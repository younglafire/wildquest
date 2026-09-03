"use client";

import Link from "next/link";
import { useState } from "react";
import { getInitializePlayerInstructionAsync } from "../generated/wildquest";
import { formatDiscoveryDate } from "../lib/game";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useWallet } from "../lib/wallet/context";
import { ProgressBar } from "../components/progress-bar";
import { SpeciesArt } from "../components/species-art";

export function HomeContent() {
  const game = useGameData();
  const { signer } = useWallet();
  const { send, isSending } = useSendTransaction();
  const [setupError, setSetupError] = useState<string | null>(null);

  const initializePlayer = async () => {
    if (!signer) return;
    setSetupError(null);
    try {
      const instruction = await getInitializePlayerInstructionAsync({
        payer: signer,
      });
      await send({ instructions: [instruction] });
      await game.refresh();
    } catch (thrownObject) {
      setSetupError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "Your Passport could not be created. You can safely retry.",
      );
    }
  };

  if (game.isLoading) {
    return <DashboardMessage message="Loading your expedition…" />;
  }

  if (game.error) {
    return (
      <DashboardMessage
        message="Your expedition could not be loaded from Devnet."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (!game.player.data?.exists) {
    return (
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-6 sm:pt-20">
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_90px_-55px_rgba(0,0,0,0.7)]">
          <div className="border-b border-border bg-emerald-500/10 p-6 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300">
              First expedition
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Create your Explorer Passport
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Your Passport is a Player account that holds your level, XP,
              discovery count, and badges on Solana Devnet.
            </p>
          </div>
          <div className="p-6 sm:p-9">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span aria-hidden="true">✓</span>One wallet approval creates it.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true">✓</span>No XP or discovery is awarded
                yet.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true">✓</span>You pay only the Devnet
                transaction fee and account rent.
              </li>
            </ul>
            {setupError && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
              >
                {setupError}
              </p>
            )}
            <button
              type="button"
              onClick={() => void initializePlayer()}
              disabled={!signer || isSending}
              className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
            >
              {isSending ? "Creating Passport…" : "Create Passport"}
            </button>
            <Link
              href="/collection"
              className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline sm:ml-5"
            >
              Browse the field guide first
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const player = game.player.data.data;
  const questCompleteCount = game.questTargets.filter(
    (target) => target.complete,
  ).length;
  const latest = game.cards
    .filter((card) => card.latestTimestamp !== null)
    .sort((left, right) => {
      const rightTimestamp = right.latestTimestamp ?? 0n;
      const leftTimestamp = left.latestTimestamp ?? 0n;
      return rightTimestamp > leftTimestamp
        ? 1
        : rightTimestamp < leftTimestamp
          ? -1
          : 0;
    })[0];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 sm:pt-14">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300">
            Expedition active
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Level {player.level.toString()} Explorer
              </h1>
              <p className="mt-2 text-sm text-muted">
                {player.xp.toString()} total XP · {game.uniqueDiscoveryCount}{" "}
                unique species
              </p>
            </div>
            <Link
              href="/capture"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 motion-reduce:hover:translate-y-0"
            >
              Capture a discovery
            </Link>
          </div>
          {game.playerProgress && (
            <div className="mt-8">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / ${game.playerProgress.nextLevelXp.toString()} XP to next level`}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat value={player.discoveryCount.toString()} label="Captures" />
          <Stat value={game.uniqueDiscoveryCount.toString()} label="Species" />
          <Stat value={player.badgeCount.toString()} label="Badges" />
        </div>
      </section>

      {game.pending && (
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Result ready
            </p>
            <h2 className="mt-1 text-xl font-black">
              Resume {game.pending.identification.common_name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your verified result is waiting to be recorded.
            </p>
          </div>
          <Link
            href="/capture"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Resume identification
          </Link>
        </section>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
                Active quest
              </p>
              <h2 className="mt-2 text-2xl font-black">Campus Field Survey</h2>
            </div>
            {game.quest.data?.exists && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                +{game.quest.data.data.rewardXp.toString()} XP
              </span>
            )}
          </div>
          {game.quest.error || !game.quest.data?.exists ? (
            <p className="mt-5 rounded-xl bg-cream p-4 text-sm text-muted">
              This quest is not available on the connected Devnet program yet.
            </p>
          ) : (
            <div className="mt-6">
              <ProgressBar
                value={Math.round(
                  (questCompleteCount / game.quest.data.data.speciesCount) *
                    100,
                )}
                label={`${questCompleteCount} / ${game.quest.data.data.speciesCount} targets found`}
              />
            </div>
          )}
          <Link
            href="/quest"
            className="mt-6 inline-flex min-h-12 items-center font-bold underline-offset-4 hover:underline"
          >
            View quest →
          </Link>
        </article>

        <article className="overflow-hidden rounded-3xl border border-border bg-card">
          {latest ? (
            <Link
              href={`/collection/${latest.species.speciesId}`}
              className="grid h-full min-h-64 grid-cols-[0.85fr_1.15fr]"
            >
              <div className="relative overflow-hidden bg-cream">
                <SpeciesArt
                  src={latest.species.imageUrl ?? latest.species.iconUrl}
                  alt={latest.species.name}
                />
              </div>
              <div className="flex flex-col justify-center p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
                  Latest discovery
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {latest.species.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {latest.species.rarity} · {latest.bestGrade ?? "Unscored"}
                </p>
                <p className="mt-5 text-xs text-muted">
                  {formatDiscoveryDate(latest.latestTimestamp)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-h-64 flex-col justify-center p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
                Collection
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Your first discovery awaits
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Photograph a supported animal to start your onchain field
                journal.
              </p>
            </div>
          )}
        </article>
      </section>

      <nav
        aria-label="Dashboard shortcuts"
        className="mt-6 grid gap-3 sm:grid-cols-3"
      >
        <QuickLink
          href="/quest"
          title="Quest"
          copy="See targets and claim rewards"
        />
        <QuickLink
          href="/collection"
          title="Collection"
          copy="Browse your wildlife field guide"
        />
        <QuickLink
          href="/profile"
          title="Passport"
          copy="Review your onchain progress"
        />
      </nav>
    </main>
  );
}

function DashboardMessage({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 text-center">
      <p className="text-sm text-muted">{message}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-12 rounded-xl border border-border px-5 text-sm font-bold"
        >
          {action}
        </button>
      )}
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-32 flex-col justify-center rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  copy,
}: {
  href: string;
  title: string;
  copy: string;
}) {
  return (
    <Link
      href={href}
      className="min-h-24 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-foreground/30 motion-reduce:hover:translate-y-0"
    >
      <span className="font-black">{title}</span>
      <span className="mt-1 block text-xs text-muted">{copy}</span>
    </Link>
  );
}
