export const TEAM_SIZE = 3;
export const MAX_BATTLE_ROUNDS = 50;

export type BattleStats = {
  hp: number;
  attack: number;
  defense: number;
  maxMana: number;
  strikeCost: number;
  guardCost: number;
  rechargeGain: number;
  abilityId: number;
  abilityCost: number;
};

export type BattleSide = "creator" | "opponent";
export type BattleOutcome = BattleSide | "tie";

export type BattleEvent = {
  round: number;
  attackerSide: BattleSide;
  attackerSlot: number;
  defenderSlot: number;
  damage: number;
  hpBefore: number;
  hpAfter: number;
};

export type BattleReport = {
  outcome: BattleOutcome;
  events: BattleEvent[];
};

type Fighter = BattleStats & { currentHp: number };

function validateTeam(
  team: readonly BattleStats[],
): asserts team is readonly [BattleStats, BattleStats, BattleStats] {
  if (team.length !== TEAM_SIZE)
    throw new Error("A battle team needs three creatures.");
  for (const stats of team) {
    for (const value of Object.values(stats)) {
      if (!Number.isSafeInteger(value) || value < 0 || value > 65_535) {
        throw new Error("Battle stats must be unsigned 16-bit integers.");
      }
    }
  }
  if (team.every((stats) => stats.hp === 0)) {
    throw new Error("A battle team must have starting power.");
  }
}

function damage(attack: number, defense: number) {
  return Math.max(1, Math.floor((attack * 100) / (100 + defense)));
}

function hit(
  defender: Fighter,
  round: number,
  attackerSide: BattleSide,
  attackerSlot: number,
  defenderSlot: number,
  amount: number,
): BattleEvent {
  const hpBefore = defender.currentHp;
  defender.currentHp = Math.max(0, defender.currentHp - amount);
  return {
    round,
    attackerSide,
    attackerSlot,
    defenderSlot,
    damage: amount,
    hpBefore,
    hpAfter: defender.currentHp,
  };
}

function nextActive(team: readonly Fighter[], index: number) {
  let next = index;
  while (next < TEAM_SIZE && team[next]!.currentHp === 0) next += 1;
  return next;
}

export function simulateBattle(
  creatorStats: readonly BattleStats[],
  opponentStats: readonly BattleStats[],
): BattleReport {
  validateTeam(creatorStats);
  validateTeam(opponentStats);
  const creator = creatorStats.map((stats) => ({
    ...stats,
    currentHp: stats.hp,
  }));
  const opponent = opponentStats.map((stats) => ({
    ...stats,
    currentHp: stats.hp,
  }));
  const creatorStart = creator.reduce((sum, item) => sum + item.hp, 0);
  const opponentStart = opponent.reduce((sum, item) => sum + item.hp, 0);
  const events: BattleEvent[] = [];
  let creatorSlot = 0;
  let opponentSlot = 0;

  for (let round = 1; round <= MAX_BATTLE_ROUNDS; round += 1) {
    creatorSlot = nextActive(creator, creatorSlot);
    opponentSlot = nextActive(opponent, opponentSlot);
    if (creatorSlot === TEAM_SIZE || opponentSlot === TEAM_SIZE) {
      return {
        outcome:
          creatorSlot === TEAM_SIZE && opponentSlot === TEAM_SIZE
            ? "tie"
            : creatorSlot === TEAM_SIZE
              ? "opponent"
              : "creator",
        events,
      };
    }

    const creatorFighter = creator[creatorSlot]!;
    const opponentFighter = opponent[opponentSlot]!;
    const creatorDamage = damage(
      creatorFighter.attack,
      opponentFighter.defense,
    );
    const opponentDamage = damage(
      opponentFighter.attack,
      creatorFighter.defense,
    );
    const creatorHit = () =>
      events.push(
        hit(
          opponentFighter,
          round,
          "creator",
          creatorSlot,
          opponentSlot,
          creatorDamage,
        ),
      );
    const opponentHit = () =>
      events.push(
        hit(
          creatorFighter,
          round,
          "opponent",
          opponentSlot,
          creatorSlot,
          opponentDamage,
        ),
      );

    creatorHit();
    opponentHit();
  }

  const creatorRemaining = creator.reduce(
    (sum, item) => sum + item.currentHp,
    0,
  );
  const opponentRemaining = opponent.reduce(
    (sum, item) => sum + item.currentHp,
    0,
  );
  const creatorRatio = creatorRemaining * opponentStart;
  const opponentRatio = opponentRemaining * creatorStart;
  return {
    outcome:
      creatorRatio > opponentRatio
        ? "creator"
        : opponentRatio > creatorRatio
          ? "opponent"
          : "tie",
    events,
  };
}
