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
        aria-label="Start Expedition"
        className="group relative inline-flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        style={{
          filter:
            "drop-shadow(0 10px 25px rgba(0,0,0,0.7)) drop-shadow(0 0 16px rgba(200,169,110,0.25))",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ui/button_start_expedition.png"
          alt=""
          aria-hidden="true"
          width={320}
          height={104}
          className="h-auto w-[min(92vw,380px)] max-w-full select-none object-contain transition-all duration-200 group-hover:brightness-110 group-hover:drop-shadow-[0_0_24px_rgba(52,211,153,0.55)]"
          draggable={false}
        />
      </button>
      <WalletChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        onConnected={() => router.push(destination())}
      />
    </>
  );
}
