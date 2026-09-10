export const BATTLE_COUNTDOWN_MS = 4_000;
export const BATTLE_EVENT_DURATION_MS = 650;

export type BattleFrame = {
  eventCount: number;
  countdownSeconds: number;
  finished: boolean;
};

export function getBattleFrame(
  settledAtSeconds: bigint,
  totalEvents: number,
  nowMilliseconds: number,
): BattleFrame {
  if (!Number.isSafeInteger(totalEvents) || totalEvents < 0) {
    throw new Error("Battle event count must be a non-negative safe integer.");
  }
  if (!Number.isFinite(nowMilliseconds)) {
    throw new Error("Battle clock must be finite.");
  }
  const settledAtMilliseconds = Number(settledAtSeconds) * 1_000;
  if (!Number.isSafeInteger(settledAtMilliseconds)) {
    throw new Error(
      "Match settlement time is outside the browser clock range.",
    );
  }
  const startsAt = settledAtMilliseconds + BATTLE_COUNTDOWN_MS;
  const timeUntilStart = startsAt - nowMilliseconds;
  if (timeUntilStart > 0) {
    return {
      eventCount: 0,
      countdownSeconds: Math.ceil(timeUntilStart / 1_000),
      finished: totalEvents === 0,
    };
  }
  const elapsed = Math.max(0, nowMilliseconds - startsAt);
  const eventCount = Math.min(
    totalEvents,
    Math.floor(elapsed / BATTLE_EVENT_DURATION_MS) + 1,
  );
  return {
    eventCount,
    countdownSeconds: 0,
    finished:
      totalEvents === 0 || elapsed >= totalEvents * BATTLE_EVENT_DURATION_MS,
  };
}
