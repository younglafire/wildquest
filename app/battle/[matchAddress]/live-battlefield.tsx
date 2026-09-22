"use client";

import { useEffect, useState } from "react";
import type { Address } from "@solana/kit";
import type { BattleRoomSnapshot } from "../../lib/battle-room";
import type { BattleCreature } from "../../lib/battle-creatures";
import { useBattleRoom } from "../../lib/hooks/use-battle-room";
import { canUseAction } from "../../lib/simultaneous-battle";
import { creatureAbility } from "../../lib/creature-abilities";
import type { WalletSession } from "../../lib/wallet/types";
import { SpeciesArt } from "../../components/species-art";

export function LiveBattlefield({
  matchAddress,
  wallet,
  isParticipant,
  playerSide,
  creator,
  opponent,
  activeExpiresAt,
  isSending,
  onRefund,
}: {
  matchAddress: Address;
  wallet: WalletSession | undefined;
  isParticipant: boolean;
  playerSide: "creator" | "opponent" | null;
  creator: BattleCreature[];
  opponent: BattleCreature[];
  activeExpiresAt: bigint | null;
  isSending: boolean;
  onRefund: () => void;
}) {
  const { snapshot, status, error, choose } = useBattleRoom({
    matchAddress,
    wallet,
    isParticipant,
  });
  const [now, setNow] = useState(0);
  const [showAbilityModal, setShowAbilityModal] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, []);

  const seconds = snapshot?.deadline
    ? Math.max(0, (snapshot.deadline - now) / 1_000).toFixed(1)
    : null;

  if (!snapshot) {
    return (
      <section className="mt-6 rounded-3xl border border-[#3a2e1e] bg-[#16130d] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c8a96e]/40 bg-[#221d14] shadow-[0_0_20px_rgba(200,169,110,0.2)]">
          <span className="animate-spin text-2xl">⚔</span>
        </div>
        <h2 className="mt-4 text-2xl font-black text-[#f0e8d4]">
          Connecting to live battlefield
        </h2>
        <p className="mt-2 text-sm text-[#8a7a62]">
          {error ?? "Loading the authoritative match clock and both teams…"}
        </p>
      </section>
    );
  }

  const creatorFighter =
    snapshot.battle.creator.fighters[snapshot.battle.creator.activeSlot];
  const opponentFighter =
    snapshot.battle.opponent.fighters[snapshot.battle.opponent.activeSlot];
  const ownFighter =
    playerSide === "opponent" ? opponentFighter : creatorFighter;
  const enemyFighter =
    playerSide === "opponent" ? creatorFighter : opponentFighter;
  const ownTeam = playerSide === "opponent" ? opponent : creator;
  const enemyTeam = playerSide === "opponent" ? creator : opponent;
  const ownSlot =
    playerSide === "opponent"
      ? snapshot.battle.opponent.activeSlot
      : snapshot.battle.creator.activeSlot;
  const enemySlot =
    playerSide === "opponent"
      ? snapshot.battle.creator.activeSlot
      : snapshot.battle.opponent.activeSlot;
  const ownLocked =
    playerSide === "opponent"
      ? snapshot.opponentLocked
      : snapshot.creatorLocked;
  const latestEvent = snapshot.events.at(-1);
  const ownAction =
    playerSide === "opponent"
      ? latestEvent?.opponentAction
      : latestEvent?.creatorAction;
  const enemyAction =
    playerSide === "opponent"
      ? latestEvent?.creatorAction
      : latestEvent?.opponentAction;

  const isResolving = snapshot.phase === "resolving";
  const ownDamageTaken =
    isResolving && latestEvent
      ? playerSide === "opponent"
        ? latestEvent.damageToOpponent
        : latestEvent.damageToCreator
      : 0;
  const enemyDamageTaken =
    isResolving && latestEvent
      ? playerSide === "opponent"
        ? latestEvent.damageToCreator
        : latestEvent.damageToOpponent
      : 0;

  const ownGuarded =
    (ownFighter?.currentGuard ?? 0) > 0 ||
    (isResolving &&
      Boolean(
        playerSide === "opponent"
          ? latestEvent?.opponentGuard && latestEvent.opponentGuard > 0
          : latestEvent?.creatorGuard && latestEvent.creatorGuard > 0,
      ));

  const enemyGuarded =
    (enemyFighter?.currentGuard ?? 0) > 0 ||
    (isResolving &&
      Boolean(
        playerSide === "opponent"
          ? latestEvent?.creatorGuard && latestEvent.creatorGuard > 0
          : latestEvent?.opponentGuard && latestEvent.opponentGuard > 0,
      ));

  const stateMessage = getStateMessage({
    snapshot,
    status,
    ownLocked,
    playerSide,
  });

  const numericSeconds = seconds !== null ? parseFloat(seconds) : null;
  const isUrgentTimer = numericSeconds !== null && numericSeconds <= 2.0;
  const activeAbility = ownFighter
    ? creatureAbility(ownFighter.stats.abilityId)
    : null;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-[#3a2e1e] bg-gradient-to-b from-[#1a150e] via-[#120f0a] to-[#0a0805] p-4 shadow-2xl sm:p-6 md:p-8">
      {/* 1. TOP HUD / MATCH CLOCK */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3a2e1e]/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8a96e]/30 bg-[#221d14] text-[#c8a96e] shadow-inner">
            <span className="text-lg">⚔</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Turn {snapshot.battle.turn} · {snapshot.phase}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-[#8a7a62] font-medium sm:text-sm">
              {stateMessage}
            </p>
          </div>
        </div>

        {/* Tactical Countdown Timer HUD */}
        <div className="flex items-center gap-3">
          <div
            className={`relative flex items-center justify-center rounded-2xl border px-4 py-2 font-mono text-xl font-black transition-all ${
              isUrgentTimer
                ? "border-red-500 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                : "border-[#c8a96e]/40 bg-[#221d14] text-[#f0e8d4] shadow-inner"
            }`}
            aria-live="polite"
          >
            {seconds ?? "Resolving"}
          </div>
        </div>
      </div>

      {/* 2. 3D CARD ARENA COLOSSEUM */}
      <div className="relative mt-6 [perspective:1200px]">
        {/* Arena floor background aura */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(200,169,110,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          {/* Opponent Active Card & Bench */}
          <TeamPanel
            team={enemyTeam}
            activeSlot={enemySlot}
            fighter={enemyFighter}
            side={playerSide ? "Opponent" : "Opponent team"}
            action={isResolving ? enemyAction : undefined}
            isResolving={isResolving}
            isOpponentSide={true}
            damageTaken={enemyDamageTaken}
            isGuarded={enemyGuarded}
          />

          {/* Center VS Clash Emblem */}
          <div className="flex flex-col items-center justify-center py-2 md:py-0">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#c8a96e]/40 bg-[#1c1810] shadow-[0_0_18px_rgba(200,169,110,0.25)] sm:h-14 sm:w-14">
              <span className="font-mono text-sm font-black tracking-widest text-[#c8a96e] sm:text-base">
                VS
              </span>
              {isResolving && (
                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-60" />
              )}
            </div>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#8a7a62]">
              Round {snapshot.battle.turn}
            </span>
          </div>

          {/* Player Active Card & Bench */}
          <TeamPanel
            team={ownTeam}
            activeSlot={ownSlot}
            fighter={ownFighter}
            side={playerSide ? "Your creature" : "Creator team"}
            action={isResolving ? ownAction : undefined}
            isResolving={isResolving}
            isOpponentSide={false}
            damageTaken={ownDamageTaken}
            isGuarded={ownGuarded}
          />
        </div>
      </div>

      {/* 3. TACTICAL ACTION TRAY (4 BUTTONS) */}
      {playerSide && (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-6 rounded-2xl border border-[#3a2e1e] bg-[#16130d]/95 p-3 shadow-2xl backdrop-blur-md md:static md:p-4">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#c8a96e]">
                Tactical Orders · Turn {snapshot.battle.turn}
              </span>
            </div>
            {ownFighter && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-sky-400">
                  ✦ {ownFighter.mana} / {ownFighter.stats.maxMana} Mana
                </span>
                {activeAbility && (
                  <button
                    type="button"
                    disabled={ownLocked}
                    onClick={() => setShowAbilityModal(true)}
                    className="rounded-md border border-[#c8a96e]/40 bg-[#221d14] px-1.5 py-0.5 text-[10px] font-bold text-[#c8a96e] hover:bg-[#c8a96e]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="View Ability Details"
                  >
                    ⓘ Ability
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {(["strike", "guard", "ability", "recharge"] as const).map(
              (action) => {
                const isStrike = action === "strike";
                const isGuard = action === "guard";
                const isAbility = action === "ability";
                const isRecharge = action === "recharge";

                const strikeCost = ownFighter?.stats.strikeCost ?? 0;
                const guardCost = ownFighter?.stats.guardCost ?? 0;
                const abilityCost = ownFighter?.stats.abilityCost ?? 0;
                const rechargeGain = ownFighter?.stats.rechargeGain ?? 0;

                const costText = isStrike
                  ? `⚔ Strike · ${strikeCost}`
                  : isGuard
                    ? `◆ Guard · ${guardCost}`
                    : isAbility
                      ? `${creatureAbility(ownFighter?.stats.abilityId ?? 1).name} · ${abilityCost}`
                      : `✦ Recharge · +${rechargeGain}`;

                const isDisabled =
                  status !== "authenticated" ||
                  snapshot.phase !== "choosing" ||
                  ownLocked ||
                  !ownFighter ||
                  !canUseAction(ownFighter, action);

                return (
                  <button
                    key={action}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => choose(action)}
                    className={`min-h-14 relative flex flex-col justify-center rounded-xl border p-2.5 text-left font-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed motion-reduce:transition-none sm:text-sm ${
                      isStrike
                        ? "border-red-950/80 bg-gradient-to-br from-[#2b1214] to-[#1a0c0e] text-red-100 hover:border-red-500/70 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                        : isGuard
                          ? "border-sky-950/80 bg-gradient-to-br from-[#101e2c] to-[#0a121c] text-sky-100 hover:border-sky-400/70 hover:shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                          : isAbility
                            ? "border-violet-950/80 bg-gradient-to-br from-[#241334] to-[#140b1e] text-violet-100 hover:border-violet-400/70 hover:shadow-[0_0_12px_rgba(167,139,250,0.25)]"
                            : "border-amber-950/80 bg-gradient-to-br from-[#2c200c] to-[#1a1306] text-amber-100 hover:border-amber-400/70 hover:shadow-[0_0_12px_rgba(252,211,77,0.25)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-black sm:text-sm">
                        {costText}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[10px] font-medium text-white/50">
                      {isStrike && "DEF-mitigated DMG"}
                      {isGuard && "1-turn shield"}
                      {isAbility && "Unique combat skill"}
                      {isRecharge && `Gain +${rechargeGain} mana`}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* 4. PLAYER READY INDICATORS */}
      <div
        className="mt-4 flex justify-between border-t border-[#3a2e1e]/40 pt-3 text-xs text-[#8a7a62]"
        aria-live="polite"
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              snapshot.creatorLocked
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                : "bg-[#8a7a62]/50"
            }`}
          />
          <span>
            {snapshot.creatorLocked ? "Creator ready" : "Creator choosing"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              snapshot.opponentLocked
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                : "bg-[#8a7a62]/50"
            }`}
          />
          <span>
            {snapshot.opponentLocked ? "Opponent ready" : "Opponent choosing"}
          </span>
        </div>
      </div>

      {/* 5. ERROR & REFUND HANDLERS */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {snapshot.settlementStatus === "failed" && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/40 p-3 text-sm text-amber-300"
        >
          Result settlement is retrying automatically. Players can use the stale
          refund after the onchain deadline if it never succeeds.
        </p>
      )}
      {activeExpiresAt !== null &&
        now >= Number(activeExpiresAt) * 1_000 &&
        playerSide && (
          <button
            type="button"
            onClick={onRefund}
            disabled={isSending}
            className="mt-4 min-h-12 w-full rounded-xl border border-destructive bg-destructive/10 px-4 text-sm font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            {isSending ? "Waiting for wallet…" : "Refund expired match"}
          </button>
        )}

      {/* 6. ABILITY DETAIL MODAL */}
      {showAbilityModal && activeAbility && ownFighter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowAbilityModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-[#c8a96e]/40 bg-[#1c1810] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#c8a96e]">
                  Active Ability · ID #{ownFighter.stats.abilityId}
                </span>
                <h3 className="mt-1 text-xl font-black text-[#f0e8d4]">
                  {activeAbility.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAbilityModal(false)}
                className="rounded-full border border-white/10 bg-white/5 p-1 text-sm text-[#8a7a62] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-white/5 bg-[#120f0a] p-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-[#8a7a62]">Mana Cost:</span>
                <span className="font-mono font-black text-sky-400">
                  ✦ {ownFighter.stats.abilityCost} Mana
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#f0e8d4]">
                {activeAbility.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAbilityModal(false)}
              className="mt-5 min-h-11 w-full rounded-xl border border-[#c8a96e] bg-[#c8a96e] py-2 text-sm font-black text-[#100e09] transition active:scale-95"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TeamPanel({
  team,
  activeSlot,
  fighter,
  side,
  action,
  isResolving,
  isOpponentSide,
  damageTaken,
  isGuarded,
}: {
  team: BattleCreature[];
  activeSlot: number;
  fighter:
    | {
        currentHp: number;
        mana: number;
        currentGuard?: number;
        stats: { hp: number; maxMana: number; abilityId?: number };
      }
    | undefined;
  side: string;
  action: "strike" | "guard" | "ability" | "recharge" | undefined;
  isResolving: boolean;
  isOpponentSide: boolean;
  damageTaken: number;
  isGuarded: boolean;
}) {
  return (
    <div className="flex flex-col">
      <CombatCard
        creature={team[activeSlot]}
        fighter={fighter}
        side={side}
        action={action}
        isResolving={isResolving}
        isOpponentSide={isOpponentSide}
        damageTaken={damageTaken}
        isGuarded={isGuarded}
      />
      {/* 3v3 Reserve Squad / Bench Bar */}
      <div className="mt-3 flex gap-2" aria-label={`${side} bench`}>
        {team.map((creature, index) => {
          const isActive = index === activeSlot;
          const isFallen = index < activeSlot;
          return (
            <div
              key={creature.creature.address}
              className={`relative h-12 flex-1 overflow-hidden rounded-xl border transition-all ${
                isActive
                  ? "border-[#c8a96e] bg-[#221d14] shadow-[0_0_10px_rgba(200,169,110,0.35)] ring-1 ring-[#c8a96e]/50"
                  : isFallen
                    ? "border-red-950/40 bg-black/40 grayscale opacity-40"
                    : "border-[#3a2e1e] bg-[#18140e] opacity-75 hover:opacity-100"
              }`}
              title={`${creature.species?.name ?? `Creature #${index + 1}`} (Slot ${index + 1})`}
            >
              <SpeciesArt
                src={creature.species?.imageUrl ?? creature.species?.iconUrl}
                alt={creature.species?.name ?? `Creature slot ${index + 1}`}
                className={
                  creature.species?.imageUrl &&
                  !creature.species.imageUrl.endsWith(".svg")
                    ? "object-cover"
                    : "object-contain p-1"
                }
              />
              <span
                className={`absolute bottom-0 right-0 rounded-tl px-1.5 py-0.2 text-[9px] font-black ${
                  isActive
                    ? "bg-[#c8a96e] text-[#100e09]"
                    : isFallen
                      ? "bg-red-900/80 text-white"
                      : "bg-black/75 text-[#8a7a62]"
                }`}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStateMessage({
  snapshot,
  status,
  ownLocked,
  playerSide,
}: {
  snapshot: BattleRoomSnapshot;
  status: ReturnType<typeof useBattleRoom>["status"];
  ownLocked: boolean;
  playerSide: "creator" | "opponent" | null;
}) {
  if (status === "reconnecting") return "Connection lost. Rejoining this turn…";
  if (!playerSide) return "Spectator mode · live authoritative state";
  if (snapshot.phase === "waiting")
    return "Waiting for the other player to connect";
  if (snapshot.phase === "finished") {
    if (snapshot.settlementStatus === "pending")
      return "Battle finished · recording result on Solana";
    if (snapshot.settlementStatus === "confirmed")
      return "Battle finished · result confirmed";
    return snapshot.battle.outcome === "tie"
      ? "Draw"
      : snapshot.battle.outcome === playerSide
        ? "Victory"
        : "Defeat";
  }
  if (snapshot.phase === "resolving") return "Resolving both actions";
  if (ownLocked) return "Choice locked · waiting for opponent";
  return "Choose before the server timer reaches zero";
}

function CombatCard({
  creature,
  fighter,
  side,
  action,
  isResolving,
  isOpponentSide,
  damageTaken,
  isGuarded,
}: {
  creature: BattleCreature | undefined;
  fighter:
    | {
        currentHp: number;
        mana: number;
        currentGuard?: number;
        stats: { hp: number; maxMana: number; abilityId?: number };
      }
    | undefined;
  side: string;
  action: "strike" | "guard" | "ability" | "recharge" | undefined;
  isResolving: boolean;
  isOpponentSide: boolean;
  damageTaken: number;
  isGuarded: boolean;
}) {
  const hp = fighter
    ? Math.round((fighter.currentHp / fighter.stats.hp) * 100)
    : 0;
  const currentMana = fighter?.mana ?? 0;
  const maxMana = fighter?.stats.maxMana ?? 5;

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${
        hp === 0 ? "grayscale opacity-50" : ""
      } ${
        isResolving
          ? isOpponentSide
            ? "animate-arena-clash-left"
            : "animate-arena-clash-right"
          : ""
      } ${
        action === "strike"
          ? "scale-[1.02] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
          : action === "guard"
            ? "ring-2 ring-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
            : action === "ability"
              ? "ring-2 ring-violet-400 shadow-[0_0_25px_rgba(167,139,250,0.35)]"
              : action === "recharge"
                ? "ring-2 ring-amber-300 shadow-[0_0_25px_rgba(252,211,77,0.35)]"
                : "border-[#3a2e1e] bg-[#18140e] shadow-xl"
      }`}
      style={{
        background:
          "linear-gradient(165deg, #201b13 0%, #16120c 60%, #0d0a07 100%)",
      }}
    >
      {/* Hexagonal Guard Energy Shield Overlay */}
      {isGuarded && hp > 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-3xl border-2 border-sky-400/80 bg-sky-500/10 animate-hex-shield">
          <div className="flex items-center gap-1.5 rounded-full border border-sky-400/80 bg-sky-950/90 px-3 py-1 text-xs font-black text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.6)] backdrop-blur-sm">
            <span>🛡️</span>
            <span>GUARD ACTIVE</span>
          </div>
        </div>
      )}

      {/* Floating Combat Damage Numbers */}
      {isResolving && damageTaken > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-30 animate-float-damage text-3xl font-black text-red-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          -{damageTaken} HP
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a7a62]">
            {side}
          </p>
          <h3 className="mt-0.5 text-lg font-black text-[#f0e8d4] sm:text-xl">
            {creature?.species?.name ?? "Unknown creature"}
          </h3>
        </div>
        {creature?.species?.battleRole && (
          <span className="rounded-full border border-[#c8a96e]/30 bg-[#120f0a] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c8a96e]">
            {creature.species.battleRole}
          </span>
        )}
      </div>

      {/* Creature Artwork Display */}
      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#120f0a] sm:h-36">
        <SpeciesArt
          src={creature?.species?.imageUrl ?? creature?.species?.iconUrl}
          alt={creature?.species?.name ?? "Creature art"}
          className={
            creature?.species?.imageUrl &&
            !creature.species.imageUrl.endsWith(".svg")
              ? "object-cover"
              : "object-contain p-3"
          }
        />
        {/* Subtle vignette gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120f0a]/80 via-transparent to-transparent" />
      </div>

      {/* Health Bar (Maintains Accessibility & Test Contracts) */}
      <div
        className="mt-4 h-3.5 overflow-hidden rounded-full border border-white/5 bg-black/40 p-0.5"
        role="progressbar"
        aria-label={`${side} health`}
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${
            hp > 50
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : hp > 25
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"
          }`}
          style={{ width: `${hp}%` }}
        />
      </div>

      {/* HP & Mana Numbers */}
      <div className="mt-2 flex justify-between text-xs font-bold text-[#f0e8d4]">
        <span className="flex items-center gap-1">
          <span className="text-emerald-400">♥</span>
          HP {fighter?.currentHp ?? 0}/{fighter?.stats.hp ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-sky-400">✦</span>
          Mana {fighter?.mana ?? 0}/{fighter?.stats.maxMana ?? 0}
        </span>
      </div>

      {/* Visual Mana Crystals Row */}
      <div
        className="mt-2 flex items-center gap-1.5"
        aria-label={`${side} mana crystals`}
      >
        {Array.from({ length: maxMana }).map((_, i) => {
          const isFilled = i < currentMana;
          return (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-sm transition-all duration-300 ${
                isFilled
                  ? "bg-gradient-to-t from-sky-500 to-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.7)] animate-mana-spark"
                  : "border border-sky-900/30 bg-sky-950/30"
              }`}
              title={`Mana socket ${i + 1}`}
            />
          );
        })}
      </div>
    </article>
  );
}
