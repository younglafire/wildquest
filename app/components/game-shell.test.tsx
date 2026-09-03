// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameShell } from "./game-shell";

const mocks = vi.hoisted(() => ({
  pathname: "/quest",
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
  mocks.pathname = "/quest";
  mocks.status = "connected";
  mocks.isReady = true;
});

describe("GameShell", () => {
  it("shows the mobile game destinations and marks the current route", () => {
    render(
      <GameShell>
        <main>Quest content</main>
      </GameShell>,
    );

    expect(screen.getByText("Quest content")).toBeVisible();
    const questLink = screen.getByRole("link", { name: /Quest/ });
    expect(questLink).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Capture/ })).toHaveAttribute(
      "href",
      "/capture",
    );
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
