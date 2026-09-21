"use client";

import Link from "next/link";
import { useState } from "react";
import { useCluster } from "../components/cluster-context";
import { ProgressBar } from "../components/progress-bar";
import { formatDiscoveryDate, getQuestCopy } from "../lib/game";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { buildQuestCompletionInstruction } from "../lib/quest-transaction";
import { useWallet } from "../lib/wallet/context";

export function QuestContent() {
  const game = useGameData();
  const { signer } = useWallet();
  const { getExplorerUrl } = useCluster();
  const { send, isSending } = useSendTransaction();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const quest = game.activeQuest;
  const progress = game.activeQuestProgress;
  const copy = quest ? getQuestCopy(quest.data.questId) : null;
  const previousQuest =
    quest && quest.data.questId > 1n
      ? game.quests.data?.find(
          (candidate) => candidate.data.questId === quest.data.questId - 1n,
        )
      : null;
  const previousCompletion = previousQuest
    ? (game.questCompletions.data?.find(
        (completion) => completion.data.quest === previousQuest.address,
      ) ?? null)
    : null;
  const canClaim =
    Boolean(signer) &&
    Boolean(game.player.data?.exists) &&
    Boolean(quest) &&
    Boolean(progress?.complete) &&
    Boolean(game.creatures.data) &&
    Boolean(game.matches.data);

  const claimQuest = async () => {
    if (
      !signer ||
      !quest ||
      !game.creatures.data ||
      !game.matches.data ||
      !canClaim
    )
      return;

    setClaimError(null);
    try {
      const instruction = await buildQuestCompletionInstruction(
        signer,
        quest,
        previousCompletion,
        game.creatures.data,
        game.matches.data,
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
    game.isLoading ||
    game.quests.isLoading ||
    game.questCompletions.isLoading ||
    game.matches.isLoading
  ) {
    return (
      <QuestMessage
        title="Loading quests"
        copy="Reading your expedition progress from Devnet…"
      />
    );
  }

  if (
    game.error ||
    game.quests.error ||
    game.questCompletions.error ||
    game.matches.error
  ) {
    return (
      <QuestMessage
        title="Quest progress unavailable"
        copy="WildQuest could not read your confirmed quest evidence from Devnet."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (!game.quests.data?.length) {
    return (
      <QuestMessage
        title="Quests unavailable"
        copy="The five quest accounts have not been initialized on the connected Devnet program."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (!game.player.data?.exists) {
    return (
      <QuestMessage
        title="Create your Passport first"
        copy="Your Passport receives the XP earned from completed quests."
        href="/home"
        action="Create Passport"
      />
    );
  }

  const allComplete = !quest;

  return (
    <main className="mx-auto max-w-4xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      <section className="rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-5 shadow-2xl sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6aab7a]">
          {allComplete ? "Expedition complete" : copy?.eyebrow}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#f0e8d4] sm:text-5xl">
              {allComplete ? "All quests completed" : copy?.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a89880]">
              {allComplete
                ? "You earned every XP reward in the current questline."
                : copy?.description}
            </p>
          </div>
          {quest && (
            <span className="rounded-full border border-[rgba(200,169,110,0.35)] px-4 py-2 text-xs font-black text-[#c8a96e]">
              +{quest.data.rewardXp.toString()} XP
            </span>
          )}
        </div>

        {progress && (
          <div className="mt-7">
            <ProgressBar value={progress.percentage} label={progress.label} />
          </div>
        )}

        {!allComplete && copy && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={copy.href}
              className="btn-guild inline-flex min-h-12 items-center justify-center px-7 text-xs font-black uppercase tracking-wider"
            >
              {copy.action}
            </Link>
            <button
              type="button"
              disabled={!canClaim || isSending}
              onClick={() => void claimQuest()}
              className="min-h-12 rounded-xl border border-[rgba(200,169,110,0.4)] px-7 text-xs font-black uppercase tracking-wider text-[#c8a96e] disabled:opacity-40"
            >
              {isSending
                ? "Claiming…"
                : progress?.complete
                  ? `Claim ${quest?.data.rewardXp.toString()} XP`
                  : "Complete the objective first"}
            </button>
          </div>
        )}

        {claimError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200"
          >
            {claimError}
          </p>
        )}
        {signature && (
          <a
            href={getExplorerUrl(`/tx/${signature}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-bold text-[#c8a96e] underline"
          >
            View confirmed reward transaction ↗
          </a>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-[rgba(200,169,110,0.25)] bg-[rgba(18,16,11,0.9)] p-5 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]">
          Questline
        </p>
        <div className="mt-4 space-y-3">
          {game.quests.data.map((candidate) => {
            const candidateCopy = getQuestCopy(candidate.data.questId);
            const completion = game.questCompletions.data?.find(
              (item) => item.data.quest === candidate.address,
            );
            const isActive = candidate.address === quest?.address;
            return (
              <article
                key={candidate.address}
                className="rounded-xl border border-[rgba(200,169,110,0.2)] bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-[#f0e8d4]">
                      {candidateCopy.title}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7a62]">
                      {candidateCopy.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#6aab7a]">
                    {completion ? "Completed" : isActive ? "Active" : "Locked"}
                  </span>
                </div>
                {completion && (
                  <p className="mt-2 text-[10px] text-[#8a7a62]">
                    {formatDiscoveryDate(completion.data.completedAt)} · +
                    {completion.data.rewardXp.toString()} XP
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
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
      <section className="rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-8">
        <h1 className="text-3xl font-black text-[#f0e8d4]">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#a89880]">{copy}</p>
        {action && href ? (
          <Link
            href={href}
            className="btn-guild mt-6 inline-flex min-h-12 items-center px-7 text-xs font-black uppercase tracking-wider"
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
