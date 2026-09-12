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
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid #3a2e1e", background: "#1c1810", boxShadow: "0 24px 90px -40px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,169,110,0.06) inset" }}
        >
          {/* Header */}
          <div className="p-6 sm:p-9" style={{ background: "rgba(200,169,110,0.07)", borderBottom: "1px solid rgba(200,169,110,0.15)" }}>
            <p className="wax-badge">First Expedition</p>
            <h1
              className="mt-4 text-4xl font-black tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Create your Explorer Passport
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "#8a7a62", fontFamily: "var(--font-sans)" }}>
              Your Passport is a Player account that holds your level, XP,
              discovery count, and badges on Solana Devnet.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-9">
            <ul className="space-y-3 text-sm" style={{ color: "#f0e8d4" }}>
              <li className="flex gap-3 items-center">
                <span style={{ color: "#c8a96e" }}>✦</span>
                One wallet approval creates it.
              </li>
              <li className="flex gap-3 items-center">
                <span style={{ color: "#c8a96e" }}>✦</span>
                No XP or discovery is awarded yet.
              </li>
              <li className="flex gap-3 items-center">
                <span style={{ color: "#c8a96e" }}>✦</span>
                You pay only the Devnet transaction fee and account rent.
              </li>
            </ul>

            {setupError && (
              <p
                role="alert"
                className="mt-5 rounded-lg p-4 text-sm"
                style={{ background: "rgba(192,57,43,0.12)", color: "#f8c8c4", border: "1px solid rgba(192,57,43,0.3)" }}
              >
                {setupError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void initializePlayer()}
              disabled={!signer || isSending}
              className="btn-guild mt-7"
            >
              {isSending ? "Creating Passport…" : "Create Passport"}
            </button>
            <Link
              href="/collection"
              className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold underline-offset-4 hover:underline sm:ml-5"
              style={{ color: "#8a7a62" }}
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
    <main className="mx-auto max-w-6xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      {/* Hero stats row */}
      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Level card */}
        <div
          className="rounded-xl p-4 sm:p-8"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e", boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,169,110,0.05) inset" }}
        >
          <div className="flex items-center justify-between">
            <p className="wax-badge wax-badge-forest">Expedition Active</p>
            <span
              className="text-[10px] font-bold uppercase tracking-wider md:hidden"
              style={{ color: "#c8a96e", fontFamily: "var(--font-mono)" }}
            >
              {player.xp.toString()} XP
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div>
              <h1
                className="text-2xl font-black tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Level {player.level.toString()} Explorer
              </h1>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: "#8a7a62" }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "#c8a96e" }}>{player.xp.toString()}</span>
                {" "}total XP ·{" "}
                <span style={{ fontFamily: "var(--font-mono)", color: "#c8a96e" }}>{game.uniqueDiscoveryCount}</span>
                {" "}unique species
              </p>
            </div>
            <Link
              href="/capture"
              className="btn-guild w-full sm:w-auto"
            >
              ✦ Hunt & Capture
            </Link>
          </div>
          {game.playerProgress && (
            <div className="mt-5 sm:mt-8">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / ${game.playerProgress.nextLevelXp.toString()} XP to next level`}
              />
            </div>
          )}
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat value={player.discoveryCount.toString()} label="Captures" />
          <Stat value={game.uniqueDiscoveryCount.toString()} label="Species" />
          <Stat value={player.badgeCount.toString()} label="Badges" />
        </div>
      </section>

      {/* Pending identification banner */}
      {game.pending && (
        <section
          className="mt-4 flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "rgba(200,169,110,0.08)",
            border: "1px solid rgba(200,169,110,0.25)",
          }}
        >
          <div>
            <p className="wax-badge">Result Ready</p>
            <h2
              className="mt-2 text-xl font-black"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Resume {game.pending.identification.common_name}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#8a7a62" }}>
              Your verified result is waiting to be recorded.
            </p>
          </div>
          <Link href="/capture" className="btn-guild whitespace-nowrap">
            Resume Identification
          </Link>
        </section>
      )}

      {/* Quest + Latest discovery */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Active quest */}
        <article
          className="rounded-xl p-6 sm:p-8"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
              >
                Active Quest
              </p>
              <h2
                className="mt-2 text-2xl font-black"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Campus Field Survey
              </h2>
            </div>
            {game.quest.data?.exists && (
              <span className="wax-badge">
                +{game.quest.data.data.rewardXp.toString()} XP
              </span>
            )}
          </div>

          {game.quest.error || !game.quest.data?.exists ? (
            <p
              className="mt-5 rounded-lg p-4 text-sm"
              style={{ background: "#221d14", color: "#8a7a62" }}
            >
              This quest is not available on the connected Devnet program yet.
            </p>
          ) : (
            <div className="mt-6">
              <ProgressBar
                value={Math.round(
                  (questCompleteCount / game.quest.data.data.speciesCount) * 100,
                )}
                label={`${questCompleteCount} / ${game.quest.data.data.speciesCount} targets found`}
              />
            </div>
          )}

          <Link
            href="/quest"
            className="mt-6 inline-flex min-h-12 items-center text-sm font-bold underline-offset-4 hover:underline"
            style={{ color: "#c8a96e" }}
          >
            View quest →
          </Link>
        </article>

        {/* Latest discovery */}
        <article
          className="overflow-hidden rounded-xl"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
        >
          {latest ? (
            <Link
              href={`/collection/${latest.species.speciesId}`}
              className="grid h-full min-h-40 grid-cols-[6rem_1fr] sm:grid-cols-[0.85fr_1.15fr]"
            >
              <div className="relative overflow-hidden" style={{ background: "#221d14" }}>
                <SpeciesArt
                  src={latest.species.imageUrl ?? latest.species.iconUrl}
                  alt={latest.species.name}
                  className="p-2 sm:p-4"
                />
              </div>
              <div className="flex flex-col justify-center p-3.5 sm:p-6">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.22em] sm:text-[10px]"
                  style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
                >
                  Latest Discovery
                </p>
                <h2
                  className="mt-1 text-lg font-black sm:mt-2 sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
                >
                  {latest.species.name}
                </h2>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: "#8a7a62" }}>
                  {latest.species.rarity} · {latest.bestGrade ?? "Unscored"}
                </p>
                <p className="mt-2 text-[10px] sm:mt-5 sm:text-xs" style={{ color: "#8a7a62", fontFamily: "var(--font-mono)" }}>
                  {formatDiscoveryDate(latest.latestTimestamp)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-h-40 flex-col justify-center p-4 sm:min-h-64 sm:p-8">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
              >
                Collection
              </p>
              <h2
                className="mt-1.5 text-xl font-black sm:mt-2 sm:text-2xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Your first discovery awaits
              </h2>
              <p className="mt-2 text-xs leading-relaxed sm:text-sm" style={{ color: "#8a7a62" }}>
                Hunt a supported wild creature to start your onchain expedition journal.
              </p>
            </div>
          )}
        </article>
      </section>

      {/* Quick links nav — 2x2 grid on mobile, 4 cols on desktop */}
      <nav
        aria-label="Dashboard shortcuts"
        className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3"
      >
        <QuickLink href="/battle" title="Battle" copy="3v3 onchain match · 0.01 SOL" />
        <QuickLink href="/quest" title="Quest" copy="Active survey targets & XP" />
        <QuickLink href="/collection" title="Collection" copy="40 species field guide" />
        <QuickLink href="/profile" title="Passport" copy="Explorer rank & wallet stats" />
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
      <p className="text-sm" style={{ color: "#8a7a62", fontFamily: "var(--font-sans)" }}>{message}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-12 rounded-lg px-5 text-sm font-bold transition hover:-translate-y-0.5"
          style={{
            border: "1px solid #3a2e1e",
            color: "#c8a96e",
            background: "rgba(200,169,110,0.07)",
          }}
        >
          {action}
        </button>
      )}
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex min-h-20 flex-col justify-center rounded-xl p-2.5 text-center sm:min-h-28 sm:p-4"
      style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
    >
      <p
        className="text-2xl font-black tabular-nums sm:text-3xl"
        style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
      >
        {value}
      </p>
      <p
        className="mt-0.5 text-[9px] uppercase tracking-wider sm:text-xs"
        style={{ color: "#8a7a62", fontFamily: "var(--font-display)", fontSize: "0.62rem" }}
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
      className="group min-h-20 rounded-xl p-3 sm:min-h-24 sm:p-5 transition-all active:scale-98"
      style={{
        background: "#1c1810",
        border: "1px solid #3a2e1e",
        boxShadow: "none",
        transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,169,110,0.4)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(200,169,110,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3a2e1e";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      <span
        className="block font-black text-xs sm:text-sm"
        style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
      >
        {title}
      </span>
      <span
        className="mt-1 block text-[10px] leading-relaxed sm:text-xs line-clamp-2"
        style={{ color: "#8a7a62" }}
      >
        {copy}
      </span>
    </Link>
  );
}
