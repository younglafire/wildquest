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

const fighter = (hp = 100, attack = 60, defense = 50): BattleStats => ({
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

const team = (stats = fighter()) => [stats, stats, stats];

describe("simultaneous battle", () => {
  it("uses attack and defense without an initiative stat", () => {
    expect(calculateStrikeDamage(fighter(), fighter())).toBe(40);
  });

  it.each<[BattleAction, BattleAction, number, number, number, number]>([
    ["strike", "strike", 40, 40, 3, 3],
    ["strike", "guard", 0, 0, 3, 4],
    ["strike", "recharge", 0, 40, 3, 5],
    ["guard", "strike", 0, 0, 4, 3],
    ["guard", "guard", 0, 0, 4, 4],
    ["guard", "recharge", 0, 0, 4, 5],
    ["recharge", "strike", 40, 0, 5, 3],
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
    const glass = fighter(20, 100, 0);
    const initial = createSimultaneousBattle(team(glass), team(glass));
    const result = resolveSimultaneousTurn(initial, "strike", "strike");
    expect(result.event.creatorKnockedOut).toBe(true);
    expect(result.event.opponentKnockedOut).toBe(true);
    expect(result.state.creator.activeSlot).toBe(1);
    expect(result.state.opponent.activeSlot).toBe(1);
  });

  it("draws when both final creatures are knocked out together", () => {
    const glass = fighter(20, 100, 0);
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

  it("resolves direct-damage, guard, healing, mana, and conditional abilities", () => {
    const abilityFighter = (abilityId: number): BattleStats => ({
      ...fighter(),
      abilityId,
      abilityCost: 3,
    });

    const venom = resolveSimultaneousTurn(
      createSimultaneousBattle(team(abilityFighter(11)), team()),
      "ability",
      "recharge",
    );
    expect(venom.event.damageToOpponent).toBe(62);

    const shelter = resolveSimultaneousTurn(
      createSimultaneousBattle(team(abilityFighter(23)), team()),
      "ability",
      "strike",
    );
    expect(shelter.event.creatorGuard).toBe(42);
    expect(shelter.event.damageToCreator).toBe(0);

    const suppliesState = createSimultaneousBattle(
      team(abilityFighter(17)),
      team(),
    );
    suppliesState.creator.fighters[0].currentHp = 50;
    const supplies = resolveSimultaneousTurn(suppliesState, "ability", "guard");
    expect(supplies.event.creatorHpAfter).toBe(68);
    expect(supplies.event.creatorManaAfter).toBe(4);

    const feint = resolveSimultaneousTurn(
      createSimultaneousBattle(team(abilityFighter(16)), team()),
      "ability",
      "guard",
    );
    expect(feint.event.creatorManaAfter).toBe(4);
  });

  it("applies Guard to each Colony Rush hit and lets Nine Lives survive", () => {
    const ant = { ...fighter(), abilityId: 28, abilityCost: 3 };
    const guarded = resolveSimultaneousTurn(
      createSimultaneousBattle(team(ant), team(fighter(100, 60, 0))),
      "ability",
      "guard",
    );
    expect(guarded.event.damageToOpponent).toBe(24);

    const cat = { ...fighter(20, 60, 0), abilityId: 4, abilityCost: 3 };
    const survives = resolveSimultaneousTurn(
      createSimultaneousBattle(team(cat), team(fighter(100, 100, 0))),
      "ability",
      "strike",
    );
    expect(survives.event.creatorHpAfter).toBe(1);
    expect(survives.event.creatorKnockedOut).toBe(false);
  });
});
