"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useWallet } from "../lib/wallet/context";
import { AppHeader } from "./app-header";
import { GridBackground } from "./grid-background";

// Inline SVG icon components — guild aesthetic
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <path d="M3 12v9h18V12" />
    </svg>
  );
}

function CaptureIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
    </svg>
  );
}

function BattleIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M2 2l20 20" />
      <path d="M20 9l-6.75-6.75" />
    </svg>
  );
}

function CollectionIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function QuestIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const MOBILE_NAVIGATION = [
  ["/home",       "Home",       HomeIcon],
  ["/battle",     "Battle",     BattleIcon],
  ["/capture",    "Capture",    CaptureIcon],
  ["/collection", "Collection", CollectionIcon],
  ["/quest",      "Quest",      QuestIcon],
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
      <div className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "#100e09" }}>
        <div>
          <p
            className="text-[11px] font-black uppercase tracking-[0.28em]"
            style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
          >
            ✦ WildQuest
          </p>
          <p className="mt-3 text-sm" style={{ color: "#8a7a62", fontFamily: "var(--font-sans)" }}>
            {status === "connecting"
              ? "Reconnecting your wallet…"
              : "Preparing your expedition…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-28 md:pb-0" style={{ background: "#100e09", color: "#f0e8d4" }}>
      <GridBackground />
      <div className="relative z-10">
        <AppHeader />
        {children}
      </div>

      {/* Bottom Navigation — Mobile Game HUD Tab Bar */}
      <nav
        aria-label="Game navigation"
        className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(22,18,12,0.94) 0%, rgba(16,14,9,0.98) 100%)",
          borderTop: "1px solid rgba(200,169,110,0.2)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
          {MOBILE_NAVIGATION.map(([href, label, Icon]) => {
            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`) ||
              (href === "/battle" && pathname.startsWith("/match/"));
            const isCapture = href === "/capture";

            if (isCapture) {
              return (
                <div key={href} className="flex flex-col items-center justify-end">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    aria-label="Capture creature"
                    className="-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full transition-transform active:scale-95"
                    style={{
                      fontFamily: "var(--font-display)",
                      background: "linear-gradient(135deg, #e0c58a 0%, #c8a96e 50%, #9a7838 100%)",
                      color: "#100e09",
                      boxShadow: active
                        ? "0 0 0 3px #100e09, 0 0 20px 4px rgba(200,169,110,0.6)"
                        : "0 0 0 3px #100e09, 0 4px 16px rgba(200,169,110,0.35)",
                      border: "1.5px solid rgba(255,255,255,0.4)",
                    }}
                  >
                    <Icon active={true} />
                    <span className="text-[8px] font-black uppercase tracking-wider">Hunt</span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95"
                style={{
                  fontFamily: "var(--font-display)",
                  color: active ? "#c8a96e" : "#8a7a62",
                  background: active ? "rgba(200,169,110,0.12)" : "transparent",
                  borderTop: active ? "2px solid #c8a96e" : "2px solid transparent",
                }}
              >
                <Icon active={active} />
                <span className="mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
