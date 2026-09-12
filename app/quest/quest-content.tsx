"use client";

import Link from "next/link";
import { useState } from "react";
import { SpeciesArt } from "../components/species-art";
import { ProgressBar } from "../components/progress-bar";
import { formatDiscoveryDate } from "../lib/game";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { buildQuestCompletionInstruction } from "../lib/quest-transaction";
import { useWallet } from "../lib/wallet/context";
import { useCluster } from "../components/cluster-context";

export function QuestContent() {
  const game = useGameData();
  const { signer } = useWallet();
  const { getExplorerUrl } = useCluster();
  const { send, isSending } = useSendTransaction();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const quest = game.quest.data?.exists ? game.quest.data : null;
  const completion = game.questCompletion.data?.exists
    ? game.questCompletion.data
    : null;
  const foundCount = game.questTargets.filter(
    (target) => target.complete,
  ).length;
  const requiredCount = quest?.data.speciesCount ?? 0;
  const canClaim =
    Boolean(game.player.data?.exists) &&
    Boolean(quest) &&
    !completion &&
    requiredCount > 0 &&
    foundCount === requiredCount;

  const claimQuest = async () => {
    if (!signer || !quest || !game.discoveries.data || !canClaim) return;
    setClaimError(null);
    try {
      const instruction = await buildQuestCompletionInstruction(
        signer,
        quest,
        game.discoveries.data,
      );
      const transactionSignature = await send({ instructions: [instruction] });
      setSignature(transactionSignature);
      await game.refresh();
    } catch (thrownObject) {
      setClaimError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The quest reward could not be claimed. You can safely retry.",
      );
    }
  };

  if (
    game.quest.isLoading ||
    game.isLoading ||
    (quest && game.questCompletion.isLoading)
  ) {
    return (
      <QuestMessage
        title="Loading quest"
        copy="Consulting the Codex from Devnet…"
      />
    );
  }

  if (game.error) {
    return (
      <QuestMessage
        title="Quest progress unavailable"
        copy="WildQuest could not read your Player, Discovery, or catalogue data. No reward transaction was submitted."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (game.quest.error || !quest) {
    return (
      <QuestMessage
        title="Quest unavailable"
        copy="The Campus Field Survey has not been initialized on the connected Devnet program yet. The quest administrator must deploy WQ-33 and initialize Quest 1."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (!game.player.data?.exists) {
    return (
      <QuestMessage
        title="Create your Passport first"
        copy="Your Passport is required before WildQuest can award quest XP and a badge."
        href="/home"
        action="Create Passport"
      />
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      <section
        className="overflow-hidden rounded-xl"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        {/* Quest header — parchment scroll banner */}
        <div
          className="p-4 sm:p-9"
          style={{
            background: "linear-gradient(180deg, rgba(74,124,89,0.12) 0%, rgba(74,124,89,0.05) 100%)",
            borderBottom: "1px solid rgba(200,169,110,0.15)",
          }}
        >
          {/* Gold ornamental rule top */}
          <div
            className="mb-3 h-[1px] w-full sm:mb-5"
            style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)" }}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.26em]"
                style={{ color: "#6aab7a", fontFamily: "var(--font-display)" }}
              >
                Quest 01 · VHU / HCMC
              </p>
              <h1
                className="mt-1.5 text-2xl font-black tracking-tight sm:mt-3 sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Campus Field Survey
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed sm:mt-3 sm:text-sm" style={{ color: "#8a7a62" }}>
                Find the five target animals in any order. Every recorded
                Discovery account counts once toward this quest.
              </p>
            </div>
            <div
              className="flex items-center justify-between rounded-xl px-4 py-2.5 sm:block sm:px-5 sm:py-3 sm:text-right"
              style={{ background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)" }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}>
                Completion Reward
              </p>
              <p
                className="text-base font-black sm:mt-1 sm:text-xl"
                style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
              >
                +{quest.data.rewardXp.toString()} XP · 1 badge
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-xl sm:mt-8">
            <ProgressBar
              value={
                requiredCount > 0
                  ? Math.round((foundCount / requiredCount) * 100)
                  : 0
              }
              label={`${foundCount} / ${requiredCount} targets found`}
            />
          </div>
        </div>

        {/* Target list */}
        <div className="grid gap-2 p-4 sm:p-6">
          {game.questTargets.map((target) => (
            <article
              key={String(target.species.id)}
              className="grid grid-cols-[5rem_1fr] items-center gap-4 rounded-xl p-3 sm:grid-cols-[6rem_1fr_auto]"
              style={{
                background: "#221d14",
                border: target.complete ? "1px solid rgba(74,124,89,0.4)" : "1px solid #3a2e1e",
                borderLeft: target.complete ? "3px solid #6aab7a" : "3px solid rgba(58,46,30,0.8)",
              }}
            >
              <div
                className="relative aspect-square overflow-hidden rounded-lg"
                style={{ background: "#100e09" }}
              >
                <SpeciesArt
                  src={target.species.imageUrl ?? target.species.iconUrl}
                  alt={target.species.name}
                  className={target.complete ? "" : "grayscale opacity-50"}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="font-black"
                    style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
                  >
                    {target.species.name}
                  </h2>
                  <span
                    className={target.complete ? "wax-badge wax-badge-forest" : "wax-badge"}
                    style={target.complete ? {} : { color: "#8a7a62", borderColor: "rgba(58,46,30,0.8)", background: "rgba(58,46,30,0.3)" }}
                  >
                    {target.complete ? "✦ Found" : "Missing"}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "#8a7a62" }}>
                  {target.species.rarity}
                  {target.bestGrade ? ` · Best ${target.bestGrade}` : ""}
                </p>
              </div>
              <Link
                href={
                  target.complete
                    ? `/collection/${target.species.speciesId}`
                    : "/capture"
                }
                className="col-span-2 flex min-h-12 items-center justify-center rounded-lg px-4 text-[11px] font-bold uppercase tracking-wide transition-colors sm:col-span-1"
                style={{
                  fontFamily: "var(--font-display)",
                  border: "1px solid #3a2e1e",
                  color: target.complete ? "#c8a96e" : "#8a7a62",
                  background: target.complete ? "rgba(200,169,110,0.06)" : "transparent",
                }}
              >
                {target.complete ? "View species" : "Find target"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Completion state or claim panel */}
      {completion ? (
        <section
          className="mt-4 rounded-xl p-6 animate-seal-stamp"
          style={{ background: "rgba(74,124,89,0.12)", border: "1px solid rgba(74,124,89,0.35)" }}
        >
          <p className="wax-badge wax-badge-forest">Quest Completed</p>
          <h2
            className="mt-3 text-2xl font-black"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Field Survey Badge Earned ✦
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#8a7a62", fontFamily: "var(--font-mono)" }}>
            Claimed {formatDiscoveryDate(completion.data.completedAt)} · +
            {completion.data.rewardXp.toString()} XP
          </p>
        </section>
      ) : (
        <section
          className="sticky bottom-24 mt-4 rounded-xl p-5 shadow-xl backdrop-blur-md md:bottom-5"
          style={{ background: "rgba(20,16,10,0.95)", border: "1px solid rgba(200,169,110,0.2)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="font-black"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                {canClaim
                  ? "✦ Your reward is ready"
                  : `${requiredCount - foundCount} targets remaining`}
              </h2>
              <p className="mt-1 text-xs" style={{ color: "#8a7a62" }}>
                The wallet signs one Devnet transaction when you claim.
              </p>
            </div>
            <button
              type="button"
              disabled={!canClaim || isSending}
              onClick={() => void claimQuest()}
              className="btn-guild whitespace-nowrap"
            >
              {isSending
                ? "Claiming reward…"
                : `Claim ${quest.data.rewardXp.toString()} XP + badge`}
            </button>
          </div>
          {claimError && (
            <p role="alert" className="mt-4 text-sm" style={{ color: "#f8c8c4" }}>
              {claimError}
            </p>
          )}
          {signature && (
            <a
              href={getExplorerUrl(`/tx/${signature}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-xs font-bold underline"
              style={{ color: "#c8a96e" }}
            >
              View confirmed transaction ↗
            </a>
          )}
        </section>
      )}
    </main>
  );
}

function QuestMessage({
  title,
  copy,
  action,
  onAction,
  href,
}: {
  title: string;
  copy: string;
  action?: string;
  onAction?: () => void;
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
        {action && href ? (
          <Link href={href} className="btn-guild mt-6 inline-flex">
            {action}
          </Link>
        ) : action && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 min-h-12 rounded-lg px-5 text-sm font-bold"
            style={{ border: "1px solid #3a2e1e", color: "#c8a96e", background: "rgba(200,169,110,0.07)" }}
          >
            {action}
          </button>
        ) : null}
      </section>
    </main>
  );
}
