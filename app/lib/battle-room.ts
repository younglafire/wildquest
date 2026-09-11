import type { BattleOutcome, BattleSide, BattleStats } from "./battle-engine";
import {
  MAX_CONSECUTIVE_MISSED_TURNS,
  TURN_ANIMATION_DURATION_MS,
  TURN_CHOICE_DURATION_MS,
  createSimultaneousBattle,
  forfeitBattle,
  normalizeAction,
  resolveSimultaneousTurn,
  type BattleAction,
  type SimultaneousBattleState,
  type TurnEvent,
} from "./simultaneous-battle";

export type BattleRoomPhase =
  | "waiting"
  | "choosing"
  | "resolving"
  | "finished";

export type BattleRoomSnapshot = {
  matchAddress: string;
  sequence: number;
  phase: BattleRoomPhase;
  turnStartsAt: number | null;
  deadline: number | null;
  creatorConnected: boolean;
  opponentConnected: boolean;
  creatorLocked: boolean;
  opponentLocked: boolean;
  creatorMissedTurns: number;
  opponentMissedTurns: number;
  battle: SimultaneousBattleState;
  events: Array<TurnEvent>;
};

export type BattleRoomConfig = {
  matchAddress: string;
  creatorStats: readonly BattleStats[];
  opponentStats: readonly BattleStats[];
};

type FinishHandler = (
  outcome: BattleOutcome,
  turnCount: number,
  events: ReadonlyArray<TurnEvent>,
) => void | Promise<void>;

export class BattleRoom {
  readonly #matchAddress: string;
  readonly #finishHandler: FinishHandler;
  #battle: SimultaneousBattleState;
  #events: Array<TurnEvent> = [];
  #sequence = 0;
  #phase: BattleRoomPhase = "waiting";
  #turnStartsAt: number | null = null;
  #deadline: number | null = null;
  #connected: Record<BattleSide, boolean> = {
    creator: false,
    opponent: false,
  };
  #choices: Partial<Record<BattleSide, BattleAction>> = {};
  #missedTurns: Record<BattleSide, number> = { creator: 0, opponent: 0 };
  #finishNotified = false;

  constructor(config: BattleRoomConfig, finishHandler: FinishHandler = () => {}) {
    this.#matchAddress = config.matchAddress;
    this.#battle = createSimultaneousBattle(
      config.creatorStats,
      config.opponentStats,
    );
    this.#finishHandler = finishHandler;
  }

  connect(side: BattleSide, now = Date.now()) {
    this.#connected[side] = true;
    this.#sequence += 1;
    if (
      this.#phase === "waiting" &&
      this.#connected.creator &&
      this.#connected.opponent
    ) {
      this.#startTurn(now);
    }
    return this.snapshot();
  }

  disconnect(side: BattleSide) {
    this.#connected[side] = false;
    this.#sequence += 1;
    return this.snapshot();
  }

  submit(side: BattleSide, action: BattleAction, turn: number, now = Date.now()) {
    this.#advanceClock(now);
    if (this.#phase !== "choosing" || this.#deadline === null) {
      throw new Error("The room is not accepting a turn choice.");
    }
    if (turn !== this.#battle.turn) throw new Error("The turn choice is stale.");
    if (now >= this.#deadline) throw new Error("The turn choice arrived after the deadline.");
    const team = this.#battle[side];
    const fighter = team.fighters[team.activeSlot];
    if (!fighter) throw new Error("The active creature is unavailable.");
    const choice = normalizeAction(fighter, action);
    if (choice.missed) throw new Error(`The active creature cannot use ${action}.`);
    this.#choices[side] = action;
    this.#sequence += 1;
    if (this.#choices.creator && this.#choices.opponent) {
      this.#resolve(now);
    }
    return this.snapshot();
  }

  tick(now = Date.now()) {
    this.#advanceClock(now);
    return this.snapshot();
  }

  snapshot(): BattleRoomSnapshot {
    return structuredClone({
      matchAddress: this.#matchAddress,
      sequence: this.#sequence,
      phase: this.#phase,
      turnStartsAt: this.#turnStartsAt,
      deadline: this.#deadline,
      creatorConnected: this.#connected.creator,
      opponentConnected: this.#connected.opponent,
      creatorLocked: Boolean(this.#choices.creator),
      opponentLocked: Boolean(this.#choices.opponent),
      creatorMissedTurns: this.#missedTurns.creator,
      opponentMissedTurns: this.#missedTurns.opponent,
      battle: this.#battle,
      events: this.#events,
    });
  }

  #advanceClock(now: number) {
    if (
      this.#phase === "resolving" &&
      this.#turnStartsAt !== null &&
      now >= this.#turnStartsAt
    ) {
      this.#startTurn(this.#turnStartsAt);
    }
    if (
      this.#phase === "choosing" &&
      this.#deadline !== null &&
      now >= this.#deadline
    ) {
      this.#resolve(this.#deadline);
    }
  }

  #startTurn(now: number) {
    this.#phase = "choosing";
    this.#turnStartsAt = now;
    this.#deadline = now + TURN_CHOICE_DURATION_MS;
    this.#choices = {};
    this.#sequence += 1;
  }

  #resolve(now: number) {
    const creatorFighter =
      this.#battle.creator.fighters[this.#battle.creator.activeSlot];
    const opponentFighter =
      this.#battle.opponent.fighters[this.#battle.opponent.activeSlot];
    if (!creatorFighter || !opponentFighter) {
      throw new Error("The active creatures are unavailable.");
    }
    const creatorChoice = normalizeAction(
      creatorFighter,
      this.#choices.creator ?? null,
    );
    const opponentChoice = normalizeAction(
      opponentFighter,
      this.#choices.opponent ?? null,
    );
    this.#missedTurns.creator = creatorChoice.missed
      ? this.#missedTurns.creator + 1
      : 0;
    this.#missedTurns.opponent = opponentChoice.missed
      ? this.#missedTurns.opponent + 1
      : 0;

    const creatorForfeits =
      this.#missedTurns.creator >= MAX_CONSECUTIVE_MISSED_TURNS;
    const opponentForfeits =
      this.#missedTurns.opponent >= MAX_CONSECUTIVE_MISSED_TURNS;
    if (creatorForfeits || opponentForfeits) {
      this.#battle =
        creatorForfeits && opponentForfeits
          ? { ...this.#battle, status: "finished", outcome: "tie" }
          : forfeitBattle(
              this.#battle,
              creatorForfeits ? "creator" : "opponent",
            );
    } else {
      const result = resolveSimultaneousTurn(
        this.#battle,
        creatorChoice.action,
        opponentChoice.action,
      );
      this.#battle = result.state;
      this.#events.push(result.event);
    }
    this.#choices = {};
    this.#deadline = null;
    this.#sequence += 1;

    if (this.#battle.status === "finished") {
      this.#phase = "finished";
      this.#turnStartsAt = null;
      this.#notifyFinish();
      return;
    }
    this.#phase = "resolving";
    this.#turnStartsAt = now + TURN_ANIMATION_DURATION_MS;
  }

  #notifyFinish() {
    if (this.#finishNotified || !this.#battle.outcome) return;
    this.#finishNotified = true;
    void this.#finishHandler(
      this.#battle.outcome,
      this.#events.at(-1)?.turn ?? this.#battle.turn,
      structuredClone(this.#events),
    );
  }
}

export function serializeBattleResult(
  matchAddress: string,
  outcome: BattleOutcome,
  turnCount: number,
  events: ReadonlyArray<TurnEvent>,
) {
  return JSON.stringify({ matchAddress, outcome, turnCount, events });
}
