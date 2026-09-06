"use client";

import { playTactileClick } from "../lib/sfx";

const SYSTEMS = [
  {
    code: "01 // OPTICAL RECON",
    title: "Real-World Field Lens",
    description:
      "Venture outside into parks, yards, or nature reserves. Point your device's camera with live viewfinder framing to capture active fauna.",
    icon: "📸",
    badge: "MOBILE CAMERA",
    accent: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    code: "02 // NEURAL CLASSIFIER",
    title: "On-Device ResNet-50",
    description:
      "25.6M parameter neural network runs client-side in WebAssembly/ONNX. Zero photos are sent to servers or stored in any database.",
    icon: "🔬",
    badge: "CLIENT-SIDE ONNX",
    accent: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  {
    code: "03 // INTEGRITY PROTOCOL",
    title: "Cryptographic pHash Gate",
    description:
      "64-bit Perceptual Hash distance algorithm blocks reused photos. Global advisory locks prevent duplicate claims across all explorers.",
    icon: "🛡️",
    badge: "ANTI-CHEAT GATE",
    accent: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    code: "04 // ONCHAIN LEDGER",
    title: "Solana Discovery PDA",
    description:
      "Every capture creates a permanent Discovery account on Solana Devnet. Program rules guarantee tamper-proof proof-of-find.",
    icon: "⚡",
    badge: "ANCHOR 0.31 PDA",
    accent: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    code: "05 // QUALITY ENGINE",
    title: "Tiered Laplacian Grading",
    description:
      "Laplacian variance evaluates focus sharpness while center luminosity ensures crisp framing, automatically grading Bronze, Silver, or Gold XP.",
    icon: "🥇",
    badge: "XP MULTIPLIER",
    accent: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    code: "06 // BOUNTY MISSIONS",
    title: "Seasonal Field Quests",
    description:
      "Discover all 5 designated target species within your survey expedition to unlock rare Founder Badges and level up your Explorer Passport.",
    icon: "🏆",
    badge: "CAMPAIGN BOUNTY",
    accent: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
] as const;

export function GameSystemsGrid() {
  return (
    <section
      aria-label="Core expedition gameplay systems"
      className="mt-28 space-y-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          <span>⚙️ EXPEDITION ENGINE</span>
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Six Core Gameplay Systems
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          From optical viewfinder to cryptographic Solana confirmation, WildQuest operates as a cohesive, truthful Web3 gaming loop.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SYSTEMS.map((system) => (
          <article
            key={system.code}
            onMouseEnter={playTactileClick}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card/80 p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${system.accent}`}
          >
            {/* Top Bar: Icon + System Code */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 dark:bg-black/40">
                  {system.icon}
                </span>
                <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider ${system.badgeColor}`}>
                  {system.badge}
                </span>
              </div>

              <p className="mt-5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {system.code}
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">
                {system.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {system.description}
              </p>
            </div>

            {/* Bottom Status Ticker */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted">
              <span>STATUS: READY</span>
              <span className="font-bold text-foreground transition-transform duration-200 group-hover:translate-x-1">
                SYSTEM VERIFIED ➔
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
