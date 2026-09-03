"use client";

import { useWallet } from "../lib/wallet/context";

type WalletChooserProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
};

export function WalletChooser({
  open,
  onOpenChange,
  onConnected,
}: WalletChooserProps) {
  const { connectors, connect, status, error } = useWallet();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-dialog-title"
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Solana Devnet
            </p>
            <h2 id="wallet-dialog-title" className="mt-1 text-2xl font-black">
              Choose your wallet
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close wallet chooser"
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your wallet owns your onchain discoveries, XP, and collection.
        </p>

        <div className="mt-5 space-y-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              type="button"
              disabled={status === "connecting"}
              onClick={async () => {
                try {
                  await connect(connector.id);
                  onOpenChange(false);
                  onConnected?.();
                } catch {
                  // WalletContext exposes the connection error below.
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-semibold transition hover:bg-cream disabled:pointer-events-none disabled:opacity-50"
            >
              {connector.icon ? (
                // Wallet icons are supplied by the installed wallet extension.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={connector.icon}
                  alt=""
                  className="h-7 w-7 rounded-lg"
                />
              ) : (
                <span className="h-7 w-7 rounded-lg bg-cream" />
              )}
              {connector.name}
            </button>
          ))}
        </div>

        {connectors.length === 0 && (
          <p className="mt-5 rounded-xl bg-cream p-4 text-sm text-muted">
            No Solana wallet was detected. Install a Wallet Standard compatible
            wallet and refresh the page.
          </p>
        )}
        {status === "connecting" && (
          <p className="mt-4 text-sm text-muted">Waiting for your wallet…</p>
        )}
        {error != null && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </p>
        )}
      </section>
    </div>
  );
}
