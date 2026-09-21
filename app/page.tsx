import { AppHeader } from "./components/app-header";
import { BackToTopButton } from "./components/back-to-top-button";
import { FieldDispatches } from "./components/field-dispatches";
import { GameFooter } from "./components/game-footer";
import { GameMetricsCounter } from "./components/game-metrics-counter";
import { GameSystemsGrid } from "./components/game-systems-grid";
import { GridBackground } from "./components/grid-background";
import { HeroInteractiveDisplay } from "./components/hero-interactive-display";
import { SpeciesMarquee } from "./components/species-marquee";
import { StartExpeditionButton } from "./components/start-expedition-button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        {/* Sticky App Header with backdrop blur */}
        <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <AppHeader landing />
        </div>

        <main className="mx-auto max-w-6xl px-4 pb-20 pt-3 sm:px-6 sm:pt-6">
          {/* Hero Section: Centered Cinematic Layout */}
          <section className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
            {/* Top Badge & Titles */}
            <div className="space-y-3 max-w-3xl mx-auto">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.25em]"
                style={{
                  background: "rgba(200,169,110,0.1)",
                  border: "1px solid rgba(200,169,110,0.25)",
                  color: "#c8a96e",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "#c8a96e" }}
                />
                WildQuest · Season 01 // Solana Devnet
              </div>

              <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ui/logo.png"
                  alt="WildQuest"
                  className="h-auto w-full max-w-[340px] sm:max-w-[500px] md:max-w-[640px] lg:max-w-[780px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                />
                <h1
                  className="mt-3 text-center text-lg font-black tracking-tight sm:text-2xl lg:text-3xl"
                  style={{
                    color: "#f0e8d4",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  The Real-World Wildlife RPG on Solana
                </h1>
              </div>

              <p
                className="mx-auto max-w-xl text-xs leading-relaxed sm:text-sm"
                style={{ color: "#8a7a62" }}
              >
                Step outside, hunt real animals with your phone camera, and
                prove your finds with on-device AI vision.
              </p>

              {/* Feature Tags — Ornate fantasy ribbon plaques */}
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 pt-1">
                {[
                  "🐾 8 Species",
                  "⚡ ResNet-50 Vision",
                  "🛡️ Anti-Cheat pHash",
                  "🏆 Onchain Quests",
                ].map((tag) => (
                  <div
                    key={tag}
                    className="group relative inline-flex min-h-9 sm:min-h-11 items-center justify-center px-7 py-2 sm:px-9 sm:py-2.5 transition-transform duration-150 hover:scale-105 select-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ui/tag_frame.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] brightness-95 transition-all group-hover:brightness-110"
                      draggable={false}
                    />
                    <span
                      className="relative z-10 text-xs sm:text-sm font-black tracking-wide text-[#f0e8d4] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Centerpiece Visual: Frameless 3D Bio-Scanner & Cards */}
            <div className="w-full">
              <HeroInteractiveDisplay />
            </div>

            {/* Centered CTA & Trust Credentials */}
            <div className="w-full max-w-md mx-auto space-y-2 pt-1">
              <div className="flex flex-col items-center gap-2.5">
                <StartExpeditionButton />
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-muted">
                  <span>✓ Solana Devnet</span>
                  <span>·</span>
                  <span>Zero real SOL spent</span>
                  <span>·</span>
                  <span>In-Memory Neural Scan</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Live Telemetry Metrics Counters */}
          <GameMetricsCounter />

          {/* Section: Continuous Supported Species Marquee */}
          <SpeciesMarquee />

          {/* Section: 6 Core Gameplay Systems Grid */}
          <GameSystemsGrid />

          {/* Section: Active Bounty Quest Highlight */}
          <section
            className="relative mt-28 overflow-hidden rounded-2xl p-6 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.85)] select-none transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_24px_64px_rgba(52,211,153,0.2)]"
            style={{
              background:
                "radial-gradient(120% 120% at 20% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 70%)",
              border: "1px solid rgba(200, 169, 110, 0.35)",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.25), inset 0 0 35px rgba(10, 24, 16, 0.6)",
            }}
          >
            {/* Top gold rule */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,169,110,0.7), transparent)",
              }}
            />

            {/* Corner Runes */}
            <span className="pointer-events-none absolute top-2 left-2.5 font-mono text-[10px] text-[#c8a96e]/40 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute top-2 right-2.5 font-mono text-[10px] text-[#c8a96e]/40 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] text-[#c8a96e]/40 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute bottom-2 right-2.5 font-mono text-[10px] text-[#c8a96e]/40 select-none">
              ❖
            </span>

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                {/* Bounty Tag Badge — Enlarged with generous safe-zone padding */}
                <div className="group relative inline-flex min-h-10 sm:min-h-12 items-center justify-center px-9 sm:px-12 py-2 sm:py-2.5 select-none transition-transform duration-200 hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ui/tag_frame.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] brightness-95 transition-all group-hover:brightness-110"
                    draggable={false}
                  />
                  <span
                    className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#f0e8d4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Active Bounty Quest
                  </span>
                </div>

                <h3
                  className="mt-3 text-2xl font-black sm:text-3xl lg:text-4xl text-[#f0e8d4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Campus Field Survey #01
                </h3>

                {/* Target Species Tokens */}
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a89880]">
                    Targets:
                  </span>
                  {[
                    { name: "Bee", icon: "🐝" },
                    { name: "Chicken", icon: "🐔" },
                    { name: "Butterfly", icon: "🦋" },
                    { name: "Dragonfly", icon: "🪰" },
                    { name: "Frog", icon: "🐸" },
                  ].map((sp) => (
                    <div
                      key={sp.name}
                      className="group/sp relative inline-flex items-center gap-1.5 rounded-lg border border-[#c8a96e]/30 bg-black/50 px-2.5 py-1 text-xs text-[#f0e8d4] transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30"
                    >
                      <span>{sp.icon}</span>
                      <span className="font-bold text-[#c8a96e]">{sp.name}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs sm:text-sm text-[#a89880]">
                  Locate all 5 target species to earn the{" "}
                  <strong className="text-emerald-400">Founder Badge</strong> and{" "}
                  <strong className="text-amber-400">+100 XP</strong> on Solana Devnet.
                </p>
              </div>

              <div className="shrink-0">
                <StartExpeditionButton />
              </div>
            </div>
          </section>

          {/* Section: Explorer Dispatches & Field Logs */}
          <FieldDispatches />

          {/* Pre-Footer Call to Action Banner */}
          <section
            className="relative mt-28 overflow-hidden rounded-2xl p-8 text-center sm:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.85)] select-none transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_24px_64px_rgba(52,211,153,0.2)]"
            style={{
              background:
                "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 75%)",
              border: "1px solid rgba(200, 169, 110, 0.35)",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.25), inset 0 0 45px rgba(10, 24, 16, 0.6)",
            }}
          >
            {/* Ambient emerald & gold glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full blur-3xl opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, rgba(200, 169, 110, 0.15) 60%, transparent 80%)",
              }}
              aria-hidden="true"
            />

            {/* Gold ornamental rules */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,169,110,0.8), transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-8 bottom-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(200,169,110,0.35), transparent)",
              }}
            />

            {/* Corner Runes */}
            <span className="pointer-events-none absolute top-2.5 left-3 font-mono text-[11px] text-[#c8a96e]/45 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute top-2.5 right-3 font-mono text-[11px] text-[#c8a96e]/45 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[11px] text-[#c8a96e]/45 select-none">
              ❖
            </span>
            <span className="pointer-events-none absolute bottom-2.5 right-3 font-mono text-[11px] text-[#c8a96e]/45 select-none">
              ❖
            </span>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              {/* Season Badge in Ornate Frame */}
              <div className="group relative inline-flex min-h-10 sm:min-h-12 items-center justify-center px-9 sm:px-12 py-2 select-none transition-transform duration-200 hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ui/tag_frame.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] brightness-105 transition-all group-hover:brightness-115"
                  draggable={false}
                />
                <span
                  className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#f0e8d4] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ✦ SEASON 01 IS LIVE ✦
                </span>
              </div>

              <h2
                className="text-3xl font-black tracking-tight sm:text-5xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Ready to Step Into the Wild?
              </h2>

              <p
                className="text-sm leading-relaxed sm:text-base max-w-xl mx-auto"
                style={{ color: "#a89880" }}
              >
                Your mobile phone is your neural scanner. Solana is your
                immutable ledger. Begin tracking local wildlife, level up your
                Explorer Passport, and mint your discoveries today.
              </p>

              <div className="pt-4 flex justify-center">
                <StartExpeditionButton />
              </div>
            </div>
          </section>
        </main>

        {/* Tactical Gaming Footer */}
        <GameFooter />

        {/* Floating Tactical Back to Top Button */}
        <BackToTopButton />
      </div>
    </div>
  );
}
