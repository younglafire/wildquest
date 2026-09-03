import { AppHeader } from "./components/app-header";
import { GridBackground } from "./components/grid-background";
import { StartExpeditionButton } from "./components/start-expedition-button";

const STEPS = [
  ["01", "Photograph", "Capture wildlife around you."],
  ["02", "Identify", "Local AI identifies and scores the photo."],
  ["03", "Record", "Add the discovery to your Solana Passport."],
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <AppHeader landing />

        <main className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-6 sm:pt-24">
          <section className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">
                Real-world wildlife expedition
              </p>
              <h1 className="mt-5 max-w-4xl text-6xl font-black leading-[0.88] tracking-[-0.07em] sm:text-8xl lg:text-9xl">
                Discover.
                <br />
                Prove.
                <br />
                Collect.
              </h1>
            </div>

            <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-[0_30px_100px_-55px_rgba(0,0,0,0.8)] backdrop-blur sm:p-8">
              <p className="text-xl font-bold leading-snug sm:text-2xl">
                Discover real wildlife, verify it with AI, and record your
                achievement on Solana.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Connect a wallet to own your discoveries, XP, and collection.
                Photos are analyzed in memory and are never stored.
              </p>
              <div className="mt-7">
                <StartExpeditionButton />
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted">
                Runs on Solana Devnet. Photos are processed in memory and are
                never stored.
              </p>
            </div>
          </section>

          <section
            aria-label="How WildQuest works"
            className="mt-20 grid overflow-hidden rounded-3xl border border-border bg-card/80 md:grid-cols-3"
          >
            {STEPS.map(([number, title, copy], index) => (
              <article
                key={number}
                className={`p-6 sm:p-8 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}
              >
                <p className="font-mono text-xs text-muted">{number}</p>
                <h2 className="mt-7 text-2xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {copy}
                </p>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
