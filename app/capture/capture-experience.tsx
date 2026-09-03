"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { WalletChooser } from "../components/wallet-chooser";
import { SpeciesArt } from "../components/species-art";
import {
  fetchMaybePlayer,
  fetchDiscovery,
  findDiscoveryPda,
  findPlayerPda,
} from "../generated/wildquest";
import {
  fetchCatalogueSpecies,
  type CatalogueSpecies,
} from "../lib/catalogue-client";
import {
  clearPendingIdentification,
  createPendingIdentification,
  identifyImage,
  loadPendingIdentification,
  proofHashToBytes,
  saveConfirmedDiscovery,
  savePendingIdentification,
  type PendingIdentification,
} from "../lib/expedition";
import { buildDiscoveryInstructions } from "../lib/discovery-transaction";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useSolanaClient } from "../lib/solana-client-context";
import { useWallet } from "../lib/wallet/context";
import { CaptureForm } from "./capture-form";

const GRADE_STYLES = {
  Bronze: "bg-amber-900/15 text-amber-700 dark:text-amber-300",
  Silver: "bg-slate-400/15 text-slate-600 dark:text-slate-300",
  Gold: "bg-yellow-400/15 text-yellow-700 dark:text-yellow-300",
} as const;

export function CaptureExperience() {
  const router = useRouter();
  const client = useSolanaClient();
  const { wallet, signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { mutate } = useSWRConfig();
  const address = wallet?.account.address;
  const [pending, setPending] = useState<PendingIdentification | null>(null);
  const [species, setSpecies] = useState<CatalogueSpecies | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const stored = loadPendingIdentification();
      if (stored && address && stored.wallet !== address) {
        clearPendingIdentification();
        setPending(null);
        return;
      }
      setPending(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!pending) return;

    let cancelled = false;
    void fetchCatalogueSpecies(pending.identification.species_id)
      .then((catalogueSpecies) => {
        if (!cancelled) setSpecies(catalogueSpecies);
      })
      .catch(() => {
        if (!cancelled) setSpecies(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pending]);

  const handleIdentify = async (file: File) => {
    if (!address || status !== "connected") {
      setChooserOpen(true);
      return;
    }

    setError(null);
    setIsIdentifying(true);
    try {
      const identification = await identifyImage(file, address);
      const nextPending = createPendingIdentification(address, identification);
      savePendingIdentification(nextPending);
      setPending(nextPending);
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "Identification failed. Please try another photo.",
      );
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleRecord = async () => {
    if (!pending || !address || !signer || pending.wallet !== address) {
      setError("Reconnect the wallet that identified this discovery.");
      return;
    }

    setError(null);
    try {
      const proofHash = proofHashToBytes(pending.identification.proof_hash);
      const [playerAddress] = await findPlayerPda({ payer: address });
      const player = await fetchMaybePlayer(client.rpc, playerAddress);
      const instructions = await buildDiscoveryInstructions(
        signer,
        pending.identification,
        player.exists,
      );

      const transactionSignature = await send({ instructions });
      saveConfirmedDiscovery(pending, transactionSignature);
      try {
        const [discoveryAddress] = await findDiscoveryPda({
          payer: address,
          proofHash,
        });
        const discovery = await fetchDiscovery(client.rpc, discoveryAddress, {
          commitment: "confirmed",
        });
        await mutate(
          ["player-discoveries", "devnet", address],
          (current = []) => [
            ...current.filter(
              (item: typeof discovery) => item.address !== discovery.address,
            ),
            discovery,
          ],
          { revalidate: false },
        );
      } catch {
        // The confirmed result stored in sessionStorage seeds the collection
        // while its onchain query catches up.
      }
      router.push(
        `/discovery/confirmed?signature=${encodeURIComponent(transactionSignature)}`,
      );
    } catch (thrownObject) {
      setError(
        thrownObject instanceof Error
          ? thrownObject.message
          : "The transaction could not be confirmed. You can safely retry.",
      );
    }
  };

  if (pending) {
    const result = pending.identification;
    return (
      <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_90px_-55px_rgba(0,0,0,0.65)]">
        <div className="grid md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative flex min-h-64 items-end overflow-hidden bg-cream p-6">
            <SpeciesArt
              src={species?.imageUrl ?? species?.iconUrl}
              alt={result.common_name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative text-white">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Verified discovery
              </p>
              <p className="mt-3 text-5xl font-black tracking-tight">
                {result.grade}
              </p>
              <p className="mt-1 text-sm text-muted">+{result.awarded_xp} XP</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${GRADE_STYLES[result.grade]}`}
              >
                {result.grade} capture
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                {result.rarity}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight">
              {result.common_name}
            </h1>
            {species?.scientificName && (
              <p className="mt-1 text-sm italic text-muted">
                {species.scientificName}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-cream p-4">
                <dt className="text-xs text-muted">Confidence</dt>
                <dd className="mt-1 text-xl font-black tabular-nums">
                  {(result.confidence * 100).toFixed(1)}%
                </dd>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <dt className="text-xs text-muted">Reward</dt>
                <dd className="mt-1 text-xl font-black tabular-nums">
                  {result.awarded_xp} XP
                </dd>
              </div>
            </dl>

            <blockquote className="mt-5 border-l-2 border-foreground pl-4 text-sm leading-relaxed text-muted">
              {result.facts[0] ?? result.explanation}
            </blockquote>

            {error && (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={isSending}
              onClick={handleRecord}
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSending ? "Confirming on Devnet…" : "Record on Solana"}
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => {
                clearPendingIdentification();
                setPending(null);
                setSpecies(null);
                setError(null);
              }}
              className="mt-3 w-full py-2 text-xs font-medium text-muted transition hover:text-foreground disabled:opacity-50"
            >
              Discard result and capture another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <CaptureForm onIdentify={handleIdentify} isIdentifying={isIdentifying} />
      {error && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-2xl rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <WalletChooser open={chooserOpen} onOpenChange={setChooserOpen} />
    </>
  );
}
