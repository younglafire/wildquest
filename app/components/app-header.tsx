"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCluster } from "./cluster-context";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

export function AppHeader() {
  const { cluster, setCluster } = useCluster();

  useEffect(() => {
    if (cluster !== "devnet") setCluster("devnet");
  }, [cluster, setCluster]);

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
      <Link href="/" className="text-sm font-black tracking-tight">
        WildQuest
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
        <Link
          href="/capture"
          className="hidden text-xs font-medium text-muted transition hover:text-foreground sm:block"
        >
          Capture
        </Link>
        <Link
          href="/collection"
          className="hidden text-xs font-medium text-muted transition hover:text-foreground sm:block"
        >
          Collection
        </Link>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
          Devnet
        </span>
        <ThemeToggle />
        <WalletButton />
      </nav>
    </header>
  );
}
