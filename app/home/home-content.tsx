"use client";

import Link from "next/link";
import { useState } from "react";
import { getInitializePlayerInstructionAsync } from "../generated/wildquest";
import { formatDiscoveryDate, getQuestCopy } from "../lib/game";
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
    return <DashboardMessage message="Consulting the Codex…" />;
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
        <section
          className="relative overflow-hidden rounded-2xl p-6 sm:p-9"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 75%)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.3)",
          }}
        >
          {/* Top gold hairline */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
          {/* Corner Runes */}
          <span className="absolute top-2.5 left-2.5 text-[11px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[11px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute bottom-2.5 left-2.5 text-[11px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute bottom-2.5 right-2.5 text-[11px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>

          {/* Header */}
          <div className="relative">
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
                ✦ FIRST EXPEDITION ✦
              </span>
            </div>

            <h1
              className="mt-4 text-3xl font-black tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Create your Explorer Passport
            </h1>
            <p
              className="mt-3 max-w-xl text-sm leading-relaxed"
              style={{ color: "#a89880" }}
            >
              Your Passport is a Player account that holds your level, XP,
              discovery count, and badges on Solana Devnet.
            </p>
          </div>

          {/* Body */}
          <div className="mt-6 border-t border-[rgba(200,169,110,0.15)] pt-6">
            <ul className="space-y-3 text-sm" style={{ color: "#f0e8d4" }}>
              <li className="flex gap-3 items-center">
                <span className="text-[#c8a96e]">✦</span>
                <span>One wallet approval creates it.</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="text-[#c8a96e]">✦</span>
                <span>No XP or discovery is awarded yet.</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="text-[#c8a96e]">✦</span>
                <span>
                  You pay only the Devnet transaction fee and account rent.
                </span>
              </li>
            </ul>

            {setupError && (
              <p
                role="alert"
                className="mt-5 rounded-xl p-4 text-sm"
                style={{
                  background: "rgba(192,57,43,0.15)",
                  color: "#f8c8c4",
                  border: "1px solid rgba(192,57,43,0.35)",
                }}
              >
                {setupError}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void initializePlayer()}
                disabled={!signer || isSending}
                className="btn-guild min-h-12 px-8 text-sm font-black tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {isSending ? "Creating Passport…" : "✦ Create Passport"}
              </button>
              <Link
                href="/collection"
                className="inline-flex min-h-12 items-center text-sm font-semibold text-[#a89880] underline-offset-4 hover:text-[#f0e8d4] hover:underline"
              >
                Browse the field guide first →
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const player = game.player.data.data;
  const capturedCount = game.creatures.data?.length ?? 0;
  const uniqueSpeciesCount = new Set(
    (game.creatures.data ?? []).map((creature) =>
      creature.data.catalogueId.toString(),
    ),
  ).size;
  const activeQuestCopy = game.activeQuest
    ? getQuestCopy(game.activeQuest.data.questId)
    : null;
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
    <main className="mx-auto max-w-6xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      {/* Hero stats row */}
      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Level card */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 75%)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200, 169, 110, 0.25)",
          }}
        >
          {/* Top gold hairline */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
          {/* Corner Runes */}
          <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>

          <div className="flex items-center justify-between">
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
                ✦ EXPEDITION ACTIVE ✦
              </span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider md:hidden"
              style={{
                background: "rgba(18, 16, 11, 0.85)",
                border: "1px solid rgba(200, 169, 110, 0.3)",
                color: "#c8a96e",
                fontFamily: "var(--font-mono)",
              }}
            >
              {player.xp.toString()} XP
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div>
              <h1
                className="text-2xl font-black tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Level {player.level.toString()} Explorer
              </h1>
              <p
                className="mt-1.5 text-xs sm:text-sm"
                style={{ color: "#a89880" }}
              >
                <span
                  style={{ fontFamily: "var(--font-mono)", color: "#c8a96e" }}
                >
                  {player.xp.toString()}
                </span>{" "}
                total XP ·{" "}
                <span
                  style={{ fontFamily: "var(--font-mono)", color: "#c8a96e" }}
                >
                  {uniqueSpeciesCount}
                </span>{" "}
                unique species
              </p>
            </div>
            <Link
              href="/capture"
              aria-label="Hunt & Capture"
              className="group relative inline-flex cursor-pointer items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
              style={{
                filter:
                  "drop-shadow(0 10px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px rgba(52,211,153,0.25))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/hunt_capture.png"
                alt="Hunt & Capture"
                width={300}
                height={90}
                className="h-auto w-56 sm:w-64 select-none object-contain transition-all duration-200 group-hover:brightness-120 group-hover:drop-shadow-[0_0_28px_rgba(52,211,153,0.7)]"
                draggable={false}
              />
            </Link>
          </div>

          {game.playerProgress && (
            <div className="mt-6 sm:mt-8">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / ${game.playerProgress.nextLevelXp.toString()} XP to next level`}
              />
            </div>
          )}
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat value={capturedCount.toString()} label="Captures" />
          <Stat value={uniqueSpeciesCount.toString()} label="Species" />
          <Stat value={game.completedQuestCount.toString()} label="Quests" />
        </div>
      </section>

      {/* Pending identification banner */}
      {game.pending && (
        <section
          className="relative mt-4 overflow-hidden rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between flex flex-col gap-4"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(160, 125, 72, 0.25) 0%, rgba(18, 16, 11, 0.95) 85%)",
            border: "1px solid rgba(200, 169, 110, 0.4)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
          <div>
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
                className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ✦ RESULT READY ✦
              </span>
            </div>
            <h2
              className="mt-2 text-xl font-black"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Resume {game.pending.identification.common_name}
            </h2>
            <p className="mt-1 text-sm text-[#a89880]">
              Your verified result is waiting to be recorded on Solana Devnet.
            </p>
          </div>
          <Link
            href="/capture"
            className="btn-guild whitespace-nowrap min-h-12 px-6 text-xs font-black tracking-wider uppercase transition-all duration-200 active:scale-95"
          >
            ✦ Resume Identification
          </Link>
        </section>
      )}

      {/* Quest + Latest discovery */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Active quest */}
        <article
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(18, 16, 11, 0.92)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
          }}
        >
          {/* Top gold hairline */}
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
                className="text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{ color: "#c8a96e", fontFamily: "var(--font-display)" }}
              >
                Active Quest
              </p>
              <h2
                className="mt-2 text-2xl font-black"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                {activeQuestCopy?.title ?? "Questline complete"}
              </h2>
            </div>
            {game.activeQuest && (
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
                  +{game.activeQuest.data.rewardXp.toString()} XP
                </span>
              </div>
            )}
          </div>

          {game.quests.error ? (
            <p
              className="mt-5 rounded-xl p-4 text-sm"
              style={{
                background: "rgba(14, 12, 8, 0.95)",
                color: "#8a7a62",
                border: "1px solid rgba(200, 169, 110, 0.2)",
              }}
            >
              Quest progress could not be loaded from Devnet.
            </p>
          ) : !game.activeQuest ? (
            <p className="mt-5 text-sm text-[#a89880]">
              You completed every available quest. More expeditions are coming.
            </p>
          ) : !game.activeQuestProgress ? (
            <p className="mt-5 text-sm text-[#a89880]">
              Loading your current quest progress…
            </p>
          ) : (
            <div className="mt-6">
              <ProgressBar
                value={game.activeQuestProgress.percentage}
                label={game.activeQuestProgress.label}
              />
            </div>
          )}

          <Link
            href="/quest"
            className="mt-6 inline-flex min-h-12 items-center text-sm font-bold text-[#c8a96e] underline-offset-4 hover:text-[#f0e8d4] hover:underline"
          >
            View quest details →
          </Link>
        </article>

        {/* Latest discovery */}
        <article
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "rgba(18, 16, 11, 0.92)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
          }}
        >
          {/* Top gold hairline */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
          <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
            ❖
          </span>

          {latest ? (
            <Link
              href={`/collection/${latest.species.speciesId}`}
              className="grid h-full min-h-40 grid-cols-[6rem_1fr] sm:grid-cols-[0.85fr_1.15fr] group"
            >
              <div
                className="relative overflow-hidden flex items-center justify-center p-2 sm:p-4"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(30, 45, 35, 0.8), rgba(12, 10, 8, 0.95))",
                }}
              >
                <SpeciesArt
                  src={latest.species.imageUrl ?? latest.species.iconUrl}
                  alt={latest.species.name}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-3.5 sm:p-6">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.24em] sm:text-[10px]"
                  style={{
                    color: "#c8a96e",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Latest Discovery
                </p>
                <h2
                  className="mt-1 text-lg font-black sm:mt-2 sm:text-2xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#f0e8d4",
                  }}
                >
                  {latest.species.name}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#a89880]">
                  <span className="font-semibold text-[#c8a96e]">
                    {latest.species.rarity}
                  </span>{" "}
                  · {latest.bestGrade ?? "Unscored"}
                </p>
                <p
                  className="mt-2 text-[10px] sm:mt-4 sm:text-xs"
                  style={{ color: "#8a7a62", fontFamily: "var(--font-mono)" }}
                >
                  {formatDiscoveryDate(latest.latestTimestamp)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-h-40 flex-col justify-center p-5 sm:min-h-64 sm:p-8">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{ color: "#c8a96e", fontFamily: "var(--font-display)" }}
              >
                Collection
              </p>
              <h2
                className="mt-1.5 text-xl font-black sm:mt-2 sm:text-2xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Your first discovery awaits
              </h2>
              <p className="mt-2 text-xs leading-relaxed sm:text-sm text-[#a89880]">
                Hunt a supported wild creature to start your onchain expedition
                journal.
              </p>
              <Link
                href="/capture"
                className="mt-4 inline-flex items-center text-xs font-bold text-[#c8a96e] underline-offset-4 hover:underline"
              >
                ✦ Hunt supported animals →
              </Link>
            </div>
          )}
        </article>
      </section>

      {/* Quick links nav — 2x2 grid on mobile, 4 cols on desktop */}
      <nav
        aria-label="Dashboard shortcuts"
        className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3"
      >
        <QuickLink
          href="/battle"
          title="Battle"
          copy="3v3 onchain match · 0.01 SOL"
        />
        <QuickLink
          href="/quest"
          title="Quest"
          copy="Active survey targets & XP"
        />
        <QuickLink
          href="/collection"
          title="Collection"
          copy="40 species field guide"
        />
        <QuickLink
          href="/profile"
          title="Passport"
          copy="Explorer rank & wallet stats"
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
      <section
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.6) 0%, rgba(18, 16, 11, 0.95) 75%)",
          border: "1px solid rgba(200, 169, 110, 0.3)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <p className="text-sm text-[#a89880]">{message}</p>
        {action && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="btn-guild mt-5 min-h-12 px-6 text-xs font-bold uppercase tracking-wider transition hover:-translate-y-0.5"
          >
            {action}
          </button>
        )}
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="relative overflow-hidden flex min-h-20 flex-col justify-center rounded-2xl p-2.5 text-center sm:min-h-28 sm:p-4"
      style={{
        background: "rgba(18, 16, 11, 0.95)",
        border: "1px solid rgba(200, 169, 110, 0.35)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
      }}
    >
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent pointer-events-none" />
      <p
        className="text-2xl font-black tabular-nums sm:text-3xl text-[#c8a96e] drop-shadow-[0_2px_8px_rgba(200,169,110,0.2)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p
        className="mt-0.5 text-[9px] uppercase tracking-wider sm:text-xs"
        style={{
          color: "#a89880",
          fontFamily: "var(--font-display)",
          fontSize: "0.62rem",
        }}
      >
        {label}
      </p>
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
      className="group relative overflow-hidden min-h-20 rounded-2xl p-3 sm:min-h-24 sm:p-5 transition-all duration-200 active:scale-98"
      style={{
        background: "rgba(18, 16, 11, 0.92)",
        border: "1px solid rgba(200, 169, 110, 0.3)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(200,169,110,0.6)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 8px 28px rgba(200,169,110,0.18)";
        (e.currentTarget as HTMLAnchorElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(200,169,110,0.3)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 8px 24px rgba(0,0,0,0.5)";
        (e.currentTarget as HTMLAnchorElement).style.transform =
          "translateY(0)";
      }}
    >
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.4)] to-transparent pointer-events-none" />
      <span
        className="block font-black text-xs sm:text-sm text-[#f0e8d4] group-hover:text-[#c8a96e] transition-colors"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title} ✦
      </span>
      <span className="mt-1 block text-[10px] leading-relaxed sm:text-xs line-clamp-2 text-[#8a7a62] group-hover:text-[#a89880] transition-colors">
        {copy}
      </span>
    </Link>
  );
}
