import { AppHeader } from "./components/app-header";
import { GridBackground } from "./components/grid-background";
import { HeroSceneDeck } from "./components/hero-scene-deck";
import { StartExpeditionButton } from "./components/start-expedition-button";

const OBJECTIVES = [
  {
    step: "01",
    tag: "FIELD SCOUTING",
    title: "Track & Photograph",
    description:
      "Venture outdoors into parks, yards, or nature reserves. Spot supported wildlife and take a live photo with your mobile camera.",
    icon: "📸",
  },
  {
    step: "02",
    tag: "NEURAL ANALYSIS",
    title: "AI Bio-Classification",
    description:
      "On-device ResNet-50 computer vision validates species anatomy, framing, and light to grade your capture Bronze, Silver, or Gold.",
    icon: "🔬",
  },
  {
    step: "03",
    tag: "ONCHAIN PROOF",
    title: "Mint Explorer Legend",
    description:
      "Record permanent Discovery accounts on Solana. Level up your Explorer Passport, unlock species lore, and claim bounty quests.",
    icon: "📜",
  },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        <AppHeader landing />

        <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-6 sm:pt-16">
          {/* Hero Section */}
          <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Column: Game Title & Mission */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                WildQuest · Season 01
              </div>

              <div>
                <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                  <span className="block bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-700 bg-clip-text text-transparent dark:from-amber-200 dark:via-emerald-400 dark:to-teal-300">
                    WILDQUEST
                  </span>
                  <span className="mt-2 block text-3xl font-black tracking-tight sm:text-4xl text-foreground">
                    The Real-World Wildlife RPG on Solana
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                  Step outside, hunt real animals with your phone camera, and prove your finds with on-device AI vision. Every validated capture builds your onchain Explorer Passport.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold text-muted">
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

              {/* Start Expedition Box */}
              <div className="rounded-3xl border-2 border-emerald-900/20 bg-card/90 p-6 shadow-[0_25px_80px_-25px_rgba(0,0,0,0.6)] backdrop-blur sm:p-7 dark:border-emerald-500/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      Ready for the wild?
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      Connect your wallet to begin your expedition.
                    </p>
                  </div>
                  <StartExpeditionButton />
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted">
                  <span>✓ Solana Devnet</span>
                  <span>·</span>
                  <span>Zero real SOL spent</span>
                  <span>·</span>
                  <span>Photos analyzed strictly in memory</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual - Interactive PPT-Style Game Deck */}
            <div className="w-full py-4 lg:py-0">
              <HeroSceneDeck />
            </div>
          </section>

          {/* Section: How WildQuest Works (Field Objectives) */}
          <section
            aria-label="Field expedition workflow"
            className="mt-28 space-y-6"
          >
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
                Explorer Handbook
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                How Your Expedition Works
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Three seamless steps from spotting wildlife outside to immortalizing your catch on Solana.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {OBJECTIVES.map((item) => (
                <article
                  key={item.step}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-2xl dark:bg-card">
                      {item.icon}
                    </span>
                    <span className="font-mono text-xs font-bold text-muted">
                      PHASE {item.step}
                    </span>
                  </div>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    {item.tag}
                  </p>
                  <h3 className="mt-1 text-xl font-black tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Active Bounty Quest Banner */}
          <section className="mt-16 overflow-hidden rounded-3xl border-2 border-emerald-900/30 bg-gradient-to-r from-emerald-950/20 via-card to-background p-6 shadow-xl sm:p-8 dark:border-emerald-500/30">
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
        </main>
      </div>
    </div>
  );
}
