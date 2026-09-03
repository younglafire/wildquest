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
        copy="Reading your targets from Devnet…"
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
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-6 sm:pt-14">
      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="bg-emerald-500/10 p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300">
                Quest 01 · VHU / HCMC
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Campus Field Survey
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Find the five target animals in any order. Every recorded
                Discovery account counts once toward this quest.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-card/80 px-5 py-3 text-right">
              <p className="text-xs text-muted">Completion reward</p>
              <p className="mt-1 text-xl font-black">
                +{quest.data.rewardXp.toString()} XP · 1 badge
              </p>
            </div>
          </div>
          <div className="mt-8 max-w-xl">
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

        <div className="grid gap-3 p-4 sm:p-6">
          {game.questTargets.map((target) => (
            <article
              key={String(target.species.id)}
              className="grid grid-cols-[5rem_1fr] items-center gap-4 rounded-2xl border border-border p-3 sm:grid-cols-[6rem_1fr_auto]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
                <SpeciesArt
                  src={target.species.imageUrl ?? target.species.iconUrl}
                  alt={target.species.name}
                  className={target.complete ? "" : "grayscale"}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-black">{target.species.name}</h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${target.complete ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-cream text-muted"}`}
                  >
                    {target.complete ? "Found" : "Missing"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
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
                className="col-span-2 flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-bold transition hover:bg-cream sm:col-span-1"
              >
                {target.complete ? "View species" : "Find target"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {completion ? (
        <section className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
            Quest completed
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Field Survey badge earned
          </h2>
          <p className="mt-2 text-sm text-muted">
            Claimed {formatDiscoveryDate(completion.data.completedAt)} · +
            {completion.data.rewardXp.toString()} XP
          </p>
        </section>
      ) : (
        <section className="sticky bottom-24 mt-5 rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur md:bottom-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">
                {canClaim
                  ? "Your reward is ready"
                  : `${requiredCount - foundCount} targets remaining`}
              </h2>
              <p className="mt-1 text-xs text-muted">
                The wallet signs one Devnet transaction when you claim.
              </p>
            </div>
            <button
              type="button"
              disabled={!canClaim || isSending}
              onClick={() => void claimQuest()}
              className="min-h-12 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSending
                ? "Claiming reward…"
                : `Claim ${quest.data.rewardXp.toString()} XP + badge`}
            </button>
          </div>
          {claimError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {claimError}
            </p>
          )}
          {signature && (
            <a
              href={getExplorerUrl(`/tx/${signature}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-xs font-bold underline"
            >
              View confirmed transaction
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
      <section className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
        {action && href ? (
          <Link
            href={href}
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            {action}
          </Link>
        ) : action && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold"
          >
            {action}
          </button>
        ) : null}
      </section>
    </main>
  );
}
