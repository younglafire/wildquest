"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "../lib/wallet/context";
import { WalletChooser } from "./wallet-chooser";

const GAME_ROUTES = [
  "/home",
  "/quest",
  "/capture",
  "/collection",
  "/profile",
  "/discovery/confirmed",
] as const;

export function StartExpeditionButton() {
  const router = useRouter();
  const { status } = useWallet();
  const [chooserOpen, setChooserOpen] = useState(false);

  const destination = () => {
    const requested = new URLSearchParams(window.location.search).get("next");
    const isGameRoute = GAME_ROUTES.some(
      (route) => requested === route || requested?.startsWith(`${route}/`),
    );
    return requested && isGameRoute ? requested : "/home";
  };

  const start = () => {
    if (status === "connected") {
      router.push(destination());
    } else {
      setChooserOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-2xl border-b-4 border-emerald-900 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-8 py-4 text-base font-black tracking-wide text-white shadow-[0_12px_35px_-10px_rgba(16,185,129,0.5)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(16,185,129,0.7)] active:translate-y-1 active:border-b-0 dark:border-emerald-950 dark:from-emerald-500 dark:via-teal-500 dark:to-emerald-600"
      >
        {/* Shimmer sweep effect */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
          <span className="animate-shimmer absolute inset-0 block w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
        </span>
        <span className="relative z-10 flex items-center gap-2.5 font-black uppercase tracking-wider">
          <span className="text-lg drop-shadow" aria-hidden="true">🧭</span>
          <span>Start Expedition</span>
          <span className="text-xs transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">➔</span>
        </span>
      </button>
      <WalletChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        onConnected={() => router.push(destination())}
      />
    </>
  );
}
