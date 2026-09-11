"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { address, unwrapOption, type Address } from "@solana/kit";
import useSWR from "swr";
import { fetchMaybeMatch, MatchStatus } from "../../generated/wildquest";
import { MatchResult } from "../battle-content";
import { useCluster } from "../../components/cluster-context";
import { useGameData } from "../../lib/hooks/use-game-data";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import {
  buildClaimMatchPayoutInstruction,
  type GameMatch,
} from "../../lib/matches";
import { useSolanaClient } from "../../lib/solana-client-context";
import { useWallet } from "../../lib/wallet/context";

const STATUS_LABEL: Record<MatchStatus, string> = {
  [MatchStatus.Open]: "Waiting for opponent",
  [MatchStatus.Claimable]: "Payout ready",
  [MatchStatus.Settled]: "Settled",
  [MatchStatus.Cancelled]: "Cancelled",
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
  const { signer } = useWallet();
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
  const playerResult =
    !game.address || !opponent
      ? null
      : winner === game.address
        ? "Victory"
        : winner === null
          ? "Draw"
          : "Defeat";

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-6 sm:pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/battle"
          className="min-h-12 py-3 text-sm font-bold underline"
        >
          ← Battle lobby
        </Link>
        <button
          type="button"
          onClick={() => void copyUrl()}
          className="min-h-12 rounded-xl border border-border px-5 text-sm font-bold"
        >
          {copied ? "Match link copied" : "Copy match link"}
        </button>
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
              Match #{match.data.data.matchId.toString()}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {playerResult ?? STATUS_LABEL[match.data.data.status]}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {STATUS_LABEL[match.data.data.status]} ·{" "}
              {Number(match.data.data.stakeLamports) / 1_000_000_000} SOL each
            </p>
          </div>
          <a
            href={`https://explorer.solana.com/address/${match.data.address}?cluster=${cluster}`}
            target="_blank"
            rel="noreferrer"
            className="min-h-12 rounded-xl border border-border px-5 py-3 text-sm font-bold"
          >
            Match account ↗
          </a>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <WalletRow label="Creator" value={match.data.data.creator} />
          <WalletRow label="Opponent" value={opponent ?? "Waiting…"} />
        </dl>
      </section>

      <MatchResult
        match={match.data}
        wallet={signer?.address ?? null}
        catalogue={game.catalogue.data ?? []}
        isSending={isSending}
        onClaim={() => void claim(match.data!)}
      />

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
          Signed receipts
        </p>
        <h2 className="mt-2 text-2xl font-black">Match transactions</h2>
        <p className="mt-2 text-sm text-muted">
          These confirmed signatures touched this Match account. They cover its
          opening, join or settlement, and winner claim when one was required.
        </p>
        {receipts.isLoading ? (
          <p className="mt-5 text-sm text-muted">Loading receipts…</p>
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
                  className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 hover:border-emerald-500"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {receipt.err
                        ? "Failed transaction"
                        : "Confirmed transaction"}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-muted">
                      {receipt.signature}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
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
          <p className="mt-5 text-sm text-muted">
            No transaction receipt is available from this RPC node yet.
          </p>
        )}
      </section>
    </main>
  );
}

function WalletRow({
  label,
  value,
}: {
  label: string;
  value: string | Address;
}) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-1 truncate font-mono text-xs">{value}</dd>
    </div>
  );
}

function MatchMessage({ title, copy }: { title: string; copy: string }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <section className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-muted">{copy}</p>
        <Link
          href="/battle"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          Return to battle lobby
        </Link>
      </section>
    </main>
  );
}
