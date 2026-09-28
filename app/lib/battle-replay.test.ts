import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { serializeBattleResult } from "./battle-room";
import { battleReplaySchema, verifyBattleReplay } from "./battle-replay";

describe("battle replay verification", () => {
  it("accepts only the canonical payload stored onchain", async () => {
    const matchAddress = "11111111111111111111111111111111";
    const payload = serializeBattleResult(matchAddress, "tie", 1, [], 2, 2);
    const resultHash = new Uint8Array(
      createHash("sha256").update(payload).digest(),
    );
    const replay = battleReplaySchema.parse({
      match_address: matchAddress,
      rules_version: 2,
      balance_version: 2,
      outcome: "tie",
      turn_count: 1,
      result_hash: Buffer.from(resultHash).toString("hex"),
      events: [],
    });

    await expect(verifyBattleReplay(replay, resultHash)).resolves.toBe(true);
    await expect(
      verifyBattleReplay({ ...replay, outcome: "creator" }, resultHash),
    ).resolves.toBe(false);
  });
});
