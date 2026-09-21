"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  findGameConfigPda,
  findMatchAccountPda,
  MatchStatus,
} from "../generated/wildquest";
import { BattlePlayback } from "./battle-playback";
import { CreatureModelCard } from "../components/creature-model-card";
import { useCluster } from "../components/cluster-context";
import {
  fetchMatchBattleCreatures,
  fetchOwnedBattleCatalogue,
  hasCurrentBattleBalance,
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
import { buildUpgradeCreatureBalanceInstruction } from "../lib/creatures";

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
      fetchOwnedBattleCatalogue(
        client.rpc,
        creatures,
        game.catalogue.data ?? [],
      ),
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
  const selectedOutdated = selected.some((creature) => {
    const card = cardsByAddress.get(creature.address);
    return card ? !hasCurrentBattleBalance(creature, card) : true;
  });

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
  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const [dragPreviewCard, setDragPreviewCard] = useState<BattleCreature | null>(
    null,
  );

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

  const handleCardPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    card: BattleCreature,
    creatureAddress: string,
    isDraggable: boolean,
  ) => {
    if (!isDraggable) return;
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;
    let hoveredSlotIndex: number | null = null;
    const targetEl = e.currentTarget;

    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback if pointer capture fails
    }

    const getSlotAtPoint = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        const el = slotRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
          ) {
            return i;
          }
        }
      }
      return null;
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
      if (!isDragging && dist > 8) {
        isDragging = true;
        setDragPreviewCard(card);
      }

      if (isDragging && dragPreviewRef.current) {
        dragPreviewRef.current.style.display = "block";
        dragPreviewRef.current.style.transform = `translate3d(${moveEvent.clientX}px, ${moveEvent.clientY}px, 0) translate(-50%, -50%) rotate(4deg) scale(0.9)`;

        const currentSlot = getSlotAtPoint(
          moveEvent.clientX,
          moveEvent.clientY,
        );
        if (currentSlot !== hoveredSlotIndex) {
          if (hoveredSlotIndex !== null && slotRefs.current[hoveredSlotIndex]) {
            slotRefs.current[hoveredSlotIndex]?.classList.remove(
              "slot-drag-over",
            );
          }
          hoveredSlotIndex = currentSlot;
          if (hoveredSlotIndex !== null && slotRefs.current[hoveredSlotIndex]) {
            slotRefs.current[hoveredSlotIndex]?.classList.add("slot-drag-over");
          }
        }
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      targetEl.removeEventListener("pointermove", onPointerMove);
      targetEl.removeEventListener("pointerup", onPointerUp);
      targetEl.removeEventListener("pointercancel", onPointerUp);

      try {
        targetEl.releasePointerCapture(upEvent.pointerId);
      } catch {
        // Safe fallback
      }

      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.display = "none";
      }

      if (hoveredSlotIndex !== null && slotRefs.current[hoveredSlotIndex]) {
        slotRefs.current[hoveredSlotIndex]?.classList.remove("slot-drag-over");
      }

      if (isDragging) {
        if (hoveredSlotIndex !== null) {
          place(hoveredSlotIndex, creatureAddress);
        }
        setDragPreviewCard(null);
      } else {
        // Simple tap or click
        setArmed((curr) => (curr === creatureAddress ? null : creatureAddress));
      }
    };

    targetEl.addEventListener("pointermove", onPointerMove);
    targetEl.addEventListener("pointerup", onPointerUp);
    targetEl.addEventListener("pointercancel", onPointerUp);
  };

  const createMatch = () =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      if (selectedOutdated) {
        throw new Error("Upgrade selected Creatures before entering battle.");
      }
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
      if (selectedOutdated) {
        throw new Error("Upgrade selected Creatures before entering battle.");
      }
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
  const upgradeCreature = (
    creature: OwnedCreature,
    config: BattleCreature["config"],
  ) =>
    run(async () => {
      if (!signer) throw new Error("Connect your wallet first.");
      const [gameConfig] = await findGameConfigPda();
      const signature = await send({
        instructions: [
          buildUpgradeCreatureBalanceInstruction(
            signer,
            gameConfig,
            config,
            creature,
          ),
        ],
      });
      await battleCreatures.mutate();
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
    <main className="mx-auto max-w-6xl px-3.5 pb-24 pt-4 sm:px-6 sm:pt-14">
      <section
        className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.85) 0%, rgba(18, 16, 11, 0.98) 75%)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200, 169, 110, 0.25)",
        }}
      >
        {/* Top gold hairline */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.8)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <div
          className="relative inline-flex min-h-9 sm:min-h-10 items-center justify-center px-6 sm:px-8 py-1 sm:py-1.5 select-none"
          style={{
            backgroundImage: "url('/ui/tag_frame.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span
            className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ⚔️ SOLANA DEVNET ARENA ⚔️
          </span>
        </div>

        <h1
          className="mt-3 text-2xl font-black tracking-tight sm:mt-4 sm:text-5xl"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          Build your team
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed sm:mt-3 sm:text-sm text-[#a89880]">
          Choose three different Creatures in order. Tap a card then a slot.
          Every match stakes 0.01 SOL.
        </p>

        {creatures.length < 3 ? (
          <div
            className="relative mt-5 overflow-hidden rounded-xl p-5 sm:mt-7 sm:p-6"
            style={{
              background: "rgba(14, 12, 8, 0.95)",
              border: "1px solid rgba(200, 169, 110, 0.3)",
              boxShadow: "inset 0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            <h2
              className="font-black text-sm sm:text-base"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              You need three Creatures
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#a89880]">
              You currently own {creatures.length}. Capture more exact supported
              species first.
            </p>
            <Link
              href="/capture"
              aria-label="Hunt & Capture"
              className="group relative mt-4 inline-flex cursor-pointer items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              style={{
                filter:
                  "drop-shadow(0 10px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 16px rgba(52,211,153,0.25))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/hunt_capture.png"
                alt="Hunt & Capture"
                width={260}
                height={78}
                className="h-auto w-52 sm:w-60 select-none object-contain transition-all duration-200 group-hover:brightness-120 group-hover:drop-shadow-[0_0_28px_rgba(52,211,153,0.7)]"
                draggable={false}
              />
            </Link>
          </div>
        ) : battleCreatures.isLoading ? (
          <p className="mt-5 text-sm sm:mt-7 text-[#a89880]">
            Loading verified onchain stats…
          </p>
        ) : battleCreatures.error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl p-4 text-sm sm:mt-7"
            style={{
              background: "rgba(192,57,43,0.15)",
              color: "#f8c8c4",
              border: "1px solid rgba(192,57,43,0.3)",
            }}
          >
            Creature stats could not be loaded.
          </p>
        ) : (
          <>
            {/* 3 Team Slots side-by-side on mobile and desktop */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
              {slots.map((slot, index) => {
                const card = cardsByAddress.get(slot);
                return (
                  <div
                    key={index}
                    ref={(el) => {
                      slotRefs.current[index] = el;
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      card
                        ? `Remove ${card.species?.name ?? "Creature"} from slot ${index + 1}`
                        : `Place selected Creature in slot ${index + 1}`
                    }
                    onClick={() => {
                      if (card) {
                        place(index, "");
                      } else if (armed) {
                        place(index, armed);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (card) {
                          place(index, "");
                        } else if (armed) {
                          place(index, armed);
                        }
                      }
                    }}
                    className="battle-slot group relative min-h-32 cursor-pointer select-none rounded-2xl text-left transition-all duration-200 sm:min-h-44 active:scale-95"
                    style={{
                      border: card
                        ? "none"
                        : "2px dashed rgba(200, 169, 110, 0.35)",
                      background: card
                        ? "transparent"
                        : "rgba(14, 12, 8, 0.95)",
                      boxShadow: card
                        ? "none"
                        : "inset 0 4px 16px rgba(0,0,0,0.6)",
                    }}
                  >
                    {card ? (
                      <div className="pointer-events-none h-full w-full">
                        <CreatureModelCard
                          creature={card}
                          compact
                          slotIndex={index + 1}
                        />
                      </div>
                    ) : (
                      <div className="pointer-events-none flex min-h-28 flex-col items-center justify-center p-1 sm:min-h-40">
                        <span className="text-2xl font-light text-[#c8a96e]/60 transition-colors group-hover:text-[#c8a96e] sm:text-4xl">
                          +
                        </span>
                        <span
                          className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#c8a96e] sm:text-[10px]"
                          style={{
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {`Slot ${index + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p
              className="mt-5 text-[10px] font-bold uppercase tracking-wider sm:mt-6 text-[#c8a96e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Creature Cards{" "}
              {armed
                ? "(Tap a slot above to place)"
                : "(Drag or tap to place in slot)"}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {(battleCreatures.data ?? []).map((card) => {
                const creatureAddress = card.creature.address;
                const creature = creatures.find(
                  (item) => item.address === creatureAddress,
                );
                const needsUpgrade =
                  !creature || !hasCurrentBattleBalance(creature, card);
                const used = slots.includes(creatureAddress);
                const isDraggable = !used && !needsUpgrade;
                return (
                  <div key={creatureAddress} className="flex flex-col gap-1.5">
                    <div
                      role="button"
                      tabIndex={isDraggable ? 0 : -1}
                      aria-pressed={armed === creatureAddress}
                      aria-disabled={!isDraggable}
                      onPointerDown={(event) =>
                        handleCardPointerDown(
                          event,
                          card,
                          creatureAddress,
                          isDraggable,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          (event.key === "Enter" || event.key === " ") &&
                          isDraggable
                        ) {
                          event.preventDefault();
                          setArmed((value) =>
                            value === creatureAddress ? null : creatureAddress,
                          );
                        }
                      }}
                      className={`touch-none rounded-2xl text-left select-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 transition-all ${
                        isDraggable
                          ? "cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(52,211,153,0.25)]"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <CreatureModelCard
                        creature={card}
                        compact
                        selected={armed === creatureAddress}
                        disabled={used || needsUpgrade}
                        disabledBadge={
                          needsUpgrade ? "UPGRADE" : used ? "IN TEAM" : null
                        }
                      />
                    </div>
                    {needsUpgrade && creature ? (
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() =>
                          void upgradeCreature(creature, card.config)
                        }
                        aria-label={
                          isSending
                            ? "Waiting for upgrade…"
                            : "Upgrade Creature for battle"
                        }
                        className="group relative mt-1 flex cursor-pointer items-center justify-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          filter:
                            "drop-shadow(0 4px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 8px rgba(200,169,110,0.3))",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/ui/upgrade.png"
                          alt="Upgrade"
                          width={180}
                          height={54}
                          className="h-auto w-full select-none object-contain transition-all duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_14px_rgba(200,169,110,0.65)]"
                          draggable={false}
                        />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl p-3 text-xs sm:mt-5 sm:p-4 sm:text-sm"
            style={{
              background: "rgba(192,57,43,0.15)",
              color: "#f8c8c4",
              border: "1px solid rgba(192,57,43,0.3)",
            }}
          >
            {error}
          </p>
        )}
        {creatures.length >= 3 && (
          <div className="mt-7 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => void createMatch()}
              disabled={selected.length !== 3 || selectedOutdated || isSending}
              aria-label={
                isSending
                  ? "Waiting for wallet…"
                  : "Open Arena Match · Stake 0.01 SOL"
              }
              className="group relative inline-flex cursor-pointer items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                filter:
                  "drop-shadow(0 14px 32px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(52,211,153,0.35))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/open_arena_match.png"
                alt="Open Arena Match"
                width={360}
                height={108}
                className="h-auto w-72 sm:w-80 md:w-96 select-none object-contain transition-all duration-200 group-hover:brightness-120 group-hover:drop-shadow-[0_0_32px_rgba(52,211,153,0.7)]"
                draggable={false}
              />
              {isSending && (
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/65 backdrop-blur-xs text-xs font-black uppercase tracking-widest text-[#f0e8d4]">
                  Waiting for wallet…
                </span>
              )}
            </button>
            <p className="mt-2.5 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#c8a96e]/80">
              Stake 0.01 SOL on Solana Devnet
            </p>
          </div>
        )}
      </section>

      {lastMatchAddress && (
        <section ref={arenaRef} className="scroll-mt-24">
          {activeMatch.isLoading || !resultMatch ? (
            <p
              className="mt-6 rounded-2xl p-5 text-sm text-[#a89880]"
              style={{
                background: "rgba(18, 16, 11, 0.9)",
                border: "1px solid rgba(200, 169, 110, 0.3)",
              }}
            >
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
          className="mt-3 inline-flex min-h-12 items-center text-sm font-bold text-[#c8a96e] underline hover:text-[#f0e8d4]"
        >
          View latest transaction on Explorer ↗
        </a>
      )}

      <section
        className="relative mt-4 overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(18, 16, 11, 0.92)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow:
            "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Match Lobby
            </p>
            <h2
              className="mt-2 text-2xl font-black"
              style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
            >
              Challenges
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void matches.mutate()}
            className="min-h-10 rounded-lg px-4 text-[11px] font-bold uppercase tracking-wider transition-colors"
            style={{
              border: "1px solid rgba(200, 169, 110, 0.35)",
              color: "#c8a96e",
              fontFamily: "var(--font-display)",
              background: "rgba(200, 169, 110, 0.08)",
            }}
          >
            Refresh
          </button>
        </div>
        {matches.isLoading ? (
          <p className="mt-6 text-sm text-[#a89880]">Loading matches…</p>
        ) : matches.error ? (
          <p className="mt-6 text-sm" style={{ color: "#f8c8c4" }}>
            The Devnet match lobby is unavailable.
          </p>
        ) : relevantMatches.length === 0 ? (
          <p
            className="mt-6 rounded-xl p-5 text-sm"
            style={{
              background: "rgba(14, 12, 8, 0.95)",
              color: "#8a7a62",
              border: "1px solid rgba(200, 169, 110, 0.2)",
            }}
          >
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
                  className="flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: "rgba(14, 12, 8, 0.95)",
                    border: mine
                      ? "1px solid rgba(200,169,110,0.4)"
                      : "1px solid rgba(200,169,110,0.2)",
                    borderLeft: mine
                      ? "3px solid #c8a96e"
                      : "3px solid rgba(200,169,110,0.4)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="relative inline-flex min-h-7 items-center justify-center px-4 py-0.5 select-none"
                        style={{
                          backgroundImage: "url('/ui/tag_frame.png')",
                          backgroundSize: "100% 100%",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <span
                          className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {STATUS_LABEL[match.data.status]}
                        </span>
                      </div>
                      {mine && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide text-[#c8a96e]"
                          style={{
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          Your match
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-3 text-sm font-bold"
                      style={{ color: "#f0e8d4" }}
                    >
                      3 Creatures ·{" "}
                      {Number(match.data.stakeLamports) / 1_000_000_000} SOL
                      stake
                    </p>
                    <p
                      className="mt-1 max-w-sm truncate text-[10px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "#8a7a62",
                      }}
                    >
                      {match.data.creator}
                    </p>
                  </div>
                  {claimable ? (
                    <Link
                      href={`/match/${match.address}`}
                      className="btn-guild min-h-11 px-5 text-xs font-black uppercase tracking-wider"
                    >
                      Watch result
                    </Link>
                  ) : mine ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/match/${match.address}`}
                        className="btn-guild min-h-11 px-5 text-xs font-black uppercase tracking-wider"
                      >
                        Open battlefield
                      </Link>
                      <button
                        type="button"
                        onClick={() => void cancelMatch(match)}
                        disabled={isSending}
                        className="min-h-11 rounded-lg px-4 text-xs font-bold text-[#a89880] hover:text-[#f0e8d4] disabled:opacity-50"
                        style={{
                          border: "1px solid rgba(200, 169, 110, 0.25)",
                          background: "transparent",
                        }}
                      >
                        Cancel and refund
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void joinMatch(match)}
                      disabled={isSending || selected.length !== 3}
                      className="btn-guild min-h-11 px-5 text-xs font-black uppercase tracking-wider"
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
        className="relative mt-4 scroll-mt-24 overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(18, 16, 11, 0.92)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow:
            "0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200, 169, 110, 0.15)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-[#c8a96e]/40 select-none pointer-events-none">
          ❖
        </span>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c8a96e]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Onchain History
        </p>
        <h2
          className="mt-2 text-2xl font-black"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          Your matches
        </h2>
        <p className="mt-2 text-sm text-[#a89880]">
          Every row links to the Match account, deterministic replay, and its
          signed transaction receipts.
        </p>
        {matches.isLoading ? (
          <p className="mt-6 text-sm text-[#a89880]">Loading history…</p>
        ) : playerHistory.length === 0 ? (
          <p
            className="mt-6 rounded-xl p-5 text-sm"
            style={{
              background: "rgba(14, 12, 8, 0.95)",
              color: "#8a7a62",
              border: "1px solid rgba(200, 169, 110, 0.2)",
            }}
          >
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
              const isWin = result === "Won";
              return (
                <Link
                  key={match.address}
                  href={`/match/${match.address}`}
                  className="rounded-xl p-5 transition-all hover:scale-[1.01]"
                  style={{
                    background: "rgba(14, 12, 8, 0.95)",
                    border: "1px solid rgba(200, 169, 110, 0.3)",
                    borderLeft: isWin
                      ? "3px solid #c8a96e"
                      : "3px solid rgba(200, 169, 110, 0.35)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="font-black"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: isWin ? "#c8a96e" : "#f0e8d4",
                      }}
                    >
                      {result}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-bold"
                      style={{
                        background: "rgba(18, 16, 11, 0.9)",
                        color: "#c8a96e",
                        border: "1px solid rgba(200, 169, 110, 0.2)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {STATUS_LABEL[match.data.status]}
                    </span>
                  </div>
                  <p
                    className="mt-3 text-sm"
                    style={{
                      color: "#8a7a62",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                    }}
                  >
                    {new Date(
                      Number(match.data.createdAt) * 1_000,
                    ).toLocaleString()}
                  </p>
                  <p
                    className="mt-2 truncate text-[10px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "rgba(138,122,98,0.6)",
                    }}
                  >
                    {match.address}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Card Drag Preview */}
      <div
        ref={dragPreviewRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden select-none"
        style={{
          width: "135px",
          filter:
            "drop-shadow(0 20px 36px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(52,211,153,0.6))",
          willChange: "transform",
        }}
      >
        {dragPreviewCard && (
          <CreatureModelCard creature={dragPreviewCard} compact />
        )}
      </div>
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
        match.data.rulesVersion !== 2 ||
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
      <section
        className="relative mt-6 overflow-hidden rounded-2xl p-6 text-center sm:p-10"
        style={{
          background: "rgba(18, 16, 11, 0.95)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a89880]">
          Match cancelled
        </p>
        <h2
          className="mt-3 text-3xl font-black text-[#f0e8d4]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stake refunded
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#8a7a62]">
          No opponent joined this challenge. The creator recovered the opening
          stake.
        </p>
      </section>
    );
  if (!opponent)
    return (
      <section
        className="relative mt-6 overflow-hidden rounded-2xl p-6 text-center sm:p-10"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(26, 56, 36, 0.75) 0%, rgba(18, 16, 11, 0.98) 75%)",
          border: "1px solid rgba(200, 169, 110, 0.35)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,110,0.6)] to-transparent pointer-events-none" />
        <p
          className="text-xs font-bold uppercase tracking-[0.22em] text-[#6aab7a]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ✦ Shared battlefield ✦
        </p>
        <h2
          className="mt-3 text-3xl font-black text-[#f0e8d4]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Waiting for an opponent
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#a89880]">
          Keep this battlefield open. It starts for both players as soon as the
          joining transaction is confirmed.
        </p>
        <p className="mt-5 break-all font-mono text-[10px] text-[#8a7a62]">
          {match.address}
        </p>
      </section>
    );
  if (details.isLoading)
    return (
      <p
        className="mt-6 rounded-2xl p-5 text-sm text-[#a89880]"
        style={{
          background: "rgba(18, 16, 11, 0.9)",
          border: "1px solid rgba(200, 169, 110, 0.3)",
        }}
      >
        Preparing deterministic replay…
      </p>
    );
  if (details.error || !details.data)
    return (
      <p
        role="alert"
        className="mt-6 rounded-2xl p-5 text-sm"
        style={{
          background: "rgba(192,57,43,0.15)",
          color: "#f8c8c4",
          border: "1px solid rgba(192,57,43,0.3)",
        }}
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
