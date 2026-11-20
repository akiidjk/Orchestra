// @vitest-environment node
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WebSocket } from "ws";
import { Room } from "./room";
import { createCode, handleConnection, listPublic, rooms } from "./rooms";

const avatar = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};
const settings = {
  lang: "fr",
  rounds: 3,
  turnTime: 30,
  isPublic: true,
} as const;

function fakeWs() {
  const ws = Object.assign(new EventEmitter(), {
    send: vi.fn(),
    readyState: 1,
    OPEN: 1,
  });
  handleConnection(ws as unknown as WebSocket);
  return {
    ws,
    say: (msg: unknown) =>
      ws.emit(
        "message",
        Buffer.from(typeof msg === "string" ? msg : JSON.stringify(msg)),
      ),
    sent: () => ws.send.mock.calls.map(([s]) => JSON.parse(s as string)),
  };
}

afterEach(() => {
  for (const r of rooms.values()) r.dispose();
  rooms.clear();
});

describe("createCode", () => {
  it("makes unique 6-char unambiguous codes", () => {
    const codes = new Set(Array.from({ length: 200 }, createCode));
    expect(codes.size).toBe(200);
    for (const c of codes) expect(c).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
  });
});

describe("listPublic", () => {
  it("lists only public, non-empty rooms", () => {
    for (const isPublic of [true, false]) {
      const r = new Room(createCode(), { ...settings, isPublic });
      r.join({ nickname: "A", avatar }, () => {});
      rooms.set(r.code, r);
    }
    rooms.set("EMPTY2", new Room("EMPTY2", settings));
    const list = listPublic();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      lang: "fr",
      players: 1,
      status: "waiting",
    });
  });
});

describe("handleConnection", () => {
  it("create → joined then state; join by lowercase code; leave removes room", () => {
    const a = fakeWs();
    a.say({ type: "create", profile: { nickname: "Ann", avatar }, settings });
    const [joined, state] = a.sent();
    expect(joined).toMatchObject({ type: "joined" });
    expect(state.type).toBe("state");
    expect(state.snapshot.hostId).toBe(joined.playerId);
    expect(rooms.has(joined.code)).toBe(true);

    const b = fakeWs();
    b.say({
      type: "join",
      code: joined.code.toLowerCase(),
      profile: { nickname: "Bob", avatar },
    });
    expect(b.sent()[0]).toMatchObject({ type: "joined", code: joined.code });
    expect(a.sent().at(-1).snapshot.players).toHaveLength(2);

    a.say({ type: "leave" });
    b.say({ type: "leave" });
    expect(rooms.has(joined.code)).toBe(false);
  });

  it("replies with errors for bad input", () => {
    const a = fakeWs();
    a.say("{not json");
    a.say("x".repeat(5000));
    a.say({ type: "join", code: "ZZZZZZ", profile: { nickname: "A", avatar } });
    a.say({ type: "start" });
    expect(a.sent()).toEqual([
      { type: "error", message: "Invalid message." },
      { type: "error", message: "Message too large." },
      { type: "error", message: "Room not found." },
      { type: "error", message: "You're not in a room." },
    ]);
  });
});
