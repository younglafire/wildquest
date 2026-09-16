"use client";

import { useCallback, useState } from "react";
import {
  assertIsSignature,
  getBase58Decoder,
  unwrapSimulationError,
  type Base64EncodedWireTransaction,
  type Signature,
} from "@solana/kit";
import { useCluster } from "../../components/cluster-context";
import type { CaptureTransaction } from "../vision/schema";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";

function decodeBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64(value: Uint8Array) {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary) as Base64EncodedWireTransaction;
}

async function waitForConfirmation(
  signature: Signature,
  rpc: ReturnType<typeof useSolanaClient>["rpc"],
) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await rpc
      .getSignatureStatuses([signature], { searchTransactionHistory: true })
      .send();
    const status = response.value[0];
    if (status?.err)
      throw new Error("The Creature transaction failed onchain.");
    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(
    "The transaction was submitted but confirmation is still pending. Check Explorer before retrying.",
  );
}

export function useSubmitCaptureTransaction() {
  const { wallet } = useWallet();
  const { cluster } = useCluster();
  const client = useSolanaClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "signing" | "confirming">("idle");

  const submit = useCallback(
    async (authorization: CaptureTransaction) => {
      if (!wallet) throw new Error("Connect your wallet first.");
      if (authorization.program_id.length === 0) {
        throw new Error("The capture authorization is invalid.");
      }

      setIsSubmitting(true);
      setStage("signing");
      try {
        const currentBlockHeight = await client.rpc
          .getBlockHeight({ commitment: "confirmed" })
          .send();
        if (
          currentBlockHeight >= BigInt(authorization.last_valid_block_height)
        ) {
          throw new Error(
            "This capture approval expired. Retake the photo to create a fresh transaction.",
          );
        }

        const unsignedForWallet = decodeBase64(
          authorization.transaction_base64,
        );
        const chain = `solana:${cluster}`;
        let signature: Signature;

        if (wallet.signTransaction) {
          const signed = await wallet.signTransaction(unsignedForWallet, chain);
          signature = await client.rpc
            .sendTransaction(encodeBase64(signed), {
              encoding: "base64",
              preflightCommitment: "confirmed",
              maxRetries: 5n,
            })
            .send();
        } else if (wallet.sendTransaction) {
          const signatureString = getBase58Decoder().decode(
            await wallet.sendTransaction(unsignedForWallet, chain),
          );
          assertIsSignature(signatureString);
          signature = signatureString;
        } else {
          throw new Error("This wallet cannot sign Solana transactions.");
        }

        setStage("confirming");
        await waitForConfirmation(signature, client.rpc);
        return signature;
      } catch (thrownObject) {
        const simulationCause = unwrapSimulationError(thrownObject);
        if (
          simulationCause instanceof Error &&
          simulationCause !== thrownObject
        ) {
          throw new Error(simulationCause.message, { cause: thrownObject });
        }
        throw thrownObject;
      } finally {
        setIsSubmitting(false);
        setStage("idle");
      }
    },
    [client.rpc, cluster, wallet],
  );

  return { submit, isSubmitting, stage };
}
