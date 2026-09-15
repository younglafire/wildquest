// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSimultaneousBattle } from "../../lib/simultaneous-battle";
import type { BattleRoomSnapshot } from "../../lib/battle-room";
import type { BattleCreature } from "../../lib/battle-creatures";
import { LiveBattlefield } from "./live-battlefield";

const mocks = vi.hoisted(() => ({
  choose: vi.fn(),
  snapshot: null as BattleRoomSnapshot | null,
}));

vi.mock("../../lib/hooks/use-battle-room", () => ({
  useBattleRoom: () => ({
    snapshot: mocks.snapshot,
    status: "authenticated",
    error: null,
    choose: mocks.choose,
  }),
}));

const stats = {
  hp: 100,
  attack: 60,
  defense: 50,
  maxMana: 5,
  strikeCost: 2,
  guardCost: 1,
  rechargeGain: 3,
  abilityId: 1,
  abilityCost: 3,
};
const creatures = [0, 1, 2].map(
  (index) =>
    ({
      creature: { address: `creature-${index}` },
      species: null,
      config: { data: { ...stats } },
    }) as unknown as BattleCreature,
);

function snapshot(overrides: Partial<BattleRoomSnapshot> = {}) {
  return {
    matchAddress: "match",
    sequence: 1,
    phase: "choosing",
    turnStartsAt: 0,
    deadline: Date.now() + 5_000,
    creatorConnected: true,
    opponentConnected: true,
    creatorLocked: false,
    opponentLocked: false,
    creatorMissedTurns: 0,
    opponentMissedTurns: 0,
    battle: createSimultaneousBattle(
      [stats, stats, stats],
      [stats, stats, stats],
    ),
    events: [],
    settlementStatus: "idle",
    settlementError: null,
    ...overrides,
  } satisfies BattleRoomSnapshot;
}

function renderBattlefield(playerSide: "creator" | "opponent" | null) {
  return render(
    <LiveBattlefield
      matchAddress={"match" as never}
      wallet={undefined}
      isParticipant={playerSide !== null}
      playerSide={playerSide}
      creator={creatures}
      opponent={creatures}
      activeExpiresAt={null}
      isSending={false}
      onRefund={vi.fn()}
    />,
  );
}

afterEach(() => {
  cleanup();
  mocks.choose.mockReset();
});

describe("LiveBattlefield", () => {
  it("renders three mobile-safe actions with explicit mana costs", () => {
    mocks.snapshot = snapshot();
    renderBattlefield("creator");

    for (const name of [/Strike · 2/, /Guard · 1/, /Recharge · \+3/]) {
      const button = screen.getByRole("button", { name });
      expect(button).toHaveClass("min-h-14");
      expect(button).toBeEnabled();
    }
  });

  it("locks every action without revealing the opponent choice", () => {
    mocks.snapshot = snapshot({ creatorLocked: true });
    renderBattlefield("creator");

    expect(screen.getByText(/Choice locked/)).toBeVisible();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
    expect(screen.queryByText(/opponent.*strike/i)).not.toBeInTheDocument();
  });

  it("submits a choice once and gives spectators no controls", () => {
    mocks.snapshot = snapshot();
    const view = renderBattlefield("creator");
    fireEvent.click(screen.getByRole("button", { name: /Guard · 1/ }));
    expect(mocks.choose).toHaveBeenCalledWith("guard");

    view.unmount();
    renderBattlefield(null);
    expect(screen.getByText(/Spectator mode/)).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("communicates a knockout without requiring motion", () => {
    const battle = createSimultaneousBattle(
      [stats, stats, stats],
      [stats, stats, stats],
    );
    battle.creator.fighters[0]!.currentHp = 0;
    mocks.snapshot = snapshot({ battle, phase: "resolving" });
    renderBattlefield("creator");

    expect(
      screen.getByRole("progressbar", { name: /Your creature health/ }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("HP 0/100").closest("article")).toHaveClass(
      "grayscale",
    );
  });
});
