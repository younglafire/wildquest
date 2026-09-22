"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";
import { isRpcRateLimitError } from "../lib/transaction-error";

const swrConfiguration = {
  shouldRetryOnError: (error: Error) => !isRpcRateLimitError(error),
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes(
        "Encountered a script tag while rendering React component",
      ) ||
      msg.includes("Hydration failed") ||
      msg.includes("server rendered HTML didn't match")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <SWRConfig value={swrConfiguration}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ClusterProvider>
          <SolanaClientProvider>
            <WalletProvider>{children}</WalletProvider>
          </SolanaClientProvider>
          <Toaster position="bottom-right" richColors />
        </ClusterProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
