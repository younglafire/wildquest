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

        <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-6 sm:pt-16">
          {/* Hero Section: Centered Cinematic Layout */}
          <section className="flex flex-col items-center text-center space-y-8">
            {/* Top Badge & Titles */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                WildQuest · Season 01 // Solana Devnet
              </div>

              <h1 className="text-6xl font-black leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                <span className="block bg-gradient-to-br from-amber-500 via-emerald-500 to-teal-600 bg-clip-text text-transparent dark:from-amber-200 dark:via-emerald-400 dark:to-teal-300">
                  WILDQUEST
                </span>
                <span className="mt-2 block text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                  The Real-World Wildlife RPG on Solana
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Step outside, hunt real animals with your phone camera, and prove your finds with on-device AI vision. Every validated capture builds your onchain Explorer Passport.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs font-bold text-muted">
                <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur">
                  🐾 8 Supported Species
                </span>
                <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur">
                  ⚡ ResNet-50 Vision
                </span>
                <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur">
                  🛡️ Anti-Cheat pHash Gate
                </span>
                <span className="rounded-xl border border-border bg-card/60 px-3 py-1.5 backdrop-blur">
                  🏆 Onchain Quests & Badges
                </span>
              </div>
            </div>

            {/* Centerpiece Visual: Massive 3D Bio-Scanner & Cards */}
            <div className="w-full">
              <HeroInteractiveDisplay />
            </div>

            {/* Centered CTA & Trust Credentials */}
            <div className="w-full max-w-md mx-auto space-y-3 pt-2">
              <div className="flex flex-col items-center gap-3">
                <StartExpeditionButton />
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted">
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
          <section className="mt-28 overflow-hidden rounded-3xl border-2 border-emerald-900/30 bg-gradient-to-r from-emerald-950/20 via-card to-background p-6 shadow-xl sm:p-8 dark:border-emerald-500/30">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <span>🎯 ACTIVE BOUNTY QUEST</span>
                </div>
                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                  Campus Field Survey #01
                </h3>
                <p className="mt-1.5 text-sm text-muted">
                  Locate all 5 target species: <strong>Bee, Chicken, Butterfly, Dragonfly, and Frog</strong> to earn the Founder Badge and +100 XP.
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
          <section className="mt-28 relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-card via-card to-background p-8 text-center shadow-[0_20px_80px_-20px_rgba(16,185,129,0.25)] sm:p-12">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                <span>⚡ SEASON 01 IS LIVE</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Ready to Step Into the Wild?
              </h2>
              <p className="text-sm text-muted sm:text-base leading-relaxed">
                Your mobile phone is your neural scanner. Solana is your immutable ledger. Begin tracking local wildlife, level up your Explorer Passport, and mint your discoveries today.
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
