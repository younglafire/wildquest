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
  african_grey_parrot: "/creatures/artwork/african_grey_parrot.png",
  angora_rabbit: "/creatures/artwork/angora_rabbit.png",
  ant: "/creatures/artwork/ant.png",
  bee: "/creatures/artwork/bee.png",
  honey_bee: "/creatures/artwork/bee.png",
  boston_terrier: "/creatures/artwork/boston_terrier.png",
  bull_mastiff: "/creatures/artwork/bull_mastiff.png",
  bullmastiff: "/creatures/artwork/bull_mastiff.png",
  bullfrog: "/creatures/artwork/bullfrog.png",
  cabbage_butterfly: "/creatures/artwork/cabbage_butterfly.png",
  chihuahua: "/creatures/artwork/chihuahua.png",
  cocker_spaniel: "/creatures/artwork/cocker_spaniel.png",
  cricket: "/creatures/artwork/cricket.png",
  damselfly: "/creatures/artwork/damselfly.png",
  dragonfly: "/creatures/artwork/dragonfly.png",
  egyptian_cat: "/creatures/artwork/egyptian_cat.png",
  domestic_shorthair: "/creatures/artwork/egyptian_cat.png",
  english_springer_spaniel: "/creatures/artwork/english_springer_spaniel.png",
  garden_lizard: "/creatures/artwork/garden_lizard.png",
  german_shepherd: "/creatures/artwork/german_shepherd.png",
  golden_retriever: "/creatures/artwork/golden_retriever.png",
  grasshopper: "/creatures/artwork/grasshopper.png",
  hamster: "/creatures/artwork/hamster.png",
  hen: "/creatures/artwork/hen.png",
  labrador_retriever: "/creatures/artwork/labrador_retriever.png",
  macaw: "/creatures/artwork/macaw.png",
  monarch_butterfly: "/creatures/artwork/monarch_butterfly.png",
  pembroke_corgi: "/creatures/artwork/pembroke_corgi.png",
  pembroke_welsh_corgi: "/creatures/artwork/pembroke_corgi.png",
  persian_cat: "/creatures/artwork/persian_cat.png",
  pig: "/creatures/artwork/pig.png",
  domestic_pig: "/creatures/artwork/pig.png",
  praying_mantis: "/creatures/artwork/praying_mantis.png",
  pug: "/creatures/artwork/pug.png",
  ringlet_butterfly: "/creatures/artwork/ringlet_butterfly.png",
  rooster: "/creatures/artwork/rooster.png",
  samoyed: "/creatures/artwork/samoyed.png",
  sea_snake: "/creatures/artwork/sea_snake.png",
  siamese_cat: "/creatures/artwork/siamese_cat.png",
  siberian_husky: "/creatures/artwork/siberian_husky.png",
  staffordshire_bull_terrier:
    "/creatures/artwork/staffordshire_bull_terrier.png",
  tabby_cat: "/creatures/artwork/tabby_cat.png",
  toy_terrier: "/creatures/artwork/toy_terrier.png",
  tree_frog: "/creatures/artwork/tree_frog.png",
  water_buffalo: "/creatures/artwork/water_buffalo.png",
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
