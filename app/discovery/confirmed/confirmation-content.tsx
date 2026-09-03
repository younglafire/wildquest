"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getExplorerUrl } from "../../lib/explorer";
import {
  loadConfirmedDiscovery,
  parseTransactionSignature,
} from "../../lib/expedition";

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const transactionSignature = parseTransactionSignature(
    searchParams.get("signature"),
  );
  const confirmed = loadConfirmedDiscovery();

  if (!transactionSignature) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-destructive">
          Invalid confirmation
        </p>
        <h1 className="mt-3 text-3xl font-black">No valid transaction found</h1>
        <p className="mt-3 text-sm text-muted">
          Return to your collection or capture another discovery.
        </p>
        <Link
          href="/collection"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          View collection
        </Link>
      </section>
    );
  }

  const matchesStoredResult = confirmed?.signature === transactionSignature;
  const identification = matchesStoredResult ? confirmed.identification : null;

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 text-center shadow-[0_24px_90px_-55px_rgba(0,0,0,0.7)] sm:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600 dark:text-emerald-300">
        ✓
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-muted">
        Solana Devnet confirmed
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">
        Discovery recorded
      </h1>
      {identification && (
        <p className="mt-3 text-base text-muted">
          {identification.common_name} joined your collection and awarded{" "}
          <strong className="text-foreground">
            {identification.awarded_xp} XP
          </strong>
          .
        </p>
      )}

      <div className="mt-6 rounded-xl bg-cream p-4 text-left">
        <p className="text-xs text-muted">Transaction signature</p>
        <p className="mt-1 break-all font-mono text-xs">
          {transactionSignature}
        </p>
      </div>

      <a
        href={getExplorerUrl(`/tx/${transactionSignature}`, "devnet")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        View on Solana Explorer
      </a>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/collection"
          className="rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-cream"
        >
          View collection
        </Link>
        <Link
          href="/capture"
          className="rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-cream"
        >
          Capture another
        </Link>
      </div>
    </section>
  );
}
