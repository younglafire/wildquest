"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { playTactileClick } from "../lib/sfx";
import { useWallet } from "../lib/wallet/context";
import { WalletChooser } from "./wallet-chooser";

const GAME_ROUTES = [
  "/home",
  "/quest",
  "/capture",
  "/battle",
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
    playTactileClick();
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
        className="group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-xl px-8 py-4 text-base font-black tracking-wide shadow-[0_12px_35px_-10px_rgba(200,169,110,0.4)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(200,169,110,0.6)] active:translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #c8a96e 0%, #a07d48 50%, #c8a96e 100%)",
          color: "#100e09",
          border: "1px solid rgba(200,169,110,0.6)",
          fontFamily: "var(--font-display)",
        }}
      >
        {/* Gold shimmer sweep */}
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
          aria-hidden="true"
        >
          <span className="animate-gold-shimmer absolute inset-0 block w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </span>
        <span className="relative z-10 flex items-center gap-2.5 font-black uppercase tracking-widest">
          <span className="text-lg drop-shadow" aria-hidden="true">
            ✦
          </span>
          <span>Start Expedition</span>
          <span
            className="text-xs transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
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
