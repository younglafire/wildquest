"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { MatchStatus } from "../generated/wildquest";
import useSWR from "swr";
import { CreatureCard } from "../components/creature-card";
import { useCluster } from "../components/cluster-context";
import {
  fetchBattleCatalogue,
  type BattleCreature,
} from "../lib/battle-creatures";
import {
  buildReleaseCreatureInstruction,
  type OwnedCreature,
} from "../lib/creatures";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { fetchMatches } from "../lib/matches";
import { useSolanaClient } from "../lib/solana-client-context";
import type { Rarity } from "../lib/species";
import { useWallet } from "../lib/wallet/context";
import {
  generateCreature,
  fetchGenerationAccess,
} from "../lib/admin/generate-creature";
import { useSubmitCaptureTransaction } from "../lib/hooks/use-submit-capture-transaction";

const FILTERS = ["All", "Owned", "Missing"] as const;
const SORTS = ["Name", "Rarity", "Battle role"] as const;
const RARITY_ORDER: Record<Rarity, number> = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
};

export function CollectionContent() {
  const game = useGameData();
  const client = useSolanaClient();
  const { cluster } = useCluster();
  const { signer, wallet } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { submit: submitGenerated, isSubmitting: isGenerating } =
    useSubmitCaptureTransaction();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [rarity, setRarity] = useState<Rarity | "All">("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Name");
  const [releaseCandidate, setReleaseCandidate] =
    useState<OwnedCreature | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const generationInFlight = useRef(false);
  const generationAccess = useSWR(
    game.address && cluster === "devnet"
      ? ["generate-access", cluster, game.address]
      : null,
    () => fetchGenerationAccess(game.address!, cluster),
  );
  const battleCatalogue = useSWR(
    game.catalogue.data ? (["battle-catalogue", cluster] as const) : null,
    () => fetchBattleCatalogue(client.rpc, game.catalogue.data ?? []),
  );
  const matches = useSWR(["matches", cluster], () => fetchMatches(client.rpc), {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
  const ownedByCatalogueId = useMemo(
    () =>
      new Map(
        (game.creatures.data ?? []).map((creature) => [
          creature.data.catalogueId.toString(),
          creature,
        ]),
      ),
    [game.creatures.data],
  );
  const lockedCreatureAddresses = useMemo(() => {
    const addresses = new Set<string>();
    for (const match of matches.data ?? []) {
      if (
        match.data.status !== MatchStatus.Open &&
        match.data.status !== MatchStatus.Claimable
      )
        continue;
      for (const creature of [
        ...match.data.creatorCreatures,
        ...match.data.opponentCreatures,
      ]) {
        addresses.add(creature);
      }
    }
    return addresses;
  }, [matches.data]);
  const cards = useMemo(() => {
    const filtered = (battleCatalogue.data ?? []).filter(({ species }) => {
      const owned = ownedByCatalogueId.has(String(species.id));
      if (filter === "Owned" && !owned) return false;
      if (filter === "Missing" && owned) return false;
      return rarity === "All" || species.rarity === rarity;
    });
    return filtered.sort((left, right) => {
      if (sort === "Rarity")
        return (
          RARITY_ORDER[right.species.rarity] - RARITY_ORDER[left.species.rarity]
        );
      if (sort === "Battle role")
        return (left.species.battleRole ?? "").localeCompare(
          right.species.battleRole ?? "",
        );
      return left.species.name.localeCompare(right.species.name);
    });
  }, [battleCatalogue.data, filter, ownedByCatalogueId, rarity, sort]);

  const releaseCreature = async () => {
    if (!signer || !releaseCandidate) return;
    setError(null);
    try {
      await send({
        instructions: [
          buildReleaseCreatureInstruction(signer, releaseCandidate),
        ],
      });
      setReleaseCandidate(null);
      await game.refresh();
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The Creature could not be released.",
      );
    }
  };

  const generateAnimal = async (catalogueId: string) => {
    if (generationInFlight.current) return;
    if (
      !signer ||
      !wallet ||
      !game.address ||
      cluster !== "devnet" ||
      !generationAccess.data
    ) {
      setError(
        "Connect a Devnet wallet that can sign messages before generating a Creature.",
      );
      return;
    }
    generationInFlight.current = true;
    setGeneratingId(catalogueId);
    setError(null);
    try {
      const transaction = await generateCreature(wallet, catalogueId);
      await submitGenerated(transaction);
      await game.refresh();
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "Creature generation failed.",
      );
    } finally {
      generationInFlight.current = false;
      setGeneratingId(null);
    }
  };

  const loading =
    game.catalogue.isLoading ||
    game.creatures.isLoading ||
    battleCatalogue.isLoading;
  const loadError =
    game.catalogue.error ?? game.creatures.error ?? battleCatalogue.error;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 sm:pt-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-muted">
            Battle roster
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Collection
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Your onchain Creature cards use the same stats and artwork shown in
            team selection and battle.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-3">
          <p className="text-xs text-muted">Creatures owned</p>
          <p className="text-2xl font-black tabular-nums">
            {ownedByCatalogueId.size}/{battleCatalogue.data?.length ?? "–"}
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

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-10 text-sm text-muted">Loading Creature cards…</p>
      ) : loadError ? (
        <section className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">
            Your Creature cards could not be loaded.
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
        <p className="mt-10 rounded-2xl bg-card p-6 text-sm text-muted">
          No Creature cards match these filters.
        </p>
      ) : (
        <section
          aria-label="Creature collection"
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map(({ species, config }) => {
            const owned = ownedByCatalogueId.get(String(species.id));
            const battleCreature: BattleCreature | null = owned
              ? { creature: owned, species, config }
              : null;
            const locked = owned
              ? lockedCreatureAddresses.has(owned.address)
              : false;
            return (
              <div key={String(species.id)}>
                <Link
                  href={`/collection/${species.speciesId}`}
                  className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {battleCreature ? (
                    <CreatureCard creature={battleCreature} />
                  ) : (
                    <CreatureCard
                      species={species}
                      stats={config.data}
                      disabled
                    />
                  )}
                </Link>
                {owned ? (
                  <button
                    type="button"
                    disabled={isSending || locked}
                    onClick={() => setReleaseCandidate(owned)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-destructive/40 px-4 text-sm font-bold text-destructive disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {locked ? "Card locked in active Match" : "Release card"}
                  </button>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/capture"
                      className="flex min-h-11 items-center justify-center rounded-xl border border-border text-sm font-bold"
                    >
                      Capture this Creature
                    </Link>
                    <button
                      type="button"
                      disabled={isGenerating || generatingId !== null}
                      onClick={() => void generateAnimal(String(species.id))}
                      className="min-h-11 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 text-sm font-bold text-amber-800 disabled:opacity-50 dark:text-amber-200"
                    >
                      {generatingId === String(species.id)
                        ? "Generating…"
                        : "Generate pet"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {releaseCandidate && (
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="release-title"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
        >
          <h2 id="release-title" className="text-xl font-black">
            Release this Creature?
          </h2>
          <p className="mt-2 text-sm text-muted">
            The card will leave your onchain roster. You can capture this exact
            species again later with a new photo.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReleaseCandidate(null)}
              className="min-h-12 rounded-xl border border-border text-sm font-bold"
            >
              Keep card
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => void releaseCreature()}
              className="min-h-12 rounded-xl bg-destructive px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSending ? "Waiting for wallet…" : "Release on Solana"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
