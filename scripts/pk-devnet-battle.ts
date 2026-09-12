import { createHash } from "node:crypto";
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
  fetchAllCreature,
  fetchMatch,
  findCreaturePda,
  findMatchAccountPda,
  MatchStatus,
} from "../app/generated/wildquest";
import {
  buildClaimMatchPayoutInstruction,
  buildJoinMatchInstruction,
  buildOpenMatchInstruction,
  buildResolveMatchInstruction,
} from "../app/lib/matches";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_RUN_COUNT = 10;
const REQUIRED_SUCCESS_RATE = 0.9;
const TEAM_A = [1001n, 1002n, 1003n] as const;
const TEAM_B = [1004n, 1005n, 1006n] as const;

async function loadSigner(file: string): Promise<KeyPairSigner> {
  const serialized: unknown = JSON.parse(
    await readFile(path.resolve(file), "utf8"),
  );
  const bytes = z
    .array(z.number().int().min(0).max(255))
    .length(64)
    .parse(serialized);
  return createKeyPairSignerFromBytes(Uint8Array.from(bytes));
}

function parseRuns() {
  const index = process.argv.indexOf("--runs");
  if (index < 0) return DEFAULT_RUN_COUNT;
  const runs = Number(process.argv[index + 1]);
  if (!Number.isInteger(runs) || runs < 1 || runs > 10) {
    throw new Error("--runs must be an integer from 1 to 10.");
  }
  return runs;
}

async function fetchTeam(
  client: ReturnType<typeof createClient>,
  owner: KeyPairSigner,
  catalogueIds: readonly bigint[],
) {
  const addresses = await Promise.all(
    catalogueIds.map(
      async (catalogueId) =>
        (await findCreaturePda({ owner: owner.address, catalogueId }))[0],
    ),
  );
  return fetchAllCreature(client.rpc, addresses, { commitment: "confirmed" });
}

async function main() {
  const runs = parseRuns();
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC_URL;
  const walletA = await loadSigner(
    process.env.WQ_DEMO_WALLET_A_KEYPAIR_PATH ??
      ".wildquest-keys/demo-wallet-a.json",
  );
  const walletB = await loadSigner(
    process.env.WQ_DEMO_WALLET_B_KEYPAIR_PATH ??
      ".wildquest-keys/demo-wallet-b.json",
  );
  const resolver = await loadSigner(
    process.env.WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH ??
      ".wildquest-keys/capture-authority.json",
  );
  const clientA = createClient({ url: devnet(rpcUrl), payer: walletA });
  const clientB = createClient({ url: devnet(rpcUrl), payer: walletB });
  const teamA = await fetchTeam(clientA, walletA, TEAM_A);
  const teamB = await fetchTeam(clientB, walletB, TEAM_B);
  const results: Array<{ ok: boolean }> = [];

  for (let index = 0; index < runs; index += 1) {
    const matchId = BigInt(Date.now()) * 100n + BigInt(index);
    try {
      const [beforeA, beforeB] = await Promise.all([
        clientA.rpc
          .getBalance(walletA.address, { commitment: "confirmed" })
          .send(),
        clientB.rpc
          .getBalance(walletB.address, { commitment: "confirmed" })
          .send(),
      ]);
      const open = await buildOpenMatchInstruction(walletA, teamA, matchId);
      const opened = await clientA.sendTransaction([open]);
      const [matchAddress] = await findMatchAccountPda({
        creator: walletA.address,
        matchId,
      });
      const openAccount = await fetchMatch(clientA.rpc, matchAddress, {
        commitment: "confirmed",
      });
      const join = await buildJoinMatchInstruction(
        walletB,
        openAccount,
        teamA,
        teamB,
      );
      const joined = await clientB.sendTransaction([join]);
      const active = await fetchMatch(clientB.rpc, matchAddress, {
        commitment: "confirmed",
      });
      if (active.data.status !== MatchStatus.Active) {
        throw new Error("The joined Match did not become active.");
      }
      const resolve = await buildResolveMatchInstruction(
        resolver,
        active,
        walletA.address,
        1,
        new Uint8Array(
          createHash("sha256")
            .update(`wildquest-devnet-smoke:${matchAddress}`)
            .digest(),
        ),
      );
      const resolverClient = createClient({
        url: devnet(rpcUrl),
        payer: resolver,
      });
      const resolution = await resolverClient.sendTransaction([resolve]);
      const resolved = await fetchMatch(clientB.rpc, matchAddress, {
        commitment: "confirmed",
      });
      const winner = unwrapOption(resolved.data.winner);
      let claimSignature: string | null = null;
      if (winner === null) {
        if (resolved.data.status !== MatchStatus.Settled) {
          throw new Error("A tied Match was not refunded atomically.");
        }
      } else {
        if (resolved.data.status !== MatchStatus.Claimable) {
          throw new Error("A winning Match did not become claimable.");
        }
        const winnerSigner = winner === walletA.address ? walletA : walletB;
        const winnerClient = winner === walletA.address ? clientA : clientB;
        const claim = buildClaimMatchPayoutInstruction(winnerSigner, resolved);
        const claimed = await winnerClient.sendTransaction([claim]);
        claimSignature = claimed.context.signature;
        const paid = await fetchMatch(winnerClient.rpc, matchAddress, {
          commitment: "confirmed",
        });
        if (paid.data.status !== MatchStatus.Settled) {
          throw new Error("Winner claim did not settle the Match.");
        }
      }
      const [afterA, afterB] = await Promise.all([
        clientA.rpc
          .getBalance(walletA.address, { commitment: "confirmed" })
          .send(),
        clientB.rpc
          .getBalance(walletB.address, { commitment: "confirmed" })
          .send(),
      ]);
      if (
        winner === walletA.address &&
        !(afterA.value > beforeA.value && afterB.value < beforeB.value)
      ) {
        throw new Error("Winner payout or loser debit was not reflected.");
      }
      if (
        winner === walletB.address &&
        !(afterB.value > beforeB.value && afterA.value < beforeA.value)
      ) {
        throw new Error("Winner payout or loser debit was not reflected.");
      }
      if (
        winner === null &&
        !(
          beforeA.value - afterA.value < 1_000_000n &&
          beforeB.value - afterB.value < 1_000_000n
        )
      ) {
        throw new Error("Tie stakes were not refunded.");
      }
      const outcome = winner ? `winner ${winner}` : "tie/refund";
      results.push({ ok: true });
      console.info(
        `Run ${index + 1}: PASS (${outcome})\n  open ${opened.context.signature}\n  join ${joined.context.signature}\n  resolve ${resolution.context.signature}${claimSignature ? `\n  claim ${claimSignature}` : ""}`,
      );
    } catch (thrownObject) {
      const detail =
        thrownObject instanceof Error
          ? thrownObject.message
          : String(thrownObject);
      results.push({ ok: false });
      console.error(`Run ${index + 1}: FAIL (${detail})`);
    }
  }

  const successful = results.filter((result) => result.ok).length;
  const required = Math.ceil(runs * REQUIRED_SUCCESS_RATE);
  console.info(`Devnet battle reliability: ${successful}/${runs}`);
  if (successful < required) {
    throw new Error(`Expected at least ${required}/${runs} successful runs.`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((thrownObject) => {
    console.error(
      thrownObject instanceof Error
        ? thrownObject.message
        : "Battle test failed.",
    );
    process.exitCode = 1;
  });
}
