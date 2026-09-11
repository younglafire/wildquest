import type { BattleOutcome, BattleSide, BattleStats } from "./battle-engine";

export const TURN_CHOICE_DURATION_MS = 5_000;
export const TURN_ANIMATION_DURATION_MS = 1_250;
export const MAX_MATCH_TURNS = 30;
export const STARTING_MANA = 5;
export const MAX_MANA = 5;
export const STRIKE_MANA_COST = 2;
export const GUARD_MANA_COST = 1;
export const RECHARGE_MANA_GAIN = 3;
export const MAX_CONSECUTIVE_MISSED_TURNS = 3;

export const BATTLE_ACTIONS = ["strike", "guard", "recharge"] as const;
export type BattleAction = (typeof BATTLE_ACTIONS)[number];

export type SimultaneousFighter = {
  stats: BattleStats;
  currentHp: number;
  mana: number;
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
  return { stats: { ...stats }, currentHp: stats.hp, mana: STARTING_MANA };
}

function createTeam(stats: readonly BattleStats[]): SimultaneousTeam {
  if (stats.length !== 3) throw new Error("A battle team needs three creatures.");
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
  if (action === "strike") return fighter.mana >= STRIKE_MANA_COST;
  if (action === "guard") return fighter.mana >= GUARD_MANA_COST;
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
  const strikePower = attacker.attack + Math.floor(attacker.speed / 5);
  return Math.max(
    1,
    Math.floor((strikePower * 100) / (100 + defender.defense)),
  );
}

function spendOrGainMana(fighter: SimultaneousFighter, action: BattleAction) {
  if (!canUseAction(fighter, action)) {
    throw new Error(`Insufficient mana for ${action}.`);
  }
  if (action === "strike") return fighter.mana - STRIKE_MANA_COST;
  if (action === "guard") return fighter.mana - GUARD_MANA_COST;
  return Math.min(MAX_MANA, fighter.mana + RECHARGE_MANA_GAIN);
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
  if (state.status !== "active") throw new Error("The battle is already finished.");
  if (state.turn < 1 || state.turn > MAX_MATCH_TURNS) {
    throw new Error("The battle turn is outside the supported range.");
  }
  const next = cloneState(state);
  const creator = next.creator.fighters[next.creator.activeSlot];
  const opponent = next.opponent.fighters[next.opponent.activeSlot];
  if (!creator || !opponent || creator.currentHp === 0 || opponent.currentHp === 0) {
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

  const creatorRawDamage =
    creatorAction === "strike"
      ? calculateStrikeDamage(creator.stats, opponent.stats)
      : 0;
  const opponentRawDamage =
    opponentAction === "strike"
      ? calculateStrikeDamage(opponent.stats, creator.stats)
      : 0;
  const damageToOpponent = Math.max(
    0,
    creatorRawDamage - (opponentAction === "guard" ? opponent.stats.shield : 0),
  );
  const damageToCreator = Math.max(
    0,
    opponentRawDamage - (creatorAction === "guard" ? creator.stats.shield : 0),
  );
  creator.currentHp = Math.max(0, creator.currentHp - damageToCreator);
  opponent.currentHp = Math.max(0, opponent.currentHp - damageToOpponent);
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
