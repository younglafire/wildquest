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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <path d="M3 12v9h18V12" />
    </svg>
  );
}

function CaptureIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
    </svg>
  );
}

function BattleIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M2 2l20 20" />
      <path d="M20 9l-6.75-6.75" />
    </svg>
  );
}

function CollectionIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function QuestIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const MOBILE_NAVIGATION = [
  ["/home", "Home", HomeIcon],
  ["/battle", "Battle", BattleIcon],
  ["/capture", "Capture", CaptureIcon],
  ["/collection", "Collection", CollectionIcon],
  ["/quest", "Quest", QuestIcon],
] as const;

export function GameShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, isReady } = useWallet();
  const isCaptureRoute = pathname === "/capture";

  useEffect(() => {
    if (isReady && status === "disconnected") {
      router.replace(`/?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, pathname, router, status]);

  if (!isReady || status !== "connected") {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: "#100e09" }}
      >
        <div>
          <p
            className="text-[11px] font-black uppercase tracking-[0.28em]"
            style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
          >
            ✦ WildQuest
          </p>
          <p
            className="mt-3 text-sm"
            style={{ color: "#8a7a62", fontFamily: "var(--font-sans)" }}
          >
            {status === "connecting"
              ? "Reconnecting your wallet…"
              : "Preparing your expedition…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen ${isCaptureRoute ? "" : "pb-28 md:pb-0"}`}
      style={{ background: "#100e09", color: "#f0e8d4" }}
    >
      {!isCaptureRoute && <GridBackground />}
      <div className="relative z-10">
        {!isCaptureRoute && <AppHeader />}
        {children}
      </div>

      {/* Bottom Navigation — Mobile Game HUD Tab Bar */}
      {!isCaptureRoute && (
        <nav
          aria-label="Game navigation"
          className="fixed inset-x-0 bottom-0 z-40 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(12,10,7,0.92) 35%, #0c0a07 100%)",
          }}
        >
          <div className="pointer-events-auto relative mx-auto w-full max-w-[440px] aspect-[1672/454]">
            {/* Ornate Fantasy HUD Dock Bar Frame */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ui/nav_bar.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_-8px_32px_rgba(0,0,0,0.95)]"
            />

            {/* Calibrated Interactive Slots matching nav_bar.png geometry */}
            <div className="relative h-full w-full">
              {MOBILE_NAVIGATION.map(([href, label, Icon], index) => {
                const active =
                  pathname === href ||
                  pathname.startsWith(`${href}/`) ||
                  (href === "/battle" && pathname.startsWith("/match/"));
                const isCapture = href === "/capture";

                // Exact calibrated coordinates matching the 5 zones of nav_bar.png:
                // Index 0 (Home): Left wing outer slot -> 16.5%
                // Index 1 (Battle): Left wing inner slot -> 31%
                // Index 2 (Capture/Hunt): Center circular ring -> 50%
                // Index 3 (Collection): Right wing inner slot -> 69%
                // Index 4 (Quest): Right wing outer slot -> 83.5%
                const HUD_SLOTS = [
                  { left: "16.5%", top: "55%" },
                  { left: "31%", top: "55%" },
                  { left: "50%", top: "47.5%" },
                  { left: "69%", top: "55%" },
                  { left: "83.5%", top: "55%" },
                ];
                const slot = HUD_SLOTS[index] ?? { left: "50%", top: "50%" };

                if (isCapture) {
                  return (
                    <div
                      key={href}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
                      style={{ left: slot.left, top: slot.top }}
                    >
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        aria-label="Capture creature"
                        className="flex h-11 w-11 sm:h-13 sm:w-13 flex-col items-center justify-center rounded-full transition-transform active:scale-90"
                        style={{
                          fontFamily: "var(--font-display)",
                          background:
                            "radial-gradient(circle at 50% 30%, #fef08a 0%, #e0c58a 35%, #c8a96e 70%, #785a28 100%)",
                          color: "#100e09",
                          boxShadow: active
                            ? "0 0 0 2.5px #100e09, 0 0 22px 5px rgba(74,222,128,0.8)"
                            : "0 0 0 2.5px #100e09, 0 4px 14px rgba(200,169,110,0.5)",
                          border: "1.5px solid rgba(255,255,255,0.65)",
                        }}
                      >
                        <Icon active={true} />
                        <span className="text-[7px] font-black uppercase tracking-wider sm:text-[8px]">
                          Hunt
                        </span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex w-[14%] flex-col items-center justify-center gap-0.5 py-0.5 transition-all active:scale-95"
                    style={{
                      left: slot.left,
                      top: slot.top,
                      fontFamily: "var(--font-display)",
                      color: active ? "#fbbf24" : "#8a7a62",
                      textShadow: active
                        ? "0 0 10px rgba(251,191,36,0.7)"
                        : "none",
                    }}
                  >
                    <Icon active={active} />
                    <span className="text-[7.5px] font-black uppercase tracking-wider sm:text-[8.5px] leading-none">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
