"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCluster } from "./cluster-context";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

const NAVIGATION = [
  ["/home", "Home"],
  ["/quest", "Quest"],
  ["/collection", "Collection"],
  ["/profile", "Passport"],
] as const;

export function AppHeader({ landing = false }: { landing?: boolean }) {
  const { cluster, setCluster } = useCluster();
  const pathname = usePathname();

  useEffect(() => {
    if (cluster !== "devnet") setCluster("devnet");
  }, [cluster, setCluster]);

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
      <Link
        href={landing ? "/" : "/home"}
        className="text-sm font-black tracking-tight"
      >
        WildQuest
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
        {!landing && (
          <div className="hidden items-center gap-1 md:flex">
            {NAVIGATION.map(([href, label]) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-cream text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/capture"
              aria-current={pathname === "/capture" ? "page" : undefined}
              className="ml-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Capture
            </Link>
          </div>
        )}
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
          Devnet
        </span>
        <ThemeToggle />
        <WalletButton />
      </nav>
    </header>
  );
}
