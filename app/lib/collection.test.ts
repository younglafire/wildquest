import { address, getBase58Decoder, lamports, signature } from "@solana/kit";
import { describe, expect, it } from "vitest";
import { WILDQUEST_PROGRAM_ADDRESS } from "../generated/wildquest";
import type { CatalogueSpecies } from "./catalogue-client";
import {
  buildCollectionCards,
  getPlayerDiscoveryFilters,
  type PlayerDiscovery,
} from "./collection";
import type { ConfirmedDiscovery } from "./expedition";

const player = address("11111111111111111111111111111111");
const transactionSignature = signature(
  getBase58Decoder().decode(new Uint8Array(64).fill(9)),
);

function catalogueSpecies(id: number, name: string): CatalogueSpecies {
  return {
    id,
    speciesId: name.toLowerCase(),
    name,
    scientificName: null,
    rarity: "Common",
    habitat: null,
    description: null,
    imageUrl: null,
    iconUrl: null,
    isActive: true,
    modelClassId: null,
    captureEnabled: false,
    baseXp: 50,
    facts: [`A fact about ${name}.`],
    quiz: null,
    targetForQuest: true,
    sourceUrl: null,
  };
}

function discovery(
  speciesId: bigint,
  grade: number,
  proofByte: number,
  timestamp: bigint,
): PlayerDiscovery {
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
      timestamp,
      grade,
      rarity: 0,
      proofHash: new Uint8Array(32).fill(proofByte),
    },
  };
}

describe("collection aggregation", () => {
  it("filters Discovery accounts by discriminator and player", () => {
    const filters = getPlayerDiscoveryFilters(player);
    expect(filters[0]).toEqual({ dataSize: 90n });
    expect(filters[1]).toMatchObject({
      memcmp: { offset: 0n, encoding: "base58" },
    });
    expect(filters[2]).toMatchObject({
      memcmp: { offset: 8n, encoding: "base58" },
    });
  });

  it("groups repeat captures and selects the best grade", () => {
    const cards = buildCollectionCards(
      [catalogueSpecies(1, "Bee"), catalogueSpecies(2, "Frog")],
      [discovery(1n, 1, 1, 10n), discovery(1n, 3, 2, 20n)],
    );

    expect(cards[0]).toMatchObject({
      count: 2,
      bestGrade: "Gold",
      latestTimestamp: 20n,
    });
    expect(cards[0].species.name).toBe("Bee");
    expect(cards[1]).toMatchObject({ count: 0, bestGrade: null });
  });

  it("adds a confirmed result optimistically without double counting its proof", () => {
    const optimistic = {
      version: 1,
      wallet: player,
      signature: transactionSignature,
      identification: {
        catalogue_id: "1",
        species_id: "bee",
        common_name: "Bee",
        model_class_id: 309,
        model_label: "bee",
        balance_version: 1,
        confidence: 0.95,
        explanation: "Matched bee.",
        rarity: "Common",
        rarity_code: 0,
        base_xp: 50,
        facts: ["Bees pollinate flowers."],
        target_for_quest: true,
        capture_enabled: true,
        grade: "Gold",
        grade_code: 3,
        awarded_xp: 100,
        proof_hash: "03".repeat(32),
      },
    } satisfies ConfirmedDiscovery;

    const optimisticCards = buildCollectionCards(
      [catalogueSpecies(1, "Bee")],
      [],
      optimistic,
    );
    expect(optimisticCards[0]).toMatchObject({ count: 1, bestGrade: "Gold" });

    const reconciledCards = buildCollectionCards(
      [catalogueSpecies(1, "Bee")],
      [discovery(1n, 3, 3, 30n)],
      optimistic,
    );
    expect(reconciledCards[0]).toMatchObject({ count: 1, bestGrade: "Gold" });
  });
});
