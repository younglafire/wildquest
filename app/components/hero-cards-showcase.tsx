"use client";

import { useState, useRef } from "react";
import { playSlideTransitionSound, playTactileClick } from "../lib/sfx";

type CardData = {
  id: string;
  name: string;
  scientific: string;
  tier: string;
  rarity: string;
  xp: string;
  icon: string;
  laplacian: string;
  note: string;
  borderColor: string;
  glowColor: string;
  tierBadgeBg: string;
  tierBadgeText: string;
  artBg: string;
};

const CARDS: CardData[] = [
  {
    id: "golden_retriever",
    name: "Golden Retriever",
    scientific: "Canis lupus",
    tier: "🥇 Gold Tier",
    rarity: "COMMON",
    xp: "+100 XP",
    icon: "🐕",
    laplacian: "Laplacian 340",
    note: "ResNet-50 · 96.4% confidence",
    borderColor: "border-amber-500/70",
    glowColor: "rgba(245, 158, 11, 0.35)",
    tierBadgeBg: "bg-amber-500/20",
    tierBadgeText: "text-amber-700 dark:text-amber-300",
    artBg: "from-amber-500/20 via-emerald-500/10 to-teal-500/15",
  },
  {
    id: "swallowtail",
    name: "Swallowtail",
    scientific: "Papilio machaon",
    tier: "✨ Epic Tier",
    rarity: "EPIC",
    xp: "+100 XP",
    icon: "🦋",
    laplacian: "Laplacian 290",
    note: "Active Bounty · Canopy Habitat",
    borderColor: "border-purple-500/70",
    glowColor: "rgba(168, 85, 247, 0.35)",
    tierBadgeBg: "bg-purple-500/20",
    tierBadgeText: "text-purple-600 dark:text-purple-300",
    artBg: "from-purple-500/20 via-pink-500/10 to-emerald-500/15",
  },
  {
    id: "tree_frog",
    name: "Tree Frog",
    scientific: "Hyla arborea",
    tier: "🥈 Silver Tier",
    rarity: "RARE",
    xp: "+75 XP",
    icon: "🐸",
    laplacian: "Laplacian 210",
    note: "Active Bounty · Wetlands Biome",
    borderColor: "border-emerald-500/70",
    glowColor: "rgba(16, 185, 129, 0.35)",
    tierBadgeBg: "bg-emerald-500/20",
    tierBadgeText: "text-emerald-700 dark:text-emerald-300",
    artBg: "from-emerald-500/20 via-teal-500/10 to-amber-500/15",
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

  // Helper to determine card position relative to activeIndex
  const getCardSlot = (cardIndex: number): "center" | "left" | "right" => {
    if (cardIndex === activeIndex) return "center";
    if (cardIndex === (activeIndex + 1) % 3) return "right";
    return "left";
  };

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center py-4">
      {/* Atmospheric Ambient Glow behind cards */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl transition-all duration-700"
        style={{
          backgroundColor: CARDS[activeIndex].glowColor,
        }}
        aria-hidden="true"
      />

      {/* 3D Perspective Card Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[430px] w-[310px] [perspective:1200px]"
      >
        {CARDS.map((card, idx) => {
          const slot = getCardSlot(idx);
          const isCenter = slot === "center";

          // Dynamic transform per slot
          let transformStyle = "";
          if (isCenter) {
            transformStyle = `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1) translateZ(30px)`;
          } else if (slot === "left") {
            transformStyle = `translateX(-45px) translateY(14px) rotateZ(-7deg) scale(0.9) translateZ(0px)`;
          } else {
            transformStyle = `translateX(45px) translateY(18px) rotateZ(7deg) scale(0.9) translateZ(0px)`;
          }

          return (
            <div
              key={card.id}
              onClick={() => {
                if (!isCenter) {
                  selectCard(idx);
                }
              }}
              style={{
                transform: transformStyle,
                transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                boxShadow: isCenter
                  ? `0 25px 60px -15px ${card.glowColor}`
                  : "0 15px 35px -15px rgba(0, 0, 0, 0.4)",
              }}
              className={`absolute inset-0 rounded-3xl border-2 bg-gradient-to-b from-card via-card to-background p-5 backdrop-blur-md ${
                card.borderColor
              } ${
                isCenter
                  ? "z-20 cursor-default opacity-100"
                  : "z-10 cursor-pointer opacity-70 hover:opacity-95 hover:scale-[0.93]"
              }`}
            >
              {/* Dynamic Holo-Foil Glare Effect on Center Card */}
              {isCenter && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-35 mix-blend-overlay transition-opacity"
                  style={{
                    background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${
                      50 - tilt.x * 3
                    }%, rgba(255,255,255,0.9), transparent 65%)`,
                  }}
                />
              )}

              {/* Card Header: Tier Badge & XP */}
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                <span
                  className={`rounded-full px-2.5 py-0.5 ${card.tierBadgeBg} ${card.tierBadgeText}`}
                >
                  {card.tier}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {card.xp}
                </span>
              </div>

              {/* Creature Artwork Frame */}
              <div
                className={`relative mt-3.5 flex h-44 items-center justify-center overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.artBg} text-7xl shadow-inner`}
              >
                <span className="drop-shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </span>
                <div className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-300 backdrop-blur">
                  {card.laplacian}
                </div>
              </div>

              {/* Creature Details */}
              <div className="mt-3.5 space-y-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-black tracking-tight text-foreground">
                    {card.name}
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-muted">
                    {card.rarity}
                  </span>
                </div>
                <p className="text-xs text-muted leading-tight">{card.note}</p>

                {/* Onchain Devnet Verified Footer */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-cream/70 p-2 text-[11px] font-semibold dark:bg-black/30">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Onchain
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Solana Devnet
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleek Interactive Switcher Controls */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const prev = (activeIndex - 1 + CARDS.length) % CARDS.length;
            selectCard(prev);
          }}
          aria-label="Previous card"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/80 text-xs font-bold text-muted transition hover:border-emerald-500 hover:text-foreground active:scale-95"
        >
          ❮
        </button>

        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card/60 p-1 backdrop-blur-md">
          {CARDS.map((card, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  selectCard(idx);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                    : "text-muted hover:bg-cream hover:text-foreground dark:hover:bg-black/40"
                }`}
              >
                <span>{card.icon}</span>
                <span className="hidden sm:inline">{card.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = (activeIndex + 1) % CARDS.length;
            selectCard(next);
          }}
          aria-label="Next card"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/80 text-xs font-bold text-muted transition hover:border-emerald-500 hover:text-foreground active:scale-95"
        >
          ❯
        </button>
      </div>

      <p className="mt-2 text-[11px] font-mono text-muted">
        CLICK BACKGROUND CARDS OR TABS TO SHUFFLE IN 3D
      </p>
    </div>
  );
}
