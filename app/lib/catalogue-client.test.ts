import { describe, expect, it } from "vitest";
import { catalogueSpeciesSchema } from "./catalogue-client";

const species = {
  id: 1003,
  speciesId: "german_shepherd",
  name: "German Shepherd",
  scientificName: "Canis lupus familiaris",
  rarity: "Common",
  habitat: null,
  description: null,
  imageUrl: "https://example.com/dog.jpg",
  iconUrl: "/creatures/dog.svg",
  iconAttributionUrl: null,
  iconLicense: "Original WildQuest SVG",
  cardSummary: "A versatile working dog developed in Germany.",
  originRegion: "Germany",
  battleRole: "Striker",
  isActive: true,
  modelClassId: 235,
  captureEnabled: true,
  baseXp: 50,
  facts: [],
  quiz: null,
  targetForQuest: false,
  sourceUrl: null,
};

describe("catalogue artwork URLs", () => {
  it("accepts local root-relative icons and absolute HTTP images", () => {
    expect(catalogueSpeciesSchema.parse(species).iconUrl).toBe(
      "/creatures/dog.svg",
    );
  });

  it.each([
    "creatures/dog.svg",
    "//other-host/icon.svg",
    "javascript:alert(1)",
  ])("rejects unsafe or ambiguous artwork path %s", (iconUrl) => {
    expect(() =>
      catalogueSpeciesSchema.parse({ ...species, iconUrl }),
    ).toThrow();
  });
});
