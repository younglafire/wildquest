"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletChooser } from "../components/wallet-chooser";
import { CreatureCard } from "../components/creature-card";
import { CreatureHologramStage } from "../components/creature-hologram-stage";
import {
  fetchMaybeSpeciesConfig,
  findSpeciesConfigPda,
  type SpeciesConfig,
} from "../generated/wildquest";
import {
  fetchCatalogueSpecies,
  type CatalogueSpecies,
} from "../lib/catalogue-client";
import { getSpeciesArtworkUrl } from "../lib/species";
import {
  clearPendingIdentification,
  createPendingIdentification,
  identifyImage,
  loadPendingIdentification,
  savePendingIdentification,
  saveConfirmedDiscovery,
  IdentifyRequestError,
  type PendingIdentification,
} from "../lib/expedition";
import { useWallet } from "../lib/wallet/context";
import { useSubmitCaptureTransaction } from "../lib/hooks/use-submit-capture-transaction";
import { useGameData } from "../lib/hooks/use-game-data";
import { useSolanaClient } from "../lib/solana-client-context";
import { CaptureForm } from "./capture-form";

export function CaptureExperience() {
  const { wallet, status } = useWallet();
  const router = useRouter();
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

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const stored = loadPendingIdentification();
      if (stored && address && stored.wallet !== address) {
        clearPendingIdentification();
        setPending(null);
      } else if (stored) {
        setPending(stored);
      }
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
      saveConfirmedDiscovery(pending, signature);
      await game.refresh();
      router.replace(`/collection/${pending.identification.species_id}`);
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
      <div className="capture-result-backdrop fixed inset-0 z-50 overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] md:static md:overflow-visible md:p-0">
        <section
          aria-labelledby="capture-result-heading"
          className="capture-result-panel mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] sm:rounded-3xl"
          style={{
            background: "#1c1810",
            border: "1px solid #3a2e1e",
            boxShadow: "0 24px 90px -55px rgba(0,0,0,0.8)",
          }}
        >
          <div className="grid md:grid-cols-[1fr_1fr]">
            <div
              className="capture-result-stage relative flex min-h-[31rem] flex-col justify-between overflow-hidden p-4 sm:p-5"
              style={{
                background: "#100e09",
                borderRight: "1px solid #3a2e1e",
              }}
            >
              {/* Status Header Badge */}
              <div className="flex items-center justify-end gap-2 z-10">
                <p className="wax-badge wax-badge-forest">Capture confirmed</p>
              </div>

              {/* 3D Hologram Card */}
              <div className="capture-card-arrival my-2 flex w-full items-center justify-center">
                <CreatureHologramStage
                  speciesId={result.species_id}
                  speciesName={result.common_name}
                  catalogueId={result.catalogue_id}
                  rarity={result.rarity}
                  role={species?.battleRole}
                  imageUrl={
                    species?.imageUrl ??
                    getSpeciesArtworkUrl(result.species_id) ??
                    species?.iconUrl
                  }
                  confidence={result.confidence}
                  stats={battleStats}
                  summary={species?.cardSummary ?? species?.description}
                  habitat={species?.habitat}
                />
              </div>

              <div className="relative text-[#f0e8d4] pt-2 border-t border-[#3a2e1e]/60">
                <p
                  className="text-2xl font-black tracking-tight sm:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#f0e8d4",
                  }}
                >
                  You captured
                </p>
                <p
                  className="mt-0.5 text-xs sm:text-sm"
                  style={{ color: "#8a7a62" }}
                >
                  Catalogue #{result.catalogue_id}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="wax-badge wax-badge-forest">
                  ResNet Class {result.model_class_id}
                </span>
                <span
                  className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    border: "1px solid #3a2e1e",
                    color: "#8a7a62",
                    background: "#100e09",
                  }}
                >
                  {result.rarity}
                </span>
              </div>

              <h1
                id="capture-result-heading"
                className="mt-4 text-3xl font-black tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                {result.common_name}!
              </h1>
              {species?.scientificName && (
                <p
                  className="mt-1 text-xs italic sm:text-sm"
                  style={{ color: "#8a7a62" }}
                >
                  {species.scientificName}
                </p>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
                <div
                  className="rounded-xl p-3 text-center sm:p-4 sm:text-left"
                  style={{ background: "#100e09", border: "1px solid #3a2e1e" }}
                >
                  <dt
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      color: "#8a7a62",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Confidence
                  </dt>
                  <dd
                    className="mt-1 text-lg font-black tabular-nums sm:text-xl"
                    style={{ color: "#c8a96e", fontFamily: "var(--font-mono)" }}
                  >
                    {(result.confidence * 100).toFixed(1)}%
                  </dd>
                </div>
                <div
                  className="rounded-xl p-3 text-center sm:p-4 sm:text-left"
                  style={{ background: "#100e09", border: "1px solid #3a2e1e" }}
                >
                  <dt
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      color: "#8a7a62",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Balance Version
                  </dt>
                  <dd
                    className="mt-1 text-lg font-black tabular-nums sm:text-xl"
                    style={{ color: "#c8a96e", fontFamily: "var(--font-mono)" }}
                  >
                    v{result.balance_version}
                  </dd>
                </div>
              </dl>

              <p
                className="mt-3 text-xs"
                style={{ color: "#8a7a62", fontFamily: "var(--font-mono)" }}
              >
                Model label: {result.model_label}
              </p>

              <div
                className="mt-4 rounded-xl p-3.5 text-xs leading-relaxed sm:text-sm"
                style={{
                  background: "rgba(200,169,110,0.06)",
                  border: "1px solid rgba(200,169,110,0.15)",
                  color: "#8a7a62",
                }}
              >
                One wallet approval creates your Creature account on Solana
                Devnet. You can own this exact catalogue creature only once.
              </div>

              {alreadyOwned && (
                <p
                  role="status"
                  className="mt-4 rounded-xl p-3.5 text-xs font-semibold sm:text-sm"
                  style={{
                    background: "rgba(200,169,110,0.12)",
                    color: "#e0c58a",
                    border: "1px solid rgba(200,169,110,0.3)",
                  }}
                >
                  You already own this exact Creature. One wallet can own each
                  catalogue species only once.
                </p>
              )}

              {species && battleStats && (
                <div className="creature-reveal mt-5">
                  <p
                    className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      color: "#6aab7a",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    ✦ Your battle card preview
                  </p>
                  <CreatureCard species={species} stats={battleStats} />
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl p-3.5 text-xs font-semibold sm:text-sm"
                  style={{
                    background: "rgba(192,57,43,0.12)",
                    color: "#f8c8c4",
                    border: "1px solid rgba(192,57,43,0.3)",
                  }}
                >
                  {error}
                </p>
              )}

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => void handleOwnCreature()}
                  disabled={isSubmitting || alreadyOwned}
                  className="btn-guild w-full"
                >
                  {alreadyOwned
                    ? "Already owned"
                    : submitStage === "signing"
                      ? "Approve in wallet…"
                      : submitStage === "confirming"
                        ? "Submitted · confirming…"
                        : "✦ Own this Creature"}
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
                  className="flex min-h-12 w-full items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    border: "1px solid #3a2e1e",
                    color: "#8a7a62",
                    background: "transparent",
                  }}
                >
                  Retake photo
                </button>
              </div>
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
      <CaptureForm
        onIdentify={handleIdentify}
        onReset={() => setError(null)}
        isIdentifying={isIdentifying}
        identificationError={error}
      />
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
    "That exact animal class is not enabled for the current battle roster.",
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
  const messages = getErrorMessages(thrownObject);
  const message =
    messages.at(-1) ?? "The Creature transaction could not be completed.";
  const normalized = messages.join(" ").toLowerCase();
  if (normalized.includes("reject") || normalized.includes("declin")) {
    return "You rejected the wallet request. Your identified Creature is saved here so you can try again.";
  }
  if (
    normalized.includes("already in use") ||
    normalized.includes("already exists") ||
    normalized.includes("already initialized")
  ) {
    return "You already own this exact Creature. Choose another supported species.";
  }
  if (normalized.includes("insufficient funds")) {
    return "Your wallet does not have enough Devnet SOL to create the Creature account.";
  }
  return message;
}

function getErrorMessages(thrownObject: unknown): Array<string> {
  const messages: Array<string> = [];
  const visited = new Set<unknown>();
  let current: unknown = thrownObject;
  while (current && !visited.has(current)) {
    visited.add(current);
    if (current instanceof Error && current.message) {
      messages.push(current.message);
      current = current.cause;
      continue;
    }
    if (typeof current === "object" && "cause" in current) {
      current = current.cause;
      continue;
    }
    break;
  }
  return messages;
}

function CaptureSteps({ current }: { current: number }) {
  const steps = ["Select", "Verify", "Result"];
  return (
    <ol aria-label="Capture progress" className="grid grid-cols-3 gap-2">
      {steps.map((step, index) => {
        const position = index + 1;
        const active = position <= current;
        return (
          <li
            key={step}
            aria-current={position === current ? "step" : undefined}
            className="rounded-xl px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "var(--font-display)",
              border: active
                ? "1px solid rgba(200,169,110,0.5)"
                : "1px solid #3a2e1e",
              background: active ? "rgba(200,169,110,0.12)" : "#1c1810",
              color: active ? "#c8a96e" : "#8a7a62",
            }}
          >
            <span className="block text-sm font-black">{position}</span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
