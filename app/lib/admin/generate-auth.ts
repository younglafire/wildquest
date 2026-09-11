import {
  createHmac,
  createPublicKey,
  randomBytes,
  timingSafeEqual,
  verify,
} from "node:crypto";
import { getAddressEncoder } from "@solana/kit";
import { z } from "zod";
import { generateRequestSchema } from "./generate-schema";

const CHALLENGE_LIFETIME_MS = 120_000;
const challengePayloadSchema = generateRequestSchema
  .extend({
    origin: z.string().url(),
    nonce: z.string().regex(/^[0-9a-f]{32}$/),
    expires: z.number().int(),
  })
  .strict();

export function generationEnabled() {
  return (
    process.env.ENABLE_GENERATE_ANIMAL === "true" &&
    (process.env.GENERATE_ANIMAL_CHALLENGE_SECRET?.length ?? 0) >= 32
  );
}

function mac(payload: string) {
  const secret = process.env.GENERATE_ANIMAL_CHALLENGE_SECRET;
  if (!generationEnabled() || !secret)
    throw new Error("Generation is disabled.");
  return createHmac("sha256", secret).update(payload).digest();
}

function challengeMessage(payload: z.infer<typeof challengePayloadSchema>) {
  return [
    "WildQuest: generate one Devnet demo Creature",
    `Website: ${payload.origin}`,
    `Wallet: ${payload.wallet}`,
    `Catalogue ID: ${payload.catalogue_id}`,
    "Network: devnet",
    `Expires: ${new Date(payload.expires).toISOString()}`,
    `Nonce: ${payload.nonce}`,
    "This message authorizes a demo request. A separate transaction creates the Creature.",
  ].join("\n");
}

export function issueGenerateChallenge(
  input: z.infer<typeof generateRequestSchema>,
  origin: string,
  now = Date.now(),
) {
  const payload = {
    ...input,
    origin,
    nonce: randomBytes(16).toString("hex"),
    expires: now + CHALLENGE_LIFETIME_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return {
    message: challengeMessage(payload),
    token: `${encoded}.${mac(encoded).toString("hex")}`,
  };
}

export function verifyGenerateChallenge(
  input: z.infer<typeof generateRequestSchema> & {
    token: string;
    signature: string;
  },
  origin: string,
  now = Date.now(),
) {
  try {
    if (!generationEnabled()) return false;
    const parts = input.token.split(".");
    if (parts.length !== 2 || !/^[0-9a-f]{64}$/.test(parts[1])) return false;
    if (!timingSafeEqual(mac(parts[0]), Buffer.from(parts[1], "hex")))
      return false;
    const payload = challengePayloadSchema.parse(
      JSON.parse(Buffer.from(parts[0], "base64url").toString()),
    );
    if (
      payload.origin !== origin ||
      payload.wallet !== input.wallet ||
      payload.catalogue_id !== input.catalogue_id ||
      payload.cluster !== input.cluster ||
      payload.expires <= now ||
      payload.expires > now + CHALLENGE_LIFETIME_MS
    )
      return false;
    const key = createPublicKey({
      key: Buffer.concat([
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(getAddressEncoder().encode(payload.wallet)),
      ]),
      format: "der",
      type: "spki",
    });
    return verify(
      null,
      Buffer.from(challengeMessage(payload)),
      key,
      Buffer.from(input.signature, "hex"),
    );
  } catch {
    return false;
  }
}
