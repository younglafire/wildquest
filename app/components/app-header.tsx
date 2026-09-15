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
      {/* Brand Logo - Fully responsive across mobile, tablet, laptop, and desktop */}
      <Link
        href={landing ? "/" : "/home"}
        className="flex shrink-0 items-center transition-transform hover:scale-105 active:scale-95"
        aria-label="WildQuest"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/creatures/logo.png"
          alt="WildQuest"
          className="h-11 sm:h-14 md:h-16 lg:h-20 w-auto max-w-[155px] sm:max-w-[210px] md:max-w-[270px] lg:max-w-[340px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
        />
      </Link>

      <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Primary">
        {/* Desktop nav links — hidden on mobile (bottom tab bar handles it) */}
        {!landing && (
          <div className="hidden items-center gap-1 md:flex lg:gap-1.5">
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
                  className={`group relative flex h-7.5 w-20 items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 md:w-22 lg:w-26 ${
                    active ? "scale-105" : "opacity-85 hover:opacity-100"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {/* Ornate Plaque Background Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/creatures/button_tab.png"
                    alt=""
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 h-full w-full object-fill transition-all ${
                      active
                        ? "drop-shadow-[0_0_10px_rgba(251,191,36,0.7)] brightness-115"
                        : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] brightness-90 group-hover:brightness-105"
                    }`}
                  />

                  {/* Text Label */}
                  <span
                    className={`relative z-10 text-[9px] font-black uppercase tracking-wider md:text-[10px] lg:text-[10.5px] transition-colors ${
                      active
                        ? "text-[#fbbf24] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                        : "text-[#d4c5a9] group-hover:text-white"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/capture"
              aria-current={pathname === "/capture" ? "page" : undefined}
              className={`group relative ml-1 flex h-7.5 w-24 items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 md:w-26 lg:w-28 ${
                pathname === "/capture"
                  ? "scale-105"
                  : "opacity-95 hover:opacity-100"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/creatures/button_tab.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_0_12px_rgba(74,222,128,0.75)] brightness-125 saturate-125"
              />
              <span className="relative z-10 text-[9.5px] font-black uppercase tracking-widest text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.9)] md:text-[10.5px]">
                CAPTURE
              </span>
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
