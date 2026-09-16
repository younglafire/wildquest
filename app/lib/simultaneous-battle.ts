import type { BattleOutcome, BattleSide, BattleStats } from "./battle-engine";

export const TURN_CHOICE_DURATION_MS = 5_000;
export const TURN_ANIMATION_DURATION_MS = 1_250;
export const MAX_MATCH_TURNS = 30;
export const MAX_CONSECUTIVE_MISSED_TURNS = 3;

export const BATTLE_ACTIONS = [
  "strike",
  "guard",
  "ability",
  "recharge",
] as const;
export type BattleAction = (typeof BATTLE_ACTIONS)[number];

export type SimultaneousFighter = {
  stats: BattleStats;
  currentHp: number;
  mana: number;
  currentGuard: number;
};

export type SimultaneousTeam = {
  fighters: [SimultaneousFighter, SimultaneousFighter, SimultaneousFighter];
  activeSlot: number;
};

export type SimultaneousBattleState = {
  turn: number;
  status: "active" | "finished";
  outcome: BattleOutcome | null;
  creator: SimultaneousTeam;
  opponent: SimultaneousTeam;
};

export type TurnChoice = {
  action: BattleAction;
  missed: boolean;
};

export type TurnEvent = {
  turn: number;
  creatorAction: BattleAction;
  opponentAction: BattleAction;
  creatorSlot: number;
  opponentSlot: number;
  creatorHpBefore: number;
  creatorHpAfter: number;
  opponentHpBefore: number;
  opponentHpAfter: number;
  creatorManaBefore: number;
  creatorManaAfter: number;
  opponentManaBefore: number;
  opponentManaAfter: number;
  creatorGuard: number;
  opponentGuard: number;
  damageToCreator: number;
  damageToOpponent: number;
  creatorKnockedOut: boolean;
  opponentKnockedOut: boolean;
  outcome: BattleOutcome | null;
};

function validateStats(stats: BattleStats) {
  for (const value of Object.values(stats)) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 65_535) {
      throw new Error("Battle stats must be unsigned 16-bit integers.");
    }
  }
  if (stats.hp === 0) throw new Error("A creature must have positive HP.");
}

function createFighter(stats: BattleStats): SimultaneousFighter {
  validateStats(stats);
  return {
    stats: { ...stats },
    currentHp: stats.hp,
    mana: stats.maxMana,
    currentGuard: 0,
  };
}

function createTeam(stats: readonly BattleStats[]): SimultaneousTeam {
  if (stats.length !== 3)
    throw new Error("A battle team needs three creatures.");
  return {
    fighters: stats.map(createFighter) as SimultaneousTeam["fighters"],
    activeSlot: 0,
  };
}

export function createSimultaneousBattle(
  creatorStats: readonly BattleStats[],
  opponentStats: readonly BattleStats[],
): SimultaneousBattleState {
  return {
    turn: 1,
    status: "active",
    outcome: null,
    creator: createTeam(creatorStats),
    opponent: createTeam(opponentStats),
  };
}

export function canUseAction(
  fighter: SimultaneousFighter,
  action: BattleAction,
) {
  if (action === "strike") return fighter.mana >= fighter.stats.strikeCost;
  if (action === "guard") return fighter.mana >= fighter.stats.guardCost;
  if (action === "ability") return fighter.mana >= fighter.stats.abilityCost;
  return true;
}

export function normalizeAction(
  fighter: SimultaneousFighter,
  action: BattleAction | null,
): TurnChoice {
  if (action && canUseAction(fighter, action)) {
    return { action, missed: false };
  }
  return { action: "recharge", missed: true };
}

export function calculateStrikeDamage(
  attacker: BattleStats,
  defender: BattleStats,
) {
  validateStats(attacker);
  validateStats(defender);
  return Math.max(
    1,
    Math.floor((attacker.attack * 100) / (100 + defender.defense)),
  );
}

function spendOrGainMana(fighter: SimultaneousFighter, action: BattleAction) {
  if (!canUseAction(fighter, action)) {
    throw new Error(`Insufficient mana for ${action}.`);
  }
  if (action === "strike") return fighter.mana - fighter.stats.strikeCost;
  if (action === "guard") return fighter.mana - fighter.stats.guardCost;
  if (action === "ability") return fighter.mana - fighter.stats.abilityCost;
  return Math.min(
    fighter.stats.maxMana,
    fighter.mana + fighter.stats.rechargeGain,
  );
}

function advanceTeam(team: SimultaneousTeam) {
  while (
    team.activeSlot < team.fighters.length &&
    team.fighters[team.activeSlot]!.currentHp === 0
  ) {
    team.activeSlot += 1;
  }
}

function remainingHp(team: SimultaneousTeam) {
  return team.fighters.reduce((total, fighter) => total + fighter.currentHp, 0);
}

function startingHp(team: SimultaneousTeam) {
  return team.fighters.reduce((total, fighter) => total + fighter.stats.hp, 0);
}

function totalMana(team: SimultaneousTeam) {
  return team.fighters.reduce((total, fighter) => total + fighter.mana, 0);
}

function turnLimitOutcome(state: SimultaneousBattleState): BattleOutcome {
  const creatorRatio = remainingHp(state.creator) * startingHp(state.opponent);
  const opponentRatio = remainingHp(state.opponent) * startingHp(state.creator);
  if (creatorRatio > opponentRatio) return "creator";
  if (opponentRatio > creatorRatio) return "opponent";
  const creatorMana = totalMana(state.creator);
  const opponentMana = totalMana(state.opponent);
  if (creatorMana > opponentMana) return "creator";
  if (opponentMana > creatorMana) return "opponent";
  return "tie";
}

function cloneState(state: SimultaneousBattleState): SimultaneousBattleState {
  const cloneTeam = (team: SimultaneousTeam): SimultaneousTeam => ({
    activeSlot: team.activeSlot,
    fighters: team.fighters.map((fighter) => ({
      stats: { ...fighter.stats },
      currentHp: fighter.currentHp,
      mana: fighter.mana,
      currentGuard: fighter.currentGuard,
    })) as SimultaneousTeam["fighters"],
  });
  return {
    turn: state.turn,
    status: state.status,
    outcome: state.outcome,
    creator: cloneTeam(state.creator),
    opponent: cloneTeam(state.opponent),
  };
}

export function resolveSimultaneousTurn(
  state: SimultaneousBattleState,
  creatorAction: BattleAction,
  opponentAction: BattleAction,
): { state: SimultaneousBattleState; event: TurnEvent } {
  if (state.status !== "active")
    throw new Error("The battle is already finished.");
  if (state.turn < 1 || state.turn > MAX_MATCH_TURNS) {
    throw new Error("The battle turn is outside the supported range.");
  }
  const next = cloneState(state);
  const creator = next.creator.fighters[next.creator.activeSlot];
  const opponent = next.opponent.fighters[next.opponent.activeSlot];
  if (
    !creator ||
    !opponent ||
    creator.currentHp === 0 ||
    opponent.currentHp === 0
  ) {
    throw new Error("Both teams need a living active creature.");
  }
  if (!canUseAction(creator, creatorAction)) {
    throw new Error(`Insufficient mana for ${creatorAction}.`);
  }
  if (!canUseAction(opponent, opponentAction)) {
    throw new Error(`Insufficient mana for ${opponentAction}.`);
  }

  const creatorHpBefore = creator.currentHp;
  const opponentHpBefore = opponent.currentHp;
  const creatorManaBefore = creator.mana;
  const opponentManaBefore = opponent.mana;
  creator.mana = spendOrGainMana(creator, creatorAction);
  opponent.mana = spendOrGainMana(opponent, opponentAction);

  creator.currentGuard =
    creatorAction === "guard"
      ? Math.floor(creator.stats.defense * 0.7) + 12
      : 0;
  opponent.currentGuard =
    opponentAction === "guard"
      ? Math.floor(opponent.stats.defense * 0.7) + 12
      : 0;

  const creatorRawDamage =
    creatorAction === "strike"
      ? calculateStrikeDamage(creator.stats, opponent.stats)
      : 0;
  const opponentRawDamage =
    opponentAction === "strike"
      ? calculateStrikeDamage(opponent.stats, creator.stats)
      : 0;
  const abilityDamage = (
    fighter: SimultaneousFighter,
    foeAction: BattleAction,
  ) => {
    const fixed: Record<number, number> = {
      1: 32,
      3: 38,
      6: 44,
      7: 34,
      9: foeAction === "recharge" ? 58 : 46,
      10: 20,
      11: 62,
      13: 50,
      14: 28,
      15: 45,
      16: 30,
      18: 36,
      19: 30,
      21: 38,
      24: 31,
      25:
        fighter.mana + fighter.stats.abilityCost === fighter.stats.maxMana
          ? 58
          : 48,
      26: 30,
      27: 52,
      28: 48,
      29: foeAction === "recharge" ? 54 : 46,
      35: 48,
      37: 34,
      39: 62,
    };
    return fixed[fighter.stats.abilityId] ?? 0;
  };
  const abilityGuard = (fighter: SimultaneousFighter) => {
    const fixed: Record<number, number> = {
      3: 10,
      5: fighter.stats.defense + 14,
      8: fighter.stats.defense,
      19: 12,
      20: fighter.stats.defense + 20,
      22: fighter.stats.defense,
      23: 42,
      26: 40,
      32: 34,
      33: fighter.stats.defense + 18,
      35: 10,
      36: 100,
      38: 20,
      40: 32,
    };
    return fixed[fighter.stats.abilityId] ?? 0;
  };
  if (creatorAction === "ability")
    creator.currentGuard += abilityGuard(creator);
  if (opponentAction === "ability")
    opponent.currentGuard += abilityGuard(opponent);
  const mimic = (
    fighter: SimultaneousFighter,
    foe: SimultaneousFighter,
    foeAction: BattleAction,
  ) => {
    if (foeAction === "strike")
      return calculateStrikeDamage(fighter.stats, foe.stats);
    if (foeAction === "guard") {
      fighter.currentGuard += Math.floor(fighter.stats.defense * 0.7) + 12;
    } else if (foeAction === "recharge") {
      fighter.mana = Math.min(
        fighter.stats.maxMana,
        fighter.mana + fighter.stats.rechargeGain,
      );
    }
    return foeAction === "ability" ? 32 : 0;
  };
  let creatorAbilityDamage =
    creatorAction === "ability" ? abilityDamage(creator, opponentAction) : 0;
  let opponentAbilityDamage =
    opponentAction === "ability" ? abilityDamage(opponent, creatorAction) : 0;
  if (creatorAction === "ability" && creator.stats.abilityId === 12) {
    creatorAbilityDamage = mimic(creator, opponent, opponentAction);
  }
  if (opponentAction === "ability" && opponent.stats.abilityId === 12) {
    opponentAbilityDamage = mimic(opponent, creator, creatorAction);
  }
  const incomingStrikeGuard = (
    fighter: SimultaneousFighter,
    rawStrikeDamage: number,
  ) => {
    if (fighter.stats.abilityId === 10) return Math.ceil(rawStrikeDamage / 2);
    if (fighter.stats.abilityId === 30) return Math.ceil(rawStrikeDamage * 0.4);
    return 0;
  };
  if (creatorAction === "ability") {
    creator.currentGuard += incomingStrikeGuard(creator, opponentRawDamage);
  }
  if (opponentAction === "ability") {
    opponent.currentGuard += incomingStrikeGuard(opponent, creatorRawDamage);
  }
  let damageToOpponent = Math.max(
    0,
    creatorRawDamage + creatorAbilityDamage - opponent.currentGuard,
  );
  let damageToCreator = Math.max(
    0,
    opponentRawDamage + opponentAbilityDamage - creator.currentGuard,
  );
  if (creatorAction === "ability" && creator.stats.abilityId === 28) {
    damageToOpponent = Math.max(0, 24 - opponent.currentGuard) * 2;
  }
  if (opponentAction === "ability" && opponent.stats.abilityId === 28) {
    damageToCreator = Math.max(0, 24 - creator.currentGuard) * 2;
  }
  if (creatorAction === "ability" && creator.stats.abilityId === 31) {
    const absorbed = Math.floor(damageToCreator / 2);
    creator.mana -= Math.min(
      creator.mana,
      Math.max(1, Math.ceil(absorbed / 10)),
      2,
    );
    damageToCreator -= absorbed;
  }
  if (opponentAction === "ability" && opponent.stats.abilityId === 31) {
    const absorbed = Math.floor(damageToOpponent / 2);
    opponent.mana -= Math.min(
      opponent.mana,
      Math.max(1, Math.ceil(absorbed / 10)),
      2,
    );
    damageToOpponent -= absorbed;
  }
  if (
    creatorAction === "ability" &&
    creator.stats.abilityId === 13 &&
    creatorAbilityDamage > 0
  ) {
    damageToOpponent = Math.max(18, damageToOpponent);
  }
  if (
    opponentAction === "ability" &&
    opponent.stats.abilityId === 13 &&
    opponentAbilityDamage > 0
  ) {
    damageToCreator = Math.max(18, damageToCreator);
  }
  creator.currentHp = Math.max(0, creator.currentHp - damageToCreator);
  opponent.currentHp = Math.max(0, opponent.currentHp - damageToOpponent);
  const heal = (fighter: SimultaneousFighter) =>
    ({ 2: 24, 8: 8, 17: 18, 22: 12 })[fighter.stats.abilityId] ?? 0;
  if (creatorAction === "ability")
    creator.currentHp = Math.min(
      creator.stats.hp,
      creator.currentHp + heal(creator),
    );
  if (opponentAction === "ability")
    opponent.currentHp = Math.min(
      opponent.stats.hp,
      opponent.currentHp + heal(opponent),
    );
  const manaRestore = (fighter: SimultaneousFighter) => {
    if (fighter.stats.abilityId === 34) return 6;
    if (fighter.stats.abilityId === 21) return 1;
    return [17, 38, 40].includes(fighter.stats.abilityId) ? 2 : 0;
  };
  if (creatorAction === "ability")
    creator.mana = Math.min(
      creator.stats.maxMana,
      creator.mana + manaRestore(creator),
    );
  if (opponentAction === "ability")
    opponent.mana = Math.min(
      opponent.stats.maxMana,
      opponent.mana + manaRestore(opponent),
    );
  const conditionalRefund = (
    fighter: SimultaneousFighter,
    foeAction: BattleAction,
  ) => {
    if (fighter.stats.abilityId === 14 && foeAction !== "guard") return 1;
    if ([16, 37].includes(fighter.stats.abilityId) && foeAction === "guard")
      return 2;
    if (fighter.stats.abilityId === 32 && foeAction === "recharge") return 1;
    return 0;
  };
  if (creatorAction === "ability") {
    creator.mana = Math.min(
      creator.stats.maxMana,
      creator.mana + conditionalRefund(creator, opponentAction),
    );
  }
  if (opponentAction === "ability") {
    opponent.mana = Math.min(
      opponent.stats.maxMana,
      opponent.mana + conditionalRefund(opponent, creatorAction),
    );
  }
  if (creatorAction === "ability" && creator.stats.abilityId === 27)
    creator.currentHp = Math.max(0, creator.currentHp - 12);
  if (opponentAction === "ability" && opponent.stats.abilityId === 27)
    opponent.currentHp = Math.max(0, opponent.currentHp - 12);
  if (creatorAction === "ability" && creator.stats.abilityId === 36)
    creator.currentHp = Math.max(0, creator.currentHp - 8);
  if (opponentAction === "ability" && opponent.stats.abilityId === 36)
    opponent.currentHp = Math.max(0, opponent.currentHp - 8);
  if (
    creatorAction === "ability" &&
    [15, 18].includes(creator.stats.abilityId)
  ) {
    opponent.mana = Math.max(
      0,
      opponent.mana -
        (creator.stats.abilityId === 18 && opponentAction !== "recharge"
          ? 0
          : 1),
    );
  }
  if (
    opponentAction === "ability" &&
    [15, 18].includes(opponent.stats.abilityId)
  ) {
    creator.mana = Math.max(
      0,
      creator.mana -
        (opponent.stats.abilityId === 18 && creatorAction !== "recharge"
          ? 0
          : 1),
    );
  }
  if (
    creatorAction === "ability" &&
    creator.stats.abilityId === 20 &&
    opponentRawDamage > 0
  ) {
    opponent.currentHp = Math.max(0, opponent.currentHp - 10);
  }
  if (
    opponentAction === "ability" &&
    opponent.stats.abilityId === 20 &&
    creatorRawDamage > 0
  ) {
    creator.currentHp = Math.max(0, creator.currentHp - 10);
  }
  if (
    creatorAction === "ability" &&
    creator.stats.abilityId === 30 &&
    opponentRawDamage > 0
  ) {
    creator.mana = Math.min(creator.stats.maxMana, creator.mana + 1);
  }
  if (
    opponentAction === "ability" &&
    opponent.stats.abilityId === 30 &&
    creatorRawDamage > 0
  ) {
    opponent.mana = Math.min(opponent.stats.maxMana, opponent.mana + 1);
  }
  if (
    creatorAction === "ability" &&
    creator.stats.abilityId === 4 &&
    creator.currentHp === 0
  )
    creator.currentHp = 1;
  if (
    opponentAction === "ability" &&
    opponent.stats.abilityId === 4 &&
    opponent.currentHp === 0
  )
    opponent.currentHp = 1;
  const creatorKnockedOut = creator.currentHp === 0;
  const opponentKnockedOut = opponent.currentHp === 0;
  advanceTeam(next.creator);
  advanceTeam(next.opponent);

  let outcome: BattleOutcome | null = null;
  if (
    next.creator.activeSlot === next.creator.fighters.length ||
    next.opponent.activeSlot === next.opponent.fighters.length
  ) {
    outcome =
      next.creator.activeSlot === next.creator.fighters.length &&
      next.opponent.activeSlot === next.opponent.fighters.length
        ? "tie"
        : next.creator.activeSlot === next.creator.fighters.length
          ? "opponent"
          : "creator";
  } else if (state.turn === MAX_MATCH_TURNS) {
    outcome = turnLimitOutcome(next);
  }
  if (outcome) {
    next.status = "finished";
    next.outcome = outcome;
  } else {
    next.turn += 1;
  }

  return {
    state: next,
    event: {
      turn: state.turn,
      creatorAction,
      opponentAction,
      creatorSlot: state.creator.activeSlot,
      opponentSlot: state.opponent.activeSlot,
      creatorHpBefore,
      creatorHpAfter: creator.currentHp,
      opponentHpBefore,
      opponentHpAfter: opponent.currentHp,
      creatorManaBefore,
      creatorManaAfter: creator.mana,
      opponentManaBefore,
      opponentManaAfter: opponent.mana,
      creatorGuard: creator.currentGuard,
      opponentGuard: opponent.currentGuard,
      damageToCreator,
      damageToOpponent,
      creatorKnockedOut,
      opponentKnockedOut,
      outcome,
    },
  };
}

export function forfeitBattle(
  state: SimultaneousBattleState,
  side: BattleSide,
): SimultaneousBattleState {
  if (state.status !== "active") return state;
  return {
    ...cloneState(state),
    status: "finished",
    outcome: side === "creator" ? "opponent" : "creator",
  };
}
