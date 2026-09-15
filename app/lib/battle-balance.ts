import type { BattleStats } from "./battle-engine";
import {
  canUseAction,
  createSimultaneousBattle,
  resolveSimultaneousTurn,
  type BattleAction,
  type SimultaneousBattleState,
} from "./simultaneous-battle";

export type BalanceMatch = {
  creatorIds: ReadonlyArray<number>;
  opponentIds: ReadonlyArray<number>;
  turns: number;
  outcome: "creator" | "opponent" | "tie";
  actions: Record<BattleAction, number>;
};

export type BalanceReport = {
  matches: number;
  medianTurns: number;
  drawRate: number;
  actionRates: Record<BattleAction, number>;
  creatureWinRates: Record<number, number>;
  maximumCreatureWinRate: number;
};

function chooseAction(
  state: SimultaneousBattleState,
  side: "creator" | "opponent",
  style: number,
): BattleAction {
  const team = state[side];
  const fighter = team.fighters[team.activeSlot]!;
  if (!canUseAction(fighter, "strike")) return "recharge";
  if ((state.turn + style) % 11 === 0 && canUseAction(fighter, "ability")) {
    return "ability";
  }
  const decision = (state.turn + style) % 7;
  const tacticalGuard = (state.turn * 3 + style) % 9 === 0;
  if (
    (decision === 0 || decision === 3 || tacticalGuard) &&
    canUseAction(fighter, "guard")
  ) {
    return "guard";
  }
  return "strike";
}

export function simulateBalanceMatch(input: {
  creatorIds: ReadonlyArray<number>;
  creatorStats: ReadonlyArray<BattleStats>;
  opponentIds: ReadonlyArray<number>;
  opponentStats: ReadonlyArray<BattleStats>;
  styleSeed: number;
}): BalanceMatch {
  let state = createSimultaneousBattle(input.creatorStats, input.opponentStats);
  const actions: Record<BattleAction, number> = {
    strike: 0,
    guard: 0,
    ability: 0,
    recharge: 0,
  };
  while (state.status === "active") {
    const creatorAction = chooseAction(state, "creator", input.styleSeed);
    const opponentAction = chooseAction(state, "opponent", input.styleSeed + 2);
    actions[creatorAction] += 1;
    actions[opponentAction] += 1;
    state = resolveSimultaneousTurn(state, creatorAction, opponentAction).state;
  }
  return {
    creatorIds: [...input.creatorIds],
    opponentIds: [...input.opponentIds],
    turns: state.turn,
    outcome: state.outcome!,
    actions,
  };
}

export function summarizeBalance(
  matches: ReadonlyArray<BalanceMatch>,
): BalanceReport {
  if (matches.length === 0) throw new Error("Balance analysis needs matches.");
  const turns = matches.map((match) => match.turns).sort((a, b) => a - b);
  const middle = Math.floor(turns.length / 2);
  const medianTurns =
    turns.length % 2 === 0
      ? (turns[middle - 1]! + turns[middle]!) / 2
      : turns[middle]!;
  const actions = { strike: 0, guard: 0, ability: 0, recharge: 0 };
  const appearances = new Map<number, number>();
  const wins = new Map<number, number>();
  for (const match of matches) {
    for (const action of Object.keys(actions) as BattleAction[]) {
      actions[action] += match.actions[action];
    }
    for (const id of [...match.creatorIds, ...match.opponentIds]) {
      appearances.set(id, (appearances.get(id) ?? 0) + 1);
    }
    const winningIds =
      match.outcome === "creator"
        ? match.creatorIds
        : match.outcome === "opponent"
          ? match.opponentIds
          : [];
    for (const id of winningIds) wins.set(id, (wins.get(id) ?? 0) + 1);
    if (match.outcome === "tie") {
      for (const id of [...match.creatorIds, ...match.opponentIds]) {
        wins.set(id, (wins.get(id) ?? 0) + 0.5);
      }
    }
  }
  const totalActions = Object.values(actions).reduce(
    (total, count) => total + count,
    0,
  );
  const creatureWinRates = Object.fromEntries(
    [...appearances].map(([id, count]) => [id, (wins.get(id) ?? 0) / count]),
  );
  return {
    matches: matches.length,
    medianTurns,
    drawRate:
      matches.filter((match) => match.outcome === "tie").length /
      matches.length,
    actionRates: {
      strike: actions.strike / totalActions,
      guard: actions.guard / totalActions,
      ability: actions.ability / totalActions,
      recharge: actions.recharge / totalActions,
    },
    creatureWinRates,
    maximumCreatureWinRate: Math.max(...Object.values(creatureWinRates)),
  };
}
