import type { WebSocket } from "ws";
import {
  GameError,
  MAX_PLAYERS,
  cleanText,
  parseProfile,
  parseSettings,
  type Profile,
  type RoomSummary,
  type ServerMsg,
} from "./protocol";
import { Room } from "./room";

export const rooms = new Map<string, Room>();

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const MAX_BYTES = 4096;
const EXPIRY_MS = 24 * 60 * 60 * 1000;

export function createCode(): string {
  for (;;) {
    let code = "";
    for (let i = 0; i < 6; i++)
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (!rooms.has(code)) return code;
  }
}

export function listPublic(): RoomSummary[] {
  return [...rooms.values()]
    .filter((r) => r.settings.isPublic && r.players.length > 0)
    .map((r) => ({
      code: r.code,
      lang: r.settings.lang,
      players: r.players.length,
      maxPlayers: MAX_PLAYERS,
      rounds: r.settings.rounds,
      turnTime: r.settings.turnTime,
      status:
        r.phase !== "lobby" && r.phase !== "podium"
          ? "in-game"
          : r.players.length >= MAX_PLAYERS
            ? "full"
            : "waiting",
    }));
}

function remove(room: Room) {
  room.dispose();
  rooms.delete(room.code);
}

export function sweep(now = Date.now()) {
  for (const r of rooms.values())
    if (!r.players.length || now - r.lastActive > EXPIRY_MS) remove(r);
}
setInterval(sweep, 10 * 60 * 1000).unref();

/** One socket = at most one room membership. */
export function handleConnection(ws: WebSocket) {
  let room: Room | null = null;
  let me = "";
  let mySend: ((msg: ServerMsg) => void) | null = null;

  const reply = (msg: ServerMsg) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  };

  const leaveCurrent = () => {
    if (!room) return;
    room.leave(me);
    if (!room.players.length) remove(room);
    room = null;
    mySend = null;
  };

  const enter = (r: Room, profile: Profile, token?: string) => {
    leaveCurrent();
    // Hold back Room's own broadcast until the client has its `joined`.
    let ready = false;
    const send = (msg: ServerMsg) => ready && reply(msg);
    const p = r.join(profile, send, token);
    room = r;
    me = p.id;
    mySend = send;
    ready = true;
    reply({ type: "joined", code: r.code, playerId: p.id, token: p.token });
    reply({ type: "state", snapshot: r.snapshot(p.id) });
  };

  ws.on("message", (data) => {
    try {
      const raw = String(data);
      if (Buffer.byteLength(raw) > MAX_BYTES)
        throw new GameError("Message too large.");
      let m: Record<string, unknown>;
      try {
        m = JSON.parse(raw);
      } catch {
        throw new GameError("Invalid message.");
      }
      if (!m || typeof m !== "object") throw new GameError("Invalid message.");

      if (m.type === "create") {
        const profile = parseProfile(m.profile);
        const r = new Room(createCode(), parseSettings(m.settings));
        rooms.set(r.code, r);
        return enter(r, profile);
      }
      if (m.type === "join") {
        const code = cleanText(m.code, 12, "Room code").toUpperCase();
        const profile = parseProfile(m.profile);
        const r = rooms.get(code);
        if (!r) throw new GameError("Room not found.");
        const token = typeof m.token === "string" ? m.token : undefined;
        return enter(r, profile, token);
      }
      if (m.type === "leave") return leaveCurrent();

      const r = room;
      if (!r) throw new GameError("You're not in a room.");
      switch (m.type) {
        case "start":
          return r.start(me);
        case "check": {
          const word = cleanText(m.word, 40, "Word");
          return reply({ type: "check", word, valid: r.check(me, word) });
        }
        case "submit":
          return r.submit(me, cleanText(m.word, 40, "Word"));
        case "skip":
          return r.skip(me);
        case "answer":
          return r.answer(me, m.index as number);
        case "chat":
          return r.chat(me, cleanText(m.text, 200, "Message"));
        default:
          throw new GameError("Unknown message.");
      }
    } catch (e) {
      if (e instanceof GameError) reply({ type: "error", message: e.message });
      else {
        console.error(e);
        reply({ type: "error", message: "Something went wrong." });
      }
    }
  });

  ws.on("close", () => {
    // Skip if a newer socket already reclaimed this player via its token.
    if (room && room.players.find((p) => p.id === me)?.send === mySend)
      room.disconnect(me);
    room = null;
  });
}
