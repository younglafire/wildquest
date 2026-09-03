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
  IdentifyRequestError,
  type PendingIdentification,
} from "../lib/expedition";
import { buildDiscoveryInstructions } from "../lib/discovery-transaction";
import { useGameData } from "../lib/hooks/use-game-data";
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
  const game = useGameData();
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

    if (!game.player.data?.exists) {
      setError("Create your Explorer Passport before identifying a photo.");
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
      setError(getIdentificationError(thrownObject));
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
      if (!player.exists) {
        setError(
          "Your Explorer Passport is missing. Return home to create it.",
        );
        return;
      }
      const instructions = await buildDiscoveryInstructions(
        signer,
        pending.identification,
        true,
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
      <div className="mx-auto w-full max-w-3xl">
        <CaptureSteps current={isSending ? 4 : 3} />
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_90px_-55px_rgba(0,0,0,0.65)]">
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
                <p className="mt-1 text-sm text-muted">
                  +{result.awarded_xp} XP
                </p>
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
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {result.explanation}
              </p>

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
      </div>
    );
  }

  if (!game.isLoading && !game.player.data?.exists) {
    if (game.player.error) {
      return (
        <section className="mx-auto max-w-2xl rounded-3xl border border-destructive/30 bg-card p-8 text-center">
          <h1 className="text-3xl font-black">Passport unavailable</h1>
          <p className="mt-3 text-sm text-muted">
            WildQuest could not verify your Player account. No photo was
            uploaded or reserved.
          </p>
          <button
            type="button"
            onClick={() => void game.player.mutate()}
            className="mt-6 min-h-12 rounded-xl border border-border px-5 text-sm font-bold"
          >
            Try again
          </button>
        </section>
      );
    }
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center">
        <h1 className="text-3xl font-black">Create your Passport first</h1>
        <p className="mt-3 text-sm text-muted">
          Passport setup must finish before a photo is identified and
          permanently reserved.
        </p>
        <a
          href="/home"
          className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          Create Passport
        </a>
      </section>
    );
  }

  return (
    <>
      <div className="mx-auto mb-5 max-w-2xl">
        <CaptureSteps current={isIdentifying ? 2 : 1} />
      </div>
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

const IDENTIFICATION_ERRORS: Record<string, string> = {
  LOW_CONFIDENCE:
    "The animal was not clear enough to identify. Move closer, keep it centered, and try again.",
  UNSUPPORTED_SPECIES:
    "That animal is outside this expedition's supported species. Try a quest target instead.",
  DUPLICATE_IMAGE:
    "This photo has already been used. Take a new photo of the animal.",
  INVALID_IMAGE:
    "That file could not be decoded as a photo. Choose a different JPEG, PNG, or WebP image.",
  INVALID_WALLET: "Reconnect your Solana wallet before identifying this photo.",
  QUEST_INELIGIBLE:
    "This species is in the field guide but is not eligible for the current photo quest.",
  IMAGE_TOO_LARGE:
    "That photo is too large. Choose an image smaller than 4 MB.",
  UNSUPPORTED_MEDIA_TYPE: "Choose a JPEG, PNG, or WebP photo.",
  DUPLICATE_CHECK_UNAVAILABLE:
    "Duplicate protection is temporarily unavailable. Your photo was not made claimable. Please retry.",
  MODEL_UNAVAILABLE:
    "The identification model is temporarily unavailable. Please retry in a moment.",
};

function getIdentificationError(thrownObject: unknown) {
  if (thrownObject instanceof IdentifyRequestError) {
    return IDENTIFICATION_ERRORS[thrownObject.code] ?? thrownObject.message;
  }
  return thrownObject instanceof Error
    ? thrownObject.message
    : "Identification failed. Please try another photo.";
}

function CaptureSteps({ current }: { current: number }) {
  const steps = ["Select", "Verify", "Review", "Record"];
  return (
    <ol aria-label="Capture progress" className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const position = index + 1;
        return (
          <li
            key={step}
            aria-current={position === current ? "step" : undefined}
            className={`rounded-xl border px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider ${position <= current ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-border bg-card text-muted"}`}
          >
            <span className="block text-sm">{position}</span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
