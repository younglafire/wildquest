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
        copy="Create your Explorer Passport before collecting XP, levels, and quest rewards."
        action="Create Passport"
        href="/home"
      />
    );

  const player = game.player.data.data;
  const completion = game.questCompletions.data?.at(-1)?.data ?? null;
  const capturedCount = game.creatures.data?.length ?? 0;
  const speciesCount = new Set(
    (game.creatures.data ?? []).map((creature) =>
      creature.data.catalogueId.toString(),
    ),
  ).size;
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
          className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 75%)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.25)",
          }}
        >
          {/* Top gold hairline */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
          <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>

          <div
            className="relative inline-flex min-h-9 sm:min-h-10 items-center justify-center px-6 sm:px-8 py-1 sm:py-1.5 select-none"
            style={{
              backgroundImage: "url('/ui/tag_frame.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ✦ EXPLORER PASSPORT ✦
            </span>
          </div>

          <h1
            className="mt-3 text-3xl font-black tracking-tight sm:mt-4 sm:text-6xl"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Level {player.level.toString()}
          </h1>
          <p className="mt-1 text-xs sm:mt-2 sm:text-sm text-[#a89880]">
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
            <PassportStat label="Captures" value={capturedCount.toString()} />
            <PassportStat label="Species" value={speciesCount.toString()} />
          </dl>
        </div>

        {/* Wallet card */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
          style={{
            background: "rgba(18, 16, 11, 0.92)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
          <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>

          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Connected Wallet
            </p>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6aab7a]"
              style={{
                background: "rgba(26,56,36,0.6)",
                border: "1px solid rgba(74,124,89,0.4)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#6aab7a] animate-pulse" />
              {cluster}
            </span>
          </div>
          <p
            className="mt-4 break-all rounded-xl p-3 text-sm"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#a89880",
              fontSize: "0.72rem",
              background: "rgba(14, 12, 8, 0.95)",
              border: "1px solid rgba(200, 169, 110, 0.2)",
            }}
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
            <span className="text-sm font-medium text-[#c8a96e]">SOL</span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="min-h-12 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                border: "1px solid rgba(200, 169, 110, 0.35)",
                color: "#c8a96e",
                background: "rgba(200, 169, 110, 0.08)",
              }}
            >
              {copied ? "Copied ✓" : "Copy address"}
            </button>
            <a
              href={getExplorerUrl(`/address/${game.address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-xl text-sm font-bold text-[#c8a96e] hover:text-[#f0e8d4] transition-all active:scale-95"
              style={{
                border: "1px solid rgba(200, 169, 110, 0.35)",
                background: "rgba(200, 169, 110, 0.08)",
              }}
            >
              Explorer ↗
            </a>
          </div>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="mt-3 min-h-12 w-full rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              border: "1px solid rgba(192, 57, 43, 0.4)",
              color: "#f8c8c4",
              background: "rgba(192, 57, 43, 0.1)",
            }}
          >
            Disconnect
          </button>
        </div>
      </section>

      {/* Quest progress */}
      <section
        className="relative mt-4 overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(18, 16, 11, 0.92)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow:
            "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quest Progress
            </p>
            <h2
              className="mt-2 text-2xl font-black"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Expedition Rewards
            </h2>
          </div>
          <div
            className="relative inline-flex min-h-8 items-center justify-center px-5 py-1 select-none"
            style={{
              backgroundImage: "url('/ui/tag_frame.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {game.completedQuestCount.toString()} COMPLETE
            </span>
          </div>
        </div>

        {completion ? (
          <article
            className="relative mt-6 overflow-hidden flex items-center gap-4 rounded-xl p-5"
            style={{
              background:
                "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.75) 0%, rgba(14, 12, 8, 0.95) 85%)",
              border: "1px solid rgba(74, 124, 89, 0.4)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4a7c59, #6aab7a)",
                color: "#f0e8d4",
                border: "1px solid rgba(200, 169, 110, 0.4)",
              }}
            >
              ✦
            </span>
            <div>
              <h3
                className="font-black text-lg"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Latest quest reward
              </h3>
              <p
                className="mt-1 text-xs text-[#a89880]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Completed {formatDiscoveryDate(completion.completedAt)} · +
                {completion.rewardXp.toString()} XP
              </p>
            </div>
          </article>
        ) : (
          <div
            className="mt-6 rounded-xl p-5"
            style={{
              background: "rgba(14, 12, 8, 0.95)",
              border: "1px solid rgba(200, 169, 110, 0.2)",
            }}
          >
            <p
              className="font-bold text-base"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Your first quest is waiting
            </p>
            <p className="mt-1 text-sm text-[#a89880]">
              Complete your first capture to unlock the opening XP reward.
            </p>
            <Link
              href="/quest"
              className="mt-4 inline-flex min-h-11 items-center font-bold text-[#c8a96e] underline-offset-4 hover:text-[#f0e8d4] hover:underline"
            >
              View quest details →
            </Link>
          </div>
        )}
      </section>

      {/* Battle record */}
      <section
        className="relative mt-4 overflow-hidden flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        style={{
          background: "rgba(18, 16, 11, 0.92)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow:
            "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Battle Record
          </p>
          <h2
            className="mt-2 text-2xl font-black"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Your Onchain Matches
          </h2>
          <p className="mt-2 text-sm text-[#a89880]">
            Rewatch deterministic battles and open every signed transaction
            receipt on Explorer.
          </p>
        </div>
        <Link
          href="/battle#history"
          aria-label="View Match History"
          className="group relative inline-flex cursor-pointer items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
          style={{
            filter:
              "drop-shadow(0 10px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px rgba(52,211,153,0.25))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/view_match.png"
            alt="View Match History"
            width={320}
            height={96}
            className="h-auto w-56 sm:w-64 select-none object-contain transition-all duration-200 group-hover:brightness-120 group-hover:drop-shadow-[0_0_28px_rgba(52,211,153,0.7)]"
            draggable={false}
          />
        </Link>
      </section>
    </main>
  );
}

function PassportStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-3 text-center sm:p-4"
      style={{
        background: "rgba(14, 12, 8, 0.95)",
        border: "1px solid rgba(200, 169, 110, 0.35)",
        boxShadow:
          "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
      }}
    >
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent pointer-events-none" />
      <dt
        className="text-[9px] uppercase tracking-wider text-[#a89880]"
        style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem" }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-xl font-black tabular-nums sm:text-2xl text-[#c8a96e] drop-shadow-[0_2px_8px_rgba(200,169,110,0.2)]"
        style={{ fontFamily: "var(--font-display)" }}
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
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.6) 0%, rgba(18, 16, 11, 0.95) 75%)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <h1
          className="text-3xl font-black"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#a89880]">{copy}</p>
        {action && href && (
          <Link
            href={href}
            className="btn-guild mt-6 inline-flex min-h-12 px-7 text-xs font-black uppercase tracking-wider"
          >
            {action}
          </Link>
        )}
      </section>
    </main>
  );
}
