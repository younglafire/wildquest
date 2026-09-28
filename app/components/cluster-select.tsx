"use client";

import { useCluster } from "./cluster-context";

export function ClusterSelect() {
  const { cluster } = useCluster();

  return (
    <div
      aria-label="Solana network"
      className="flex items-center gap-2 rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium"
      title="WildQuest is locked to Solana Devnet"
    >
      <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
      {cluster}
    </div>
  );
}
