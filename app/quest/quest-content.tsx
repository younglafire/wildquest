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
        className="relative overflow-hidden rounded-2xl"
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

        {/* Quest header banner */}
        <div className="p-5 sm:p-9 border-b border-[rgba(200,169,110,0.2)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
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
                  ✦ QUEST 01 · VHU / HCMC ✦
                </span>
              </div>
              <h1
                className="mt-3 text-2xl font-black tracking-tight sm:mt-4 sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Campus Field Survey
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed sm:mt-3 sm:text-sm text-[#a89880]">
                Find the five target animals in any order. Every recorded
                Discovery account counts once toward this quest.
              </p>
            </div>
            <div
              className="relative inline-flex min-h-11 items-center justify-center px-7 py-2 select-none self-start"
              style={{
                backgroundImage: "url('/ui/tag_frame.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <span
                className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)" }}
              >
                +{quest.data.rewardXp.toString()} XP · 1 BADGE
              </span>
            </div>
          </div>
          <div className="mt-6 max-w-xl sm:mt-8">
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
        <div
          className="grid gap-2.5 p-4 sm:p-6"
          style={{ background: "rgba(12, 10, 8, 0.4)" }}
        >
          {game.questTargets.map((target) => (
            <article
              key={String(target.species.id)}
              className="grid grid-cols-[5rem_1fr] items-center gap-4 rounded-xl p-3 sm:grid-cols-[6rem_1fr_auto]"
              style={{
                background: "rgba(14, 12, 8, 0.95)",
                border: target.complete
                  ? "1px solid rgba(74,124,89,0.45)"
                  : "1px solid rgba(200,169,110,0.25)",
                borderLeft: target.complete
                  ? "3px solid #6aab7a"
                  : "3px solid rgba(200,169,110,0.3)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="relative aspect-square overflow-hidden rounded-xl flex items-center justify-center p-2"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(30, 45, 35, 0.8), rgba(12, 10, 8, 0.95))",
                  border: "1px solid rgba(200, 169, 110, 0.25)",
                }}
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
                    className="font-black text-base sm:text-lg"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "#f0e8d4",
                    }}
                  >
                    {target.species.name}
                  </h2>
                  {target.complete ? (
                    <div
                      className="relative inline-flex min-h-7 items-center justify-center px-4 py-0.5 select-none"
                      style={{
                        backgroundImage: "url('/ui/tag_frame.png')",
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6aab7a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        ✦ Found
                      </span>
                    </div>
                  ) : (
                    <span
                      className="rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8a7a62]"
                      style={{
                        background: "rgba(18, 16, 11, 0.8)",
                        border: "1px solid rgba(200, 169, 110, 0.2)",
                      }}
                    >
                      Missing
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#a89880]">
                  <span className="text-[#c8a96e] font-semibold">
                    {target.species.rarity}
                  </span>
                  {target.bestGrade ? ` · Best ${target.bestGrade}` : ""}
                </p>
              </div>
              <Link
                href={
                  target.complete
                    ? `/collection/${target.species.speciesId}`
                    : "/capture"
                }
                className="col-span-2 flex min-h-11 items-center justify-center rounded-xl px-5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 sm:col-span-1"
                style={{
                  fontFamily: "var(--font-display)",
                  border: "1px solid rgba(200, 169, 110, 0.35)",
                  color: target.complete ? "#f0e8d4" : "#c8a96e",
                  background: target.complete
                    ? "linear-gradient(135deg, rgba(74,124,89,0.3), rgba(26,56,36,0.3))"
                    : "rgba(200,169,110,0.08)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                {target.complete ? "View species →" : "Find target ✦"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Completion state or claim panel */}
      {completion ? (
        <section
          className="relative mt-4 overflow-hidden rounded-2xl p-6 sm:p-8 animate-seal-stamp"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.95) 0%, rgba(18, 16, 11, 0.98) 75%)",
            border: "1px solid rgba(74, 124, 89, 0.5)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(74, 124, 89, 0.4)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(74,124,89,0.8)] to-transparent pointer-events-none" />
          <span className="absolute top-2.5 left-2.5 text-[10px] text-[#6aab7a]/50 select-none pointer-events-none">
            ❖
          </span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-[#6aab7a]/50 select-none pointer-events-none">
            ❖
          </span>

          <div
            className="relative inline-flex min-h-9 items-center justify-center px-6 py-1 select-none"
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
              ✦ QUEST COMPLETED ✦
            </span>
          </div>

          <h2
            className="mt-3 text-2xl font-black text-[#f0e8d4] sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Field Survey Badge Earned ✦
          </h2>
          <p
            className="mt-2 text-sm text-[#a89880]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Claimed {formatDiscoveryDate(completion.data.completedAt)} · +
            {completion.data.rewardXp.toString()} XP
          </p>
        </section>
      ) : (
        <section
          className="sticky bottom-24 mt-4 overflow-hidden rounded-2xl p-5 shadow-2xl backdrop-blur-md md:bottom-5"
          style={{
            background: "rgba(14, 12, 8, 0.95)",
            border: "1px solid rgba(200, 169, 110, 0.4)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="font-black text-lg sm:text-xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                {canClaim
                  ? "✦ Your reward is ready to claim"
                  : `${requiredCount - foundCount} targets remaining`}
              </h2>
              <p className="mt-1 text-xs text-[#a89880]">
                The wallet signs one Devnet transaction when you claim.
              </p>
            </div>
            <button
              type="button"
              disabled={!canClaim || isSending}
              onClick={() => void claimQuest()}
              className="btn-guild whitespace-nowrap min-h-12 px-7 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-40"
            >
              {isSending
                ? "Claiming reward…"
                : `✦ Claim ${quest.data.rewardXp.toString()} XP + badge`}
            </button>
          </div>
          {claimError && (
            <p
              role="alert"
              className="mt-4 rounded-xl p-3 text-sm"
              style={{
                background: "rgba(192,57,43,0.15)",
                color: "#f8c8c4",
                border: "1px solid rgba(192,57,43,0.3)",
              }}
            >
              {claimError}
            </p>
          )}
          {signature && (
            <a
              href={getExplorerUrl(`/tx/${signature}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-xs font-bold text-[#c8a96e] underline hover:text-[#f0e8d4]"
            >
              View confirmed transaction on Explorer ↗
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
        {action && href ? (
          <Link
            href={href}
            className="btn-guild mt-6 inline-flex min-h-12 px-7 text-xs font-black uppercase tracking-wider"
          >
            {action}
          </Link>
        ) : action && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="btn-guild mt-6 min-h-12 px-7 text-xs font-black uppercase tracking-wider"
          >
            {action}
          </button>
        ) : null}
      </section>
    </main>
  );
}
