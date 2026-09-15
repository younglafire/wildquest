import { describe, expect, it } from "vitest";
import {
  MAX_BATTLE_ROUNDS,
  simulateBattle,
  type BattleStats,
} from "./battle-engine";

const stats = (hp: number, attack: number, defense: number): BattleStats => ({
  hp,
  attack,
  defense,
  maxMana: 5,
  strikeCost: 2,
  guardCost: 1,
  rechargeGain: 3,
  abilityId: 1,
  abilityCost: 3,
});

describe("deterministic battle engine", () => {
  it("resolves attacks simultaneously without initiative", () => {
    const glass = Array(3).fill(stats(1, 1000, 0));
    const report = simulateBattle(glass, glass);
    expect(report.outcome).toBe("tie");
    expect(
      report.events.slice(0, 2).map((event) => event.attackerSide),
    ).toEqual(["creator", "opponent"]);
  });

  it("uses HP percentage at the round limit", () => {
    const durable = Array(3).fill(stats(1000, 1, 65_535));
    const report = simulateBattle(durable, durable);
    expect(report.outcome).toBe("tie");
    expect(report.events.at(-1)?.round).toBe(MAX_BATTLE_ROUNDS);
  });

  it("rewards attack and defense without an initiative stat", () => {
    const strong = Array(3).fill(stats(100, 80, 40));
    const weak = Array(3).fill(stats(100, 40, 20));
    expect(simulateBattle(strong, weak).outcome).toBe("creator");
  });

  it("rejects invalid teams and unsafe stats", () => {
    expect(() => simulateBattle([], [])).toThrow("three creatures");
    expect(() =>
      simulateBattle(
        Array(3).fill(stats(-1, 1, 1)),
        Array(3).fill(stats(1, 1, 1)),
      ),
    ).toThrow("unsigned 16-bit");
  });
});
