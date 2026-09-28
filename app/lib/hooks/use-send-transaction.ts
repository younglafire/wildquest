"use client";

import { useState, useCallback, useMemo } from "react";
import { useSWRConfig } from "swr";
import type { Instruction } from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import { useWallet } from "../wallet/context";
import { useCluster } from "../../components/cluster-context";
import { getClusterUrl, getClusterWsConfig } from "../solana-client";

export function useSendTransaction() {
  const { signer } = useWallet();
  const { cluster } = useCluster();
  const { mutate } = useSWRConfig();
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "awaiting-wallet" | "submitting" | "confirmed" | "failed"
  >("idle");

  const txClient = useMemo(
    () =>
      signer
        ? createClient({
            url: getClusterUrl(cluster),
            rpcSubscriptionsConfig: getClusterWsConfig(cluster),
            payer: signer,
          })
        : null,
    [cluster, signer],
  );

  const send = useCallback(
    async ({ instructions }: { instructions: readonly Instruction[] }) => {
      if (!txClient) throw new Error("Wallet not connected");

      setIsSending(true);
      setStatus("awaiting-wallet");
      try {
        // The wallet approval and RPC submission are one adapter call. Marking
        // submission just before it keeps every screen on one shared lifecycle.
        setStatus("submitting");
        const result = await txClient.sendTransaction([...instructions]);
        mutate((key: unknown) => Array.isArray(key) && key[0] === "balance");
        setStatus("confirmed");
        return result.context.signature;
      } catch (error) {
        setStatus("failed");
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [txClient, mutate],
  );

  return { send, isSending, status };
}
