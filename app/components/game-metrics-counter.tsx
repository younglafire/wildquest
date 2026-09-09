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
      className="mt-14 rounded-3xl border-2 border-emerald-900/25 bg-card/70 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-7 dark:border-emerald-500/20"
    >
      <div className="flex flex-col gap-3 pb-5 border-b border-border/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
            SOLANA DEVNET TELEMETRY // LIVE SPEC
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span>CONSENSUS: 400ms</span>
          <span>·</span>
          <span>PROGRAM: CONFIRMED</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.id}
            onMouseEnter={playTactileClick}
            className={`group relative overflow-hidden rounded-2xl border ${metric.border} bg-gradient-to-b ${metric.accent} p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5`}
          >
            {/* Corner Bracket Accent */}
            <span className="pointer-events-none absolute right-2 top-2 text-[10px] font-mono text-muted opacity-40 group-hover:opacity-100 transition-opacity">
              [SYS]
            </span>

            <div
              className="flex items-center gap-2 text-xl sm:text-2xl"
              aria-hidden="true"
            >
              <span>{metric.icon}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span
                className={`font-mono text-3xl font-black tracking-tight sm:text-4xl ${metric.textGlow}`}
              >
                {metric.value}
              </span>
              <span className="font-mono text-xs font-bold text-muted">
                {metric.unit}
              </span>
            </div>

            <p className="mt-1 text-xs font-black tracking-tight text-foreground sm:text-sm">
              {metric.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted font-mono">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
