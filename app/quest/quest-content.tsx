"use client";

import Link from "next/link";
import { useState } from "react";
import { useCluster } from "../components/cluster-context";
import { ProgressBar } from "../components/progress-bar";
import { QUEST_IDS, getQuestCopy } from "../lib/game";
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

  const quests = game.quests.data ?? [];
  const completions = game.questCompletions.data ?? [];
  const activeQuest = game.activeQuest;
  const activeProgress = game.activeQuestProgress;
  const activeIndex = activeQuest
    ? quests.findIndex((quest) => quest.address === activeQuest.address)
    : -1;
  const previousQuest = activeIndex > 0 ? quests[activeIndex - 1] : null;
  const previousCompletion = previousQuest
    ? (completions.find(
        (completion) => completion.data.quest === previousQuest.address,
      ) ?? null)
    : null;

  const claimQuest = async () => {
    if (
      !signer ||
      !activeQuest ||
      !activeProgress?.complete ||
      !game.creatures.data ||
      !game.matches.data
    ) {
      return;
    }
    setClaimError(null);
    try {
      const instruction = await buildQuestCompletionInstruction(
        signer,
        activeQuest,
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
          : "The quest XP could not be claimed. You can safely retry.",
      );
    }
  };

  if (
    game.quests.isLoading ||
    game.questCompletions.isLoading ||
    game.matches.isLoading ||
    game.isLoading
  ) {
    return (
      <QuestMessage
        title="Loading quests"
        copy="Reading your confirmed progress from Devnet…"
      />
    );
  }

  if (game.error) {
    return (
      <QuestMessage
        title="Quest progress unavailable"
        copy="WildQuest could not read your Player or Creature accounts. No reward transaction was submitted."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (game.quests.error || quests.length !== QUEST_IDS.length) {
    return (
      <QuestMessage
        title="Quest update required"
        copy="The five incremental quests have not been initialized on this cluster yet. Deploy the updated program, then run the roster setup."
        action="Try again"
        onAction={() => void game.refresh()}
      />
    );
  }

  if (!game.player.data?.exists) {
    return (
      <QuestMessage
        title="Create your Passport first"
        copy="Your Passport holds the XP and level earned from completed quests."
        href="/home"
        action="Create Passport"
      />
    );
  }

  if (!activeQuest) {
    return (
      <main className="mx-auto max-w-3xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
        <section
          className="rounded-xl p-6 text-center sm:p-10"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
        >
          <p className="wax-badge wax-badge-forest">Questline Complete</p>
          <h1
            className="mt-4 text-3xl font-black sm:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Field Explorer
          </h1>
          <p
            className="mx-auto mt-3 max-w-lg text-sm leading-relaxed"
            style={{ color: "#8a7a62" }}
          >
            You completed all five starter quests and claimed 400 XP.
          </p>
          <Link href="/battle" className="btn-guild mt-7 inline-flex">
            Continue to Battle
          </Link>
        </section>
        <QuestJourney
          quests={quests}
          completedAddresses={
            new Set(completions.map((completion) => completion.data.quest))
          }
          activeAddress={null}
        />
      </main>
    );
  }

  const copy = getQuestCopy(activeQuest.data.questId);
  const canClaim = Boolean(activeProgress?.complete) && !isSending;

  return (
    <main className="mx-auto max-w-5xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      <section
        className="overflow-hidden rounded-xl"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        <div
          className="p-5 sm:p-9"
          style={{
            background:
              "linear-gradient(180deg, rgba(74,124,89,0.12) 0%, rgba(74,124,89,0.05) 100%)",
            borderBottom: "1px solid rgba(200,169,110,0.15)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{ color: "#6aab7a", fontFamily: "var(--font-display)" }}
              >
                {copy.eyebrow}
              </p>
              <h1
                className="mt-2 text-3xl font-black tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                {copy.title}
              </h1>
              <p
                className="mt-3 max-w-2xl text-sm leading-relaxed"
                style={{ color: "#8a7a62" }}
              >
                {copy.description}
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(200,169,110,0.08)",
                border: "1px solid rgba(200,169,110,0.2)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
              >
                Reward
              </p>
              <p
                className="mt-1 text-xl font-black"
                style={{ color: "#c8a96e", fontFamily: "var(--font-display)" }}
              >
                +{activeQuest.data.rewardXp.toString()} XP
              </p>
            </div>
          </div>

          {activeProgress && (
            <div className="mt-7 max-w-xl">
              <ProgressBar
                value={activeProgress.percentage}
                label={activeProgress.label}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p
              className="font-black"
              style={{ color: "#f0e8d4", fontFamily: "var(--font-display)" }}
            >
              {activeProgress?.complete
                ? "Quest complete. Your XP is ready."
                : "Keep exploring to finish this quest."}
            </p>
            <p className="mt-1 text-xs" style={{ color: "#8a7a62" }}>
              Claiming XP requires one wallet approval.
            </p>
          </div>
          {activeProgress?.complete ? (
            <button
              type="button"
              disabled={!canClaim}
              onClick={() => void claimQuest()}
              className="btn-guild whitespace-nowrap"
            >
              {isSending
                ? "Claiming XP…"
                : `Claim ${activeQuest.data.rewardXp.toString()} XP`}
            </button>
          ) : (
            <Link href={copy.href} className="btn-guild whitespace-nowrap">
              {copy.action}
            </Link>
          )}
        </div>
      </section>

      {claimError && (
        <p
          role="alert"
          className="mt-4 rounded-xl p-4 text-sm"
          style={{
            color: "#f8c8c4",
            background: "rgba(192,57,43,0.12)",
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
          className="mt-4 inline-flex text-xs font-bold underline"
          style={{ color: "#c8a96e" }}
        >
          View confirmed transaction ↗
        </a>
      )}

      <QuestJourney
        quests={quests}
        completedAddresses={
          new Set(completions.map((completion) => completion.data.quest))
        }
        activeAddress={activeQuest.address}
      />
    </main>
  );
}

function QuestJourney({
  quests,
  completedAddresses,
  activeAddress,
}: {
  quests: NonNullable<ReturnType<typeof useGameData>["quests"]["data"]>;
  completedAddresses: Set<string>;
  activeAddress: string | null;
}) {
  return (
    <section
      className="mt-4 rounded-xl p-5 sm:p-7"
      style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
      >
        Starter Questline
      </p>
      <div className="mt-4 grid gap-2">
        {quests.map((quest) => {
          const complete = completedAddresses.has(quest.address);
          const active = quest.address === activeAddress;
          const copy = getQuestCopy(quest.data.questId);
          return (
            <div
              key={quest.address}
              className="flex min-h-14 items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: active ? "rgba(74,124,89,0.12)" : "#221d14",
                border: active
                  ? "1px solid rgba(74,124,89,0.4)"
                  : "1px solid #3a2e1e",
                opacity: complete || active ? 1 : 0.58,
              }}
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                style={{
                  background: complete
                    ? "#4a7c59"
                    : active
                      ? "#c8a96e"
                      : "#100e09",
                  color: complete || active ? "#100e09" : "#8a7a62",
                }}
              >
                {complete ? "✓" : quest.data.questId.toString()}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-black"
                  style={{
                    color: "#f0e8d4",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {copy.title}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: "#8a7a62" }}
                >
                  {complete ? "XP claimed" : active ? "Active" : "Locked"}
                </p>
              </div>
              <span className="text-xs font-bold" style={{ color: "#c8a96e" }}>
                +{quest.data.rewardXp.toString()} XP
              </span>
            </div>
          );
        })}
      </div>
    </section>
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
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "#8a7a62" }}
        >
          {copy}
        </p>
        {action && href && (
          <Link href={href} className="btn-guild mt-6 inline-flex">
            {action}
          </Link>
        )}
        {action && onAction && (
          <button type="button" onClick={onAction} className="btn-guild mt-6">
            {action}
          </button>
        )}
      </section>
    </main>
  );
}
