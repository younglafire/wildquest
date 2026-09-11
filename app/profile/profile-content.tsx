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
    <main className="mx-auto max-w-5xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      {/* Passport + Wallet */}
      <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Guild Passport Card */}
        <div
          className="rounded-xl p-4 sm:p-8"
          style={{
            background: "#1c1810",
            border: "1px solid #3a2e1e",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,169,110,0.06) inset",
          }}
        >
          {/* Top rule */}
          <div
            className="mb-3 h-[1px] w-full sm:mb-4"
            style={{ background: "linear-gradient(90deg, transparent, #c8a96e, transparent)" }}
          />
          <p className="wax-badge">Explorer Passport</p>
          <h1
            className="mt-2 text-3xl font-black tracking-tight sm:mt-4 sm:text-6xl"
            style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
          >
            Level {player.level.toString()}
          </h1>
          <p className="mt-1 text-xs sm:mt-2 sm:text-sm" style={{ color: "#8a7a62" }}>
            WildQuest field explorer · Solana {cluster}
          </p>
          {game.playerProgress && (
            <div className="mt-5 sm:mt-8">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / 100 XP to next level`}
              />
            </div>
          )}
          <dl className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
            <PassportStat label="Total XP" value={player.xp.toString()} />
            <PassportStat
              label="Captures"
              value={player.discoveryCount.toString()}
            />
            <PassportStat label="Badges" value={player.badgeCount.toString()} />
          </dl>
          {/* Bottom rule */}
          <div
            className="mt-4 h-[1px] w-full sm:mt-6"
            style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)" }}
          />
        </div>

        {/* Wallet card */}
        <div
          className="rounded-xl p-4 sm:p-8"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
          >
            Connected Wallet
          </p>
          <p
            className="mt-4 break-all text-sm"
            style={{ fontFamily: "var(--font-mono)", color: "#8a7a62", fontSize: "0.72rem" }}
          >
            {game.address}
          </p>
          <p
            className="mt-5 text-3xl font-black tabular-nums"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            {balance.lamports !== null
              ? lamportsToSolString(balance.lamports)
              : "—"}{" "}
            <span
              className="text-sm font-medium"
              style={{ color: "#8a7a62" }}
            >
              SOL
            </span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="min-h-12 rounded-lg text-sm font-bold transition-colors"
              style={{ border: "1px solid #3a2e1e", color: "#c8a96e", background: "rgba(200,169,110,0.06)" }}
            >
              {copied ? "Copied ✓" : "Copy address"}
            </button>
            <a
              href={getExplorerUrl(`/address/${game.address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-lg text-sm font-bold transition-colors"
              style={{ border: "1px solid #3a2e1e", color: "#c8a96e", background: "rgba(200,169,110,0.06)" }}
            >
              Explorer ↗
            </a>
          </div>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="mt-3 min-h-12 w-full rounded-lg text-sm font-bold"
            style={{ border: "1px solid rgba(192,57,43,0.35)", color: "#f8c8c4", background: "rgba(192,57,43,0.08)" }}
          >
            Disconnect
          </button>
        </div>
      </section>

      {/* Badges */}
      <section
        className="mt-4 rounded-xl p-6 sm:p-8"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
            >
              Badges
            </p>
            <h2
              className="mt-2 text-2xl font-black"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Expedition Achievements
            </h2>
          </div>
          <span className="wax-badge">
            {player.badgeCount.toString()} earned
          </span>
        </div>

        {completion ? (
          <article
            className="mt-6 flex items-center gap-4 rounded-xl p-5"
            style={{ background: "rgba(74,124,89,0.1)", border: "1px solid rgba(74,124,89,0.3)" }}
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ background: "linear-gradient(135deg, #4a7c59, #6aab7a)", color: "#fff" }}
            >
              ✦
            </span>
            <div>
              <h3
                className="font-black"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Campus Field Survey
              </h3>
              <p className="mt-1 text-xs" style={{ color: "#8a7a62", fontFamily: "var(--font-mono)" }}>
                Completed {formatDiscoveryDate(completion.completedAt)} · +
                {completion.rewardXp.toString()} XP
              </p>
            </div>
          </article>
        ) : (
          <div
            className="mt-6 rounded-xl p-5"
            style={{ background: "#221d14" }}
          >
            <p className="font-bold" style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}>
              Your first badge is waiting
            </p>
            <p className="mt-1 text-sm" style={{ color: "#8a7a62" }}>
              Complete the Campus Field Survey to earn it.
            </p>
            <Link
              href="/quest"
              className="mt-4 inline-flex min-h-12 items-center font-bold underline-offset-4 hover:underline"
              style={{ color: "#c8a96e" }}
            >
              View quest →
            </Link>
          </div>
        )}
      </section>

      {/* Battle record */}
      <section
        className="mt-4 flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
          >
            Battle Record
          </p>
          <h2
            className="mt-2 text-2xl font-black"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Your Onchain Matches
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#8a7a62" }}>
            Rewatch deterministic battles and open every signed transaction
            receipt on Explorer.
          </p>
        </div>
        <Link
          href="/battle#history"
          className="btn-guild whitespace-nowrap"
        >
          View Match History
        </Link>
      </section>
    </main>
  );
}

function PassportStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-2.5 text-center sm:p-4"
      style={{ background: "#100e09", border: "1px solid #3a2e1e" }}
    >
      <dt
        className="text-[9px] uppercase tracking-wider"
        style={{ color: "#8a7a62", fontFamily: "var(--font-display)", fontSize: "0.62rem" }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-xl font-black tabular-nums sm:text-2xl"
        style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
      >
        {value}
      </dd>
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
      <section
        className="rounded-xl p-8"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        <h1
          className="text-3xl font-black"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "#8a7a62" }}>
          {copy}
        </p>
        {action && href && (
          <Link
            href={href}
            className="btn-guild mt-6 inline-flex"
          >
            {action}
          </Link>
        )}
      </section>
    </main>
  );
}
