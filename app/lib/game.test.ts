import { address, lamports } from "@solana/kit";
import { describe, expect, it } from "vitest";
import { WILDQUEST_PROGRAM_ADDRESS } from "../generated/wildquest";
import type { CatalogueSpecies } from "./catalogue-client";
import type { CollectionCard, PlayerDiscovery } from "./collection";
import {
  calculatePlayerProgress,
  getQuestTargets,
  getUniqueDiscoveryCount,
} from "./game";

const player = address("11111111111111111111111111111111");

function species(id: number): CatalogueSpecies {
  return {
    id,
    speciesId: `species-${id}`,
    name: `Species ${id}`,
    scientificName: null,
    rarity: "Common",
    habitat: null,
    description: null,
    imageUrl: null,
    iconUrl: null,
    iconAttributionUrl: null,
    iconLicense: null,
    cardSummary: null,
    originRegion: null,
    battleRole: null,
    isActive: true,
    modelClassId: null,
    captureEnabled: false,
    baseXp: 50,
    facts: ["A fact."],
    quiz: null,
    targetForQuest: true,
    sourceUrl: null,
  };
}

function discovery(speciesId: bigint): PlayerDiscovery {
  return {
    address: player,
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 90n,
    data: {
      discriminator: new Uint8Array(8),
      player,
      speciesId,
      timestamp: 1n,
      grade: 1,
      rarity: 0,
      proofHash: new Uint8Array(32),
    },
  };
}

describe("game progress", () => {
  it("derives level progress from cumulative XP", () => {
    expect(calculatePlayerProgress(0n)).toEqual({
      currentLevelXp: 0n,
      nextLevelXp: 100n,
      percentage: 0,
    });
    expect(calculatePlayerProgress(225n)).toEqual({
      currentLevelXp: 25n,
      nextLevelXp: 100n,
      percentage: 25,
    });
  });

  it("counts each discovered species once", () => {
    expect(
      getUniqueDiscoveryCount([discovery(3n), discovery(3n), discovery(8n)]),
    ).toBe(2);
  });

  it("preserves quest target order and marks completed targets", () => {
    const cards: Array<CollectionCard> = [
      { species: species(3), count: 2, bestGrade: "Gold", latestTimestamp: 1n },
      { species: species(8), count: 0, bestGrade: null, latestTimestamp: null },
    ];
    const targets = getQuestTargets([8n, 3n], cards);
    expect(targets.map((target) => target.species.id)).toEqual([8, 3]);
    expect(targets.map((target) => target.complete)).toEqual([false, true]);
  });
});
