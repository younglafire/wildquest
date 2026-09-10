import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createKeyPairSignerFromBytes,
  devnet,
  unwrapOption,
  type KeyPairSigner,
} from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import { z } from "zod";
import {
  fetchGameConfig,
  findGameConfigPda,
  getAdminCloseCreatureInstructionAsync,
  getAdminCloseMatchInstructionAsync,
  MatchStatus,
} from "../app/generated/wildquest";
import { fetchCreatures } from "../app/lib/creatures";
import { fetchMatches } from "../app/lib/matches";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";

async function loadAdmin(): Promise<KeyPairSigner> {
  const keypairPath =
    process.env.WQ_ADMIN_KEYPAIR_PATH ??
    "/Users/doanbao/.config/solana/id.json";
  const serialized: unknown = JSON.parse(
    await readFile(path.resolve(keypairPath), "utf8"),
  );
  const bytes = z
    .array(z.number().int().min(0).max(255))
    .length(64)
    .parse(serialized);
  return createKeyPairSignerFromBytes(Uint8Array.from(bytes));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC_URL;
  const admin = await loadAdmin();
  const client = createClient({ url: devnet(rpcUrl), payer: admin });
  const [gameConfigAddress] = await findGameConfigPda();
  const gameConfig = await fetchGameConfig(client.rpc, gameConfigAddress, {
    commitment: "confirmed",
  });
  if (gameConfig.data.admin !== admin.address) {
    throw new Error(
      "The configured Devnet signer is not the game administrator.",
    );
  }

  const matches = await fetchMatches(client.rpc);
  const creatures = await fetchCreatures(client.rpc);
  if (dryRun) {
    console.info(
      `Reset preview: ${matches.length} Match and ${creatures.length} Creature accounts.`,
    );
    return;
  }
  console.info(`Closing ${matches.length} Match accounts safely.`);
  for (const match of matches) {
    const winner = unwrapOption(match.data.winner);
    const payoutRecipient =
      match.data.status === MatchStatus.Claimable && winner
        ? winner
        : match.data.creator;
    const instruction = await getAdminCloseMatchInstructionAsync({
      admin,
      matchAccount: match.address,
      creator: match.data.creator,
      payoutRecipient,
    });
    const result = await client.sendTransaction([instruction]);
    console.info(`Closed Match ${match.address}: ${result.context.signature}`);
  }

  console.info(`Closing ${creatures.length} Creature accounts.`);
  for (const creature of creatures) {
    const instruction = await getAdminCloseCreatureInstructionAsync({
      admin,
      creature: creature.address,
      owner: creature.data.owner,
    });
    const result = await client.sendTransaction([instruction]);
    console.info(
      `Closed Creature ${creature.address}: ${result.context.signature}`,
    );
  }

  const [remainingMatches, remainingCreatures] = await Promise.all([
    fetchMatches(client.rpc),
    fetchCreatures(client.rpc),
  ]);
  if (remainingMatches.length || remainingCreatures.length) {
    throw new Error(
      `Reset incomplete: ${remainingMatches.length} Match and ${remainingCreatures.length} Creature accounts remain.`,
    );
  }
  console.info(
    "Devnet battle ownership reset verified: 0 Matches, 0 Creatures.",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((thrownObject) => {
    console.error(
      thrownObject instanceof Error ? thrownObject.message : "Reset failed.",
    );
    process.exitCode = 1;
  });
}
