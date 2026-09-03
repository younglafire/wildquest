"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetchCatalogue } from "../lib/catalogue-client";
import {
  buildCollectionCards,
  fetchPlayerDiscoveries,
} from "../lib/collection";
import { loadConfirmedDiscovery } from "../lib/expedition";
import { useSolanaClient } from "../lib/solana-client-context";
import { useWallet } from "../lib/wallet/context";
import { SpeciesArt } from "../components/species-art";

const GRADE_STYLES = {
  Bronze: "text-amber-700 dark:text-amber-300",
  Silver: "text-slate-600 dark:text-slate-300",
  Gold: "text-yellow-700 dark:text-yellow-300",
} as const;

export function CollectionContent() {
  const client = useSolanaClient();
  const { wallet, status } = useWallet();
  const address = wallet?.account.address;
  const catalogue = useSWR("species-catalogue", fetchCatalogue);
  const discoveries = useSWR(
    address ? ["player-discoveries", "devnet", address] : null,
    () => fetchPlayerDiscoveries(client.rpc, address!),
  );
  const confirmed =
    typeof window === "undefined" ? null : loadConfirmedDiscovery();
  const optimistic = confirmed?.wallet === address ? confirmed : null;
  const cards =
    catalogue.data && discoveries.data
      ? buildCollectionCards(catalogue.data, discoveries.data, optimistic)
      : [];
  const discoveredCount = cards.filter((card) => card.count > 0).length;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-6 sm:pt-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-muted">
            Wildlife passport
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Collection
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Your verified captures are read directly from WildQuest Discovery
            accounts on Solana Devnet.
          </p>
        </div>
        {address && (
          <div className="rounded-2xl border border-border bg-card px-5 py-3">
            <p className="text-xs text-muted">Species discovered</p>
            <p className="text-2xl font-black tabular-nums">
              {discoveredCount}/{catalogue.data?.length ?? "–"}
            </p>
          </div>
        )}
      </div>

      {status !== "connected" || !address ? (
        <section className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-black">Connect your wallet</h2>
          <p className="mt-2 text-sm text-muted">
            Your wallet address selects the onchain collection to display.
          </p>
        </section>
      ) : catalogue.isLoading || discoveries.isLoading ? (
        <p className="mt-10 text-sm text-muted">Loading your collection…</p>
      ) : catalogue.error || discoveries.error ? (
        <section className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">
            Your collection could not be loaded from Devnet.
          </p>
          <button
            type="button"
            onClick={() => {
              void catalogue.mutate();
              void discoveries.mutate();
            }}
            className="mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </section>
      ) : (
        <section
          aria-label="Species collection"
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => {
            const discovered = card.count > 0;
            return (
              <article
                key={String(card.species.id)}
                className={`overflow-hidden rounded-2xl border border-border bg-card ${discovered ? "" : "opacity-55"}`}
              >
                <div className="relative flex aspect-[16/9] items-end overflow-hidden bg-cream p-5">
                  <SpeciesArt
                    src={card.species.imageUrl ?? card.species.iconUrl}
                    alt={card.species.name}
                    className={discovered ? "" : "grayscale"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <span className="relative rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-foreground">
                    {discovered ? `${card.count} captured` : "Not discovered"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">
                        {discovered ? card.species.name : "Unknown species"}
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        {card.species.rarity}
                      </p>
                    </div>
                    {card.bestGrade && (
                      <span
                        className={`text-xs font-bold ${GRADE_STYLES[card.bestGrade]}`}
                      >
                        {card.bestGrade}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="mt-8">
        <Link
          href="/capture"
          className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Capture a discovery
        </Link>
      </div>
    </main>
  );
}
