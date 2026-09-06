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
        <div className="animate-marquee flex gap-4 py-2">
          {/* First loop */}
          {MARQUEE_ITEMS.map((item) => (
            <div
              key={`loop1-${item.id}`}
              onMouseEnter={playTactileClick}
              className="flex w-64 shrink-0 items-center gap-3.5 rounded-2xl border border-border bg-card/85 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-2xl dark:bg-black/40">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-black text-foreground">
                    {item.name}
                  </p>
                  <span className={`shrink-0 rounded-md border px-1.5 py-0.2 font-mono text-[9px] font-bold ${item.badgeColor}`}>
                    {item.xp}
                  </span>
                </div>
                <p className="truncate text-[10px] italic text-muted">
                  {item.scientific}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-muted">
                  <span>{item.biome}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
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
              className="flex w-64 shrink-0 items-center gap-3.5 rounded-2xl border border-border bg-card/85 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-2xl dark:bg-black/40">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-black text-foreground">
                    {item.name}
                  </p>
                  <span className={`shrink-0 rounded-md border px-1.5 py-0.2 font-mono text-[9px] font-bold ${item.badgeColor}`}>
                    {item.xp}
                  </span>
                </div>
                <p className="truncate text-[10px] italic text-muted">
                  {item.scientific}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-muted">
                  <span>{item.biome}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
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
