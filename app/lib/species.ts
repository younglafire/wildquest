import type { Json, SpeciesRow } from "./supabase/database.types";

export const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
] as const;

export type Rarity = (typeof RARITIES)[number];

export type SpeciesQuiz = {
  question: string;
  options: string[];
  correctOptionIndex: number;
};

export type Species = {
  id: string | number;
  speciesId: string;
  name: string;
  scientificName: string | null;
  rarity: Rarity;
  habitat: string | null;
  description: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  isActive: boolean;
  modelClassId: number | null;
  captureEnabled: boolean;
  baseXp: number;
  facts: string[];
  quiz: SpeciesQuiz | null;
  targetForQuest: boolean;
  sourceUrl: string | null;
};

function isRecord(
  value: Json | undefined,
): value is Record<string, Json | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFacts(value: Json | undefined): Array<string> {
  if (
    !Array.isArray(value) ||
    !value.every(
      (fact) =>
        typeof fact === "string" &&
        fact.trim().length > 0 &&
        fact.trim().length <= 300,
    )
  ) {
    throw new Error("Species facts must be an array of non-empty strings.");
  }

  return value
    .filter((fact): fact is string => typeof fact === "string")
    .map((fact) => fact.trim());
}

function parseQuiz(value: Json | undefined): SpeciesQuiz | null {
  if (!isRecord(value)) return null;

  const { question, options, correctOptionIndex } = value;
  if (
    typeof question !== "string" ||
    !Array.isArray(options) ||
    !options.every((option) => typeof option === "string") ||
    typeof correctOptionIndex !== "number" ||
    !Number.isInteger(correctOptionIndex) ||
    correctOptionIndex < 0 ||
    correctOptionIndex >= options.length
  ) {
    return null;
  }

  return { question, options: options as string[], correctOptionIndex };
}

export function parseRarity(value: string): Rarity {
  const normalized = value.trim().toLowerCase();
  const rarity = RARITIES.find(
    (candidate) => candidate.toLowerCase() === normalized,
  );

  if (rarity) {
    return rarity;
  }

  throw new Error(`Unsupported species rarity: ${value}`);
}

export function mapSpeciesRow(row: SpeciesRow): Species {
  return {
    id: row.id,
    speciesId: row.species_id,
    name: row.name,
    scientificName: row.scientific_name,
    rarity: parseRarity(row.rarity),
    habitat: row.habitat,
    description: row.description,
    imageUrl: row.image_url,
    iconUrl: row.icon_url,
    isActive: row.is_active ?? false,
    modelClassId: row.model_class_id,
    captureEnabled: row.capture_enabled ?? false,
    baseXp: row.base_xp ?? 50,
    facts: parseFacts(row.facts ?? undefined),
    quiz: parseQuiz(row.quiz ?? undefined),
    targetForQuest: row.target_for_quest ?? false,
    sourceUrl: row.source_url ?? null,
  };
}
