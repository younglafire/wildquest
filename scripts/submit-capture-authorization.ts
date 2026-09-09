import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createKeyPairSignerFromBytes,
  devnet,
  getBase64EncodedWireTransaction,
  getTransactionDecoder,
  partiallySignTransactionWithSigners,
} from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import { z } from "zod";
import { identifySuccessSchema } from "../app/lib/vision/schema";

async function main() {
  const responsePath = process.argv[2];
  const walletPath = process.argv[3];
  if (!responsePath || !walletPath) {
    throw new Error(
      "Usage: submit-capture-authorization <response.json> <wallet.json>",
    );
  }

  const response = identifySuccessSchema.parse(
    JSON.parse(await readFile(path.resolve(responsePath), "utf8")),
  );
  const walletBytes = z
    .array(z.number().int().min(0).max(255))
    .length(64)
    .parse(JSON.parse(await readFile(path.resolve(walletPath), "utf8")));
  const wallet = await createKeyPairSignerFromBytes(
    Uint8Array.from(walletBytes),
  );
  const transaction = getTransactionDecoder().decode(
    Uint8Array.from(
      Buffer.from(response.capture_transaction.transaction_base64, "base64"),
    ),
  );
  const signed = await partiallySignTransactionWithSigners(
    [wallet],
    transaction,
  );
  const client = createClient({
    url: devnet(
      process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com",
    ),
    payer: wallet,
  });
  const signature = await client.rpc
    .sendTransaction(getBase64EncodedWireTransaction(signed), {
      encoding: "base64",
      preflightCommitment: "confirmed",
      maxRetries: 5n,
    })
    .send();
  console.info(`Capture confirmed: ${signature}`);
  console.info(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((thrownObject) => {
    console.error(thrownObject);
    process.exitCode = 1;
  });
}
