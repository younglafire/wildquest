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

export const WAITING_FOR_OPPONENT_TIMEOUT_MS = 20_000;

export type BattleRoomPhase = "waiting" | "choosing" | "resolving" | "finished";

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
  settlementStatus: "idle" | "pending" | "confirmed" | "failed";
  settlementError: string | null;
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
  #connectionDeadline: number | null = null;
  #turnStartsAt: number | null = null;
  #deadline: number | null = null;
  #connected: Record<BattleSide, boolean> = {
    creator: false,
    opponent: false,
  };
  #choices: Partial<Record<BattleSide, BattleAction>> = {};
  #missedTurns: Record<BattleSide, number> = { creator: 0, opponent: 0 };
  #finishNotified = false;
  #settlementStatus: BattleRoomSnapshot["settlementStatus"] = "idle";
  #settlementError: string | null = null;
  #nextSettlementAttemptAt: number | null = null;

  constructor(
    config: BattleRoomConfig,
    finishHandler: FinishHandler = () => {},
  ) {
    this.#matchAddress = config.matchAddress;
    this.#battle = createSimultaneousBattle(
      config.creatorStats,
      config.opponentStats,
    );
    this.#finishHandler = finishHandler;
  }

  connect(side: BattleSide, now = Date.now()) {
    const wasWaitingForOpponent =
      this.#phase === "waiting" &&
      !this.#connected.creator &&
      !this.#connected.opponent;
    this.#connected[side] = true;
    this.#sequence += 1;
    if (
      this.#phase === "waiting" &&
      this.#connected.creator &&
      this.#connected.opponent
    ) {
      this.#connectionDeadline = null;
      this.#startTurn(now);
    } else if (wasWaitingForOpponent) {
      this.#connectionDeadline = now + WAITING_FOR_OPPONENT_TIMEOUT_MS;
    }
    return this.snapshot();
  }

  disconnect(side: BattleSide) {
    this.#connected[side] = false;
    this.#sequence += 1;
    return this.snapshot();
  }

  submit(
    side: BattleSide,
    action: BattleAction,
    turn: number,
    now = Date.now(),
  ) {
    this.#advanceClock(now);
    if (this.#phase !== "choosing" || this.#deadline === null) {
      throw new Error("The room is not accepting a turn choice.");
    }
    if (turn !== this.#battle.turn)
      throw new Error("The turn choice is stale.");
    if (now >= this.#deadline)
      throw new Error("The turn choice arrived after the deadline.");
    if (this.#choices[side]) {
      throw new Error("The turn choice is already locked.");
    }
    const team = this.#battle[side];
    const fighter = team.fighters[team.activeSlot];
    if (!fighter) throw new Error("The active creature is unavailable.");
    const choice = normalizeAction(fighter, action);
    if (choice.missed)
      throw new Error(`The active creature cannot use ${action}.`);
    this.#choices[side] = action;
    this.#sequence += 1;
    if (this.#choices.creator && this.#choices.opponent) {
      this.#resolve(now);
    }
    return this.snapshot();
  }

  tick(now = Date.now()) {
    this.#advanceClock(now);
    if (
      this.#phase === "finished" &&
      this.#settlementStatus === "failed" &&
      this.#nextSettlementAttemptAt !== null &&
      now >= this.#nextSettlementAttemptAt
    ) {
      this.#runSettlement(now);
    }
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
      settlementStatus: this.#settlementStatus,
      settlementError: this.#settlementError,
    });
  }

  #advanceClock(now: number) {
    if (
      this.#phase === "waiting" &&
      this.#connectionDeadline !== null &&
      now >= this.#connectionDeadline
    ) {
      this.#cancelWaitingMatch(now);
    }
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

  #cancelWaitingMatch(now: number) {
    this.#battle = { ...this.#battle, status: "finished", outcome: "tie" };
    this.#connectionDeadline = null;
    this.#phase = "finished";
    this.#turnStartsAt = null;
    this.#deadline = null;
    this.#sequence += 1;
    this.#notifyFinish(now);
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
      this.#notifyFinish(now);
      return;
    }
    this.#phase = "resolving";
    this.#turnStartsAt = now + TURN_ANIMATION_DURATION_MS;
  }

  #notifyFinish(now: number) {
    if (this.#finishNotified || !this.#battle.outcome) return;
    this.#finishNotified = true;
    this.#runSettlement(now);
  }

  #runSettlement(now: number) {
    if (!this.#battle.outcome || this.#settlementStatus === "pending") return;
    this.#settlementStatus = "pending";
    this.#settlementError = null;
    this.#nextSettlementAttemptAt = null;
    this.#sequence += 1;
    void Promise.resolve(
      this.#finishHandler(
        this.#battle.outcome,
        this.#events.at(-1)?.turn ?? this.#battle.turn,
        structuredClone(this.#events),
      ),
    ).then(
      () => {
        this.#settlementStatus = "confirmed";
        this.#sequence += 1;
      },
      (error: unknown) => {
        this.#settlementStatus = "failed";
        this.#settlementError =
          error instanceof Error ? error.message : "Settlement failed.";
        this.#nextSettlementAttemptAt = now + 3_000;
        this.#sequence += 1;
      },
    );
  }
}

export function serializeBattleResult(
  matchAddress: string,
  outcome: BattleOutcome,
  turnCount: number,
  events: ReadonlyArray<TurnEvent>,
  rulesVersion?: number,
  balanceVersion?: number,
) {
  return JSON.stringify({
    matchAddress,
    outcome,
    turnCount,
    rulesVersion,
    balanceVersion,
    events,
  });
}
