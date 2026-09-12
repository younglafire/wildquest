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
              style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.25)", color: "#c8a96e" }}
            >
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#c8a96e" }} />
              WildQuest · Season 01 // Solana Devnet
            </div>

            <h1
              className="text-3xl font-black leading-none sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, #e0c58a 0%, #c8a96e 40%, #a07d48 70%, #c8a96e 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WILDQUEST
              </span>
              <span
                className="mt-1.5 block text-lg font-black tracking-tight sm:text-2xl lg:text-3xl"
                style={{ color: "#f0e8d4" }}
              >
                The Real-World Wildlife RPG on Solana
              </span>
            </h1>

            <p
              className="mx-auto max-w-xl text-xs leading-relaxed sm:text-sm"
              style={{ color: "#8a7a62" }}
            >
              Step outside, hunt real animals with your phone camera, and
              prove your finds with on-device AI vision.
            </p>

            {/* Feature Tags — leather bordered */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {[
                "🐾 8 Species",
                "⚡ ResNet-50 Vision",
                "🛡️ Anti-Cheat pHash",
                "🏆 Onchain Quests",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: "rgba(58,46,30,0.6)",
                    border: "1px solid rgba(200,169,110,0.2)",
                    color: "#8a7a62",
                    fontFamily: "var(--font-display)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {tag}
                </span>
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
            className="mt-28 overflow-hidden rounded-xl p-6 shadow-xl sm:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(74,124,89,0.12) 0%, #1c1810 60%)",
              border: "1px solid rgba(200,169,110,0.2)",
            }}
          >
            {/* Top gold rule */}
            <div
              className="mb-5 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)" }}
            />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="wax-badge wax-badge-forest inline-flex">
                  🎯 Active Bounty Quest
                </div>
                <h3
                  className="mt-3 text-2xl font-black sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
                >
                  Campus Field Survey #01
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: "#8a7a62" }}>
                  Locate all 5 target species:{" "}
                  <strong style={{ color: "#c8a96e" }}>Bee, Chicken, Butterfly, Dragonfly, and Frog</strong>{" "}
                  to earn the Founder Badge and +100 XP.
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
            className="mt-28 relative overflow-hidden rounded-xl p-8 text-center sm:p-12"
            style={{
              background: "linear-gradient(180deg, #1c1810 0%, #221d14 100%)",
              border: "1px solid rgba(200,169,110,0.2)",
              boxShadow: "0 20px 80px -20px rgba(200,169,110,0.15)",
            }}
          >
            {/* Ambient gold glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full blur-3xl"
              style={{ background: "rgba(200,169,110,0.12)" }}
              aria-hidden="true"
            />
            {/* Gold ornamental rules */}
            <div
              className="absolute inset-x-8 top-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)" }}
            />
            <div
              className="absolute inset-x-8 bottom-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.25), transparent)" }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-widest"
                style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.25)", color: "#c8a96e" }}
              >
                <span>✦ SEASON 01 IS LIVE</span>
              </div>
              <h2
                className="text-3xl font-black tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Ready to Step Into the Wild?
              </h2>
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#8a7a62" }}>
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
