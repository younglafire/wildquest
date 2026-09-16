import { address, lamports, type Account } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  findCreaturePda,
  getCreatureSize,
  getSpeciesConfigSize,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
} from "../generated/wildquest";
import {
  hasCurrentBattleBalance,
  resolveMatchCatalogueIds,
  type BattleCreature,
} from "./battle-creatures";
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

describe("owned battle Creature freshness", () => {
  function creature(balanceVersion: number): Account<Creature> {
    return {
      address: address("SysvarRent111111111111111111111111111111111"),
      executable: false,
      lamports: lamports(1n),
      programAddress: WILDQUEST_PROGRAM_ADDRESS,
      space: BigInt(getCreatureSize()),
      data: {
        discriminator: new Uint8Array(8),
        owner,
        catalogueId: 1001n,
        proofHash: new Uint8Array(32),
        capturedAt: 1n,
        balanceVersion,
        bump: 1,
      },
    };
  }

  function battleCreature(balanceVersion: number): BattleCreature {
    return {
      creature: creature(1),
      species: species(1001),
      config: {
        address: address("SysvarS1otHashes111111111111111111111111111"),
        executable: false,
        lamports: lamports(1n),
        programAddress: WILDQUEST_PROGRAM_ADDRESS,
        space: BigInt(getSpeciesConfigSize()),
        data: {
          discriminator: new Uint8Array(8),
          catalogueId: 1001n,
          modelClassId: 151,
          hp: 78,
          attack: 58,
          defense: 30,
          maxMana: 7,
          strikeCost: 2,
          guardCost: 1,
          rechargeGain: 4,
          abilityId: 1,
          abilityCost: 3,
          balanceVersion,
          active: true,
          bump: 1,
        },
      },
    };
  }

  it("marks older owned Creature accounts as needing a battle upgrade", () => {
    expect(hasCurrentBattleBalance(creature(1), battleCreature(2))).toBe(false);
    expect(hasCurrentBattleBalance(creature(2), battleCreature(2))).toBe(true);
  });
});
