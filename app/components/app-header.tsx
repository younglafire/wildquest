"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCluster } from "./cluster-context";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

const NAVIGATION = [
  ["/home", "Home"],
  ["/battle", "Battle"],
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
    <header
      className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-4"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0px))" }}
    >
      {/* Brand */}
      <Link
        href={landing ? "/" : "/home"}
        className="shrink-0 text-sm font-black tracking-widest transition-opacity hover:opacity-80"
        style={{
          fontFamily: "var(--font-display)",
          background: "linear-gradient(135deg, #e0c58a, #c8a96e, #a07d48)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ✦ WILDQUEST
      </Link>

      <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Primary">
        {/* Desktop nav links — hidden on mobile (bottom tab bar handles it) */}
        {!landing && (
          <div className="hidden items-center gap-0.5 md:flex">
            {NAVIGATION.map(([href, label]) => {
              const active =
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (href === "/battle" && pathname.startsWith("/match/"));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-[#c8a96e]"
                      : "text-[#8a7a62] hover:text-[#f0e8d4]"
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute inset-x-3 bottom-0 h-[2px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #c8a96e, transparent)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/capture"
              aria-current={pathname === "/capture" ? "page" : undefined}
              className="ml-2 rounded px-4 py-2 text-[11px] font-black tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #c8a96e, #a07d48)",
                color: "#100e09",
                boxShadow: "0 2px 10px rgba(200,169,110,0.2)",
              }}
            >
              CAPTURE
            </Link>
          </div>
        )}

        {/* Devnet wax badge — smaller on mobile */}
        <span
          className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest sm:px-2.5 sm:text-[9px]"
          style={{
            fontFamily: "var(--font-display)",
            background: "rgba(200,169,110,0.1)",
            color: "#c8a96e",
            border: "1px solid rgba(200,169,110,0.3)",
          }}
        >
          Devnet
        </span>

        {/* Mobile quick link to Passport */}
        {!landing && (
          <Link
            href="/profile"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold md:hidden"
            style={{
              fontFamily: "var(--font-display)",
              color: pathname === "/profile" ? "#c8a96e" : "#8a7a62",
              border: "1px solid rgba(200,169,110,0.25)",
              background:
                pathname === "/profile"
                  ? "rgba(200,169,110,0.18)"
                  : "rgba(200,169,110,0.06)",
            }}
          >
            <span>Passport</span>
          </Link>
        )}

        <ThemeToggle />
        <WalletButton />
      </nav>
    </header>
  );
}
