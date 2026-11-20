import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("applies the default variant classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-indigo-brand");
    expect(button.className).toContain("text-white");
  });

  it("applies the outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border");
    expect(button.className).toContain("border-border");
  });

  it("applies the accent variant classes", () => {
    render(<Button variant="accent">Accent</Button>);
    expect(screen.getByRole("button").className).toContain("bg-accent");
  });

  it("merges a custom className", () => {
    render(<Button className="mt-4">With class</Button>);
    expect(screen.getByRole("button").className).toContain("mt-4");
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
