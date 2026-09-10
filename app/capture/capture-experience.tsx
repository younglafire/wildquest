"use client";

import { useEffect, useState } from "react";
import { WalletChooser } from "../components/wallet-chooser";
import { SpeciesArt } from "../components/species-art";
import { CreatureCard } from "../components/creature-card";
import {
  fetchMaybeSpeciesConfig,
  findSpeciesConfigPda,
  type SpeciesConfig,
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
  savePendingIdentification,
  IdentifyRequestError,
  type PendingIdentification,
} from "../lib/expedition";
import { useWallet } from "../lib/wallet/context";
import { useSubmitCaptureTransaction } from "../lib/hooks/use-submit-capture-transaction";
import { useGameData } from "../lib/hooks/use-game-data";
import { useCluster } from "../components/cluster-context";
import { useSolanaClient } from "../lib/solana-client-context";
import Link from "next/link";
import { CaptureForm } from "./capture-form";

export function CaptureExperience() {
  const { wallet, status } = useWallet();
  const { cluster } = useCluster();
  const game = useGameData();
  const client = useSolanaClient();
  const {
    submit,
    isSubmitting,
    stage: submitStage,
  } = useSubmitCaptureTransaction();
  const address = wallet?.account.address;
  const [pending, setPending] = useState<PendingIdentification | null>(null);
  const [species, setSpecies] = useState<CatalogueSpecies | null>(null);
  const [battleStats, setBattleStats] = useState<SpeciesConfig | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [captureSignature, setCaptureSignature] = useState<string | null>(null);

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
    void Promise.all([
      fetchCatalogueSpecies(pending.identification.species_id),
      findSpeciesConfigPda({
        catalogueId: BigInt(pending.identification.catalogue_id),
      }).then(([configAddress]) =>
        fetchMaybeSpeciesConfig(client.rpc, configAddress, {
          commitment: "confirmed",
        }),
      ),
    ])
      .then(([catalogueSpecies, config]) => {
        if (!cancelled) {
          setSpecies(catalogueSpecies);
          setBattleStats(config.exists ? config.data : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpecies(null);
          setBattleStats(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client.rpc, pending]);

  const handleIdentify = async (file: File) => {
    if (!address || status !== "connected") {
      setChooserOpen(true);
      return;
    }

    setError(null);
    setIsIdentifying(true);
    try {
      const { identification, captureTransaction } = await identifyImage(
        file,
        address,
      );
      const nextPending = createPendingIdentification(
        address,
        identification,
        captureTransaction,
      );
      savePendingIdentification(nextPending);
      setPending(nextPending);
    } catch (thrownObject) {
      setError(getIdentificationError(thrownObject));
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleOwnCreature = async () => {
    if (!pending) return;
    setError(null);
    try {
      const signature = await submit(pending.captureTransaction);
      setCaptureSignature(signature);
      clearPendingIdentification();
      await game.refresh();
    } catch (thrownObject) {
      setError(getCaptureTransactionError(thrownObject));
    }
  };

  if (pending) {
    const result = pending.identification;
    const alreadyOwned = (game.creatures.data ?? []).some(
      (creature) => creature.data.catalogueId === BigInt(result.catalogue_id),
    );
    return (
      <div className="mx-auto w-full max-w-3xl">
        <CaptureSteps current={3} />
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
                  Creature identified
                </p>
                <p className="mt-3 text-5xl font-black tracking-tight">
                  Exact match
                </p>
                <p className="mt-1 text-sm text-muted">
                  Catalogue #{result.catalogue_id}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  ResNet class {result.model_class_id}
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
                  <dt className="text-xs text-muted">Balance version</dt>
                  <dd className="mt-1 text-xl font-black tabular-nums">
                    v{result.balance_version}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-muted">
                Model label: {result.model_label}
              </p>

              <div className="mt-5 rounded-xl border border-border bg-cream p-4 text-sm text-muted">
                One wallet approval creates your Creature account on Solana
                Devnet. You can own this exact catalogue creature only once.
              </div>

              {alreadyOwned && (
                <p
                  role="status"
                  className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm font-semibold text-amber-800 dark:text-amber-200"
                >
                  You already own this exact Creature. One wallet can own each
                  catalogue species only once.
                </p>
              )}

              {species && battleStats && (
                <div className="creature-reveal mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    Your battle card
                  </p>
                  <CreatureCard species={species} stats={battleStats} />
                </div>
              )}

              {error && (
                <p role="alert" className="mt-5 text-sm text-destructive">
                  {error}
                </p>
              )}

              {captureSignature ? (
                <div className="mt-6 space-y-3">
                  <p
                    role="status"
                    className="text-sm font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    Creature owned. Add it to your battle team.
                  </p>
                  <Link
                    href="/battle"
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                  >
                    Build battle team
                  </Link>
                  <a
                    href={`https://explorer.solana.com/tx/${captureSignature}?cluster=${cluster}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-center text-sm font-semibold underline"
                  >
                    View transaction
                  </a>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleOwnCreature()}
                    disabled={isSubmitting || alreadyOwned}
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {alreadyOwned
                      ? "Already owned"
                      : submitStage === "signing"
                        ? "Approve in wallet…"
                        : submitStage === "confirming"
                          ? "Submitted · confirming…"
                          : "Own this Creature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearPendingIdentification();
                      setPending(null);
                      setSpecies(null);
                      setBattleStats(null);
                      setError(null);
                    }}
                    className="flex min-h-12 w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold"
                  >
                    Retake photo
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
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
  CAPTURE_INELIGIBLE:
    "That exact animal class is not enabled for the six-creature battle slice.",
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

export function getCaptureTransactionError(thrownObject: unknown) {
  const message =
    thrownObject instanceof Error
      ? thrownObject.message
      : "The Creature transaction could not be completed.";
  const normalized = message.toLowerCase();
  if (normalized.includes("reject") || normalized.includes("declin")) {
    return "You rejected the wallet request. Your identified Creature is saved here so you can try again.";
  }
  if (
    normalized.includes("already in use") ||
    normalized.includes("already exists")
  ) {
    return "You already own this exact Creature. Choose another supported species.";
  }
  return message;
}

function CaptureSteps({ current }: { current: number }) {
  const steps = ["Select", "Verify", "Result"];
  return (
    <ol aria-label="Capture progress" className="grid grid-cols-3 gap-2">
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
