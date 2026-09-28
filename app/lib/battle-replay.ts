import { z } from "zod";
import { serializeBattleResult } from "./battle-room";

const actionSchema = z.enum(["strike", "guard", "ability", "recharge"]);
const outcomeSchema = z.enum(["creator", "opponent", "tie"]);

export const turnEventSchema = z.object({
  turn: z.number().int().positive(),
  creatorAction: actionSchema,
  opponentAction: actionSchema,
  creatorSlot: z.number().int().min(0).max(2),
  opponentSlot: z.number().int().min(0).max(2),
  creatorHpBefore: z.number().int().nonnegative(),
  creatorHpAfter: z.number().int().nonnegative(),
  opponentHpBefore: z.number().int().nonnegative(),
  opponentHpAfter: z.number().int().nonnegative(),
  creatorManaBefore: z.number().int().nonnegative(),
  creatorManaAfter: z.number().int().nonnegative(),
  opponentManaBefore: z.number().int().nonnegative(),
  opponentManaAfter: z.number().int().nonnegative(),
  creatorGuard: z.number().int().nonnegative(),
  opponentGuard: z.number().int().nonnegative(),
  damageToCreator: z.number().int().nonnegative(),
  damageToOpponent: z.number().int().nonnegative(),
  creatorKnockedOut: z.boolean(),
  opponentKnockedOut: z.boolean(),
  outcome: outcomeSchema.nullable(),
});

export const battleReplaySchema = z.object({
  match_address: z.string().min(32),
  rules_version: z.number().int().positive(),
  balance_version: z.number().int().positive(),
  outcome: outcomeSchema,
  turn_count: z.number().int().min(1).max(30),
  result_hash: z.string().regex(/^[0-9a-f]{64}$/),
  events: z.array(turnEventSchema),
});

export type BattleReplay = z.infer<typeof battleReplaySchema>;

function bytesToHex(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function verifyBattleReplay(
  replay: BattleReplay,
  expectedResultHash: Uint8Array,
) {
  const payload = serializeBattleResult(
    replay.match_address,
    replay.outcome,
    replay.turn_count,
    replay.events,
    replay.rules_version,
    replay.balance_version,
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return (
    bytesToHex(digest) === replay.result_hash &&
    replay.result_hash === bytesToHex(expectedResultHash)
  );
}
