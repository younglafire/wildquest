import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createKeyPairSignerFromBytes,
  devnet,
  type KeyPairSigner,
} from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import { z } from "zod";
import {
  fetchMaybeCreature,
  fetchMaybeGameConfig,
  fetchMaybeSpeciesConfig,
  findCreaturePda,
  findGameConfigPda,
  findSpeciesConfigPda,
  getActivateTurnCombatInstruction,
  getCaptureCreatureInstructionAsync,
  getInitializeGameConfigInstructionAsync,
  getInitializeSpeciesConfigInstructionAsync,
} from "../app/generated/wildquest";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const CATALOGUE_IDS = Array.from({ length: 40 }, (_, index) =>
  BigInt(1001 + index),
);
const MINIMUM_ADMIN_BALANCE = 30_000_000n;
const MINIMUM_WALLET_BALANCE = 20_000_000n;

async function loadSigner(
  variableName: string,
  defaultPath: string,
): Promise<KeyPairSigner> {
  const keypairPath = process.env[variableName] ?? defaultPath;

  const serialized: unknown = JSON.parse(
    await readFile(path.resolve(keypairPath), "utf8"),
  );
  const bytes = z
    .array(z.number().int().min(0).max(255))
    .length(64)
    .parse(serialized);
  return createKeyPairSignerFromBytes(Uint8Array.from(bytes));
}

function demoProof(owner: string, catalogueId: bigint): Uint8Array {
  return new Uint8Array(
    createHash("sha256")
      .update(`wildquest-pk-demo:v1:${owner}:${catalogueId}`)
      .digest(),
  );
}

async function requireBalance(
  rpc: ReturnType<typeof createClient>["rpc"],
  signer: KeyPairSigner,
  minimum: bigint,
) {
  const balance = await rpc
    .getBalance(signer.address, { commitment: "confirmed" })
    .send();
  if (balance.value < minimum) {
    throw new Error(
      `${signer.address} needs at least ${Number(minimum) / 1_000_000_000} Devnet SOL.`,
    );
  }
}

async function ensureGameConfig(
  client: ReturnType<typeof createClient>,
  admin: KeyPairSigner,
  captureAuthority: KeyPairSigner,
) {
  const [address] = await findGameConfigPda();
  const existing = await fetchMaybeGameConfig(client.rpc, address, {
    commitment: "confirmed",
  });

  if (existing.exists) {
    if (
      existing.data.admin !== admin.address ||
      existing.data.captureAuthority !== captureAuthority.address
    ) {
      throw new Error(
        "GameConfig already exists with a different admin or capture authority.",
      );
    }
    console.info(`GameConfig already exists: ${address}`);
    if (
      existing.data.rulesVersion !== 2 ||
      existing.data.balanceVersion !== 2
    ) {
      const instruction = getActivateTurnCombatInstruction({
        admin,
        gameConfig: address,
      });
      const result = await client.sendTransaction([instruction]);
      console.info(
        `Activated simultaneous turn rules: ${result.context.signature}`,
      );
    }
    return;
  }

  const instruction = await getInitializeGameConfigInstructionAsync({
    admin,
    captureAuthority: captureAuthority.address,
  });
  const result = await client.sendTransaction([instruction]);
  console.info(`Created GameConfig: ${result.context.signature}`);
}

async function ensureSpeciesConfigs(
  client: ReturnType<typeof createClient>,
  admin: KeyPairSigner,
) {
  for (const catalogueId of CATALOGUE_IDS) {
    const [address] = await findSpeciesConfigPda({ catalogueId });
    const existing = await fetchMaybeSpeciesConfig(client.rpc, address, {
      commitment: "confirmed",
    });
    if (existing.exists) {
      console.info(`SpeciesConfig ${catalogueId} already exists: ${address}`);
      continue;
    }

    const instruction = await getInitializeSpeciesConfigInstructionAsync({
      admin,
      catalogueId,
    });
    const result = await client.sendTransaction([instruction]);
    console.info(
      `Created SpeciesConfig ${catalogueId}: ${result.context.signature}`,
    );
  }
}

async function ensureRoster(
  rpcUrl: string,
  owner: KeyPairSigner,
  captureAuthority: KeyPairSigner,
) {
  const client = createClient({ url: devnet(rpcUrl), payer: owner });
  await requireBalance(client.rpc, owner, MINIMUM_WALLET_BALANCE);

  for (const catalogueId of CATALOGUE_IDS) {
    const [address] = await findCreaturePda({
      owner: owner.address,
      catalogueId,
    });
    const existing = await fetchMaybeCreature(client.rpc, address, {
      commitment: "confirmed",
    });
    if (existing.exists) {
      console.info(
        `Creature ${catalogueId} already exists for ${owner.address}: ${address}`,
      );
      continue;
    }

    const instruction = await getCaptureCreatureInstructionAsync({
      owner,
      captureAuthority,
      catalogueId,
      proofHash: demoProof(owner.address, catalogueId),
    });
    const result = await client.sendTransaction([instruction]);
    console.info(
      `Created Creature ${catalogueId} for ${owner.address}: ${result.context.signature}`,
    );
  }
}

async function main() {
  const configsOnly = process.argv.includes("--configs-only");
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC_URL;
  const admin = await loadSigner(
    "WQ_ADMIN_KEYPAIR_PATH",
    "/Users/doanbao/.config/solana/id.json",
  );
  const captureAuthority = await loadSigner(
    "WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH",
    ".wildquest-keys/capture-authority.json",
  );
  if (admin.address === captureAuthority.address) {
    throw new Error(
      "Use a dedicated capture authority; do not reuse the program admin keypair.",
    );
  }
  const adminClient = createClient({ url: devnet(rpcUrl), payer: admin });
  await requireBalance(adminClient.rpc, admin, MINIMUM_ADMIN_BALANCE);
  await ensureGameConfig(adminClient, admin, captureAuthority);
  await ensureSpeciesConfigs(adminClient, admin);
  if (configsOnly) {
    console.info("Battle configuration setup complete.");
    return;
  }
  const walletA = await loadSigner(
    "WQ_DEMO_WALLET_A_KEYPAIR_PATH",
    ".wildquest-keys/demo-wallet-a.json",
  );
  const walletB = await loadSigner(
    "WQ_DEMO_WALLET_B_KEYPAIR_PATH",
    ".wildquest-keys/demo-wallet-b.json",
  );
  if (walletA.address === walletB.address) {
    throw new Error("Demo wallet A and B must be different wallets.");
  }
  await ensureRoster(rpcUrl, walletA, captureAuthority);
  await ensureRoster(rpcUrl, walletB, captureAuthority);
  console.info("Demo roster setup complete for both wallets.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((thrownObject) => {
    console.error(
      thrownObject instanceof Error ? thrownObject.message : "Setup failed.",
    );
    process.exitCode = 1;
  });
}
