"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { unwrapOption, type Address, type Signature } from "@solana/kit";
import useSWR from "swr";
import {
  fetchAllCreature,
  MatchStatus,
  type Match,
} from "../generated/wildquest";
import { useCluster } from "../components/cluster-context";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import {
  buildCancelMatchInstruction,
  buildJoinMatchInstruction,
  buildOpenMatchInstruction,
  fetchMatches,
  type GameMatch,
} from "../lib/matches";
import { useSolanaClient } from "../lib/solana-client-context";
import { useWallet } from "../lib/wallet/context";
import type { OwnedCreature } from "../lib/creatures";

const STATUS_LABEL: Record<MatchStatus, string> = {
  [MatchStatus.Open]: "Open",
  [MatchStatus.Settled]: "Settled",
  [MatchStatus.Cancelled]: "Cancelled",
};

export function BattleContent() {
  const game = useGameData();
  const client = useSolanaClient();
  const { signer } = useWallet();
  const { cluster } = useCluster();
  const { send, isSending } = useSendTransaction();
  const matches = useSWR(["matches", cluster], () => fetchMatches(client.rpc), {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
  const [slots, setSlots] = useState<Array<string>>(["", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<Signature | null>(null);
  const [lastMatchAddress, setLastMatchAddress] = useState<Address | null>(
    null,
  );

  const creatures = game.creatures.data ?? [];
  const selected = slots
    .map((slot) => creatures.find((creature) => creature.address === slot))
    .filter((creature): creature is OwnedCreature => Boolean(creature));
  const catalogueById = useMemo(
    () =>
      new Map(
        (game.catalogue.data ?? []).map((species) => [
          BigInt(species.id).toString(),
          species,
        ]),
      ),
    [game.catalogue.data],
  );

  const speciesName = (catalogueId: bigint) =>
    catalogueById.get(catalogueId.toString())?.name ??
    `Creature #${catalogueId.toString()}`;

  const run = async (
    operation: () => Promise<Signature>,
    match?: GameMatch,
  ) => {
    setError(null);
    setLastSignature(null);
    try {
      const signature = await operation();
      setLastSignature(signature);
      setLastMatchAddress(match?.address ?? null);
      await Promise.all([matches.mutate(), game.refresh()]);
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The match transaction failed.",
      );
    }
  };

  const createMatch = () =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const instruction = await buildOpenMatchInstruction(
        signer,
        selected,
        BigInt(Date.now()),
      );
      return send({ instructions: [instruction] });
    });

  const joinMatch = (match: GameMatch) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const creatorCreatures = await fetchAllCreature(
        client.rpc,
        [...match.data.creatorCreatures],
        { commitment: "confirmed" },
      );
      const instruction = await buildJoinMatchInstruction(
        signer,
        match,
        creatorCreatures,
        selected,
      );
      return send({ instructions: [instruction] });
    }, match);

  const cancelMatch = (match: GameMatch) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      return send({
        instructions: [buildCancelMatchInstruction(signer, match)],
      });
    }, match);

  const openMatches = (matches.data ?? []).filter(
    (match) => match.data.status === MatchStatus.Open,
  );
  const resultMatch = lastMatchAddress
    ? (matches.data ?? []).find((match) => match.address === lastMatchAddress)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-6 sm:pt-14">
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          Deterministic arena · Devnet
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Build your team
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Pick three different Creatures in order. Every match stakes 0.01 SOL;
          the winner receives both stakes and ties refund both players.
        </p>

        {creatures.length < 3 ? (
          <div className="mt-7 rounded-2xl border border-border bg-cream p-5">
            <h2 className="font-black">You need three Creatures</h2>
            <p className="mt-2 text-sm text-muted">
              You currently own {creatures.length}. Capture exact supported
              species until your team has three members.
            </p>
            <Link
              href="/capture"
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              Capture a Creature
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {slots.map((slot, index) => (
              <label
                key={index}
                className="rounded-2xl border border-border bg-cream p-4"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Slot {index + 1}
                </span>
                <select
                  aria-label={`Team slot ${index + 1}`}
                  value={slot}
                  onChange={(event) =>
                    setSlots((current) =>
                      current.map((value, slotIndex) =>
                        slotIndex === index ? event.target.value : value,
                      ),
                    )
                  }
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
                >
                  <option value="">Choose Creature</option>
                  {creatures.map((creature) => (
                    <option
                      key={creature.address}
                      value={creature.address}
                      disabled={slots.some(
                        (value, slotIndex) =>
                          slotIndex !== index && value === creature.address,
                      )}
                    >
                      {speciesName(creature.data.catalogueId)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {creatures.length >= 3 && (
          <button
            type="button"
            onClick={() => void createMatch()}
            disabled={selected.length !== 3 || isSending}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-50 sm:w-auto"
          >
            {isSending
              ? "Waiting for wallet…"
              : "Create match · stake 0.01 SOL"}
          </button>
        )}
      </section>

      {lastSignature && (
        <BattleResult
          match={resultMatch?.data ?? null}
          wallet={signer?.address ?? null}
          signature={lastSignature}
          cluster={cluster}
          catalogueById={catalogueById}
        />
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
              Match lobby
            </p>
            <h2 className="mt-2 text-2xl font-black">Open challenges</h2>
          </div>
          <button
            type="button"
            onClick={() => void matches.mutate()}
            className="min-h-12 rounded-xl border border-border px-4 text-sm font-bold"
          >
            Refresh
          </button>
        </div>

        {matches.isLoading ? (
          <p className="mt-6 text-sm text-muted">Loading matches…</p>
        ) : matches.error ? (
          <p className="mt-6 text-sm text-destructive">
            The Devnet match lobby is unavailable.
          </p>
        ) : openMatches.length === 0 ? (
          <p className="mt-6 rounded-xl bg-cream p-5 text-sm text-muted">
            No open challenge yet. Create the first one.
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {openMatches.map((match) => {
              const mine = match.data.creator === signer?.address;
              return (
                <article
                  key={match.address}
                  className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {STATUS_LABEL[match.data.status]}
                      </span>
                      {mine && (
                        <span className="text-xs font-bold">Your match</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-bold">
                      {match.data.creatorCreatures.length} Creatures ·{" "}
                      {Number(match.data.stakeLamports) / 1_000_000_000} SOL
                      stake
                    </p>
                    <p className="mt-1 max-w-sm truncate font-mono text-[10px] text-muted">
                      {match.data.creator}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void (mine ? cancelMatch(match) : joinMatch(match))
                    }
                    disabled={isSending || (!mine && selected.length !== 3)}
                    className={`min-h-12 rounded-xl px-5 text-sm font-bold disabled:opacity-50 ${mine ? "border border-border" : "bg-primary text-primary-foreground"}`}
                  >
                    {mine ? "Cancel and refund" : "Join · stake 0.01 SOL"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function BattleResult({
  match,
  wallet,
  signature,
  cluster,
  catalogueById,
}: {
  match: Match | null;
  wallet: Address | null;
  signature: Signature;
  cluster: string;
  catalogueById: Map<string, { name: string }>;
}) {
  const client = useSolanaClient();
  const winner = match ? unwrapOption(match.winner) : null;
  const opponent = match ? unwrapOption(match.opponent) : null;
  const details = useSWR(
    match && opponent
      ? (["match-result-details", cluster, signature] as const)
      : null,
    async () => {
      const creatureAddresses = [
        ...match!.creatorCreatures,
        ...match!.opponentCreatures,
      ];
      const [creatures, creatorBalance, opponentBalance] = await Promise.all([
        fetchAllCreature(client.rpc, creatureAddresses, {
          commitment: "confirmed",
        }),
        client.rpc
          .getBalance(match!.creator, { commitment: "confirmed" })
          .send(),
        client.rpc.getBalance(opponent!, { commitment: "confirmed" }).send(),
      ]);
      return {
        names: new Map(
          creatures.map((creature) => [
            creature.address,
            catalogueById.get(creature.data.catalogueId.toString())?.name ??
              `Creature #${creature.data.catalogueId.toString()}`,
          ]),
        ),
        creatorBalance: creatorBalance.value,
        opponentBalance: opponentBalance.value,
      };
    },
  );
  const outcome = !match
    ? "Transaction confirmed"
    : match.status === MatchStatus.Cancelled
      ? "Match cancelled · stake refunded"
      : winner === null
        ? "Draw · both stakes refunded"
        : winner === wallet
          ? "Victory · 0.02 SOL payout"
          : "Defeat · opponent received the pot";

  return (
    <section className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
        Confirmed on Solana
      </p>
      <h2 className="mt-2 text-3xl font-black">{outcome}</h2>
      {match && match.status === MatchStatus.Settled && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <TeamSummary
            title="Creator team"
            addresses={match.creatorCreatures}
            names={details.data?.names}
          />
          <TeamSummary
            title="Opponent team"
            addresses={match.opponentCreatures}
            names={details.data?.names}
          />
        </div>
      )}
      {details.data && (
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-card p-4">
            <dt className="text-xs text-muted">Creator balance</dt>
            <dd className="mt-1 font-black tabular-nums">
              {(Number(details.data.creatorBalance) / 1_000_000_000).toFixed(4)}{" "}
              SOL
            </dd>
          </div>
          <div className="rounded-xl bg-card p-4">
            <dt className="text-xs text-muted">Opponent balance</dt>
            <dd className="mt-1 font-black tabular-nums">
              {(Number(details.data.opponentBalance) / 1_000_000_000).toFixed(
                4,
              )}{" "}
              SOL
            </dd>
          </div>
        </dl>
      )}
      <a
        href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex min-h-12 items-center font-bold underline"
      >
        View exact transaction on Explorer
      </a>
    </section>
  );
}

function TeamSummary({
  title,
  addresses,
  names,
}: {
  title: string;
  addresses: Address[];
  names?: Map<Address, string>;
}) {
  return (
    <div className="rounded-xl bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {title}
      </p>
      <ol className="mt-2 space-y-1 font-mono text-[10px] text-muted">
        {addresses.map((creature, index) => (
          <li key={creature}>
            {index + 1}.{" "}
            {names?.get(creature) ??
              `${creature.slice(0, 8)}…${creature.slice(-6)}`}
          </li>
        ))}
      </ol>
    </div>
  );
}
