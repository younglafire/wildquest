import { describe, expect, it } from "vitest";
import {
  MAX_MATCH_TURNS,
  calculateStrikeDamage,
  createSimultaneousBattle,
  normalizeAction,
  resolveSimultaneousTurn,
  type BattleAction,
} from "./simultaneous-battle";
import type { BattleStats } from "./battle-engine";

const fighter = (
  hp = 100,
  attack = 60,
  defense = 50,
  speed = 50,
  shield = 25,
): BattleStats => ({ hp, attack, defense, speed, shield });

const team = (stats = fighter()) => [stats, stats, stats];

describe("simultaneous battle", () => {
  it("uses speed as strike power without deciding action order", () => {
    expect(calculateStrikeDamage(fighter(), fighter())).toBe(46);
  });

  it.each<[BattleAction, BattleAction, number, number, number, number]>([
    ["strike", "strike", 46, 46, 3, 3],
    ["strike", "guard", 0, 21, 3, 4],
    ["strike", "recharge", 0, 46, 3, 5],
    ["guard", "strike", 21, 0, 4, 3],
    ["guard", "guard", 0, 0, 4, 4],
    ["guard", "recharge", 0, 0, 4, 5],
    ["recharge", "strike", 46, 0, 5, 3],
    ["recharge", "guard", 0, 0, 5, 4],
    ["recharge", "recharge", 0, 0, 5, 5],
  ])(
    "%s versus %s resolves the action matrix",
    (
      creatorAction,
      opponentAction,
      damageToCreator,
      damageToOpponent,
      creatorMana,
      opponentMana,
    ) => {
      const initial = createSimultaneousBattle(team(), team());
      const result = resolveSimultaneousTurn(
        initial,
        creatorAction,
        opponentAction,
      );
      expect(result.event.damageToCreator).toBe(damageToCreator);
      expect(result.event.damageToOpponent).toBe(damageToOpponent);
      expect(result.event.creatorManaAfter).toBe(creatorMana);
      expect(result.event.opponentManaAfter).toBe(opponentMana);
    },
  );

  it("lets both living creatures act before a double knockout", () => {
    const glass = fighter(20, 100, 0, 100, 0);
    const initial = createSimultaneousBattle(team(glass), team(glass));
    const result = resolveSimultaneousTurn(initial, "strike", "strike");
    expect(result.event.creatorKnockedOut).toBe(true);
    expect(result.event.opponentKnockedOut).toBe(true);
    expect(result.state.creator.activeSlot).toBe(1);
    expect(result.state.opponent.activeSlot).toBe(1);
  });

  it("draws when both final creatures are knocked out together", () => {
    const glass = fighter(20, 100, 0, 100, 0);
    const initial = createSimultaneousBattle(team(glass), team(glass));
    initial.creator.activeSlot = 2;
    initial.opponent.activeSlot = 2;
    initial.creator.fighters[0].currentHp = 0;
    initial.creator.fighters[1].currentHp = 0;
    initial.opponent.fighters[0].currentHp = 0;
    initial.opponent.fighters[1].currentHp = 0;
    const result = resolveSimultaneousTurn(initial, "strike", "strike");
    expect(result.state.outcome).toBe("tie");
  });

  it("defaults a missing or unaffordable choice to recharge", () => {
    const initial = createSimultaneousBattle(team(), team());
    const active = initial.creator.fighters[0];
    active.mana = 1;
    expect(normalizeAction(active, "strike")).toEqual({
      action: "recharge",
      missed: true,
    });
    expect(normalizeAction(active, null)).toEqual({
      action: "recharge",
      missed: true,
    });
  });

  it("caps recharge at five mana", () => {
    const initial = createSimultaneousBattle(team(), team());
    initial.creator.fighters[0].mana = 4;
    const result = resolveSimultaneousTurn(initial, "recharge", "guard");
    expect(result.event.creatorManaAfter).toBe(5);
  });

  it("settles the turn cap by HP ratio and then mana", () => {
    const initial = createSimultaneousBattle(team(), team());
    initial.turn = MAX_MATCH_TURNS;
    initial.creator.fighters[1].currentHp = 50;
    const result = resolveSimultaneousTurn(initial, "guard", "recharge");
    expect(result.state.outcome).toBe("opponent");
  });

  it("rejects unaffordable actions when bypassing normalization", () => {
    const initial = createSimultaneousBattle(team(), team());
    initial.creator.fighters[0].mana = 1;
    expect(() => resolveSimultaneousTurn(initial, "strike", "guard")).toThrow(
      "Insufficient mana",
    );
  });
});
