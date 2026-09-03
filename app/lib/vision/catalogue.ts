import type { SpeciesRow } from "@/app/lib/supabase/database.types";
import { parseFacts, parseRarity, type Rarity } from "@/app/lib/species";
import { InvalidCatalogueMetadataError } from "./errors";
import { QUEST_BASE_XP } from "./rules";

export type IdentificationSpecies = {
  catalogueId: string;
  speciesId: string;
  commonName: string;
  rarity: Rarity;
  baseXp: number;
  facts: Array<string>;
  targetForQuest: boolean;
};

type IdentificationSpeciesRow = Pick<
  SpeciesRow,
  | "id"
  | "species_id"
  | "name"
  | "rarity"
  | "base_xp"
  | "facts"
  | "target_for_quest"
>;

export function mapIdentificationSpecies(
  row: IdentificationSpeciesRow,
): IdentificationSpecies {
  try {
    if (!Number.isSafeInteger(row.id) || row.id <= 0) {
      throw new Error("Catalogue ID must be a positive safe integer.");
    }

    if (!Number.isSafeInteger(row.base_xp) || row.base_xp <= 0) {
      throw new Error("Base XP must be a positive safe integer.");
    }
    if (row.target_for_quest && row.base_xp !== QUEST_BASE_XP) {
      throw new Error(`Quest base XP must be ${QUEST_BASE_XP}.`);
    }

    return {
      catalogueId: String(row.id),
      speciesId: row.species_id,
      commonName: row.name,
      rarity: parseRarity(row.rarity),
      baseXp: row.base_xp,
      facts: parseFacts(row.facts),
      targetForQuest: row.target_for_quest,
    };
  } catch (error) {
    throw new InvalidCatalogueMetadataError(
      "The species catalogue contains invalid identification metadata.",
      { cause: error },
    );
  }
}
