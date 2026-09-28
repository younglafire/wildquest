import { createEmptyClient } from "@solana/kit";
import { rpc, rpcAirdrop } from "@solana/kit-plugin-rpc";

export type ClusterMoniker = "devnet";

export const CLUSTERS: Array<ClusterMoniker> = ["devnet"];

const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const DEVNET_WS_URL =
  process.env.NEXT_PUBLIC_RPC_WS_URL || "wss://api.devnet.solana.com";

const CLUSTER_URLS: Record<ClusterMoniker, string> = {
  devnet: DEVNET_RPC_URL,
};

const WS_URLS: Record<ClusterMoniker, string> = {
  devnet: DEVNET_WS_URL,
};

export function getClusterUrl(cluster: ClusterMoniker) {
  return CLUSTER_URLS[cluster];
}

export function getClusterWsConfig(cluster: ClusterMoniker) {
  return { url: WS_URLS[cluster] };
}

export function createSolanaClient(cluster: ClusterMoniker) {
  return createSolanaClientWithUrls(CLUSTER_URLS[cluster], WS_URLS[cluster]);
}

export function createSolanaClientWithUrls(url: string, wsUrl?: string) {
  return createEmptyClient()
    .use(rpc(url, wsUrl ? { url: wsUrl } : undefined))
    .use(rpcAirdrop());
}

export type SolanaClient = ReturnType<typeof createSolanaClient>;
