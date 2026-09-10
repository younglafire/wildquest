import { describe, expect, it } from "vitest";
import type { SpeciesRow } from "./supabase/database.types";
import { mapSpeciesRow } from "./species";

const row: SpeciesRow = {
  id: 1003,
  species_id: "german_shepherd",
  name: "German Shepherd",
  scientific_name: "Canis lupus familiaris",
  rarity: "Common",
  habitat: "Homes and working environments",
  description: "A working dog.",
  image_url: "https://example.com/dog.jpg",
  icon_url: null,
  icon_attribution_url:
    "https://www.flaticon.com/free-icon/german-shepherd_3013786",
  icon_license: "Flaticon Free License (attribution required)",
  card_summary: "A versatile working dog developed in Germany.",
  origin_region: "Germany",
  battle_role: "Striker",
  is_active: true,
  model_class_id: 235,
  capture_enabled: true,
  base_xp: 50,
  facts: ["German Shepherds are working dogs."],
  quiz: null,
  target_for_quest: false,
  source_url: "https://example.com/source",
  created_at: "2026-09-10T00:00:00Z",
};

describe("species catalogue mapping", () => {
  it("maps player-facing card metadata", () => {
    expect(mapSpeciesRow(row)).toMatchObject({
      cardSummary: "A versatile working dog developed in Germany.",
      originRegion: "Germany",
      battleRole: "Striker",
      iconAttributionUrl:
        "https://www.flaticon.com/free-icon/german-shepherd_3013786",
      iconLicense: "Flaticon Free License (attribution required)",
    });
  });

  it("rejects an unknown battle role", () => {
    expect(() => mapSpeciesRow({ ...row, battle_role: "Wizard" })).toThrow(
      "Unsupported battle role",
    );
  });
});
