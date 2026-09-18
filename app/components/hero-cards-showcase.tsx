"use client";

import { useState, useRef } from "react";
import { CreatureModelCard } from "./creature-model-card";
import type { CatalogueSpecies } from "../lib/catalogue-client";
import type { BattleRole, Rarity } from "../lib/species";
import { playSlideTransitionSound } from "../lib/sfx";

type ShowcaseCard = {
  species: CatalogueSpecies;
  stats: {
    catalogueId: bigint;
    hp: number;
    attack: number;
    defense: number;
    maxMana: number;
    strikeCost: number;
    guardCost: number;
    rechargeGain: number;
    abilityId: number;
    abilityCost: number;
  };
  glowColor: string;
  icon: string;
};

function createShowcaseSpecies(data: {
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

const COLLECTION_CARDS: ShowcaseCard[] = [
  {
    species: createShowcaseSpecies({
      id: 1002,
      speciesId: "golden_retriever",
      name: "Golden Retriever",
      scientificName: "Canis lupus familiaris",
      rarity: "Common",
      battleRole: "Support",
      imageUrl: "/creatures/artwork/golden_retriever.png",
      cardSummary:
        "Loyal companion with keen olfactory tracking and high endurance.",
    }),
    stats: {
      catalogueId: 1002n,
      hp: 100,
      attack: 56,
      defense: 46,
      maxMana: 6,
      strikeCost: 2,
      guardCost: 2,
      rechargeGain: 3,
      abilityId: 2,
      abilityCost: 4,
    },
    glowColor: "rgba(245, 158, 11, 0.4)",
    icon: "🐕",
  },
  {
    species: createShowcaseSpecies({
      id: 1011,
      speciesId: "sea_snake",
      name: "Sea Snake",
      scientificName: "Hydrophis platurus",
      rarity: "Rare",
      battleRole: "Striker",
      imageUrl: "/creatures/artwork/sea_snake.png",
      cardSummary:
        "Venomous pelagic predator adept at swift underwater strikes.",
    }),
    stats: {
      catalogueId: 1011n,
      hp: 82,
      attack: 76,
      defense: 34,
      maxMana: 6,
      strikeCost: 2,
      guardCost: 2,
      rechargeGain: 3,
      abilityId: 11,
      abilityCost: 5,
    },
    glowColor: "rgba(59, 130, 246, 0.45)",
    icon: "🐍",
  },
  {
    species: createShowcaseSpecies({
      id: 1012,
      speciesId: "african_grey_parrot",
      name: "African Grey Parrot",
      scientificName: "Psittacus erithacus",
      rarity: "Uncommon",
      battleRole: "Controller",
      imageUrl: "/creatures/artwork/african_grey_parrot.png",
      cardSummary:
        "Highly intelligent psittacine with mimicry tactics and aerial perception.",
    }),
    stats: {
      catalogueId: 1012n,
      hp: 86,
      attack: 58,
      defense: 40,
      maxMana: 8,
      strikeCost: 2,
      guardCost: 2,
      rechargeGain: 4,
      abilityId: 12,
      abilityCost: 4,
    },
    glowColor: "rgba(16, 185, 129, 0.4)",
    icon: "🦜",
  },
  {
    species: createShowcaseSpecies({
      id: 1010,
      speciesId: "tree_frog",
      name: "Tree Frog",
      scientificName: "Hyla arborea",
      rarity: "Common",
      battleRole: "Skirmisher",
      imageUrl: "/creatures/artwork/tree_frog.png",
      cardSummary:
        "Arboreal hopper using high agility and evasive leaps in combat.",
    }),
    stats: {
      catalogueId: 1010n,
      hp: 76,
      attack: 58,
      defense: 34,
      maxMana: 8,
      strikeCost: 1,
      guardCost: 2,
      rechargeGain: 4,
      abilityId: 10,
      abilityCost: 3,
    },
    glowColor: "rgba(34, 197, 94, 0.4)",
    icon: "🐸",
  },
  {
    species: createShowcaseSpecies({
      id: 1006,
      speciesId: "monarch_butterfly",
      name: "Monarch Butterfly",
      scientificName: "Danaus plexippus",
      rarity: "Common",
      battleRole: "Striker",
      imageUrl: "/creatures/artwork/monarch_butterfly.png",
      cardSummary:
        "Airborne navigator utilizing bright aposematic defense in battle.",
    }),
    stats: {
      catalogueId: 1006n,
      hp: 78,
      attack: 72,
      defense: 32,
      maxMana: 6,
      strikeCost: 2,
      guardCost: 2,
      rechargeGain: 3,
      abilityId: 6,
      abilityCost: 4,
    },
    glowColor: "rgba(234, 88, 12, 0.4)",
    icon: "🦋",
  },
];

export function HeroCardsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectCard = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    playSlideTransitionSound();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 12,
      y: x * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Determine card position relative to activeIndex (center, left, right, or hidden)
  const getCardSlot = (
    cardIndex: number,
  ): "center" | "left" | "right" | "hidden" => {
    if (cardIndex === activeIndex) return "center";
    if (cardIndex === (activeIndex + 1) % COLLECTION_CARDS.length)
      return "right";
    if (
      cardIndex ===
      (activeIndex - 1 + COLLECTION_CARDS.length) % COLLECTION_CARDS.length
    )
      return "left";
    return "hidden";
  };

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center justify-center py-4">
      {/* Atmospheric Ambient Glow behind cards */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl transition-all duration-700"
        style={{
          backgroundColor: COLLECTION_CARDS[activeIndex].glowColor,
        }}
        aria-hidden="true"
      />

      {/* 3D Perspective Card Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[430px] sm:h-[490px] w-[280px] sm:w-[325px] [perspective:1200px]"
      >
        {COLLECTION_CARDS.map((card, idx) => {
          const slot = getCardSlot(idx);
          const isCenter = slot === "center";

          // Dynamic transform per slot
          let transformStyle = "";
          if (isCenter) {
            transformStyle = `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1) translateZ(30px)`;
          } else if (slot === "left") {
            transformStyle = `translateX(-52px) translateY(18px) rotateZ(-7deg) scale(0.88) translateZ(0px)`;
          } else if (slot === "right") {
            transformStyle = `translateX(52px) translateY(22px) rotateZ(7deg) scale(0.88) translateZ(0px)`;
          } else {
            transformStyle = `scale(0.6) translateZ(-80px)`;
          }

          return (
            <div
              key={card.species.speciesId}
              onClick={() => {
                if (!isCenter) {
                  selectCard(idx);
                }
              }}
              style={{
                transform: transformStyle,
                transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                display: slot === "hidden" ? "none" : "block",
              }}
              className={`absolute inset-0 select-none ${
                isCenter
                  ? "z-20 cursor-default opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
                  : "z-10 cursor-pointer opacity-60 hover:opacity-95 hover:scale-[0.92] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
              }`}
            >
              <CreatureModelCard
                species={card.species}
                stats={card.stats}
                selected={isCenter}
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[10.5px] font-mono text-[#8a7a62] text-center tracking-wider select-none">
        AUTHENTIC ONCHAIN CREATURE CARDS · CLICK BACKGROUND CARDS TO SHUFFLE IN 3D
      </p>
    </div>
  );
}
