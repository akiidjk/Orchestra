import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Snapshot } from "@/lib/game/protocol";
import { Podium, rank } from "./podium";

const avatar = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};
const player = (id: string, score: number) => ({
  id,
  nickname: id,
  avatar,
  score,
  connected: true,
  answered: false,
});

const snap: Snapshot = {
  code: "ABCDEF",
  settings: { lang: "en", rounds: 5, turnTime: 60, isPublic: false },
  hostId: "ann",
  players: [
    player("cat", 3),
    player("ann", 7),
    player("bob", 7),
    player("dan", 1),
  ],
  phase: "podium",
  round: 5,
  gmId: null,
  endsInMs: null,
  prompt: null,
  options: [],
  myAnswer: null,
};

describe("Podium", () => {
  it("gives tied players the same rank", () => {
    expect(rank(snap.players).map((p) => [p.id, p.rank])).toEqual([
      ["ann", 1],
      ["bob", 1],
      ["cat", 3],
      ["dan", 4],
    ]);
  });

  it("renders the ranking and lets the host rematch", () => {
    const send = vi.fn();
    render(<Podium snapshot={snap} me="ann" send={send} onHome={vi.fn()} />);
    const items = within(screen.getByRole("list", { name: "Final ranking" }))
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(items).toEqual(["1.ann7", "1.bob7", "3.cat3", "4.dan1"]);
    screen.getByRole("button", { name: "Rematch" }).click();
    expect(send).toHaveBeenCalledWith({ type: "start" });
  });

  it("hides rematch from non-hosts", () => {
    render(<Podium snapshot={snap} me="bob" send={vi.fn()} onHome={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Rematch" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Back home" }),
    ).toBeInTheDocument();
  });
});
