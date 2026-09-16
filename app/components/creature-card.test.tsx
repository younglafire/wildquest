// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CatalogueSpecies } from "../lib/catalogue-client";
import { CreatureCard } from "./creature-card";

const species = {
  id: 1003,
  speciesId: "german_shepherd",
  name: "German Shepherd",
  scientificName: "Canis lupus familiaris",
  rarity: "Common",
  habitat: null,
  description: null,
  imageUrl: null,
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
} satisfies CatalogueSpecies;

describe("CreatureCard", () => {
  it("shows artwork, role, four stats, action costs, and ability only", () => {
    render(
      <CreatureCard
        species={species}
        stats={{
          catalogueId: 1003n,
          hp: 100,
          attack: 72,
          defense: 55,
          maxMana: 6,
          strikeCost: 2,
          guardCost: 1,
          rechargeGain: 3,
          abilityId: 1,
          abilityCost: 3,
        }}
      />,
    );
    expect(screen.getByAltText("German Shepherd").getAttribute("src")).toBe(
      "/creatures/dog.svg",
    );
    expect(screen.getByText("Striker")).toBeTruthy();
    expect(screen.queryByText(/versatile working dog/i)).toBeNull();
    expect(screen.queryByText(/Origin · Germany/i)).toBeNull();
    for (const label of ["HP", "ATK", "DEF", "Mana"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByText(/Strike 2/)).toBeTruthy();
    expect(screen.getByText(/Recharge \+3/)).toBeTruthy();
    expect(screen.getByText(/Fearless Yap/)).toBeTruthy();
  });
});
