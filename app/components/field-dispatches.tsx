"use client";

import { playTactileClick } from "../lib/sfx";

const DISPATCHES = [
  {
    callsign: "VANGUARD-01",
    author: "@sol_ranger",
    rank: "Season 01 Vanguard",
    avatar: "🧭",
    quote:
      "Scored Gold Tier (+100 XP) on a Swallowtail butterfly by centering the subject in direct morning sunlight. The Laplacian sharpness check is strict, but that makes hitting Gold truly rewarding.",
    metric: "GOLD TIER · 96.4% ACCURACY",
    tag: "DISCOVERY PDA VERIFIED",
  },
  {
    callsign: "SCOUT-09",
    author: "@devnet_scout",
    rank: "Field Biologist",
    avatar: "🔬",
    quote:
      "Zero latency on mobile. The neural inference runs in ~180ms right inside the browser. No photos ever get uploaded or stored in the cloud, and the Solana PDA transaction settled in under 1 second.",
    metric: "180MS INFERENCE · 0.00 SOL",
    tag: "ZERO-CLOUD PRIVACY",
  },
  {
    callsign: "SENTINEL-04",
    author: "@hash_sentinel",
    rank: "Protocol Auditor",
    avatar: "🛡️",
    quote:
      "The 64-bit pHash reservation lock prevents duplicate photo sniping across the cluster. You can't just download a picture from the web and bypass the Hamming distance gate.",
    metric: "HAMMING DISTANCE < 10 GATE",
    tag: "ANTI-CHEAT INTEGRITY",
  },
] as const;

export function FieldDispatches() {
  return (
    <section aria-label="Explorer field dispatches" className="mt-28 space-y-8">
      <div className="flex flex-col items-center text-center">
        {/* Ornate Tag Frame for Section Title */}
        <div className="relative inline-flex min-h-8 sm:min-h-9 items-center justify-center px-6 py-1.5 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/tag_frame.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
          <span
            className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#f0e8d4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            📡 Field Comm-Link
          </span>
        </div>
        <h2
          className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-[#f0e8d4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Explorer Dispatches & Field Logs
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[#a89880]">
          Read real-world field telemetry and tips from early explorers
          pioneering the Devnet wildlife protocol.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {DISPATCHES.map((dispatch) => (
          <article
            key={dispatch.callsign}
            onMouseEnter={playTactileClick}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 sm:p-7 select-none transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/60 hover:shadow-[0_16px_36px_rgba(52,211,153,0.3)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,24,16,0.95) 0%, rgba(16,14,9,0.98) 100%)",
              border: "1px solid rgba(200,169,110,0.3)",
              boxShadow:
                "0 10px 28px rgba(0,0,0,0.65), inset 0 1px 0 rgba(200,169,110,0.18)",
            }}
          >
            {/* Corner Brass Notches */}
            <span className="pointer-events-none absolute top-1.5 left-2 font-mono text-[9px] text-[#c8a96e]/40 select-none">
              ⌜
            </span>
            <span className="pointer-events-none absolute top-1.5 right-2 font-mono text-[9px] text-[#c8a96e]/40 select-none">
              ⌝
            </span>
            <span className="pointer-events-none absolute bottom-1.5 left-2 font-mono text-[9px] text-[#c8a96e]/40 select-none">
              ⌞
            </span>
            <span className="pointer-events-none absolute bottom-1.5 right-2 font-mono text-[9px] text-[#c8a96e]/40 select-none">
              ⌟
            </span>

            <div>
              {/* Header with callsign & ornate tag frame */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow">
                  {dispatch.callsign}
                </span>

                <div className="relative inline-flex min-h-6 sm:min-h-7 items-center justify-center px-3 py-0.5 select-none shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ui/tag_frame.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow brightness-95"
                    draggable={false}
                  />
                  <span className="relative z-10 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#f0e8d4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {dispatch.tag}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="mt-4 text-xs sm:text-[13px] leading-relaxed text-[#dfd4c0] italic font-serif">
                “{dispatch.quote}”
              </blockquote>
            </div>

            {/* Author info & Metric bar */}
            <div className="mt-6 border-t border-[#3a2e1e]/80 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ui/icon_socket.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                    draggable={false}
                  />
                  <span className="relative z-10 text-lg sm:text-xl drop-shadow">
                    {dispatch.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-[#f0e8d4] drop-shadow">
                    {dispatch.author}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#a89880] font-mono">
                    {dispatch.rank}
                  </p>
                </div>
              </div>

              {/* Metric bar */}
              <div
                className="mt-3.5 flex items-center justify-between rounded-lg border border-[#c8a96e]/20 px-3 py-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(16,36,24,0.6) 0%, rgba(16,14,9,0.8) 100%)",
                }}
              >
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-400 drop-shadow">
                  {dispatch.metric}
                </span>
                <span className="font-mono text-[9px] font-bold text-[#c8a96e]">
                  ✓ VERIFIED
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
