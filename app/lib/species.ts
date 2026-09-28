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

export const BATTLE_ROLES = [
  "Balanced",
  "Brawler",
  "Controller",
  "Energizer",
  "Guardian",
  "Skirmisher",
  "Striker",
  "Support",
] as const;

export type BattleRole = (typeof BATTLE_ROLES)[number];

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
  iconAttributionUrl: string | null;
  iconLicense: string | null;
  cardSummary: string | null;
  originRegion: string | null;
  battleRole: BattleRole | null;
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

function parseBattleRole(value: string | null): BattleRole | null {
  if (value === null) return null;
  const role = BATTLE_ROLES.find((candidate) => candidate === value.trim());
  if (role) return role;
  throw new Error(`Unsupported battle role: ${value}`);
}

export const SPECIES_LOCAL_ARTWORK: Record<string, string> = {
  african_grey_parrot: "/creatures/artwork/african_grey_parrot.webp",
  angora_rabbit: "/creatures/artwork/angora_rabbit.webp",
  ant: "/creatures/artwork/ant.webp",
  bee: "/creatures/artwork/bee.webp",
  honey_bee: "/creatures/artwork/bee.webp",
  boston_terrier: "/creatures/artwork/boston_terrier.webp",
  bull_mastiff: "/creatures/artwork/bull_mastiff.webp",
  bullmastiff: "/creatures/artwork/bull_mastiff.webp",
  bullfrog: "/creatures/artwork/bullfrog.webp",
  cabbage_butterfly: "/creatures/artwork/cabbage_butterfly.webp",
  chihuahua: "/creatures/artwork/chihuahua.webp",
  cocker_spaniel: "/creatures/artwork/cocker_spaniel.webp",
  cricket: "/creatures/artwork/cricket.webp",
  damselfly: "/creatures/artwork/damselfly.webp",
  dragonfly: "/creatures/artwork/dragonfly.webp",
  egyptian_cat: "/creatures/artwork/egyptian_cat.webp",
  domestic_shorthair: "/creatures/artwork/egyptian_cat.webp",
  english_springer_spaniel: "/creatures/artwork/english_springer_spaniel.webp",
  garden_lizard: "/creatures/artwork/garden_lizard.webp",
  german_shepherd: "/creatures/artwork/german_shepherd.webp",
  golden_retriever: "/creatures/artwork/golden_retriever.webp",
  grasshopper: "/creatures/artwork/grasshopper.webp",
  hamster: "/creatures/artwork/hamster.webp",
  hen: "/creatures/artwork/hen.webp",
  labrador_retriever: "/creatures/artwork/labrador_retriever.webp",
  macaw: "/creatures/artwork/macaw.webp",
  monarch_butterfly: "/creatures/artwork/monarch_butterfly.webp",
  pembroke_corgi: "/creatures/artwork/pembroke_corgi.webp",
  pembroke_welsh_corgi: "/creatures/artwork/pembroke_corgi.webp",
  persian_cat: "/creatures/artwork/persian_cat.webp",
  pig: "/creatures/artwork/pig.webp",
  domestic_pig: "/creatures/artwork/pig.webp",
  praying_mantis: "/creatures/artwork/praying_mantis.webp",
  pug: "/creatures/artwork/pug.webp",
  ringlet_butterfly: "/creatures/artwork/ringlet_butterfly.webp",
  rooster: "/creatures/artwork/rooster.webp",
  samoyed: "/creatures/artwork/samoyed.webp",
  sea_snake: "/creatures/artwork/sea_snake.webp",
  siamese_cat: "/creatures/artwork/siamese_cat.webp",
  siberian_husky: "/creatures/artwork/siberian_husky.webp",
  staffordshire_bull_terrier:
    "/creatures/artwork/staffordshire_bull_terrier.webp",
  tabby_cat: "/creatures/artwork/tabby_cat.webp",
  toy_terrier: "/creatures/artwork/toy_terrier.webp",
  tree_frog: "/creatures/artwork/tree_frog.webp",
  water_buffalo: "/creatures/artwork/water_buffalo.webp",
};

export function getSpeciesArtworkUrl(speciesId?: string | null): string | null {
  if (!speciesId) return null;
  return SPECIES_LOCAL_ARTWORK[speciesId.toLowerCase()] ?? null;
}

export function mapSpeciesRow(row: SpeciesRow): Species {
  const localArtwork = SPECIES_LOCAL_ARTWORK[row.species_id];
  return {
    id: row.id,
    speciesId: row.species_id,
    name: row.name,
    scientificName: row.scientific_name,
    rarity: parseRarity(row.rarity),
    habitat: row.habitat,
    description: row.description,
    imageUrl: localArtwork ?? row.image_url,
    iconUrl: row.icon_url,
    iconAttributionUrl: row.icon_attribution_url,
    iconLicense: row.icon_license,
    cardSummary: row.card_summary,
    originRegion: row.origin_region,
    battleRole: parseBattleRole(row.battle_role),
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
