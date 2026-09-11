"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  address as parseAddress,
  unwrapOption,
  type Address,
  type Signature,
} from "@solana/kit";
import useSWR from "swr";
import {
  fetchAllCreature,
  fetchMaybeMatch,
  findMatchAccountPda,
  MatchStatus,
} from "../generated/wildquest";
import { BattlePlayback } from "./battle-playback";
import { CreatureCard } from "../components/creature-card";
import { useCluster } from "../components/cluster-context";
import {
  fetchBattleCreatures,
  fetchMatchBattleCreatures,
  type BattleCreature,
} from "../lib/battle-creatures";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import {
  buildCancelMatchInstruction,
  buildClaimMatchPayoutInstruction,
  buildJoinMatchInstruction,
  buildOpenMatchInstruction,
  fetchMatches,
  getPlayerMatches,
  type GameMatch,
} from "../lib/matches";
import { useSolanaClient } from "../lib/solana-client-context";
import { useWallet } from "../lib/wallet/context";
import type { OwnedCreature } from "../lib/creatures";

const STATUS_LABEL: Record<MatchStatus, string> = {
  [MatchStatus.Open]: "Open",
  [MatchStatus.Settled]: "Paid",
  [MatchStatus.Cancelled]: "Cancelled",
  [MatchStatus.Claimable]: "Winner can claim",
  [MatchStatus.Active]: "Battle in progress",
  [MatchStatus.Refunded]: "Refunded",
};

export function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const arenaRef = useRef<HTMLElement>(null);
  const game = useGameData();
  const client = useSolanaClient();
  const { signer } = useWallet();
  const { cluster } = useCluster();
  const { send, isSending } = useSendTransaction();
  const matches = useSWR(["matches", cluster], () => fetchMatches(client.rpc), {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
  const creatures = game.creatures.data ?? [];
  const battleCreatures = useSWR(
    creatures.length && game.catalogue.data
      ? ["battle-creatures", cluster, ...creatures.map((item) => item.address)]
      : null,
    () =>
      fetchBattleCreatures(client.rpc, creatures, game.catalogue.data ?? []),
  );
  const [slots, setSlots] = useState<string[]>(["", "", ""]);
  const [armed, setArmed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<Signature | null>(null);
  const [lastMatchAddress, setLastMatchAddress] = useState<Address | null>(
    null,
  );
  const activeMatch = useSWR(
    lastMatchAddress
      ? (["active-match", cluster, lastMatchAddress] as const)
      : null,
    async () => {
      const account = await fetchMaybeMatch(client.rpc, lastMatchAddress!, {
        commitment: "confirmed",
      });
      return account.exists ? account : null;
    },
    { refreshInterval: 5_000, revalidateOnFocus: true },
  );

  useEffect(() => {
    if (!signer) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const requested = searchParams.get("match");
      const stored = sessionStorage.getItem(
        `wildquest:last-match:${cluster}:${signer.address}`,
      );
      const candidate = requested ?? stored;
      if (!candidate) return;
      try {
        setLastMatchAddress(parseAddress(candidate));
      } catch {
        sessionStorage.removeItem(
          `wildquest:last-match:${cluster}:${signer.address}`,
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cluster, searchParams, signer]);

  useEffect(() => {
    if (!lastMatchAddress) return;
    const abortController = new AbortController();
    const subscribe = async () => {
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(lastMatchAddress, { commitment: "confirmed" })
          .subscribe({ abortSignal: abortController.signal });
        for await (const notification of notifications) {
          void notification;
          await Promise.all([activeMatch.mutate(), matches.mutate()]);
        }
      } catch {
        // Confirmed polling remains active when an RPC WebSocket disconnects.
      }
    };
    void subscribe();
    return () => abortController.abort();
  }, [activeMatch, client, lastMatchAddress, matches]);

  useEffect(() => {
    if (!lastMatchAddress || !activeMatch.data) return;
    arenaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeMatch.data, lastMatchAddress]);

  useEffect(() => {
    if (
      !signer ||
      !lastMatchAddress ||
      activeMatch.isLoading ||
      activeMatch.data !== null
    )
      return;
    queueMicrotask(() => {
      sessionStorage.removeItem(
        `wildquest:last-match:${cluster}:${signer.address}`,
      );
      setLastMatchAddress(null);
      router.replace("/battle", { scroll: false });
    });
  }, [
    activeMatch.data,
    activeMatch.isLoading,
    cluster,
    lastMatchAddress,
    router,
    signer,
  ]);

  const selected = slots
    .map((slot) => creatures.find((creature) => creature.address === slot))
    .filter((creature): creature is OwnedCreature => Boolean(creature));
  const cardsByAddress = useMemo(
    () =>
      new Map<string, BattleCreature>(
        (battleCreatures.data ?? []).map((item) => [
          item.creature.address,
          item,
        ]),
      ),
    [battleCreatures.data],
  );
  const resultMatch = activeMatch.data ?? null;

  const rememberMatch = (matchAddress: Address) => {
    setLastMatchAddress(matchAddress);
    if (signer)
      sessionStorage.setItem(
        `wildquest:last-match:${cluster}:${signer.address}`,
        matchAddress,
      );
    router.push(`/match/${matchAddress}`);
  };
  const run = async (operation: () => Promise<Signature>) => {
    setError(null);
    try {
      const signature = await operation();
      setLastSignature(signature);
      await Promise.all([matches.mutate(), game.refresh()]);
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The match transaction failed.",
      );
    }
  };
  const place = (index: number, creatureAddress: string) => {
    if (
      creatureAddress &&
      slots.some(
        (value, slotIndex) => slotIndex !== index && value === creatureAddress,
      )
    )
      return;
    setSlots((current) =>
      current.map((value, slotIndex) =>
        slotIndex === index ? creatureAddress : value,
      ),
    );
    setArmed(null);
  };
  const handleDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    place(index, event.dataTransfer.getData("text/plain"));
  };

  const createMatch = () =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const matchId = BigInt(Date.now());
      const [matchAddress] = await findMatchAccountPda({
        creator: signer.address,
        matchId,
      });
      const signature = await send({
        instructions: [
          await buildOpenMatchInstruction(signer, selected, matchId),
        ],
      });
      rememberMatch(matchAddress);
      return signature;
    });
  const joinMatch = (match: GameMatch) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const creatorCreatures = await fetchAllCreature(
        client.rpc,
        [...match.data.creatorCreatures],
        { commitment: "confirmed" },
      );
      const signature = await send({
        instructions: [
          await buildJoinMatchInstruction(
            signer,
            match,
            creatorCreatures,
            selected,
          ),
        ],
      });
      rememberMatch(match.address);
      return signature;
    });
  const cancelMatch = (match: GameMatch) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const signature = await send({
        instructions: [buildCancelMatchInstruction(signer, match)],
      });
      rememberMatch(match.address);
      return signature;
    });
  const claimMatch = (match: GameMatch) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const signature = await send({
        instructions: [buildClaimMatchPayoutInstruction(signer, match)],
      });
      rememberMatch(match.address);
      return signature;
    });

  const relevantMatches = (matches.data ?? []).filter((match) => {
    if (match.data.status === MatchStatus.Open) return true;
    const opponent = unwrapOption(match.data.opponent);
    return (
      match.data.status === MatchStatus.Claimable &&
      (match.data.creator === signer?.address || opponent === signer?.address)
    );
  });
  const playerHistory = signer
    ? getPlayerMatches(matches.data ?? [], signer.address)
    : [];

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
          Choose three different Creatures in order. Tap a card then a + slot,
          or drag it on desktop. Every match stakes 0.01 SOL.
        </p>

        {creatures.length < 3 ? (
          <div className="mt-7 rounded-2xl border border-border bg-cream p-5">
            <h2 className="font-black">You need three Creatures</h2>
            <p className="mt-2 text-sm text-muted">
              You currently own {creatures.length}. Capture more exact supported
              species first.
            </p>
            <Link
              href="/capture"
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              Capture a Creature
            </Link>
          </div>
        ) : battleCreatures.isLoading ? (
          <p className="mt-7 text-sm text-muted">
            Loading verified onchain stats…
          </p>
        ) : battleCreatures.error ? (
          <p role="alert" className="mt-7 text-sm text-destructive">
            Creature stats could not be loaded.
          </p>
        ) : (
          <>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {slots.map((slot, index) => {
                const card = cardsByAddress.get(slot);
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={
                      card
                        ? `Remove ${card.species?.name ?? "Creature"} from slot ${index + 1}`
                        : `Place selected Creature in slot ${index + 1}`
                    }
                    onClick={() =>
                      card ? place(index, "") : armed && place(index, armed)
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, index)}
                    className="min-h-44 rounded-2xl border-2 border-dashed border-border bg-cream p-2 text-left transition hover:border-emerald-500"
                  >
                    {card ? (
                      <CreatureCard creature={card} compact />
                    ) : (
                      <span className="flex min-h-40 items-center justify-center text-4xl font-light text-muted">
                        +
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">
              Your Creature cards
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {(battleCreatures.data ?? []).map((card) => {
                const creatureAddress = card.creature.address;
                const used = slots.includes(creatureAddress);
                return (
                  <button
                    key={creatureAddress}
                    type="button"
                    draggable={!used}
                    disabled={used}
                    aria-pressed={armed === creatureAddress}
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", creatureAddress)
                    }
                    onClick={() =>
                      setArmed((value) =>
                        value === creatureAddress ? null : creatureAddress,
                      )
                    }
                    className="rounded-2xl text-left focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <CreatureCard
                      creature={card}
                      compact
                      selected={armed === creatureAddress}
                      disabled={used}
                    />
                  </button>
                );
              })}
            </div>
          </>
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

      {lastMatchAddress && (
        <section ref={arenaRef} className="scroll-mt-24">
          {activeMatch.isLoading || !resultMatch ? (
            <p className="mt-6 rounded-2xl bg-card p-5 text-sm text-muted">
              Opening the shared battlefield…
            </p>
          ) : (
            <MatchResult
              match={resultMatch}
              wallet={signer?.address ?? null}
              catalogue={game.catalogue.data ?? []}
              isSending={isSending}
              onClaim={() => void claimMatch(resultMatch)}
            />
          )}
        </section>
      )}
      {lastSignature && (
        <a
          href={`https://explorer.solana.com/tx/${lastSignature}?cluster=${cluster}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-12 items-center text-sm font-bold underline"
        >
          View latest transaction on Explorer
        </a>
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
              Match lobby
            </p>
            <h2 className="mt-2 text-2xl font-black">Challenges</h2>
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
        ) : relevantMatches.length === 0 ? (
          <p className="mt-6 rounded-xl bg-cream p-5 text-sm text-muted">
            No open challenge or unclaimed win yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {relevantMatches.map((match) => {
              const mine = match.data.creator === signer?.address;
              const claimable = match.data.status === MatchStatus.Claimable;
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
                      3 Creatures ·{" "}
                      {Number(match.data.stakeLamports) / 1_000_000_000} SOL
                      stake
                    </p>
                    <p className="mt-1 max-w-sm truncate font-mono text-[10px] text-muted">
                      {match.data.creator}
                    </p>
                  </div>
                  {claimable ? (
                    <Link
                      href={`/match/${match.address}`}
                      className="flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
                    >
                      Watch result
                    </Link>
                  ) : mine ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/match/${match.address}`}
                        className="flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
                      >
                        Open battlefield
                      </Link>
                      <button
                        type="button"
                        onClick={() => void cancelMatch(match)}
                        disabled={isSending}
                        className="min-h-12 rounded-xl border border-border px-5 text-sm font-bold disabled:opacity-50"
                      >
                        Cancel and refund
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void joinMatch(match)}
                      disabled={isSending || selected.length !== 3}
                      className="min-h-12 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50"
                    >
                      Join · stake 0.01 SOL
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        id="history"
        className="mt-6 scroll-mt-24 rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
          Onchain history
        </p>
        <h2 className="mt-2 text-2xl font-black">Your matches</h2>
        <p className="mt-2 text-sm text-muted">
          Every row links to the Match account, deterministic replay, and its
          signed transaction receipts.
        </p>
        {matches.isLoading ? (
          <p className="mt-6 text-sm text-muted">Loading history…</p>
        ) : playerHistory.length === 0 ? (
          <p className="mt-6 rounded-xl bg-cream p-5 text-sm text-muted">
            Your wallet has not opened or joined a match yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {playerHistory.map((match) => {
              const winner = unwrapOption(match.data.winner);
              const result =
                winner === signer?.address
                  ? "Won"
                  : winner === null
                    ? match.data.status === MatchStatus.Cancelled
                      ? "Cancelled"
                      : "Draw"
                    : "Lost";
              return (
                <Link
                  key={match.address}
                  href={`/match/${match.address}`}
                  className="rounded-2xl border border-border p-5 transition hover:border-emerald-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">{result}</span>
                    <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold">
                      {STATUS_LABEL[match.data.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {new Date(
                      Number(match.data.createdAt) * 1_000,
                    ).toLocaleString()}
                  </p>
                  <p className="mt-2 truncate font-mono text-[10px] text-muted">
                    {match.address}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export function MatchResult({
  match,
  wallet,
  catalogue,
  isSending,
  onClaim,
}: {
  match: GameMatch;
  wallet: Address | null;
  catalogue: NonNullable<ReturnType<typeof useGameData>["catalogue"]["data"]>;
  isSending: boolean;
  onClaim: () => void;
}) {
  const client = useSolanaClient();
  const opponent = unwrapOption(match.data.opponent);
  const details = useSWR(
    opponent ? ["match-replay", match.address, match.data.status] : null,
    async () => {
      const [creator, opponentCards] = await Promise.all([
        fetchMatchBattleCreatures(
          client.rpc,
          match.data.creator,
          match.data.creatorCreatures,
          catalogue,
        ),
        fetchMatchBattleCreatures(
          client.rpc,
          opponent!,
          match.data.opponentCreatures,
          catalogue,
        ),
      ]);
      const cards = [...creator, ...opponentCards];
      if (
        match.data.rulesVersion !== 1 ||
        cards.some(
          (card) =>
            card.config.data.balanceVersion !== match.data.balanceVersion,
        )
      ) {
        throw new Error("This Match uses an unsupported battle rules version.");
      }
      return { creator, opponent: opponentCards };
    },
  );
  if (!opponent && match.data.status === MatchStatus.Cancelled)
    return (
      <section className="mt-6 rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
          Match cancelled
        </p>
        <h2 className="mt-3 text-3xl font-black">Stake refunded</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          No opponent joined this challenge. The creator recovered the opening
          stake.
        </p>
      </section>
    );
  if (!opponent)
    return (
      <section className="mt-6 rounded-3xl border border-emerald-500/30 bg-card p-6 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
          Shared battlefield
        </p>
        <h2 className="mt-3 text-3xl font-black">Waiting for an opponent</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Keep this battlefield open. It starts for both players as soon as the
          joining transaction is confirmed.
        </p>
        <p className="mt-5 break-all font-mono text-[10px] text-muted">
          {match.address}
        </p>
      </section>
    );
  if (details.isLoading)
    return (
      <p className="mt-6 rounded-2xl bg-card p-5 text-sm text-muted">
        Preparing deterministic replay…
      </p>
    );
  if (details.error || !details.data)
    return (
      <p
        role="alert"
        className="mt-6 rounded-2xl bg-destructive/10 p-5 text-sm text-destructive"
      >
        Battle replay data is unavailable.
      </p>
    );
  return (
    <BattlePlayback
      match={match}
      creatorTeam={details.data.creator}
      opponentTeam={details.data.opponent}
      wallet={wallet}
      isSending={isSending}
      onClaim={onClaim}
    />
  );
}
