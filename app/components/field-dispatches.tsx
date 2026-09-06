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
    <section
      aria-label="Explorer field dispatches"
      className="mt-28 space-y-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
          <span>📡 FIELD COMM-LINK</span>
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Explorer Dispatches & Field Logs
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Read real-world field telemetry and tips from early explorers pioneering the Devnet wildlife protocol.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {DISPATCHES.map((dispatch) => (
          <article
            key={dispatch.callsign}
            onMouseEnter={playTactileClick}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card/85 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-xl"
          >
            <div>
              {/* Header with callsign & badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {dispatch.callsign}
                </span>
                <span className="rounded-full bg-cream px-2.5 py-0.5 font-mono text-[9px] font-bold text-muted dark:bg-black/40">
                  {dispatch.tag}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="mt-4 text-xs leading-relaxed text-foreground/90 italic">
                “{dispatch.quote}”
              </blockquote>
            </div>

            {/* Author info */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-xl dark:bg-black/30">
                  {dispatch.avatar}
                </span>
                <div>
                  <p className="text-xs font-black text-foreground">
                    {dispatch.author}
                  </p>
                  <p className="text-[10px] text-muted font-mono">
                    {dispatch.rank}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-cream/70 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-600 dark:bg-black/40 dark:text-emerald-400">
                {dispatch.metric}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
