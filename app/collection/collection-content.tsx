"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SpeciesArt } from "../components/species-art";
import { useGameData } from "../lib/hooks/use-game-data";
import type { Rarity } from "../lib/species";

const FILTERS = ["All", "Discovered", "Undiscovered", "Quest targets"] as const;
const SORTS = ["Recently discovered", "Name", "Rarity", "Best grade"] as const;
const RARITY_ORDER: Record<Rarity, number> = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
};
const GRADE_ORDER = { Bronze: 1, Silver: 2, Gold: 3 } as const;

export function CollectionContent() {
  const game = useGameData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [rarity, setRarity] = useState<Rarity | "All">("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>(
    "Recently discovered",
  );

  const cards = useMemo(() => {
    const filtered = game.cards.filter((card) => {
      if (filter === "Discovered" && card.count === 0) return false;
      if (filter === "Undiscovered" && card.count > 0) return false;
      if (filter === "Quest targets" && !card.species.targetForQuest)
        return false;
      return rarity === "All" || card.species.rarity === rarity;
    });
    return filtered.sort((left, right) => {
      if (sort === "Name")
        return left.species.name.localeCompare(right.species.name);
      if (sort === "Rarity")
        return (
          RARITY_ORDER[right.species.rarity] - RARITY_ORDER[left.species.rarity]
        );
      if (sort === "Best grade")
        return (
          (right.bestGrade ? GRADE_ORDER[right.bestGrade] : 0) -
          (left.bestGrade ? GRADE_ORDER[left.bestGrade] : 0)
        );
      const rightTime = right.latestTimestamp ?? -1n;
      const leftTime = left.latestTimestamp ?? -1n;
      return rightTime > leftTime
        ? 1
        : rightTime < leftTime
          ? -1
          : left.species.name.localeCompare(right.species.name);
    });
  }, [filter, game.cards, rarity, sort]);
  const discoveredCount = game.cards.filter((card) => card.count > 0).length;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 sm:pt-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-muted">
            Wildlife field guide
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Collection
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Catalogue knowledge from Supabase, matched with your confirmed
            Discovery accounts on Solana Devnet.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-3">
          <p className="text-xs text-muted">Species discovered</p>
          <p className="text-2xl font-black tabular-nums">
            {discoveredCount}/{game.catalogue.data?.length ?? "–"}
          </p>
        </div>
      </div>
      <section
        aria-label="Collection filters"
        className="mt-8 rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold ${filter === option ? "bg-primary text-primary-foreground" : "bg-cream text-muted"}`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:ml-auto sm:max-w-md">
          <label className="text-xs text-muted">
            Rarity
            <select
              value={rarity}
              onChange={(event) =>
                setRarity(event.target.value as Rarity | "All")
              }
              className="mt-1 block min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            >
              <option>All</option>
              {Object.keys(RARITY_ORDER).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Sort
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as (typeof SORTS)[number])
              }
              className="mt-1 block min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            >
              {SORTS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {game.isLoading ? (
        <p className="mt-10 text-sm text-muted">Loading your collection…</p>
      ) : game.error ? (
        <section className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">
            Your collection could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => void game.refresh()}
            className="mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </section>
      ) : cards.length === 0 ? (
        <section className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-black">
            No species match these filters
          </h2>
          <button
            type="button"
            onClick={() => {
              setFilter("All");
              setRarity("All");
            }}
            className="mt-5 min-h-12 rounded-xl border border-border px-5 text-sm font-bold"
          >
            Clear filters
          </button>
        </section>
      ) : (
        <section
          aria-label="Species collection"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <Link
              href={`/collection/${card.species.speciesId}`}
              key={String(card.species.id)}
              className={`group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0 ${card.count > 0 ? "" : "opacity-70"}`}
            >
              <div className="relative flex aspect-[16/9] items-end overflow-hidden bg-cream p-5">
                <SpeciesArt
                  src={card.species.imageUrl ?? card.species.iconUrl}
                  alt={card.species.name}
                  className={
                    card.count > 0
                      ? "transition group-hover:scale-105"
                      : "grayscale transition group-hover:scale-105"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="relative rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-foreground">
                  {card.count > 0 ? `${card.count} captured` : "Not discovered"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{card.species.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {card.species.rarity}
                      {card.species.targetForQuest ? " · Quest target" : ""}
                    </p>
                  </div>
                  {card.bestGrade && (
                    <span className="text-xs font-bold">{card.bestGrade}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
      <Link
        href="/capture"
        className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Capture a discovery
      </Link>
    </main>
  );
}
