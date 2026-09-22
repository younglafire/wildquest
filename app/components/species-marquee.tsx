"use client";

import type { SpeciesConfig } from "../generated/wildquest";
import type { CatalogueSpecies } from "../lib/catalogue-client";
import type { BattleRole, Rarity } from "../lib/species";
import { CreatureModelCard } from "./creature-model-card";

type MarqueeStats = Pick<
  SpeciesConfig,
  | "catalogueId"
  | "hp"
  | "attack"
  | "defense"
  | "maxMana"
  | "strikeCost"
  | "guardCost"
  | "rechargeGain"
  | "abilityId"
  | "abilityCost"
>;

type MarqueeItem = {
  species: CatalogueSpecies;
  stats: MarqueeStats;
};

function createSpecies(data: {
  id: number;
  speciesId: string;
  name: string;
  scientificName: string;
  rarity: Rarity;
  battleRole: BattleRole;
  imageUrl: string;
  cardSummary: string;
}): CatalogueSpecies {
  return {
    ...data,
    habitat: "Wild Habitat",
    description: data.cardSummary,
    iconUrl: null,
    iconAttributionUrl: null,
    iconLicense: null,
    originRegion: "Vietnam / Global",
    isActive: true,
    modelClassId: null,
    captureEnabled: true,
    baseXp: 100,
    facts: [],
    quiz: null,
    targetForQuest: false,
    sourceUrl: null,
  };
}

const MARQUEE_DATA: Array<
  [string, string, string, Rarity, BattleRole, string, string, number]
> = [
  [
    "Golden Retriever",
    "golden_retriever",
    "Canis lupus familiaris",
    "Common",
    "Support",
    "/creatures/artwork/golden_retriever.png",
    "Loyal companion with keen olfactory tracking.",
    1002,
  ],
  [
    "Tree Frog",
    "tree_frog",
    "Hyla arborea",
    "Common",
    "Skirmisher",
    "/creatures/artwork/tree_frog.png",
    "Arboreal hopper with evasive leaps.",
    1010,
  ],
  [
    "Monarch Butterfly",
    "monarch_butterfly",
    "Danaus plexippus",
    "Common",
    "Striker",
    "/creatures/artwork/monarch_butterfly.png",
    "Airborne navigator with aposematic defense.",
    1006,
  ],
  [
    "African Grey Parrot",
    "african_grey_parrot",
    "Psittacus erithacus",
    "Uncommon",
    "Controller",
    "/creatures/artwork/african_grey_parrot.png",
    "Highly intelligent aerial tactician.",
    1012,
  ],
  [
    "Sea Snake",
    "sea_snake",
    "Hydrophis platurus",
    "Rare",
    "Striker",
    "/creatures/artwork/sea_snake.png",
    "Pelagic predator adept at swift strikes.",
    1011,
  ],
  [
    "Egyptian Cat",
    "egyptian_cat",
    "Felis catus",
    "Common",
    "Balanced",
    "/creatures/artwork/egyptian_cat.png",
    "Alert settlement hunter with precise reflexes.",
    1004,
  ],
  [
    "Honey Bee",
    "honey_bee",
    "Apis mellifera",
    "Common",
    "Energizer",
    "/creatures/artwork/bee.png",
    "Small pollinator with relentless endurance.",
    1001,
  ],
  [
    "Common Darter",
    "dragonfly",
    "Sympetrum striolatum",
    "Uncommon",
    "Skirmisher",
    "/creatures/artwork/dragonfly.png",
    "Riverbed hunter with astonishing agility.",
    1003,
  ],
];

const MARQUEE_ITEMS: MarqueeItem[] = MARQUEE_DATA.map(
  ([
    name,
    speciesId,
    scientificName,
    rarity,
    battleRole,
    imageUrl,
    cardSummary,
    id,
  ]) => ({
    species: createSpecies({
      id,
      speciesId,
      name,
      scientificName,
      rarity,
      battleRole,
      imageUrl,
      cardSummary,
    }),
    stats: {
      catalogueId: BigInt(id),
      hp: 84,
      attack: 62,
      defense: 48,
      maxMana: 6,
      strikeCost: 2,
      guardCost: 2,
      rechargeGain: 3,
      abilityId: id - 1000,
      abilityCost: 4,
    },
  }),
);

export function SpeciesMarquee() {
  return (
    <section
      aria-label="Supported wildlife species marquee"
      className="mt-16 overflow-hidden py-4"
    >
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            BIO-DEX FIELD CATALOGUE // 8 CLASSIFIABLE TARGETS
          </p>
        </div>
        <span className="hidden font-mono text-[11px] text-muted sm:inline">
          HOVER CARD TO PAUSE STREAM
        </span>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="animate-marquee flex items-center gap-5 py-3">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <div
              key={`${item.species.speciesId}-${index}`}
              className="w-52 shrink-0 sm:w-60"
            >
              <CreatureModelCard species={item.species} stats={item.stats} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
