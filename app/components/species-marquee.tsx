"use client";

import { playTactileClick } from "../lib/sfx";

const MARQUEE_ITEMS = [
  {
    id: "butterfly",
    name: "Swallowtail",
    scientific: "Papilio machaon",
    icon: "🦋",
    biome: "Canopy",
    xp: "+100 XP",
    status: "Quest Target",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "dog",
    name: "Golden Retriever",
    scientific: "Canis lupus",
    icon: "🐕",
    biome: "Urban / Yard",
    xp: "+100 XP",
    status: "Common",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "frog",
    name: "Tree Frog",
    scientific: "Hyla arborea",
    icon: "🐸",
    biome: "Wetlands",
    xp: "+75 XP",
    status: "Quest Target",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "bee",
    name: "Honey Bee",
    scientific: "Apis mellifera",
    icon: "🐝",
    biome: "Meadow",
    xp: "+100 XP",
    status: "Quest Target",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "cat",
    name: "Domestic Cat",
    scientific: "Felis catus",
    icon: "🐈",
    biome: "Settlement",
    xp: "+75 XP",
    status: "Common",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "dragonfly",
    name: "Common Darter",
    scientific: "Sympetrum striolatum",
    icon: "🦗",
    biome: "Riverbed",
    xp: "+100 XP",
    status: "Quest Target",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
  {
    id: "chicken",
    name: "Red Junglefowl",
    scientific: "Gallus gallus",
    icon: "🐔",
    biome: "Rural / Farm",
    xp: "+50 XP",
    status: "Quest Target",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    id: "ant",
    name: "Carpenter Ant",
    scientific: "Camponotus",
    icon: "🐜",
    biome: "Forest Floor",
    xp: "+50 XP",
    status: "Common",
    badgeColor: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  },
] as const;

export function SpeciesMarquee() {
  return (
    <section
      aria-label="Supported wildlife species marquee"
      className="mt-16 overflow-hidden py-4"
    >
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            BIO-DEX FIELD CATALOGUE // 8 CLASSIFIABLE TARGETS
          </p>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-muted">
          HOVER CARD TO PAUSE STREAM
        </span>
      </div>

      {/* Marquee Wrapper with soft edge masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="animate-marquee flex gap-5 py-3">
          {/* First loop */}
          {MARQUEE_ITEMS.map((item) => (
            <div
              key={`loop1-${item.id}`}
              onMouseEnter={playTactileClick}
              className="group relative flex h-32 w-96 sm:h-36 sm:w-[420px] shrink-0 select-none items-center transition-transform duration-200 hover:-translate-y-1"
            >
              {/* Ornate Fantasy Card Frame */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/marquee_card_frame.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)] brightness-95 transition-all group-hover:brightness-105 group-hover:drop-shadow-[0_8px_24px_rgba(52,211,153,0.45)]"
                draggable={false}
              />

              {/* Left Socket: Icon (strictly centered inside square emerald frame) */}
              <div className="absolute left-[13.5%] top-[22%] flex h-[56%] w-[17%] items-center justify-center">
                <span className="text-3xl sm:text-4xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
              </div>

              {/* Right Dark Slate: Name, XP, Scientific, Biome, Status (strictly inside marble slab) */}
              <div className="absolute left-[37.5%] right-[15.5%] top-[23%] bottom-[23%] flex flex-col justify-between py-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-sm sm:text-base font-black leading-tight text-[#f0e8d4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.name}
                  </p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] sm:text-xs font-black leading-none ${item.badgeColor}`}
                  >
                    {item.xp}
                  </span>
                </div>
                <p className="truncate text-xs italic leading-tight text-[#b5a792]">
                  {item.scientific}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold leading-tight text-[#8a7a62]">
                  <span className="truncate">{item.biome}</span>
                  <span className="shrink-0 font-mono font-bold text-emerald-400">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Duplicate loop for infinite continuous scroll */}
          {MARQUEE_ITEMS.map((item) => (
            <div
              key={`loop2-${item.id}`}
              onMouseEnter={playTactileClick}
              className="group relative flex h-32 w-96 sm:h-36 sm:w-[420px] shrink-0 select-none items-center transition-transform duration-200 hover:-translate-y-1"
            >
              {/* Ornate Fantasy Card Frame */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/marquee_card_frame.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)] brightness-95 transition-all group-hover:brightness-105 group-hover:drop-shadow-[0_8px_24px_rgba(52,211,153,0.45)]"
                draggable={false}
              />

              {/* Left Socket: Icon (strictly centered inside square emerald frame) */}
              <div className="absolute left-[13.5%] top-[22%] flex h-[56%] w-[17%] items-center justify-center">
                <span className="text-3xl sm:text-4xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
              </div>

              {/* Right Dark Slate: Name, XP, Scientific, Biome, Status (strictly inside marble slab) */}
              <div className="absolute left-[37.5%] right-[15.5%] top-[23%] bottom-[23%] flex flex-col justify-between py-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-sm sm:text-base font-black leading-tight text-[#f0e8d4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.name}
                  </p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] sm:text-xs font-black leading-none ${item.badgeColor}`}
                  >
                    {item.xp}
                  </span>
                </div>
                <p className="truncate text-xs italic leading-tight text-[#b5a792]">
                  {item.scientific}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold leading-tight text-[#8a7a62]">
                  <span className="truncate">{item.biome}</span>
                  <span className="shrink-0 font-mono font-bold text-emerald-400">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
