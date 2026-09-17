import type { WalletSession } from "../wallet/types";
import {
  generateChallengeSchema,
  generateResponseSchema,
} from "./generate-schema";

async function post(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result?.error?.message ?? "Generation is unavailable.");
  return result as unknown;
}

export async function fetchGenerationAccess(wallet: string, cluster: string) {
  const response = await fetch(
    `/api/admin/generate-creature?${new URLSearchParams({ wallet, cluster })}`,
    { cache: "no-store" },
  );
  if (!response.ok) return false;
  const result = await response.json();
  return result?.enabled === true;
}

export async function generateCreature(
  wallet: WalletSession,
  catalogueId: string,
) {
  if (!wallet.signMessage)
    throw new Error("This wallet cannot sign the admin verification message.");
  const input = {
    wallet: wallet.account.address,
    catalogue_id: catalogueId,
    cluster: "devnet",
  };
  const challenge = generateChallengeSchema.parse(
    await post("/api/admin/generate-creature/challenge", input),
  );
  const signature = await wallet.signMessage(
    new TextEncoder().encode(challenge.message),
  );
  const result = generateResponseSchema.parse(
    await post("/api/admin/generate-creature", {
      ...input,
      token: challenge.token,
      signature: Array.from(signature, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    }),
  );
  if (result.catalogue_id !== catalogueId)
    throw new Error("Generation returned a different Creature.");
  return result.capture_transaction;
}
