"use client";

import { playTactileClick } from "../lib/sfx";

const METRICS = [
  {
    id: "species",
    value: "8",
    unit: "SPECIES",
    label: "Local Flora & Fauna",
    detail: "100% On-Device ResNet-50",
    icon: "🐾",
    accent: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    textGlow: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: "phash",
    value: "64-bit",
    unit: "PHASH",
    label: "Anti-Duplicate Proof",
    detail: "Hamming Distance Gate < 10",
    icon: "🛡️",
    accent: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/30",
    textGlow: "text-teal-500 dark:text-teal-400",
  },
  {
    id: "cost",
    value: "0.00",
    unit: "SOL",
    label: "Devnet Gas-Free",
    detail: "Zero Real SOL Required",
    icon: "⚡",
    accent: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    textGlow: "text-amber-500 dark:text-amber-400",
  },
  {
    id: "xp",
    value: "+100",
    unit: "XP",
    label: "Max Bounty Reward",
    detail: "Gold Tier Quality Mint",
    icon: "🏆",
    accent: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    textGlow: "text-amber-500 dark:text-amber-400",
  },
] as const;

export function GameMetricsCounter() {
  return (
    <section
      aria-label="Expedition telemetry metrics"
      className="relative mt-14 overflow-hidden rounded-2xl p-5 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.85)] select-none transition-all duration-300"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 0%, rgba(18, 38, 26, 0.85) 0%, rgba(16, 14, 9, 0.98) 75%)",
        border: "1px solid rgba(200, 169, 110, 0.35)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.25), inset 0 0 40px rgba(10, 24, 16, 0.6)",
      }}
    >
      {/* Top Gold Filigree Rule */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(200,169,110,0.7), transparent)",
        }}
      />

      {/* Corner Runes */}
      <span className="pointer-events-none absolute top-1.5 left-2.5 font-mono text-[9px] text-[#c8a96e]/40 select-none">
        ❖
      </span>
      <span className="pointer-events-none absolute top-1.5 right-2.5 font-mono text-[9px] text-[#c8a96e]/40 select-none">
        ❖
      </span>
      <span className="pointer-events-none absolute bottom-1.5 left-2.5 font-mono text-[9px] text-[#c8a96e]/40 select-none">
        ❖
      </span>
      <span className="pointer-events-none absolute bottom-1.5 right-2.5 font-mono text-[9px] text-[#c8a96e]/40 select-none">
        ❖
      </span>

      {/* Header: Title Badge & Status Indicators */}
      <div className="flex flex-col gap-3 pb-5 border-b border-[#3a2e1e]/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Ornate Tag Frame for Title */}
          <div className="relative inline-flex min-h-8 sm:min-h-9 items-center justify-center px-5 py-1 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ui/tag_frame.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
              draggable={false}
            />
            <div className="relative z-10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#f0e8d4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                SOLANA DEVNET TELEMETRY
              </span>
            </div>
          </div>
          <span className="hidden sm:inline font-mono text-xs text-[#8a7a62]">
            {"// LIVE SPEC"}
          </span>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#c8a96e] drop-shadow">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            CONSENSUS: 400ms
          </span>
          <span className="text-[#8a7a62]">·</span>
          <span className="text-emerald-400 font-bold">PROGRAM: CONFIRMED</span>
        </div>
      </div>

      {/* 4 Metric Cards Grid — Telemetry Console Terminals */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.id}
            onMouseEnter={playTactileClick}
            className="group relative flex min-h-[175px] sm:min-h-[190px] flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5 select-none transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/60 hover:shadow-[0_12px_28px_rgba(52,211,153,0.3)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,24,16,0.95) 0%, rgba(16,14,9,0.98) 100%)",
              border: "1px solid rgba(200,169,110,0.3)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(200,169,110,0.18)",
            }}
          >
            {/* Ornate Brass Corner Notches */}
            <span className="pointer-events-none absolute top-1 left-1.5 font-mono text-[8px] text-[#c8a96e]/50 select-none">
              ⌜
            </span>
            <span className="pointer-events-none absolute top-1 right-1.5 font-mono text-[8px] text-[#c8a96e]/50 select-none">
              ⌝
            </span>
            <span className="pointer-events-none absolute bottom-1 left-1.5 font-mono text-[8px] text-[#c8a96e]/50 select-none">
              ⌞
            </span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 font-mono text-[8px] text-[#c8a96e]/50 select-none">
              ⌟
            </span>

            {/* Top Row: Celtic Icon Socket + Unit Tag Frame */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ui/icon_socket.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                  draggable={false}
                />
                <span className="relative z-10 text-lg sm:text-xl drop-shadow">
                  {metric.icon}
                </span>
              </div>

              {/* Ornate Tag Frame for Unit Badge */}
              <div className="relative inline-flex min-h-6 sm:min-h-7 items-center justify-center px-3 py-0.5 select-none shrink-0 transition-transform duration-200 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ui/tag_frame.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow brightness-95"
                  draggable={false}
                />
                <span className="relative z-10 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#f0e8d4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {metric.unit}
                </span>
              </div>
            </div>

            {/* Middle: Big Metric Value */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${metric.textGlow}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {metric.value}
                </span>
              </div>

              {/* Label & Detail Subtitle */}
              <p
                className="mt-1 text-xs sm:text-sm font-black tracking-tight text-[#f0e8d4] drop-shadow line-clamp-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {metric.label}
              </p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-mono leading-tight text-[#a89880] line-clamp-1">
                {metric.detail}
              </p>
            </div>

            {/* Bottom Subtle Gold Hairline */}
            <div
              className="mt-3 h-[1px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(200,169,110,0.35) 0%, transparent 100%)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
