// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameError, type Profile, type Settings } from "./protocol";
import { RECONNECT_GRACE_MS, Room } from "./room";

const avatar = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};
const prof = (nickname: string): Profile => ({ nickname, avatar });
const base: Settings = { lang: "it", rounds: 2, turnTime: 20, isPublic: false };

function setup(n: number, settings: Partial<Settings> = {}) {
  const room = new Room("ABCDEF", { ...base, ...settings });
  const sends = Array.from({ length: n }, () => vi.fn());
  const ids = sends.map((send, i) => room.join(prof(`P${i}`), send).id);
  return { room, ids, sends };
}

const correct = (room: Room) =>
  (room as unknown as { correctIndex: number }).correctIndex;
const wrong = (room: Room) => (correct(room) + 1) % 5;
const gm = (room: Room) => room.snapshot("").gmId;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("join", () => {
  it("rejects a duplicate nickname case-insensitively", () => {
    const { room } = setup(1);
    expect(() => room.join(prof("p0"), vi.fn())).toThrow(GameError);
  });

  it("rejects the 9th player", () => {
    const { room } = setup(8);
    expect(() => room.join(prof("Late"), vi.fn())).toThrow(/full/);
  });

  it("rejects new players mid-game", () => {
    const { room, ids } = setup(2);
    room.start(ids[0]);
    expect(() => room.join(prof("Late"), vi.fn())).toThrow(/in progress/);
  });

  it("restores the same player on reconnect with the token", () => {
    const { room, ids } = setup(2);
    room.start(ids[0]);
    const p1 = room.players[1];
    p1.score = 5;
    room.disconnect(p1.id);
    expect(room.snapshot(ids[0]).players[1].connected).toBe(false);

    const send = vi.fn();
    const back = room.join(prof("Whatever"), send, p1.token);
    expect(back.id).toBe(ids[1]);
    expect(back.score).toBe(5);
    expect(room.players).toHaveLength(2);
    expect(send).toHaveBeenCalled();
    expect(room.snapshot(ids[0]).players[1].connected).toBe(true);
  });

  it("drops a disconnected player after the grace period", () => {
    const { room, ids } = setup(3);
    room.disconnect(ids[2]);
    vi.advanceTimersByTime(RECONNECT_GRACE_MS);
    expect(room.players.map((p) => p.id)).toEqual(ids.slice(0, 2));
  });
});

describe("start", () => {
  it("is host-only and needs 2 players", () => {
    const solo = setup(1);
    expect(() => solo.room.start(solo.ids[0])).toThrow(/at least 2/);

    const { room, ids } = setup(2);
    expect(() => room.start(ids[1])).toThrow(/host/);
    room.start(ids[0]);
    expect(room.phase).toBe("picking");
    expect(gm(room)).toBe(ids[0]);
    expect(() => room.start(ids[0])).toThrow(GameError);
  });
});

describe("picking", () => {
  it("auto-picks a word after 30s", () => {
    const { room, ids, sends } = setup(2);
    room.start(ids[0]);
    vi.advanceTimersByTime(29_999);
    expect(room.phase).toBe("picking");
    vi.advanceTimersByTime(1);
    expect(room.phase).toBe("guessing");
    const s = sends[1].mock.lastCall![0].snapshot;
    expect(s.phase).toBe("guessing");
    expect(s.prompt.lang).not.toBe("it");
    expect(s.options).toHaveLength(5);
  });

  it("rejects invalid words and non-GM submits", () => {
    const { room, ids } = setup(2);
    room.start(ids[0]);
    expect(() => room.submit(ids[0], "cane")).toThrow(GameError); // target lang
    expect(() => room.submit(ids[0], "xyzzy")).toThrow(GameError);
    expect(() => room.submit(ids[1], "dog")).toThrow(/not your turn/);
    expect(room.check(ids[0], "dog")).toBe(true);
    expect(room.check(ids[0], "xyzzy")).toBe(false);
    room.submit(ids[0], "dog");
    expect(room.phase).toBe("guessing");
  });

  it("auto-picks when the GM disconnects", () => {
    const { room, ids } = setup(3);
    room.start(ids[0]);
    room.disconnect(ids[0]);
    expect(room.phase).toBe("guessing");
  });

  it("skips to the next GM when the GM leaves", () => {
    const { room, ids } = setup(3);
    room.start(ids[0]);
    room.submit(ids[0], "dog");
    room.leave(ids[0]);
    expect(room.phase).toBe("picking");
    expect(gm(room)).toBe(ids[1]);
  });
});

describe("snapshot privacy", () => {
  it("hides the answer until reveal", () => {
    const { room, ids } = setup(3);
    room.start(ids[0]);
    room.submit(ids[0], "dog");
    for (const id of ids) {
      const s = room.snapshot(id);
      expect("correctIndex" in s).toBe(false);
      expect("turnPoints" in s).toBe(false);
      expect(s.options.every((o) => typeof o === "string")).toBe(true);
      expect(s.options).toContain("cane");
    }
    room.answer(ids[1], 0);
    expect(room.snapshot(ids[1]).myAnswer).toBe(0);
    expect(room.snapshot(ids[2]).myAnswer).toBeNull();
    expect(room.snapshot(ids[2]).players[1].answered).toBe(true);

    vi.advanceTimersByTime(20_000);
    const s = room.snapshot(ids[2]);
    expect(s.phase).toBe("reveal");
    expect(s.options[s.correctIndex!]).toBe("cane");
    expect(s.turnPoints).toBeDefined();
  });
});

describe("scoring", () => {
  it("awards 3 / 2 / 1 by rank and time, ending early when all answered", () => {
    const { room, ids } = setup(4, { turnTime: 20 });
    room.start(ids[0]);
    room.submit(ids[0], "dog");
    vi.advanceTimersByTime(1_000);
    room.answer(ids[1], correct(room));
    vi.advanceTimersByTime(2_000);
    room.answer(ids[2], correct(room));
    expect(room.phase).toBe("guessing");
    vi.advanceTimersByTime(10_000); // 13s > half of 20s
    room.answer(ids[3], correct(room));
    expect(room.phase).toBe("reveal");
    expect(room.snapshot(ids[0]).turnPoints).toEqual({
      [ids[1]]: 3,
      [ids[2]]: 2,
      [ids[3]]: 1,
    });
    expect(room.players.map((p) => p.score)).toEqual([0, 3, 2, 1]);
  });

  it("locks out wrong answers and gives the GM +1 when nobody is right", () => {
    const { room, ids } = setup(3);
    room.start(ids[0]);
    room.submit(ids[0], "dog");
    expect(() => room.answer(ids[0], 0)).toThrow(/Game Master/);
    room.answer(ids[1], wrong(room));
    room.answer(ids[1], correct(room)); // idempotent: first answer stands
    room.answer(ids[2], wrong(room));
    expect(room.phase).toBe("reveal");
    expect(room.snapshot(ids[0]).turnPoints).toEqual({ [ids[0]]: 1 });
    expect(room.players.map((p) => p.score)).toEqual([1, 0, 0]);
  });

  it("does not wait for disconnected guessers", () => {
    const { room, ids } = setup(3);
    room.start(ids[0]);
    room.submit(ids[0], "dog");
    room.answer(ids[1], correct(room));
    room.disconnect(ids[2]);
    expect(room.phase).toBe("reveal");
  });
});

describe("game flow", () => {
  it("rotates the GM, counts rounds, ends on the podium, and rematches", () => {
    const { room, ids } = setup(3, { rounds: 2, turnTime: 15 });
    room.start(ids[0]);
    for (let t = 0; t < 6; t++) {
      const s = room.snapshot(ids[0]);
      expect(s.phase).toBe("picking");
      expect(s.gmId).toBe(ids[t % 3]);
      expect(s.round).toBe(Math.floor(t / 3) + 1);
      vi.advanceTimersByTime(30_000); // auto-pick
      vi.advanceTimersByTime(15_000); // time up, nobody answered
      expect(room.phase).toBe("reveal");
      vi.advanceTimersByTime(5_000);
    }
    expect(room.phase).toBe("podium");
    expect(room.snapshot(ids[0]).gmId).toBeNull();
    expect(room.players.map((p) => p.score)).toEqual([2, 2, 2]);

    expect(() => room.start(ids[1])).toThrow(/host/);
    room.start(ids[0]);
    expect(room.phase).toBe("picking");
    expect(room.snapshot(ids[0]).round).toBe(1);
    expect(room.players.map((p) => p.score)).toEqual([0, 0, 0]);
  });

  it("ends the game when fewer than 2 players remain", () => {
    const { room, ids } = setup(2);
    room.start(ids[0]);
    room.leave(ids[1]);
    expect(room.phase).toBe("podium");
  });

  it("passes host to the next player when the host leaves", () => {
    const { room, ids } = setup(3);
    room.leave(ids[0]);
    expect(room.hostId).toBe(ids[1]);
    expect(room.snapshot(ids[1]).hostId).toBe(ids[1]);
  });
});
