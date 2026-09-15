// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameShell } from "./game-shell";

const mocks = vi.hoisted(() => ({
  pathname: "/battle",
  replace: vi.fn(),
  status: "connected" as "connected" | "disconnected",
  isReady: true,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("../lib/wallet/context", () => ({
  useWallet: () => ({ status: mocks.status, isReady: mocks.isReady }),
}));
vi.mock("./app-header", () => ({ AppHeader: () => <header>Header</header> }));
vi.mock("./grid-background", () => ({ GridBackground: () => null }));

afterEach(() => {
  cleanup();
  mocks.replace.mockReset();
  mocks.pathname = "/battle";
  mocks.status = "connected";
  mocks.isReady = true;
});

describe("GameShell", () => {
  it("shows the mobile game destinations and marks the current route", () => {
    render(
      <GameShell>
        <main>Battle content</main>
      </GameShell>,
    );

    expect(screen.getByText("Battle content")).toBeVisible();
    const battleLink = screen.getByRole("link", { name: /Battle/ });
    expect(battleLink).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Capture/ })).toHaveAttribute(
      "href",
      "/capture",
    );
  });

  it("gives the capture route the full viewport without shell navigation", () => {
    mocks.pathname = "/capture";
    render(
      <GameShell>
        <main>Camera scanner</main>
      </GameShell>,
    );

    expect(screen.getByText("Camera scanner")).toBeVisible();
    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Game navigation" }),
    ).not.toBeInTheDocument();
  });

  it("returns a disconnected visitor to landing with the intended route", async () => {
    mocks.status = "disconnected";
    mocks.pathname = "/profile";
    render(
      <GameShell>
        <main>Passport</main>
      </GameShell>,
    );

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/?next=%2Fprofile"),
    );
    expect(screen.queryByText("Passport")).not.toBeInTheDocument();
  });
});
