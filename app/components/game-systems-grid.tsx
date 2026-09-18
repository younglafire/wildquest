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
            ⚙️ Expedition Engine
          </span>
        </div>
        <h2
          className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-[#f0e8d4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Six Core Gameplay Systems
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[#a89880]">
          From optical viewfinder to cryptographic Solana confirmation,
          WildQuest operates as a cohesive, truthful Web3 gaming loop.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SYSTEMS.map((system) => (
          <article
            key={system.code}
            onMouseEnter={playTactileClick}
            className="group relative flex h-[540px] sm:h-[580px] w-full flex-col justify-between select-none transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_16px_36px_rgba(52,211,153,0.35)]"
            style={{
              backgroundImage: "url('/ui/system_card_frame.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.85))",
            }}
          >
            {/* Inner Content strictly bounded inside dark stone tablet */}
            <div className="relative z-10 flex h-full flex-col justify-between px-[15%] pt-[14%] pb-[12%]">
              <div>
                {/* Top Bar: Celtic Icon Socket + Tag Frame Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ui/icon_socket.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      draggable={false}
                    />
                    <span className="relative z-10 text-2xl sm:text-3xl drop-shadow">
                      {system.icon}
                    </span>
                  </div>

                  {/* Ornate Tag Frame for Badge */}
                  <div className="relative inline-flex min-h-7 sm:min-h-8 items-center justify-center px-4 py-1 sm:px-5 select-none shrink-0 transition-transform duration-200 group-hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ui/tag_frame.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] brightness-95 transition-all group-hover:brightness-110"
                      draggable={false}
                    />
                    <span className="relative z-10 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#f0e8d4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {system.badge}
                    </span>
                  </div>
                </div>

                <p className="mt-5 font-mono text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-emerald-400 drop-shadow">
                  {system.code}
                </p>
                <h3
                  className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {system.title}
                </h3>
                <p className="mt-3 text-sm sm:text-[15px] font-medium leading-relaxed text-[#dfd4c0]">
                  {system.description}
                </p>
              </div>

              {/* Bottom Status Bar */}
              <div className="mt-4 pt-1">
                <div className="mb-2 flex items-center justify-between px-1 font-mono text-xs text-[#a89880]">
                  <span>STATUS: READY</span>
                  <span className="text-emerald-400 font-bold">0xDEVNET</span>
                </div>
                <div className="relative flex h-9 sm:h-10 w-full items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ui/status_verified_bar.png"
                    alt="System Verified"
                    className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(52,211,153,0.35)] transition-all group-hover:drop-shadow-[0_4px_16px_rgba(52,211,153,0.65)]"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
