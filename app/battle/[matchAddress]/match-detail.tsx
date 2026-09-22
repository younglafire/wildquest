"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { address, unwrapOption, type Address } from "@solana/kit";
import useSWR from "swr";
import { fetchMaybeMatch, MatchStatus } from "../../generated/wildquest";
import { MatchResult } from "../battle-content";
import { LiveBattlefield } from "./live-battlefield";
import { useCluster } from "../../components/cluster-context";
import { useGameData } from "../../lib/hooks/use-game-data";
import { fetchMatchBattleCreatures } from "../../lib/battle-creatures";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import {
  buildClaimMatchPayoutInstruction,
  buildRefundStaleMatchInstruction,
  type GameMatch,
} from "../../lib/matches";
import { useSolanaClient } from "../../lib/solana-client-context";
import { useWallet } from "../../lib/wallet/context";
import { getPlayerMatchResult } from "../../lib/match-presentation";

const STATUS_LABEL: Record<MatchStatus, string> = {
  [MatchStatus.Open]: "Waiting for opponent",
  [MatchStatus.Claimable]: "Payout ready",
  [MatchStatus.Settled]: "Settled",
  [MatchStatus.Cancelled]: "Cancelled",
  [MatchStatus.Active]: "Battle in progress",
  [MatchStatus.Refunded]: "Refunded",
};

export function MatchDetail({ matchAddress }: { matchAddress: string }) {
  const parsedAddress = useMemo(() => {
    try {
      return address(matchAddress);
    } catch {
      return null;
    }
  }, [matchAddress]);
  const client = useSolanaClient();
  const game = useGameData();
  const { signer, wallet } = useWallet();
  const { cluster } = useCluster();
  const { send, isSending } = useSendTransaction();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const match = useSWR(
    parsedAddress ? (["match-detail", cluster, parsedAddress] as const) : null,
    async () => {
      const account = await fetchMaybeMatch(client.rpc, parsedAddress!, {
        commitment: "confirmed",
      });
      return account.exists ? account : null;
    },
    { refreshInterval: 5_000, revalidateOnFocus: true },
  );
  const receipts = useSWR(
    parsedAddress && match.data
      ? ([
          "match-receipts",
          cluster,
          parsedAddress,
          match.data.data.status,
        ] as const)
      : null,
    () =>
      client.rpc
        .getSignaturesForAddress(parsedAddress!, {
          commitment: "confirmed",
          limit: 10,
        })
        .send(),
    { revalidateOnFocus: true },
  );
  const opponentAddress = match.data
    ? unwrapOption(match.data.data.opponent)
    : null;
  const liveTeams = useSWR(
    match.data &&
      opponentAddress &&
      match.data.data.rulesVersion === 2 &&
      game.catalogue.data
      ? (["live-match-teams", cluster, match.data.address] as const)
      : null,
    async () => {
      const [creator, opponentTeam] = await Promise.all([
        fetchMatchBattleCreatures(
          client.rpc,
          match.data!.data.creator,
          match.data!.data.creatorCreatures,
          game.catalogue.data!,
        ),
        fetchMatchBattleCreatures(
          client.rpc,
          opponentAddress!,
          match.data!.data.opponentCreatures,
          game.catalogue.data!,
        ),
      ]);
      return { creator, opponent: opponentTeam };
    },
  );

  useEffect(() => {
    if (!parsedAddress) return;
    const abortController = new AbortController();
    const subscribe = async () => {
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(parsedAddress, { commitment: "confirmed" })
          .subscribe({ abortSignal: abortController.signal });
        for await (const notification of notifications) {
          void notification;
          await Promise.all([match.mutate(), receipts.mutate()]);
        }
      } catch {
        // Confirmed polling keeps the match current if the WebSocket disconnects.
      }
    };
    void subscribe();
    return () => abortController.abort();
  }, [client, match, parsedAddress, receipts]);

  const claim = async (matchAccount: GameMatch) => {
    if (!signer) return;
    setError(null);
    try {
      await send({
        instructions: [buildClaimMatchPayoutInstruction(signer, matchAccount)],
      });
      await Promise.all([match.mutate(), receipts.mutate(), game.refresh()]);
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The payout transaction failed.",
      );
    }
  };

  const refund = async (matchAccount: GameMatch) => {
    if (!signer) return;
    setError(null);
    try {
      await send({
        instructions: [buildRefundStaleMatchInstruction(signer, matchAccount)],
      });
      await Promise.all([match.mutate(), receipts.mutate(), game.refresh()]);
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The refund transaction failed.",
      );
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  if (!parsedAddress)
    return (
      <MatchMessage
        title="Invalid match URL"
        copy="The Match address is not a valid Solana address."
      />
    );
  if (match.isLoading || game.catalogue.isLoading)
    return (
      <MatchMessage
        title="Loading battlefield"
        copy="Reading the confirmed Match account and creature catalogue…"
      />
    );
  if (match.error || game.catalogue.error)
    return (
      <MatchMessage
        title="Battlefield unavailable"
        copy="WildQuest could not read this Match from the selected cluster."
      />
    );
  if (!match.data)
    return (
      <MatchMessage
        title="Match not found"
        copy="This Match account does not exist. It may have been removed by a Devnet reset."
      />
    );

  const opponent = unwrapOption(match.data.data.opponent);
  const winner = unwrapOption(match.data.data.winner);
  const playerResult = getPlayerMatchResult({
    status: match.data.data.status,
    player: game.address ?? null,
    opponent,
    winner,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/battle"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.3)] bg-[#1c1810] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#c8a96e] shadow-md transition-all hover:border-[#c8a96e] hover:bg-[#252016]"
        >
          <span>←</span>
          <span>Battle lobby</span>
        </Link>
        <button
          type="button"
          onClick={() => void copyUrl()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.4)] bg-[#221d14] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#c8a96e] shadow-md transition-all hover:border-[#c8a96e] hover:bg-[#2a2218] active:scale-95"
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span>{copied ? "Match link copied" : "Copy match link"}</span>
        </button>
      </div>

      {/* Match Account Header Card */}
      <section className="relative mt-4 overflow-hidden rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6aab7a]">
                Match #{match.data.data.matchId.toString()}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-black text-[#f0e8d4] sm:text-4xl [font-family:var(--font-display)]">
              {playerResult ?? STATUS_LABEL[match.data.data.status]}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(200,169,110,0.35)] bg-[#120f0a] px-3 py-1 text-xs font-black text-[#c8a96e]">
                <span>⚔️</span>
                <span>{STATUS_LABEL[match.data.data.status]}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#120f0a] px-3 py-1 text-xs font-mono font-bold text-[#f0e8d4]">
                <span>✦</span>
                <span>
                  {Number(match.data.data.stakeLamports) / 1_000_000_000} SOL
                  each
                </span>
              </span>
            </div>
          </div>
          <a
            href={`https://explorer.solana.com/address/${match.data.address}?cluster=${cluster}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgba(200,169,110,0.35)] bg-[#1c1810] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#c8a96e] shadow-sm transition-all hover:border-[#c8a96e] hover:bg-[#252016]"
          >
            <span>Match account</span>
            <span>↗</span>
          </a>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <WalletRow
            label="Creator"
            value={match.data.data.creator}
            isConnected={signer?.address === match.data.data.creator}
          />
          <WalletRow
            label="Opponent"
            value={opponent ?? "Waiting…"}
            isConnected={signer?.address === opponent}
            isWaiting={!opponent}
          />
        </dl>
      </section>

      {match.data.data.rulesVersion === 2 &&
      match.data.data.status === MatchStatus.Active ? (
        liveTeams.data ? (
          <LiveBattlefield
            matchAddress={match.data.address}
            wallet={wallet}
            isParticipant={
              signer?.address === match.data.data.creator ||
              signer?.address === opponent
            }
            playerSide={
              signer?.address === match.data.data.creator
                ? "creator"
                : signer?.address === opponent
                  ? "opponent"
                  : null
            }
            creator={liveTeams.data.creator}
            opponent={liveTeams.data.opponent}
            activeExpiresAt={unwrapOption(match.data.data.activeExpiresAt)}
            isSending={isSending}
            onRefund={() => void refund(match.data!)}
          />
        ) : (
          <MatchMessage
            title="Preparing live teams"
            copy={
              liveTeams.error
                ? "The battle creatures or their onchain stats could not be loaded."
                : "Reading the six creature accounts and battle stats…"
            }
          />
        )
      ) : match.data.data.rulesVersion === 2 && opponent ? (
        <TurnBattleResult
          match={match.data}
          wallet={signer?.address ?? null}
          isSending={isSending}
          onClaim={() => void claim(match.data!)}
        />
      ) : (
        <MatchResult
          match={match.data}
          wallet={signer?.address ?? null}
          catalogue={game.catalogue.data ?? []}
          isSending={isSending}
          onClaim={() => void claim(match.data!)}
        />
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-950/60 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Match Transactions / Signed Receipts Card */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent" />
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]">
          Signed Receipts · Onchain Evidence
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#f0e8d4] [font-family:var(--font-display)]">
          Match transactions
        </h2>
        <p className="mt-1 text-sm text-[#a89880]">
          These confirmed signatures touched this Match account. They cover its
          opening, join or settlement, and winner claim when one was required.
        </p>
        {receipts.isLoading ? (
          <p className="mt-5 text-sm text-[#8a7a62]">Loading receipts…</p>
        ) : receipts.error ? (
          <p className="mt-5 text-sm text-destructive">
            Transaction receipts are temporarily unavailable.
          </p>
        ) : receipts.data?.length ? (
          <ol className="mt-5 grid gap-3">
            {receipts.data.map((receipt) => (
              <li key={receipt.signature}>
                <a
                  href={`https://explorer.solana.com/tx/${receipt.signature}?cluster=${cluster}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-[rgba(200,169,110,0.2)] bg-[#14110b] px-4 py-3 shadow-sm transition-all hover:border-[#c8a96e] hover:bg-[#1a150e]"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#f0e8d4]">
                      <span
                        className={
                          receipt.err ? "text-destructive" : "text-emerald-400"
                        }
                      >
                        {receipt.err ? "✕" : "✓"}
                      </span>
                      <span>
                        {receipt.err
                          ? "Failed transaction"
                          : "Confirmed transaction"}
                      </span>
                    </span>
                    <span className="block truncate font-mono text-[10px] text-[#8a7a62]">
                      {receipt.signature}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[#8a7a62]">
                    {receipt.blockTime
                      ? new Date(
                          Number(receipt.blockTime) * 1_000,
                        ).toLocaleString()
                      : `Slot ${receipt.slot.toString()}`}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 text-sm text-[#8a7a62]">
            No transaction receipt is available from this RPC node yet.
          </p>
        )}
      </section>
    </main>
  );
}

function TurnBattleResult({
  match,
  wallet,
  isSending,
  onClaim,
}: {
  match: GameMatch;
  wallet: Address | null;
  isSending: boolean;
  onClaim: () => void;
}) {
  const winner = unwrapOption(match.data.winner);
  const canClaim =
    match.data.status === MatchStatus.Claimable && winner === wallet;
  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-6 text-center shadow-2xl sm:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent" />
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6aab7a]">
        {match.data.turnCount} turns completed
      </p>
      <h2 className="mt-2 text-3xl font-black text-[#f0e8d4] [font-family:var(--font-display)]">
        {winner ? (winner === wallet ? "Victory" : "Battle complete") : "Draw"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-[#a89880]">
        The authoritative server committed the battle result hash onchain. The
        full action log is not trusted as payout authority.
      </p>
      {canClaim ? (
        <button
          type="button"
          onClick={onClaim}
          disabled={isSending}
          className="btn-guild mt-5 inline-flex min-h-12 items-center justify-center px-8 text-xs font-black uppercase tracking-wider text-[#100e09] disabled:opacity-50"
        >
          {isSending ? "Waiting for wallet…" : "Claim 0.02 SOL pot"}
        </button>
      ) : match.data.status === MatchStatus.Claimable ? (
        <p className="mt-5 text-sm font-bold text-[#c8a96e]">
          The recorded winner can claim this pot.
        </p>
      ) : (
        <p className="mt-5 text-sm text-[#8a7a62]">Settlement is complete.</p>
      )}
    </section>
  );
}

function WalletRow({
  label,
  value,
  isConnected,
  isWaiting,
}: {
  label: string;
  value: string | Address;
  isConnected?: boolean;
  isWaiting?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgba(200,169,110,0.2)] bg-[#14110b] p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8a7a62]">
          {label}
        </dt>
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isWaiting
              ? "bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.6)]"
              : isConnected
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                : "bg-[#c8a96e]/60"
          }`}
        />
      </div>
      <dd className="mt-1.5 truncate font-mono text-xs font-bold text-[#f0e8d4]">
        {value}
      </dd>
    </div>
  );
}

function MatchMessage({ title, copy }: { title: string; copy: string }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <section className="relative overflow-hidden rounded-2xl border border-[rgba(200,169,110,0.35)] bg-[rgba(18,16,11,0.95)] p-8 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.5)] to-transparent" />
        <h1 className="text-3xl font-black text-[#f0e8d4] [font-family:var(--font-display)]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#a89880]">{copy}</p>
        <Link
          href="/battle"
          className="btn-guild mt-6 inline-flex min-h-12 items-center justify-center px-6 text-xs font-black uppercase tracking-wider"
        >
          Return to battle lobby
        </Link>
      </section>
    </main>
  );
}
