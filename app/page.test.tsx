import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("Home", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("[]")),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders title, forms and the empty rooms state", async () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /uordz/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nickname")).toBeInTheDocument();
    expect(
      await screen.findByText("No open rooms yet — create one!"),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/rooms");
  });

  it("enables create once a nickname is typed and navigates", async () => {
    render(<Home />);
    const create = screen.getByRole("button", { name: "Create room" });
    expect(create).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Nickname"), "Ada");
    await userEvent.click(create);
    expect(push).toHaveBeenCalledWith(
      "/room/new?lang=en&rounds=5&turnTime=60&public=0",
    );
    expect(sessionStorage.getItem("uordz:profile")).toContain("Ada");
  });
});
