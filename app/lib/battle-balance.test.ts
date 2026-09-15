import { describe, expect, it } from "vitest";
import type { BattleStats } from "./battle-engine";
import { simulateBalanceMatch, summarizeBalance } from "./battle-balance";

const balanced: BattleStats = {
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

describe("battle balance analysis", () => {
  it("produces deterministic action and match metrics", () => {
    const match = simulateBalanceMatch({
      creatorIds: [1, 2, 3],
      creatorStats: [balanced, balanced, balanced],
      opponentIds: [4, 5, 6],
      opponentStats: [balanced, balanced, balanced],
      styleSeed: 1,
    });
    const repeated = simulateBalanceMatch({
      creatorIds: [1, 2, 3],
      creatorStats: [balanced, balanced, balanced],
      opponentIds: [4, 5, 6],
      opponentStats: [balanced, balanced, balanced],
      styleSeed: 1,
    });
    expect(repeated).toEqual(match);
    const report = summarizeBalance([match]);
    expect(report.matches).toBe(1);
    expect(report.medianTurns).toBeGreaterThan(0);
    expect(
      Object.values(report.actionRates).reduce((a, b) => a + b, 0),
    ).toBeCloseTo(1);
  });
});
