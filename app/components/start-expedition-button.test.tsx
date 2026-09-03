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
});

describe("StartExpeditionButton", () => {
  it("routes a connected player to capture", async () => {
    const user = userEvent.setup();
    render(<StartExpeditionButton />);

    await user.click(screen.getByRole("button", { name: "Start Expedition" }));
    expect(mocks.push).toHaveBeenCalledWith("/capture");
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
  });
});
