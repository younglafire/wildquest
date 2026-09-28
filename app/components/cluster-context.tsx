"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import type { ClusterMoniker } from "../lib/solana-client";
import { CLUSTERS } from "../lib/solana-client";
import { getExplorerUrl } from "../lib/explorer";

type ClusterContextValue = {
  cluster: ClusterMoniker;
  getExplorerUrl: (path: string) => string;
};

const ClusterContext = createContext<ClusterContextValue | null>(null);

export { CLUSTERS };

export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster: ClusterMoniker = "devnet";

  const explorerUrl = useCallback(
    (path: string) => getExplorerUrl(path, cluster),
    [cluster],
  );

  return (
    <ClusterContext.Provider value={{ cluster, getExplorerUrl: explorerUrl }}>
      {children}
    </ClusterContext.Provider>
  );
}

export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}
