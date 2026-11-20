import { randomUUID } from "node:crypto";
import {
  GameError,
  MAX_PLAYERS,
  PICK_TIME,
  REVEAL_TIME,
  type Phase,
  type Profile,
  type ServerMsg,
  type Settings,
  type Snapshot,
} from "./protocol";
import { buildBallot, lookup, randomPrompt, type Prompt } from "./words";

export const RECONNECT_GRACE_MS = 60_000;

type Send = (msg: ServerMsg) => void;

interface Player extends Profile {
  id: string;
  token: string;
  score: number;
  send: Send | null; // null while disconnected
}

const key = (nick: string) => nick.toLocaleLowerCase();

/** Authoritative state of one room. Every public method validates the caller,
 *  applies one transition, then pushes a personalised snapshot to everyone. */
export const CHAT_PER_SEC = 10;

export class Room {
  players: Player[] = [];
  hostId = "";
  phase: Phase = "lobby";
  lastActive = Date.now();

  private order: string[] = [];
  private gmIdx = -1;
  private round = 1;
  private deadline: number | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private dropTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private prompt: Prompt | null = null;
  private options: string[] = [];
  private correctIndex = -1;
  private shownAt = 0;
  private chatTimes = new Map<string, number[]>();
  private answers = new Map<string, { index: number; ms: number }>();
  private turnPoints: Record<string, number> = {};

  constructor(
    readonly code: string,
    readonly settings: Settings,
  ) {}

  get gmId(): string | null {
    return this.phase === "lobby" || this.phase === "podium"
      ? null
      : (this.order[this.gmIdx] ?? null);
  }

  // ---- membership -------------------------------------------------------

  join(profile: Profile, send: Send, token?: string): Player {
    const back = token && this.players.find((p) => p.token === token);
    if (back) {
      clearTimeout(this.dropTimers.get(back.id));
      this.dropTimers.delete(back.id);
      back.send = send;
      back.avatar = profile.avatar;
      this.changed();
      return back;
    }
    if (this.phase !== "lobby" && this.phase !== "podium")
      throw new GameError("This game is already in progress.");
    if (this.players.length >= MAX_PLAYERS)
      throw new GameError("This room is full.");
    if (this.players.some((p) => key(p.nickname) === key(profile.nickname)))
      throw new GameError("That nickname is taken in this room.");
    const p: Player = {
      ...profile,
      id: randomUUID(),
      token: randomUUID(),
      score: 0,
      send,
    };
    this.players.push(p);
    if (!this.hostId) this.hostId = p.id;
    this.changed();
    return p;
  }

  /** Socket dropped: hold the slot for a while so a reload can reclaim it. */
  disconnect(id: string) {
    const p = this.find(id);
    if (!p) return;
    p.send = null;
    clearTimeout(this.dropTimers.get(id));
    this.dropTimers.set(
      id,
      setTimeout(() => this.leave(id), RECONNECT_GRACE_MS),
    );
    if (this.phase === "picking" && this.gmId === id) this.autoPick();
    else if (this.phase === "guessing") this.maybeReveal();
    this.changed();
  }

  leave(id: string) {
    const i = this.players.findIndex((p) => p.id === id);
    if (i < 0) return;
    clearTimeout(this.dropTimers.get(id));
    this.dropTimers.delete(id);
    const wasGm = this.gmId === id;
    this.players.splice(i, 1);
    if (this.hostId === id) this.hostId = this.players[0]?.id ?? "";

    const k = this.order.indexOf(id);
    if (k >= 0) {
      this.order.splice(k, 1);
      if (k <= this.gmIdx) this.gmIdx--;
    }
    if (this.phase !== "lobby" && this.phase !== "podium") {
      if (this.order.length < 2) this.endGame();
      else if (wasGm && this.phase !== "reveal") this.nextTurn();
      else if (this.phase === "guessing") this.maybeReveal();
    }
    if (!this.players.length) clearTimeout(this.timer);
    this.changed();
  }

  // ---- game flow --------------------------------------------------------

  /** Start, or rematch from the podium with the same players. */
  start(id: string) {
    if (id !== this.hostId) throw new GameError("Only the host can start.");
    if (this.phase !== "lobby" && this.phase !== "podium")
      throw new GameError("The game has already started.");
    if (this.players.length < 2)
      throw new GameError("You need at least 2 players.");
    for (const p of this.players) p.score = 0;
    this.order = this.players.map((p) => p.id);
    this.gmIdx = -1;
    this.round = 1;
    this.nextTurn();
    this.changed();
  }

  check(id: string, word: string): boolean {
    this.requireGmPicking(id);
    return lookup(word, this.settings.lang) !== null;
  }

  submit(id: string, word: string) {
    this.requireGmPicking(id);
    const p = lookup(word, this.settings.lang);
    if (!p)
      throw new GameError(
        "That word isn't in the dictionary (or is the same in the target language).",
      );
    this.beginGuessing(p);
    this.changed();
  }

  skip(id: string) {
    this.requireGmPicking(id);
    this.autoPick();
    this.changed();
  }

  answer(id: string, index: number) {
    if (this.phase !== "guessing") throw new GameError("Not guessing now.");
    if (id === this.gmId) throw new GameError("The Game Master can't answer.");
    if (!this.order.includes(id)) throw new GameError("You're not playing.");
    if (this.answers.has(id)) return; // first answer is final; resends are no-ops
    if (!Number.isInteger(index) || index < 0 || index >= this.options.length)
      throw new GameError("Invalid option.");
    this.answers.set(id, { index, ms: Date.now() - this.shownAt });
    this.maybeReveal();
    this.changed();
  }

  chat(id: string, text: string) {
    const p = this.find(id);
    if (!p) return;
    const now = Date.now();
    // ponytail: sliding window per player, in-memory; fine at 8 players/room
    const recent = (this.chatTimes.get(id) ?? []).filter((t) => now - t < 1000);
    if (recent.length >= CHAT_PER_SEC) throw new GameError("Slow down.");
    this.chatTimes.set(id, [...recent, now]);
    this.lastActive = now;
    const msg: ServerMsg = {
      type: "chat",
      from: p.nickname,
      text,
      at: Date.now(),
    };
    for (const q of this.players) q.send?.(msg);
  }

  private requireGmPicking(id: string) {
    if (this.phase !== "picking" || this.gmId !== id)
      throw new GameError("It's not your turn to pick a word.");
  }

  private nextTurn() {
    this.gmIdx++;
    if (this.gmIdx >= this.order.length) {
      this.gmIdx = 0;
      this.round++;
    }
    if (this.round > this.settings.rounds) return this.endGame();
    this.phase = "picking";
    this.prompt = null;
    this.options = [];
    this.answers.clear();
    this.turnPoints = {};
    if (!this.find(this.gmId!)?.send) return this.autoPick();
    this.schedule(PICK_TIME, () => {
      this.autoPick();
      this.changed();
    });
  }

  private autoPick() {
    this.beginGuessing(randomPrompt(this.settings.lang));
  }

  private beginGuessing(prompt: Prompt) {
    const ballot = buildBallot(prompt.concept, this.settings.lang);
    this.prompt = prompt;
    this.options = ballot.options;
    this.correctIndex = ballot.correctIndex;
    this.phase = "guessing";
    this.shownAt = Date.now();
    this.schedule(this.settings.turnTime, () => {
      this.reveal();
      this.changed();
    });
  }

  private maybeReveal() {
    const waiting = this.order.filter(
      (id) => id !== this.gmId && !this.answers.has(id) && this.find(id)?.send,
    );
    if (!waiting.length) this.reveal();
  }

  private reveal() {
    const half = (this.settings.turnTime * 1000) / 2;
    const correct = [...this.answers]
      .filter(([, a]) => a.index === this.correctIndex)
      .sort(([, a], [, b]) => a.ms - b.ms);
    this.turnPoints = {};
    correct.forEach(([id, a], rank) => {
      this.turnPoints[id] = rank === 0 ? 3 : a.ms <= half ? 2 : 1;
    });
    const guessers = this.order.filter((id) => id !== this.gmId).length;
    if (!correct.length && guessers > 0 && this.gmId)
      this.turnPoints[this.gmId] = 1;
    for (const [id, pts] of Object.entries(this.turnPoints)) {
      const p = this.find(id);
      if (p) p.score += pts;
    }
    this.phase = "reveal";
    this.schedule(REVEAL_TIME, () => {
      this.nextTurn();
      this.changed();
    });
  }

  private endGame() {
    clearTimeout(this.timer);
    this.deadline = null;
    this.phase = "podium";
  }

  private schedule(seconds: number, fn: () => void) {
    clearTimeout(this.timer);
    this.deadline = Date.now() + seconds * 1000;
    this.timer = setTimeout(fn, seconds * 1000);
  }

  // ---- views ------------------------------------------------------------

  private find(id: string) {
    return this.players.find((p) => p.id === id);
  }

  snapshot(forId: string): Snapshot {
    const revealed = this.phase === "reveal";
    const playing = this.phase === "guessing" || revealed;
    return {
      code: this.code,
      settings: this.settings,
      hostId: this.hostId,
      players: this.players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        connected: !!p.send,
        answered: playing && this.answers.has(p.id),
      })),
      phase: this.phase,
      round: Math.min(this.round, this.settings.rounds),
      gmId: this.gmId,
      endsInMs:
        this.deadline && this.phase !== "lobby" && this.phase !== "podium"
          ? Math.max(0, this.deadline - Date.now())
          : null,
      prompt:
        playing && this.prompt
          ? { word: this.prompt.word, lang: this.prompt.lang }
          : null,
      options: playing ? this.options : [],
      myAnswer: playing ? (this.answers.get(forId)?.index ?? null) : null,
      ...(revealed && {
        correctIndex: this.correctIndex,
        turnPoints: this.turnPoints,
      }),
    };
  }

  private changed() {
    this.lastActive = Date.now();
    for (const p of this.players)
      p.send?.({ type: "state", snapshot: this.snapshot(p.id) });
  }

  dispose() {
    clearTimeout(this.timer);
    for (const t of this.dropTimers.values()) clearTimeout(t);
  }
}
