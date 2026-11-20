import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Snapshot } from "@/lib/game/protocol";
import { Stage } from "./stage";

vi.mock("@/lib/client/sound", () => ({ play: vi.fn() }));

const avatar = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};
const player = (id: string, score = 0) => ({
  id,
  nickname: id,
  avatar,
  score,
  connected: true,
  answered: false,
});

const base: Snapshot = {
  code: "ABCDEF",
  settings: { lang: "it", rounds: 5, turnTime: 60, isPublic: false },
  hostId: "gm",
  players: [player("gm"), player("me"), player("bob")],
  phase: "guessing",
  round: 1,
  gmId: "gm",
  endsInMs: 60000,
  prompt: { word: "dog", lang: "en" },
  options: ["cane", "gatto", "cono", "pane", "casa"],
  myAnswer: null,
};

describe("Stage", () => {
  it("shows the prompt and five cards, and answers on click", async () => {
    const send = vi.fn();
    render(<Stage snapshot={base} me="me" check={null} send={send} />);
    expect(screen.getByText("dog")).toBeInTheDocument();
    const cards = screen.getAllByRole("button");
    expect(cards).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "pane" }));
    expect(send).toHaveBeenCalledWith({ type: "answer", index: 3 });
  });

  it("disables the cards for the Game Master", () => {
    render(<Stage snapshot={base} me="gm" check={null} send={vi.fn()} />);
    for (const b of screen.getAllByRole("button")) expect(b).toBeDisabled();
    expect(screen.getByText(/you're conducting/i)).toBeInTheDocument();
  });

  it("locks in my answer", () => {
    render(
      <Stage
        snapshot={{ ...base, myAnswer: 1 }}
        me="me"
        check={null}
        send={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "gatto" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Locked in")).toBeInTheDocument();
  });

  it("marks the correct card and my wrong pick on reveal", () => {
    const snap: Snapshot = {
      ...base,
      phase: "reveal",
      endsInMs: 5000,
      myAnswer: 1,
      correctIndex: 0,
      turnPoints: { bob: 3 },
    };
    render(<Stage snapshot={snap} me="me" check={null} send={vi.fn()} />);
    const correct = screen.getByRole("button", { name: /cane/ });
    expect(correct).toHaveTextContent("✓ Correct");
    expect(correct.className).toContain("pulse-once");
    expect(screen.getByRole("button", { name: /gatto/ })).toHaveTextContent(
      "✗",
    );
    expect(screen.getByText("The answer was cane")).toBeInTheDocument();
  });

  it("validates the GM's word with a debounced check", () => {
    vi.useFakeTimers();
    const send = vi.fn();
    const picking: Snapshot = {
      ...base,
      phase: "picking",
      endsInMs: 30000,
      prompt: null,
      options: [],
    };
    const { rerender } = render(
      <Stage snapshot={picking} me="gm" check={null} send={send} />,
    );
    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/pick a word/i), {
      target: { value: "dog" },
    });
    expect(send).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(send).toHaveBeenCalledWith({ type: "check", word: "dog" });

    rerender(
      <Stage
        snapshot={picking}
        me="gm"
        check={{ word: "dog", valid: true }}
        send={send}
      />,
    );
    expect(screen.getByText("Known word ✓")).toBeInTheDocument();
    expect(submit).toBeEnabled();
    vi.useRealTimers();
  });
});
