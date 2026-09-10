import { describe, expect, it } from "vitest";
import {
  BATTLE_COUNTDOWN_MS,
  BATTLE_EVENT_DURATION_MS,
  getBattleFrame,
} from "./battle-timeline";

describe("shared battle timeline", () => {
  const settledAt = 2_000_000_000n;
  const settledAtMilliseconds = Number(settledAt) * 1_000;
  const startsAt = settledAtMilliseconds + BATTLE_COUNTDOWN_MS;

  it("gives every client the same countdown from the onchain timestamp", () => {
    expect(getBattleFrame(settledAt, 3, startsAt - 2_200)).toEqual({
      eventCount: 0,
      countdownSeconds: 3,
      finished: false,
    });
  });

  it("derives progress from time instead of local play controls", () => {
    expect(getBattleFrame(settledAt, 3, startsAt).eventCount).toBe(1);
    expect(
      getBattleFrame(settledAt, 3, startsAt + BATTLE_EVENT_DURATION_MS)
        .eventCount,
    ).toBe(2);
  });

  it("finishes only after the shared event window has elapsed", () => {
    expect(
      getBattleFrame(settledAt, 3, startsAt + BATTLE_EVENT_DURATION_MS * 3 - 1)
        .finished,
    ).toBe(false);
    expect(
      getBattleFrame(settledAt, 3, startsAt + BATTLE_EVENT_DURATION_MS * 3),
    ).toMatchObject({ eventCount: 3, finished: true });
  });
});
