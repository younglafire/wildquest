import { describe, expect, it } from "vitest";
import { mapIdentificationSpecies } from "./catalogue";
import { InvalidCatalogueMetadataError } from "./errors";

const catalogueRow = {
  id: 8,
  species_id: "butterfly",
  name: "Butterfly",
  rarity: "common",
  base_xp: 50,
  facts: [
    " Butterfly wings are covered with thousands of tiny scales. ",
    "Butterflies undergo complete metamorphosis.",
  ],
  target_for_quest: true,
};

describe("identification species mapping", () => {
  it("maps catalogue metadata into the API domain type", () => {
    expect(mapIdentificationSpecies(catalogueRow)).toEqual({
      catalogueId: "8",
      speciesId: "butterfly",
      commonName: "Butterfly",
      rarity: "Common",
      baseXp: 50,
      facts: [
        "Butterfly wings are covered with thousands of tiny scales.",
        "Butterflies undergo complete metamorphosis.",
      ],
      targetForQuest: true,
    });
  });

  it.each([
    ["zero catalogue ID", { id: 0 }],
    ["negative catalogue ID", { id: -4 }],
    ["unsafe catalogue ID", { id: Number.MAX_SAFE_INTEGER + 1 }],
    ["fractional catalogue ID", { id: 1.5 }],
    ["zero base XP", { base_xp: 0 }],
    ["fractional base XP", { base_xp: 50.5 }],
    ["non-standard quest base XP", { base_xp: 75 }],
    ["unsupported rarity", { rarity: "Mythic" }],
    ["non-array facts", { facts: { fact: "invalid" } }],
    ["non-string fact", { facts: ["valid", 42] }],
    ["empty fact", { facts: [" "] }],
  ])("rejects %s", (_name, invalidMetadata) => {
    expect(() =>
      mapIdentificationSpecies({ ...catalogueRow, ...invalidMetadata }),
    ).toThrow(InvalidCatalogueMetadataError);
  });
});
