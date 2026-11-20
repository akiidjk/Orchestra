import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AVATAR_PARTS, type Avatar as AvatarData } from "@/lib/game/protocol";
import { Avatar, AvatarEditor, randomAvatar } from "./avatar";

const zero: AvatarData = {
  skin: 0,
  eyes: 0,
  mouth: 0,
  hair: 0,
  hairColor: 0,
  accessory: 0,
};

function inRange(a: AvatarData) {
  for (const [k, n] of Object.entries(AVATAR_PARTS)) {
    const v = a[k as keyof AvatarData];
    expect(Number.isInteger(v) && v >= 0 && v < n).toBe(true);
  }
}

describe("Avatar", () => {
  it("renders an svg with an aria-label", () => {
    const { container } = render(<Avatar avatar={zero} title="Ada" />);
    expect(screen.getByRole("img", { name: "Ada" })).toBe(
      container.querySelector("svg"),
    );
  });

  it("defaults the label to 'avatar'", () => {
    render(<Avatar avatar={randomAvatar()} />);
    expect(screen.getByRole("img", { name: "avatar" })).toBeInTheDocument();
  });

  it("randomAvatar stays in range", () => {
    for (let i = 0; i < 20; i++) inRange(randomAvatar());
  });
});

describe("AvatarEditor", () => {
  it("steps parts with wrap-around", async () => {
    const onChange = vi.fn();
    render(<AvatarEditor value={zero} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Next eyes" }));
    expect(onChange).toHaveBeenLastCalledWith({ ...zero, eyes: 1 });
    await userEvent.click(
      screen.getByRole("button", { name: "Previous accessory" }),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      ...zero,
      accessory: AVATAR_PARTS.accessory - 1,
    });
  });

  it("randomizes to an in-range avatar", async () => {
    const onChange = vi.fn();
    render(<AvatarEditor value={zero} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /randomize/i }));
    inRange(onChange.mock.calls[0][0]);
  });
});
