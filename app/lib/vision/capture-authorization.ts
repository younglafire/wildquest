import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createKeyPairSignerFromBytes,
  createNoopSigner,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  partiallySignTransactionWithSigners,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getCaptureCreatureInstructionAsync,
  WILDQUEST_PROGRAM_ADDRESS,
} from "@/app/generated/wildquest";
import { createSolanaClient } from "@/app/lib/solana-client";
import { CaptureAuthorizationUnavailableError } from "./errors";
import type { CaptureTransaction } from "./schema";

let captureAuthorityPromise: ReturnType<
  typeof createKeyPairSignerFromBytes
> | null = null;

function getCaptureAuthority() {
  if (!captureAuthorityPromise) {
    const encoded = process.env.CAPTURE_AUTHORITY_SECRET_KEY_BASE64;
    captureAuthorityPromise = (async () => {
      if (encoded) {
        return createKeyPairSignerFromBytes(
          Uint8Array.from(Buffer.from(encoded, "base64")),
        );
      }
      if (process.env.NODE_ENV === "production") {
        throw new CaptureAuthorizationUnavailableError();
      }
      const keypairPath =
        process.env.WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH ??
        ".wildquest-keys/capture-authority.json";
      const serialized = JSON.parse(
        await readFile(path.resolve(process.cwd(), keypairPath), "utf8"),
      ) as number[];
      return createKeyPairSignerFromBytes(Uint8Array.from(serialized));
    })().catch((error: unknown) => {
      captureAuthorityPromise = null;
      throw new CaptureAuthorizationUnavailableError({ cause: error });
    });
  }
  return captureAuthorityPromise;
}

export async function createCaptureAuthorization(input: {
  owner: string;
  catalogueId: string;
  proofHash: string;
}): Promise<CaptureTransaction> {
  try {
    const owner = address(input.owner);
    const catalogueId = BigInt(input.catalogueId);
    const proofHash = Uint8Array.from(Buffer.from(input.proofHash, "hex"));
    if (proofHash.length !== 32) {
      throw new Error("Invalid proof hash length.");
    }

    const captureAuthority = await getCaptureAuthority();
    const instruction = await getCaptureCreatureInstructionAsync({
      owner: createNoopSigner(owner),
      captureAuthority,
      catalogueId,
      proofHash,
    });
    const client = createSolanaClient("devnet");
    const { value: lifetime } = await client.rpc
      .getLatestBlockhash({ commitment: "confirmed" })
      .send();

    const message = appendTransactionMessageInstruction(
      instruction,
      setTransactionMessageLifetimeUsingBlockhash(
        lifetime,
        setTransactionMessageFeePayer(
          owner,
          createTransactionMessage({ version: 0 }),
        ),
      ),
    );
    const transaction = compileTransaction(message);
    const partiallySigned = await partiallySignTransactionWithSigners(
      [captureAuthority],
      transaction,
    );

    return {
      program_id: WILDQUEST_PROGRAM_ADDRESS,
      transaction_base64: getBase64EncodedWireTransaction(partiallySigned),
      last_valid_block_height: String(lifetime.lastValidBlockHeight),
    };
  } catch (error) {
    if (error instanceof CaptureAuthorizationUnavailableError) throw error;
    throw new CaptureAuthorizationUnavailableError({ cause: error });
  }
}
