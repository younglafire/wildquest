import { unwrapOption, type Account, type Address } from "@solana/kit";
import {
  MatchStatus,
  type Quest,
  type QuestCompletion,
} from "../generated/wildquest";
import type { CollectionCard, PlayerDiscovery } from "./collection";
import type { OwnedCreature } from "./creatures";
import type { GameMatch } from "./matches";

export const QUEST_IDS = [1n, 2n, 3n, 4n, 5n] as const;
export const QUEST_OBJECTIVE_CAPTURE_COUNT = 1;
export const QUEST_OBJECTIVE_CAPTURE_ANY = 2;
export const QUEST_OBJECTIVE_BATTLE_PARTICIPATION = 3;
export const XP_PER_LEVEL = 100n;

export type QuestDefinition = {
  objective: number;
  requiredCount: number;
};

const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  "1": { objective: QUEST_OBJECTIVE_CAPTURE_COUNT, requiredCount: 1 },
  "2": { objective: QUEST_OBJECTIVE_CAPTURE_COUNT, requiredCount: 3 },
  "3": { objective: QUEST_OBJECTIVE_CAPTURE_ANY, requiredCount: 1 },
  "4": { objective: QUEST_OBJECTIVE_CAPTURE_ANY, requiredCount: 1 },
  "5": { objective: QUEST_OBJECTIVE_BATTLE_PARTICIPATION, requiredCount: 1 },
};

export type QuestCopy = {
  title: string;
  eyebrow: string;
  description: string;
  action: string;
  href: "/capture" | "/battle";
};

const QUEST_COPY: Record<string, QuestCopy> = {
  "1": {
    title: "First Discovery",
    eyebrow: "Quest 01 · Start here",
    description: "Capture your first animal and add it to your Collection.",
    action: "Capture an animal",
    href: "/capture",
  },
  "2": {
    title: "Build a Trio",
    eyebrow: "Quest 02 · Grow your roster",
    description: "Own three different animals so you can form a battle team.",
    action: "Capture more animals",
    href: "/capture",
  },
  "3": {
    title: "Wings in the Garden",
    eyebrow: "Quest 03 · Find a butterfly",
    description: "Capture a Ringlet Butterfly or Cabbage Butterfly.",
    action: "Hunt a butterfly",
    href: "/capture",
  },
  "4": {
    title: "Rare Encounter",
    eyebrow: "Quest 04 · Hard to find",
    description: "Capture the Rare Sea Snake for your Collection.",
    action: "Hunt the rare animal",
    href: "/capture",
  },
  "5": {
    title: "Enter the Arena",
    eyebrow: "Quest 05 · First battle",
    description:
      "Join a battle with another explorer. Winning is not required.",
    action: "Find a battle",
    href: "/battle",
  },
};

export type QuestProgress = {
  current: number;
  target: number;
  percentage: number;
  complete: boolean;
  label: string;
};

export type QuestTarget = CollectionCard & {
  complete: boolean;
};

export type PlayerProgress = {
  currentLevelXp: bigint;
  nextLevelXp: bigint;
  percentage: number;
};

export function getQuestCopy(questId: bigint): QuestCopy {
  const copy = QUEST_COPY[questId.toString()];
  if (!copy) throw new Error(`Quest ${questId.toString()} is unsupported.`);
  return copy;
}

export function getQuestDefinition(questId: bigint): QuestDefinition {
  const definition = QUEST_DEFINITIONS[questId.toString()];
  if (!definition)
    throw new Error(`Quest ${questId.toString()} is unsupported.`);
  return definition;
}

export function getCompletedQuestCount(
  completions: ReadonlyArray<Account<QuestCompletion>>,
): number {
  return completions.length;
}

export function getActiveQuest(
  quests: ReadonlyArray<Account<Quest>>,
  completions: ReadonlyArray<Account<QuestCompletion>>,
): Account<Quest> | null {
  const completedQuestAddresses = new Set(
    completions.map((completion) => completion.data.quest),
  );
  return (
    quests.find((quest) => !completedQuestAddresses.has(quest.address)) ?? null
  );
}

export function calculateQuestProgress(
  quest: Account<Quest>,
  creatures: ReadonlyArray<OwnedCreature>,
  matches: ReadonlyArray<GameMatch>,
  wallet: Address,
): QuestProgress {
  const definition = getQuestDefinition(quest.data.questId);
  const target = quest.data.speciesCount;
  let current = 0;

  if (definition.objective === QUEST_OBJECTIVE_CAPTURE_COUNT) {
    current = new Set(
      creatures.map((creature) => creature.data.catalogueId.toString()),
    ).size;
  } else if (definition.objective === QUEST_OBJECTIVE_CAPTURE_ANY) {
    const targets = new Set(
      quest.data.targets.map((catalogueId) => catalogueId.toString()),
    );
    current = creatures.filter((creature) =>
      targets.has(creature.data.catalogueId.toString()),
    ).length;
  } else if (definition.objective === QUEST_OBJECTIVE_BATTLE_PARTICIPATION) {
    current = matches.filter((match) => {
      const opponent = unwrapOption(match.data.opponent);
      const participated =
        opponent !== null &&
        (match.data.creator === wallet || opponent === wallet);
      return (
        participated &&
        match.data.status !== MatchStatus.Open &&
        match.data.status !== MatchStatus.Cancelled
      );
    }).length;
  }

  const boundedCurrent = Math.min(current, target);
  return {
    current: boundedCurrent,
    target,
    percentage: target > 0 ? Math.round((boundedCurrent / target) * 100) : 0,
    complete: target > 0 && boundedCurrent >= target,
    label:
      definition.objective === QUEST_OBJECTIVE_BATTLE_PARTICIPATION
        ? `${boundedCurrent} / ${target} battle attended`
        : `${boundedCurrent} / ${target} captured`,
  };
}

export function calculatePlayerProgress(xp: bigint): PlayerProgress {
  const currentLevelXp = xp % XP_PER_LEVEL;
  return {
    currentLevelXp,
    nextLevelXp: XP_PER_LEVEL,
    percentage: Number(currentLevelXp),
  };
}

export function getUniqueDiscoveryCount(
  discoveries: Array<PlayerDiscovery>,
): number {
  return new Set(
    discoveries.map((discovery) => discovery.data.speciesId.toString()),
  ).size;
}

export function getQuestTargets(
  targetIds: Array<bigint>,
  cards: Array<CollectionCard>,
): Array<QuestTarget> {
  const cardsById = new Map(
    cards.map((card) => [String(card.species.id), card]),
  );

  return targetIds.flatMap((targetId) => {
    const card = cardsById.get(targetId.toString());
    return card ? [{ ...card, complete: card.count > 0 }] : [];
  });
}

export function formatDiscoveryDate(timestamp: bigint | null): string | null {
  if (timestamp === null || timestamp <= 0n) return null;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(Number(timestamp) * 1_000));
}
