import type { CollectionCard, PlayerDiscovery } from "./collection";

export const DEMO_QUEST_ID = 1n;
export const XP_PER_LEVEL = 100n;

export type QuestTarget = CollectionCard & {
  complete: boolean;
};

export type PlayerProgress = {
  currentLevelXp: bigint;
  nextLevelXp: bigint;
  percentage: number;
};

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
