import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";
import { findCreaturePda } from "../generated/wildquest";
import { resolveMatchCatalogueIds } from "./battle-creatures";
import type { CatalogueSpecies } from "./catalogue-client";

const owner = address("11111111111111111111111111111111");

function species(id: number): CatalogueSpecies {
  return {
    id,
    speciesId: `species_${id}`,
    name: `Species ${id}`,
    scientificName: null,
    rarity: "Common",
    habitat: null,
    description: null,
    imageUrl: null,
    iconUrl: "/creatures/dog.svg",
    iconAttributionUrl: null,
    iconLicense: "WildQuest original",
    cardSummary: "A playable creature.",
    originRegion: "Vietnam",
    battleRole: "Balanced",
    isActive: true,
    modelClassId: id,
    captureEnabled: true,
    baseXp: 50,
    facts: ["A fact."],
    quiz: null,
    targetForQuest: false,
    sourceUrl: null,
  };
}

describe("Match replay creature resolution", () => {
  it("recovers catalogue IDs from permanent Match addresses", async () => {
    const catalogue = [species(1001), species(1002), species(1003)];
    const addresses = await Promise.all(
      catalogue.map(
        async ({ id }) =>
          (await findCreaturePda({ owner, catalogueId: BigInt(id) }))[0],
      ),
    );

    await expect(
      resolveMatchCatalogueIds(owner, addresses, catalogue),
    ).resolves.toEqual([1001n, 1002n, 1003n]);
  });

  it("rejects an address outside the playable catalogue", async () => {
    await expect(
      resolveMatchCatalogueIds(
        owner,
        [address("Vote111111111111111111111111111111111111111")],
        [species(1001)],
      ),
    ).rejects.toThrow("not in the playable catalogue");
  });
});
