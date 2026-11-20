import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the heading and a get-started button", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /next\.js starter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get started/i }),
    ).toBeInTheDocument();
  });
});
