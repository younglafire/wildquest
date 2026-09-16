"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { MatchStatus } from "../generated/wildquest";
import useSWR from "swr";
import { CreatureModelCard } from "../components/creature-model-card";
import { useCluster } from "../components/cluster-context";
import {
  fetchBattleCatalogue,
  type BattleCreature,
} from "../lib/battle-creatures";
import {
  buildReleaseCreatureInstruction,
  buildUpgradeCreatureBalanceInstruction,
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
  const ownedByCatalogueId = useMemo(() => {
    const map = new Map<string, OwnedCreature>();
    for (const creature of game.creatures.data ?? []) {
      map.set(creature.data.catalogueId.toString(), creature);
    }
    return map;
  }, [game.creatures.data]);
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

  const upgradeCreature = async (
    creature: OwnedCreature,
    config: BattleCreature["config"],
  ) => {
    if (!signer || !game.address) return;
    setError(null);
    try {
      await send({
        instructions: [
          buildUpgradeCreatureBalanceInstruction(
            signer,
            game.address,
            config,
            creature,
          ),
        ],
      });
      await game.refresh();
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The Creature could not be upgraded.",
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
    <main className="mx-auto max-w-6xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
          >
            Battle Roster
          </p>
          <h1
            className="mt-1 text-3xl font-black tracking-tight sm:mt-2 sm:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Collection
          </h1>
          <p
            className="mt-2 max-w-xl text-xs leading-relaxed sm:mt-3 sm:text-sm"
            style={{ color: "#8a7a62" }}
          >
            Your onchain Creature cards for deterministic 3v3 arena battle.
          </p>
        </div>
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5 sm:block sm:px-5 sm:py-3"
          style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#8a7a62",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Creatures Owned
          </p>
          <p
            className="text-xl font-black tabular-nums sm:text-2xl"
            style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
          >
            {ownedByCatalogueId.size} / {battleCatalogue.data?.length ?? "–"}
          </p>
        </div>
      </div>

      <section
        aria-label="Collection filters"
        className="mt-4 rounded-xl p-3 sm:mt-6 sm:p-4"
        style={{ background: "#1c1810", border: "1px solid #3a2e1e" }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className="min-h-10 shrink-0 rounded-lg px-4 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-display)",
                background:
                  filter === option
                    ? "linear-gradient(135deg, #c8a96e, #a07d48)"
                    : "rgba(58,46,30,0.5)",
                color: filter === option ? "#100e09" : "#8a7a62",
                border:
                  filter === option
                    ? "1px solid #c8a96e"
                    : "1px solid transparent",
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:mt-3 sm:ml-auto sm:max-w-md sm:gap-3">
          <label
            className="text-xs"
            style={{
              color: "#8a7a62",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Rarity
            <select
              value={rarity}
              onChange={(event) =>
                setRarity(event.target.value as Rarity | "All")
              }
              className="mt-1 block min-h-10 w-full rounded-lg px-3 text-xs sm:text-sm"
              style={{
                background: "#100e09",
                border: "1px solid #3a2e1e",
                color: "#f0e8d4",
              }}
            >
              <option>All</option>
              {Object.keys(RARITY_ORDER).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label
            className="text-xs"
            style={{
              color: "#8a7a62",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Sort
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as (typeof SORTS)[number])
              }
              className="mt-1 block min-h-10 w-full rounded-lg px-3 text-xs sm:text-sm"
              style={{
                background: "#100e09",
                border: "1px solid #3a2e1e",
                color: "#f0e8d4",
              }}
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
          className="mt-6 rounded-lg p-4 text-sm"
          style={{
            background: "rgba(192,57,43,0.12)",
            color: "#f8c8c4",
            border: "1px solid rgba(192,57,43,0.3)",
          }}
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-10 text-sm" style={{ color: "#8a7a62" }}>
          Consulting the Codex…
        </p>
      ) : loadError ? (
        <section
          className="mt-10 rounded-xl p-5"
          style={{
            background: "rgba(192,57,43,0.1)",
            border: "1px solid rgba(192,57,43,0.25)",
          }}
        >
          <p className="text-sm" style={{ color: "#f8c8c4" }}>
            Your Creature cards could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => void game.refresh()}
            className="mt-3 text-sm font-bold underline"
            style={{ color: "#c8a96e" }}
          >
            Try again
          </button>
        </section>
      ) : cards.length === 0 ? (
        <p
          className="mt-10 rounded-xl p-6 text-sm"
          style={{ background: "#1c1810", color: "#8a7a62" }}
        >
          No Creature cards match these filters.
        </p>
      ) : (
        <section
          aria-label="Creature collection"
          className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {cards.map(({ species, config }) => {
            const owned = ownedByCatalogueId.get(String(species.id));
            const battleCreature: BattleCreature | null = owned
              ? { creature: owned, species, config }
              : null;
            const locked = owned
              ? lockedCreatureAddresses.has(owned.address)
              : false;
            const needsUpgrade = owned
              ? owned.data.balanceVersion !== config.data.balanceVersion
              : false;
            return (
              <div key={String(species.id)} className="flex flex-col">
                <Link
                  href={`/collection/${species.speciesId}`}
                  className="group block flex-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a96e]"
                  style={{ outline: "none" }}
                  aria-label={`View ${species.name} details`}
                >
                  {battleCreature ? (
                    <CreatureModelCard
                      creature={battleCreature}
                      disabledBadge={locked ? "IN MATCH" : null}
                    />
                  ) : (
                    <CreatureModelCard
                      species={species}
                      stats={config.data}
                      disabled
                      disabledBadge="UNDISCOVERED"
                    />
                  )}
                </Link>
                {owned && needsUpgrade ? (
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => void upgradeCreature(owned, config)}
                    className="mt-2 min-h-10 w-full rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-45 sm:text-[11px]"
                    style={{
                      border: "1px solid rgba(200,169,110,0.55)",
                      color: "#100e09",
                      background: "linear-gradient(135deg, #d8bd82, #a9834d)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {isSending ? "Waiting for wallet…" : "Upgrade for battle"}
                  </button>
                ) : owned ? (
                  <button
                    type="button"
                    disabled={isSending || locked}
                    onClick={() => {
                      setReleaseCandidate(owned);
                    }}
                    className="mt-2 min-h-10 w-full rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-45 sm:text-[11px]"
                    style={{
                      border: "1px solid rgba(192,57,43,0.4)",
                      color: "#f8c8c4",
                      background: "rgba(192,57,43,0.08)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {locked ? "Locked in Match" : "Release card"}
                  </button>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <Link
                      href="/capture"
                      className="flex min-h-10 items-center justify-center rounded-lg px-1 text-[10px] font-bold uppercase tracking-wide transition-colors sm:text-[11px]"
                      style={{
                        border: "1px solid #3a2e1e",
                        color: "#c8a96e",
                        fontFamily: "var(--font-display)",
                        background: "rgba(200,169,110,0.06)",
                      }}
                    >
                      Capture
                    </Link>
                    <button
                      type="button"
                      disabled={isGenerating || generatingId !== null}
                      onClick={() => void generateAnimal(String(species.id))}
                      className="min-h-10 rounded-lg px-1 text-[10px] font-bold uppercase tracking-wide disabled:opacity-50 sm:text-[11px]"
                      style={{
                        border: "1px solid rgba(200,169,110,0.3)",
                        color: "#c8a96e",
                        background: "rgba(200,169,110,0.08)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {generatingId === String(species.id)
                        ? "Generating…"
                        : "Devnet"}
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
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl p-5 shadow-2xl"
          style={{
            background: "#1c1810",
            border: "1px solid #3a2e1e",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          <h2
            id="release-title"
            className="text-xl font-black"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            Release this Creature?
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#8a7a62" }}>
            The card will leave your onchain roster. You can capture this exact
            species again later with a new photo.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReleaseCandidate(null)}
              className="min-h-12 rounded-lg text-sm font-bold"
              style={{
                border: "1px solid #3a2e1e",
                color: "#f0e8d4",
                background: "transparent",
              }}
            >
              Keep card
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => void releaseCreature()}
              className="min-h-12 rounded-lg px-4 text-sm font-bold disabled:opacity-50"
              style={{ background: "#c0392b", color: "#fff" }}
            >
              {isSending ? "Waiting for wallet…" : "Release on Solana"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
