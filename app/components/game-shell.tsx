"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useWallet } from "../lib/wallet/context";
import { AppHeader } from "./app-header";
import { GridBackground } from "./grid-background";

const MOBILE_NAVIGATION = [
  ["/home", "Home", "⌂"],
  ["/capture", "Capture", "+"],
  ["/battle", "Battle", "⚔"],
  ["/collection", "Collection", "▦"],
  ["/profile", "Passport", "◎"],
] as const;

export function GameShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, isReady } = useWallet();

  useEffect(() => {
    if (isReady && status === "disconnected") {
      router.replace(`/?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, pathname, router, status]);

  if (!isReady || status !== "connected") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            WildQuest
          </p>
          <p className="mt-3 text-sm text-muted">
            {status === "connecting"
              ? "Reconnecting your wallet…"
              : "Preparing your expedition…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background pb-24 text-foreground md:pb-0">
      <GridBackground />
      <div className="relative z-10">
        <AppHeader />
        {children}
      </div>
      <nav
        aria-label="Game navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {MOBILE_NAVIGATION.map(([href, label, icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const capture = href === "/battle";
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl text-[10px] font-semibold transition ${
                  capture
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-cream text-foreground"
                      : "text-muted hover:text-foreground"
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {icon}
                </span>
                <span className="mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
