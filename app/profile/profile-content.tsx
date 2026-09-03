"use client";

import Link from "next/link";
import { useState } from "react";
import { useCluster } from "../components/cluster-context";
import { ProgressBar } from "../components/progress-bar";
import { formatDiscoveryDate } from "../lib/game";
import { useBalance } from "../lib/hooks/use-balance";
import { useGameData } from "../lib/hooks/use-game-data";
import { lamportsToSolString } from "../lib/lamports";
import { useWallet } from "../lib/wallet/context";

export function ProfileContent() {
  const game = useGameData();
  const { disconnect } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  const balance = useBalance(game.address);
  const [copied, setCopied] = useState(false);

  if (game.isLoading)
    return (
      <ProfileMessage
        title="Loading Passport"
        copy="Reading your Player account from Devnet…"
      />
    );
  if (game.error)
    return (
      <ProfileMessage
        title="Passport unavailable"
        copy="WildQuest could not read your confirmed Player account from Devnet."
        action="Return home"
        href="/home"
      />
    );
  if (!game.player.data?.exists)
    return (
      <ProfileMessage
        title="Passport not created"
        copy="Create your Explorer Passport before collecting XP, levels, and badges."
        action="Create Passport"
        href="/home"
      />
    );

  const player = game.player.data.data;
  const completion = game.questCompletion.data?.exists
    ? game.questCompletion.data.data
    : null;
  const copyAddress = async () => {
    if (!game.address) return;
    await navigator.clipboard.writeText(game.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-6 sm:pt-14">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300">
            Explorer Passport
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Level {player.level.toString()}
          </h1>
          <p className="mt-2 text-sm text-muted">
            WildQuest field explorer · Solana {cluster}
          </p>
          {game.playerProgress && (
            <div className="mt-8">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / 100 XP to next level`}
              />
            </div>
          )}
          <dl className="mt-8 grid grid-cols-3 gap-3">
            <PassportStat label="Total XP" value={player.xp.toString()} />
            <PassportStat
              label="Captures"
              value={player.discoveryCount.toString()}
            />
            <PassportStat label="Badges" value={player.badgeCount.toString()} />
          </dl>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
            Connected wallet
          </p>
          <p className="mt-4 break-all font-mono text-sm">{game.address}</p>
          <p className="mt-5 text-3xl font-black tabular-nums">
            {balance.lamports !== null
              ? lamportsToSolString(balance.lamports)
              : "—"}{" "}
            <span className="text-sm font-medium text-muted">SOL</span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="min-h-12 rounded-xl border border-border px-4 text-sm font-bold hover:bg-cream"
            >
              {copied ? "Copied" : "Copy address"}
            </button>
            <a
              href={getExplorerUrl(`/address/${game.address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-cream"
            >
              Explorer
            </a>
          </div>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="mt-3 min-h-12 w-full rounded-xl border border-destructive/30 text-sm font-bold text-destructive hover:bg-destructive/10"
          >
            Disconnect
          </button>
        </div>
      </section>
      <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
              Badges
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Expedition achievements
            </h2>
          </div>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold">
            {player.badgeCount.toString()} earned
          </span>
        </div>
        {completion ? (
          <article className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white"
            >
              ✓
            </span>
            <div>
              <h3 className="font-black">Campus Field Survey</h3>
              <p className="mt-1 text-xs text-muted">
                Completed {formatDiscoveryDate(completion.completedAt)} · +
                {completion.rewardXp.toString()} XP
              </p>
            </div>
          </article>
        ) : (
          <div className="mt-6 rounded-2xl bg-cream p-5">
            <p className="font-bold">Your first badge is waiting</p>
            <p className="mt-1 text-sm text-muted">
              Complete the Campus Field Survey to earn it.
            </p>
            <Link
              href="/quest"
              className="mt-4 inline-flex min-h-12 items-center font-bold underline"
            >
              View quest →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function PassportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4 text-center">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-black tabular-nums">{value}</dd>
    </div>
  );
}

function ProfileMessage({
  title,
  copy,
  action,
  href,
}: {
  title: string;
  copy: string;
  action?: string;
  href?: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <section className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-muted">{copy}</p>
        {action && href && (
          <Link
            href={href}
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            {action}
          </Link>
        )}
      </section>
    </main>
  );
}
