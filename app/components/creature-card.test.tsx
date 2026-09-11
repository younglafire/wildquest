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
  it("shows local artwork, story, role, origin, and all authoritative stats", () => {
    render(
      <CreatureCard
        species={species}
        stats={{
          catalogueId: 1003n,
          hp: 100,
          attack: 72,
          defense: 55,
          speed: 55,
          shield: 18,
        }}
      />,
    );
    expect(screen.getByAltText("German Shepherd").getAttribute("src")).toBe(
      "/creatures/dog.svg",
    );
    expect(screen.getByText("Striker")).toBeTruthy();
    expect(screen.getByText(/versatile working dog/i)).toBeTruthy();
    expect(screen.getByText(/Origin · Germany/i)).toBeTruthy();
    for (const label of ["HP", "Damage", "Defense", "Speed", "Shield"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});
