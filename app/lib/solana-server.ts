import "server-only";

import { createSolanaClientWithUrls } from "./solana-client";

const PUBLIC_DEVNET_RPC = "https://api.devnet.solana.com";

export function createSolanaServerClient() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl && process.env.NODE_ENV === "production") {
    throw new Error("SOLANA_RPC_URL is required in production.");
  }

  return createSolanaClientWithUrls(
    rpcUrl ?? process.env.NEXT_PUBLIC_RPC_URL ?? PUBLIC_DEVNET_RPC,
    process.env.SOLANA_RPC_WS_URL ?? process.env.NEXT_PUBLIC_RPC_WS_URL,
  );
}
