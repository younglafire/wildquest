import { spawn, type ChildProcess } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createKeyPairSignerFromBytes,
  devnet,
  isSignature,
  type KeyPairSigner,
  type Signature,
} from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import sharp from "sharp";
import { z } from "zod";
import {
  fetchDiscovery,
  fetchMaybeDiscovery,
  fetchMaybePlayer,
  fetchPlayer,
  findDiscoveryPda,
  findPlayerPda,
} from "../app/generated/wildquest";
import { catalogueSpeciesSchema } from "../app/lib/catalogue-client";
import { fetchPlayerDiscoveries } from "../app/lib/collection";
import { buildDiscoveryInstructions } from "../app/lib/discovery-transaction";
import { proofHashToBytes } from "../app/lib/expedition";
import {
  createPerceptualImageHash,
  getPerceptualHashDistance,
  PERCEPTUAL_HASH_DISTANCE_THRESHOLD,
} from "../app/lib/vision/perceptual-hash";
import {
  identifySuccessSchema,
  type Identification,
} from "../app/lib/vision/schema";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_RUN_COUNT = 10;
const MINIMUM_SUCCESS_RATE = 0.9;
const MINIMUM_TEST_BALANCE_LAMPORTS = 20_000_000n;
const SERVER_START_TIMEOUT_MS = 90_000;
const HTTP_TIMEOUT_MS = 70_000;
const RUN_SPACING_MS = 1_000;
const RPC_RETRY_DELAYS_MS = [500, 1_000, 2_000, 4_000, 8_000] as const;

type FixtureSource =
  { name: string; path: string } | { name: string; url: string };

const GOLDEN_RETRIEVER_FIXTURES: Array<FixtureSource> = [
  {
    name: "Shara golden retriever",
    url: commonsFileUrl("Shara.golden.retriever.jpg"),
  },
  {
    name: "Sitting golden retriever",
    url: commonsFileUrl("Sitting golden retriever.jpg"),
  },
  {
    name: "Golden retriever dog",
    url: commonsFileUrl("Golden-retriever-dog.jpg"),
  },
  {
    name: "Golden Retriever adult",
    url: commonsFileUrl("Golden Retriever adult.jpg"),
  },
  {
    name: "Image of golden retriever",
    url: commonsFileUrl("Image of golden retriever.jpg"),
  },
  {
    name: "Golden Retriever Pet Dog",
    url: commonsFileUrl("Golden Retriever (Pet Dog).jpg"),
  },
  {
    name: "Golden Retriever lying",
    url: commonsFileUrl("Golden Retriever -.jpg"),
  },
  {
    name: "Guide dog golden retriever",
    url: commonsFileUrl("Guide dog golden retriever.jpg"),
  },
  {
    name: "Golden Retriever Yardie",
    url: commonsFileUrl("Golden Retriever Yardie.jpg"),
  },
  {
    name: "Golden Retriever 7 weeks",
    url: commonsFileUrl("Golden Retriever - 7 weeks.jpg"),
  },
];

const catalogueResponseSchema = z
  .object({ species: z.array(catalogueSpeciesSchema) })
  .strict();

const identifyErrorSchema = z
  .object({
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .passthrough(),
  })
  .strict();

type RunResult = {
  run: number;
  fixture: string;
  succeeded: boolean;
  durationMs: number;
  signature?: string;
  error?: string;
};

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function commonsFileUrl(filename: string) {
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;
}

function ensureError(thrownObject: unknown): Error {
  if (thrownObject instanceof Error) return thrownObject;
  return new Error(`Non-Error thrown: ${String(thrownObject)}`);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isTransientRpcError(error: Error) {
  return /\b(?:429|502|503|504)\b|fetch failed|timed? ?out|socket/i.test(
    error.message,
  );
}

async function retryRpc<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  for (const delay of [0, ...RPC_RETRY_DELAYS_MS]) {
    if (delay > 0) await wait(delay);
    try {
      return await operation();
    } catch (thrownObject) {
      const error = ensureError(thrownObject);
      if (!isTransientRpcError(error)) throw error;
      lastError = error;
    }
  }
  throw lastError ?? new Error("RPC request failed.");
}

export function extractTransactionSignature(message: string): Signature | null {
  const candidates = message.match(/[1-9A-HJ-NP-Za-km-z]{64,88}/g) ?? [];
  for (const candidate of candidates) {
    if (isSignature(candidate)) return candidate;
  }
  return null;
}

function parseRunCount(arguments_: Array<string>): number {
  const optionIndex = arguments_.indexOf("--runs");
  if (optionIndex === -1) return DEFAULT_RUN_COUNT;
  const value = Number(arguments_[optionIndex + 1]);
  if (!Number.isSafeInteger(value) || value < 1 || value > 10) {
    throw new Error("--runs must be an integer from 1 through 10.");
  }
  return value;
}

export function requiredSuccessfulRuns(runCount: number): number {
  if (!Number.isSafeInteger(runCount) || runCount < 1) {
    throw new Error("Run count must be a positive integer.");
  }
  return Math.ceil(runCount * MINIMUM_SUCCESS_RATE);
}

export function assertReliability(results: Array<RunResult>): void {
  const successes = results.filter((result) => result.succeeded).length;
  const required = requiredSuccessfulRuns(results.length);
  if (successes < required) {
    throw new Error(
      `Devnet reliability was ${successes}/${results.length}; ${required}/${results.length} successful runs are required.`,
    );
  }
}

async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
}

async function serverIsReady(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/health/supabase`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(baseUrl: string, process: ChildProcess) {
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Next.js exited with code ${process.exitCode}.`);
    }
    if (await serverIsReady(baseUrl)) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Next.js did not become ready at ${baseUrl}.`);
}

async function ensureServer(baseUrl: string): Promise<ChildProcess | null> {
  if (await serverIsReady(baseUrl)) return null;

  const parsedUrl = new URL(baseUrl);
  if (
    parsedUrl.hostname !== "127.0.0.1" &&
    parsedUrl.hostname !== "localhost"
  ) {
    throw new Error(`The configured server is unavailable at ${baseUrl}.`);
  }

  const serverProcess = spawn(
    "npm",
    [
      "run",
      "dev",
      "--",
      "--hostname",
      parsedUrl.hostname,
      "--port",
      parsedUrl.port || "80",
    ],
    { cwd: process.cwd(), env: process.env, stdio: "inherit" },
  );
  await waitForServer(baseUrl, serverProcess);
  return serverProcess;
}

async function loadSigner(keypairPath: string): Promise<KeyPairSigner> {
  const serialized: unknown = JSON.parse(await readFile(keypairPath, "utf8"));
  const parsed = z
    .array(z.number().int().min(0).max(255))
    .length(64)
    .parse(serialized);
  return createKeyPairSignerFromBytes(Uint8Array.from(parsed));
}

async function loadFixture(source: FixtureSource): Promise<Uint8Array> {
  const input =
    "path" in source
      ? await readFile(path.resolve(process.cwd(), source.path))
      : new Uint8Array(
          await (
            await fetchWithTimeout(source.url, {
              headers: {
                "user-agent":
                  "WildQuest Devnet integration test (https://github.com/)",
              },
            })
          ).arrayBuffer(),
        );

  const normalized = await sharp(input, { failOn: "error" })
    .autoOrient()
    .resize(768, 768, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  return new Uint8Array(normalized);
}

async function loadDistinctFixtures(runCount: number) {
  const fixtures = await Promise.all(
    GOLDEN_RETRIEVER_FIXTURES.slice(0, runCount).map(async (source) => ({
      source,
      bytes: await loadFixture(source),
    })),
  );
  const hashes: Array<string> = [];

  for (const fixture of fixtures) {
    const hash = await createPerceptualImageHash(
      new Blob([copyToArrayBuffer(fixture.bytes)], { type: "image/jpeg" }),
    );
    for (const priorHash of hashes) {
      const distance = getPerceptualHashDistance(hash, priorHash);
      if (distance <= PERCEPTUAL_HASH_DISTANCE_THRESHOLD) {
        throw new Error(
          `${fixture.source.name} is too similar to another test fixture at pHash distance ${distance}.`,
        );
      }
    }
    hashes.push(hash);
  }

  return fixtures;
}

async function identify(
  baseUrl: string,
  fixtureName: string,
  bytes: Uint8Array,
  wallet: string,
): Promise<Identification> {
  const formData = new FormData();
  formData.set(
    "image",
    new Blob([copyToArrayBuffer(bytes)], { type: "image/jpeg" }),
    `${fixtureName.replaceAll(/[^a-zA-Z0-9]+/g, "-")}.jpg`,
  );
  formData.set("wallet", wallet);

  const response = await fetchWithTimeout(`${baseUrl}/api/identify`, {
    method: "POST",
    body: formData,
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = identifyErrorSchema.safeParse(body);
    throw new Error(
      error.success
        ? `${error.data.error.code}: ${error.data.error.message}`
        : `Identify API returned HTTP ${response.status}.`,
    );
  }

  const identification = identifySuccessSchema.parse(body).identification;
  if (identification.species_id !== "dog") {
    throw new Error(
      `Expected dog but ResNet-50 identified ${identification.species_id}.`,
    );
  }
  return identification;
}

async function fetchCatalogue(baseUrl: string) {
  const response = await fetchWithTimeout(`${baseUrl}/api/species`);
  if (!response.ok) {
    throw new Error(`Catalogue API returned HTTP ${response.status}.`);
  }
  return catalogueResponseSchema.parse(await response.json()).species;
}

async function sendAndReconcileTransaction(
  client: ReturnType<typeof createDevnetClient>,
  instructions: Parameters<typeof client.sendTransaction>[0],
  signer: KeyPairSigner,
  identification: Identification,
): Promise<Signature> {
  try {
    const transaction = await client.sendTransaction(instructions);
    return transaction.context.signature;
  } catch (thrownObject) {
    const error = ensureError(thrownObject);
    const signature = extractTransactionSignature(error.message);
    if (!signature) throw error;

    const [discoveryAddress] = await findDiscoveryPda({
      payer: signer.address,
      proofHash: proofHashToBytes(identification.proof_hash),
    });
    for (const delay of RPC_RETRY_DELAYS_MS) {
      await wait(delay);
      try {
        const discovery = await fetchMaybeDiscovery(
          client.rpc,
          discoveryAddress,
          { commitment: "confirmed" },
        );
        if (discovery.exists) return signature;
      } catch (pollThrownObject) {
        const pollError = ensureError(pollThrownObject);
        if (!isTransientRpcError(pollError)) throw pollError;
      }
    }
    throw error;
  }
}

async function runDiscovery(
  run: number,
  fixture: Awaited<ReturnType<typeof loadDistinctFixtures>>[number],
  baseUrl: string,
  signer: KeyPairSigner,
  client: ReturnType<typeof createDevnetClient>,
): Promise<RunResult> {
  const startedAt = Date.now();
  try {
    const [playerAddress] = await findPlayerPda({ payer: signer.address });
    const playerBefore = await retryRpc(() =>
      fetchMaybePlayer(client.rpc, playerAddress, {
        commitment: "confirmed",
      }),
    );
    const discoveriesBefore = await retryRpc(() =>
      fetchPlayerDiscoveries(client.rpc, signer.address),
    );
    const identification = await identify(
      baseUrl,
      fixture.source.name,
      fixture.bytes,
      signer.address,
    );
    const catalogue = await fetchCatalogue(baseUrl);
    if (
      !catalogue.some(
        (species) =>
          String(species.id) === identification.catalogue_id &&
          species.speciesId === identification.species_id,
      )
    ) {
      throw new Error("The API identification does not match the catalogue.");
    }

    const instructions = await buildDiscoveryInstructions(
      signer,
      identification,
      playerBefore.exists,
    );
    const signature = await sendAndReconcileTransaction(
      client,
      instructions,
      signer,
      identification,
    );
    const proofHash = proofHashToBytes(identification.proof_hash);
    const [discoveryAddress] = await findDiscoveryPda({
      payer: signer.address,
      proofHash,
    });
    const discovery = await retryRpc(() =>
      fetchDiscovery(client.rpc, discoveryAddress, {
        commitment: "confirmed",
      }),
    );
    const playerAfter = await retryRpc(() =>
      fetchPlayer(client.rpc, playerAddress, { commitment: "confirmed" }),
    );
    const discoveriesAfter = await retryRpc(() =>
      fetchPlayerDiscoveries(client.rpc, signer.address),
    );

    const expectedXp =
      (playerBefore.exists ? playerBefore.data.xp : 0n) +
      BigInt(identification.awarded_xp);
    const expectedDiscoveryCount =
      (playerBefore.exists ? playerBefore.data.discoveryCount : 0n) + 1n;
    const speciesCountBefore = discoveriesBefore.filter(
      (item) => item.data.speciesId.toString() === identification.catalogue_id,
    ).length;
    const speciesCountAfter = discoveriesAfter.filter(
      (item) => item.data.speciesId.toString() === identification.catalogue_id,
    ).length;

    if (
      discovery.data.player !== signer.address ||
      discovery.data.speciesId.toString() !== identification.catalogue_id ||
      discovery.data.grade !== identification.grade_code ||
      discovery.data.rarity !== identification.rarity_code
    ) {
      throw new Error("The Discovery account does not match the API result.");
    }
    if (
      playerAfter.data.xp !== expectedXp ||
      playerAfter.data.discoveryCount !== expectedDiscoveryCount ||
      playerAfter.data.level !== 1n + expectedXp / 100n
    ) {
      throw new Error(
        "The Player account progression does not match the grade.",
      );
    }
    if (speciesCountAfter !== speciesCountBefore + 1) {
      throw new Error("The collection did not gain the confirmed discovery.");
    }

    return {
      run,
      fixture: fixture.source.name,
      succeeded: true,
      durationMs: Date.now() - startedAt,
      signature,
    };
  } catch (thrownObject) {
    return {
      run,
      fixture: fixture.source.name,
      succeeded: false,
      durationMs: Date.now() - startedAt,
      error: ensureError(thrownObject).message,
    };
  }
}

function createDevnetClient(rpcUrl: string, signer: KeyPairSigner) {
  return createClient({ url: devnet(rpcUrl), payer: signer });
}

async function main() {
  const runCount = parseRunCount(process.argv.slice(2));
  const keypairPath = process.env.WQ_E2E_KEYPAIR_PATH;
  if (!keypairPath) {
    throw new Error(
      "Set WQ_E2E_KEYPAIR_PATH to a dedicated, pre-funded Devnet keypair.",
    );
  }

  const baseUrl = process.env.WQ_E2E_BASE_URL ?? DEFAULT_BASE_URL;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC_URL;
  const signer = await loadSigner(keypairPath);
  const client = createDevnetClient(rpcUrl, signer);
  const balance = await client.rpc
    .getBalance(signer.address, { commitment: "confirmed" })
    .send();
  if (balance.value < MINIMUM_TEST_BALANCE_LAMPORTS) {
    throw new Error(
      `Test wallet ${signer.address} needs at least 0.02 Devnet SOL.`,
    );
  }

  console.info(`Wallet: ${signer.address}`);
  console.info(`Loading ${runCount} distinct public-domain dog photos...`);
  const fixtures = await loadDistinctFixtures(runCount);
  const serverProcess = await ensureServer(baseUrl);
  const results: Array<RunResult> = [];

  try {
    for (const [index, fixture] of fixtures.entries()) {
      const result = await runDiscovery(
        index + 1,
        fixture,
        baseUrl,
        signer,
        client,
      );
      results.push(result);
      console.info(
        result.succeeded
          ? `PASS ${result.run}/${runCount} ${result.fixture} ${result.durationMs}ms ${result.signature}`
          : `FAIL ${result.run}/${runCount} ${result.fixture} ${result.durationMs}ms ${result.error}`,
      );
      if (index + 1 < fixtures.length) await wait(RUN_SPACING_MS);
    }
  } finally {
    serverProcess?.kill("SIGTERM");
  }

  assertReliability(results);
  const successes = results.filter((result) => result.succeeded).length;
  console.info(`WQ-28 full loop: PASS`);
  console.info(`WQ-29 Devnet reliability: ${successes}/${runCount} PASS`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((thrownObject) => {
    console.error(ensureError(thrownObject).message);
    process.exitCode = 1;
  });
}
