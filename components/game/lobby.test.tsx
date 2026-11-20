import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Snapshot } from "@/lib/game/protocol";
import { Lobby } from "./lobby";

const avatar = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};
const player = (id: string) => ({
  id,
  nickname: id,
  avatar,
  score: 0,
  connected: true,
  answered: false,
});

const snap: Snapshot = {
  code: "ABCDEF",
  settings: { lang: "fr", rounds: 3, turnTime: 45, isPublic: true },
  hostId: "ann",
  players: [player("ann")],
  phase: "lobby",
  round: 0,
  gmId: null,
  endsInMs: null,
  prompt: null,
  options: [],
  myAnswer: null,
};

describe("Lobby", () => {
  it("disables start for a lone host and explains why", () => {
    render(<Lobby snapshot={snap} me="ann" send={vi.fn()} />);
    const start = screen.getByRole("button", { name: "Start game" });
    expect(start).toBeDisabled();
    expect(start).toHaveAccessibleDescription(/at least 2 players/);
  });

  it("lets the host start with two players; others wait", () => {
    const send = vi.fn();
    const two = { ...snap, players: [player("ann"), player("bob")] };
    const { unmount } = render(<Lobby snapshot={two} me="ann" send={send} />);
    screen.getByRole("button", { name: "Start game" }).click();
    expect(send).toHaveBeenCalledWith({ type: "start" });
    unmount();

    render(<Lobby snapshot={two} me="bob" send={send} />);
    expect(screen.getByText("Waiting for host…")).toBeInTheDocument();
  });
});
