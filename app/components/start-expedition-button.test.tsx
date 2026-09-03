// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StartExpeditionButton } from "./start-expedition-button";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  status: "connected" as "connected" | "disconnected",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("../lib/wallet/context", () => ({
  useWallet: () => ({
    connectors: [],
    connect: vi.fn(),
    status: mocks.status,
    error: undefined,
  }),
}));

afterEach(() => {
  cleanup();
  mocks.push.mockReset();
  mocks.status = "connected";
  window.history.replaceState({}, "", "/");
});

describe("StartExpeditionButton", () => {
  it("routes a connected player to the expedition home", async () => {
    const user = userEvent.setup();
    render(<StartExpeditionButton />);

    await user.click(screen.getByRole("button", { name: "Start Expedition" }));
    expect(mocks.push).toHaveBeenCalledWith("/home");
  });

  it("returns a connected player to a requested game route", async () => {
    window.history.replaceState({}, "", "/?next=%2Fquest");
    const user = userEvent.setup();
    render(<StartExpeditionButton />);

    await user.click(screen.getByRole("button", { name: "Start Expedition" }));
    expect(mocks.push).toHaveBeenCalledWith("/quest");
  });

  it("opens wallet selection when disconnected", async () => {
    mocks.status = "disconnected";
    const user = userEvent.setup();
    render(<StartExpeditionButton />);

    await user.click(screen.getByRole("button", { name: "Start Expedition" }));
    expect(
      screen.getByRole("dialog", { name: "Choose your wallet" }),
    ).toBeVisible();
    expect(mocks.push).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
