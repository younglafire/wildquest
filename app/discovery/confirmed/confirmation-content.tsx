"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useCluster } from "../../components/cluster-context";
import { ProgressBar } from "../../components/progress-bar";
import {
  loadConfirmedDiscovery,
  parseTransactionSignature,
} from "../../lib/expedition";
import { useGameData } from "../../lib/hooks/use-game-data";
import { useSolanaClient } from "../../lib/solana-client-context";

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const client = useSolanaClient();
  const { cluster, getExplorerUrl } = useCluster();
  const game = useGameData();
  const transactionSignature = parseTransactionSignature(
    searchParams.get("signature"),
  );
  const confirmed = loadConfirmedDiscovery();
  const transactionStatus = useSWR(
    transactionSignature
      ? ["transaction-status", cluster, transactionSignature]
      : null,
    async () =>
      (await client.rpc.getSignatureStatuses([transactionSignature!]).send())
        .value[0],
    {
      refreshInterval: (status) =>
        status?.confirmationStatus === "confirmed" ||
        status?.confirmationStatus === "finalized" ||
        status?.err
          ? 0
          : 3_000,
    },
  );

  if (!transactionSignature) {
    return (
      <ConfirmationMessage
        title="No valid transaction found"
        copy="Return home or open your collection to continue the expedition."
      />
    );
  }

  const matchesStoredResult =
    confirmed?.signature === transactionSignature &&
    confirmed.wallet === game.address;
  const identification = matchesStoredResult ? confirmed.identification : null;
  const failed = Boolean(transactionStatus.data?.err);
  const isConfirmed =
    transactionStatus.data?.confirmationStatus === "confirmed" ||
    transactionStatus.data?.confirmationStatus === "finalized";
  const questProgress = game.activeQuestProgress;

  if (failed) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-destructive/30 bg-card p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-destructive">
          Transaction failed
        </p>
        <h1 className="mt-3 text-3xl font-black">Discovery was not recorded</h1>
        <p className="mt-3 text-sm text-muted">
          Your pending identification is still available if the wallet can
          safely retry.
        </p>
        <Link
          href="/capture"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          Return to capture
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 text-center shadow-[0_24px_90px_-55px_rgba(0,0,0,0.7)] sm:p-10">
      <span
        aria-hidden="true"
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${isConfirmed ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-cream text-muted"}`}
      >
        {isConfirmed ? "✓" : "…"}
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-muted">
        {isConfirmed
          ? "Solana Devnet confirmed"
          : "Submitted · confirmation pending"}
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">
        {isConfirmed ? "Discovery recorded" : "Waiting for the network"}
      </h1>
      {identification && (
        <p className="mt-3 text-base text-muted">
          {identification.common_name}{" "}
          {isConfirmed
            ? "joined your Collection."
            : "will join your Collection after confirmation."}
        </p>
      )}

      {isConfirmed && game.player.data?.exists && (
        <div className="mt-7 rounded-2xl bg-cream p-5 text-left">
          <div className="flex items-center justify-between">
            <p className="font-black">
              Level {game.player.data.data.level.toString()}
            </p>
            <p className="text-xs text-muted">
              {game.player.data.data.xp.toString()} total XP
            </p>
          </div>
          {game.playerProgress && (
            <div className="mt-4">
              <ProgressBar
                value={game.playerProgress.percentage}
                label={`${game.playerProgress.currentLevelXp.toString()} / 100 XP to next level`}
              />
            </div>
          )}
          {questProgress && (
            <p className="mt-4 text-xs text-muted">
              Active quest: {questProgress.label}
            </p>
          )}
        </div>
      )}

      <Link
        href="/home"
        className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
      >
        Continue expedition
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/collection"
          className="flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-cream"
        >
          View collection
        </Link>
        <Link
          href="/capture"
          className="flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-cream"
        >
          Capture another
        </Link>
      </div>
      <details className="mt-5 rounded-xl border border-border text-left">
        <summary className="cursor-pointer px-4 py-3 text-xs font-bold">
          Transaction details
        </summary>
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted">Signature</p>
          <p className="mt-1 break-all font-mono text-xs">
            {transactionSignature}
          </p>
          {identification && (
            <>
              <p className="mt-4 text-xs text-muted">Image proof</p>
              <p className="mt-1 break-all font-mono text-xs">
                {identification.proof_hash}
              </p>
            </>
          )}
          <a
            href={getExplorerUrl(`/tx/${transactionSignature}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-12 items-center text-xs font-bold underline"
          >
            View exact transaction on Explorer ↗
          </a>
        </div>
      </details>
    </section>
  );
}

function ConfirmationMessage({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-sm text-muted">{copy}</p>
      <Link
        href="/home"
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Return home
      </Link>
    </section>
  );
}
