"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { CreatureHologramStage } from "../../components/creature-hologram-stage";
import {
  fetchMaybeSpeciesConfig,
  findSpeciesConfigPda,
} from "../../generated/wildquest";
import { fetchCatalogueSpecies } from "../../lib/catalogue-client";
import { formatDiscoveryDate } from "../../lib/game";
import { useGameData } from "../../lib/hooks/use-game-data";
import { useSolanaClient } from "../../lib/solana-client-context";

export function SpeciesDetail({ speciesId }: { speciesId: string }) {
  const species = useSWR(["catalogue-species", speciesId], () =>
    fetchCatalogueSpecies(speciesId),
  );
  const game = useGameData();
  const client = useSolanaClient();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const speciesConfig = useSWR(
    species.data ? ["species-config", String(species.data.id)] : null,
    async () => {
      const [address] = await findSpeciesConfigPda({
        catalogueId: BigInt(species.data!.id),
      });
      const account = await fetchMaybeSpeciesConfig(client.rpc, address, {
        commitment: "confirmed",
      });
      return account.exists ? account.data : null;
    },
  );

  if (species.isLoading)
    return (
      <DetailMessage
        title="Opening field guide"
        copy="Loading species details…"
      />
    );
  if (species.error || !species.data)
    return (
      <DetailMessage
        title="Species unavailable"
        copy="This active species could not be loaded from the catalogue."
        action="Back to collection"
      />
    );

  const card = game.cards.find(
    (candidate) => candidate.species.speciesId === speciesId,
  );
  const catalogueId = BigInt(species.data.id);
  const owned = (game.creatures.data ?? []).some(
    (creature) => creature.data.catalogueId === catalogueId,
  );
  const discovered = (card?.count ?? 0) > 0 || owned;
  const quiz = species.data.quiz;
  const displayImageUrl = species.data.imageUrl ?? species.data.iconUrl;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-6 sm:pt-14">
      <Link
        href="/collection"
        className="inline-flex min-h-12 items-center text-sm font-bold text-muted hover:text-foreground"
      >
        ← Back to collection
      </Link>
      <article className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid md:grid-cols-[1fr_1fr]">
          <div
            className="relative flex flex-col justify-between overflow-hidden p-4 sm:p-6"
            style={{ background: "#100e09", borderRight: "1px solid #3a2e1e" }}
          >
            <div className="flex items-center justify-between gap-2 z-10">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "rgba(16,14,9,0.85)",
                  color: "#c8a96e",
                  border: "1px solid rgba(200,169,110,0.35)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {species.data.battleRole ?? "Creature"}
              </span>
              <span
                className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold border border-[#3a2e1e]"
                style={{ color: "#c8a96e" }}
              >
                {discovered ? `${card?.count ?? 1} captured` : "Not discovered"}
              </span>
            </div>

            <div className="my-2 flex w-full items-center justify-center">
              <CreatureHologramStage
                speciesId={species.data.speciesId}
                speciesName={species.data.name}
                catalogueId={species.data.id}
                rarity={species.data.rarity}
                role={species.data.battleRole}
                imageUrl={displayImageUrl}
                stats={speciesConfig.data}
                summary={species.data.cardSummary ?? species.data.description}
              />
            </div>
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold">
                {species.data.rarity}
              </span>
              {species.data.targetForQuest && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Quest target
                </span>
              )}
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              {species.data.name}
            </h1>
            {species.data.scientificName && (
              <p className="mt-2 text-sm italic text-muted">
                {species.data.scientificName}
              </p>
            )}
            {species.data.description && (
              <p className="mt-6 text-sm leading-7 text-muted">
                {species.data.description}
              </p>
            )}
            <dl className="mt-7 grid grid-cols-2 gap-3">
              <Info
                label="Habitat"
                value={species.data.habitat ?? "Not documented"}
              />
              <Info label="Base reward" value={`${species.data.baseXp} XP`} />
              <Info label="Best grade" value={card?.bestGrade ?? "None yet"} />
              <Info
                label="Latest capture"
                value={
                  formatDiscoveryDate(card?.latestTimestamp ?? null) ??
                  "None yet"
                }
              />
            </dl>
            {!discovered && (
              <Link
                href="/capture"
                className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
              >
                Find this species
              </Link>
            )}
          </div>
        </div>
      </article>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
            Field notes
          </p>
          <h2 className="mt-2 text-2xl font-black">
            What explorers should know
          </h2>
          <ul className="mt-5 space-y-4">
            {species.data.facts.map((fact) => (
              <li
                key={fact}
                className="flex gap-3 text-sm leading-relaxed text-muted"
              >
                <span aria-hidden="true" className="text-emerald-500">
                  ●
                </span>
                {fact}
              </li>
            ))}
          </ul>
          {species.data.sourceUrl && (
            <a
              href={species.data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center text-sm font-bold underline"
            >
              Read the catalogue source ↗
            </a>
          )}
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
            Practice quiz
          </p>
          {quiz ? (
            <>
              <h2 className="mt-2 text-2xl font-black">{quiz.question}</h2>
              <div className="mt-5 space-y-2">
                {quiz.options.map((option, index) => {
                  const answered = selectedAnswer !== null;
                  const correct = index === quiz.correctOptionIndex;
                  const chosen = index === selectedAnswer;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={answered}
                      onClick={() => setSelectedAnswer(index)}
                      className={`min-h-12 w-full rounded-xl border px-4 text-left text-sm font-semibold ${answered && correct ? "border-emerald-500 bg-emerald-500/10" : answered && chosen ? "border-destructive bg-destructive/10" : "border-border hover:bg-cream"}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selectedAnswer !== null && (
                <div
                  role="status"
                  className="mt-4 rounded-xl bg-cream p-4 text-sm"
                >
                  <p className="font-bold">
                    {selectedAnswer === quiz.correctOptionIndex
                      ? "Correct"
                      : "Not quite"}
                  </p>
                  <p className="mt-1 text-muted">
                    Practice questions do not award XP yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedAnswer(null)}
                    className="mt-3 font-bold underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black">No quiz available</h2>
              <p className="mt-3 text-sm text-muted">
                This catalogue entry does not have a practice question yet.
              </p>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-bold">{value}</dd>
    </div>
  );
}

function DetailMessage({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <section className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-muted">{copy}</p>
        {action && (
          <Link
            href="/collection"
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            {action}
          </Link>
        )}
      </section>
    </main>
  );
}
