import { describe, expect, it } from "vitest";
import goldenVectors from "../../programs/wildquest/tests/fixtures/battle-vectors.json";
import {
  MAX_BATTLE_ROUNDS,
  simulateBattle,
  type BattleStats,
} from "./battle-engine";

const stats = (
  hp: number,
  attack: number,
  defense: number,
  speed: number,
  shield: number,
): BattleStats => ({ hp, attack, defense, speed, shield });

describe("deterministic battle engine", () => {
  it("matches all shared Rust and TypeScript golden vectors", () => {
    for (const vector of goldenVectors) {
      const toStats = (team: number[][]) =>
        team.map(([hp, attack, defense, speed, shield]) =>
          stats(hp!, attack!, defense!, speed!, shield!),
        );
      expect(
        simulateBattle(toStats(vector.creator), toStats(vector.opponent))
          .outcome,
        vector.name,
      ).toBe(vector.outcome);
    }
  });
  it("matches the onchain knockout and no-counterattack rule", () => {
    const report = simulateBattle(
      Array(3).fill(stats(10, 1000, 0, 20, 0)),
      Array(3).fill(stats(1, 1000, 0, 10, 0)),
    );
    expect(report.outcome).toBe("creator");
    expect(report.events).toHaveLength(3);
  });

  it("resolves equal-speed attacks simultaneously", () => {
    const team = Array(3).fill(stats(1, 1000, 0, 10, 0));
    const report = simulateBattle(team, team);
    expect(report.outcome).toBe("tie");
    expect(
      report.events.slice(0, 2).map((event) => event.attackerSide),
    ).toEqual(["creator", "opponent"]);
  });

  it("records shield damage before HP damage", () => {
    const report = simulateBattle(
      Array(3).fill(stats(10, 100, 0, 20, 0)),
      Array(3).fill(stats(10, 1, 0, 10, 5)),
    );
    expect(report.events[0]).toMatchObject({
      damage: 100,
      shieldBefore: 5,
      shieldAfter: 0,
      hpBefore: 10,
      hpAfter: 0,
    });
  });

  it("uses the proportional remaining-power tie-break at round 50", () => {
    const durable = Array(3).fill(stats(1000, 1, 65_535, 10, 0));
    const report = simulateBattle(durable, durable);
    expect(report.outcome).toBe("tie");
    expect(report.events.at(-1)?.round).toBe(MAX_BATTLE_ROUNDS);
  });

  it.each([
    [
      "creator faster",
      stats(100, 50, 20, 40, 0),
      stats(100, 50, 20, 20, 0),
      "creator",
    ],
    [
      "opponent faster",
      stats(100, 50, 20, 20, 0),
      stats(100, 50, 20, 40, 0),
      "opponent",
    ],
    [
      "creator shield",
      stats(100, 50, 20, 20, 80),
      stats(100, 50, 20, 20, 0),
      "creator",
    ],
    [
      "opponent shield",
      stats(100, 50, 20, 20, 0),
      stats(100, 50, 20, 20, 80),
      "opponent",
    ],
    [
      "creator attack",
      stats(100, 80, 20, 20, 0),
      stats(100, 30, 20, 20, 0),
      "creator",
    ],
    [
      "opponent attack",
      stats(100, 30, 20, 20, 0),
      stats(100, 80, 20, 20, 0),
      "opponent",
    ],
  ])("produces a stable outcome for %s", (_name, left, right, outcome) => {
    expect(
      simulateBattle(Array(3).fill(left), Array(3).fill(right)).outcome,
    ).toBe(outcome);
  });

  it("rejects invalid teams and unsafe stats", () => {
    expect(() => simulateBattle([], [])).toThrow("three creatures");
    expect(() =>
      simulateBattle(
        Array(3).fill(stats(-1, 1, 1, 1, 1)),
        Array(3).fill(stats(1, 1, 1, 1, 1)),
      ),
    ).toThrow("unsigned 16-bit");
  });
});
