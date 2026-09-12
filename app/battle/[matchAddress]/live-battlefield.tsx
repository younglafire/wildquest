"use client";

import { useEffect, useState } from "react";
import type { Address } from "@solana/kit";
import type { BattleRoomSnapshot } from "../../lib/battle-room";
import type { BattleCreature } from "../../lib/battle-creatures";
import { useBattleRoom } from "../../lib/hooks/use-battle-room";
import { canUseAction } from "../../lib/simultaneous-battle";
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
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = snapshot?.deadline
    ? Math.max(0, (snapshot.deadline - now) / 1_000).toFixed(1)
    : null;

  if (!snapshot) {
    return (
      <section className="mt-6 rounded-3xl border border-border bg-card p-8 text-center">
        <h2 className="text-2xl font-black">Connecting to live battlefield</h2>
        <p className="mt-2 text-sm text-muted">
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
  const stateMessage = getStateMessage({
    snapshot,
    status,
    ownLocked,
    playerSide,
  });
  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-4 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Turn {snapshot.battle.turn} · {snapshot.phase}
          </p>
          <p className="mt-1 text-sm text-muted">{stateMessage}</p>
        </div>
        <div
          className="rounded-full bg-cream px-4 py-2 font-mono text-lg font-black"
          aria-live="polite"
        >
          {seconds ?? "Resolving"}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TeamPanel
          team={enemyTeam}
          activeSlot={enemySlot}
          fighter={enemyFighter}
          side={playerSide ? "Opponent" : "Opponent team"}
          action={snapshot.phase === "resolving" ? enemyAction : undefined}
        />
        <TeamPanel
          team={ownTeam}
          activeSlot={ownSlot}
          fighter={ownFighter}
          side={playerSide ? "Your creature" : "Creator team"}
          action={snapshot.phase === "resolving" ? ownAction : undefined}
        />
      </div>

      {playerSide && (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-card/95 p-2 backdrop-blur md:static md:p-0">
          {(["strike", "guard", "recharge"] as const).map((action) => (
            <button
              key={action}
              type="button"
              disabled={
                status !== "authenticated" ||
                snapshot.phase !== "choosing" ||
                ownLocked ||
                !ownFighter ||
                !canUseAction(ownFighter, action)
              }
              onClick={() => choose(action)}
              className="min-h-14 rounded-xl border border-border bg-cream px-2 text-xs font-black transition active:scale-95 disabled:opacity-40 motion-reduce:transition-none sm:text-sm"
            >
              {action === "strike"
                ? "⚔ Strike · 2"
                : action === "guard"
                  ? "◆ Guard · 1"
                  : "✦ Recharge · +3"}
            </button>
          ))}
        </div>
      )}
      <div
        className="mt-3 flex justify-between text-xs text-muted"
        aria-live="polite"
      >
        <span>
          {snapshot.creatorLocked ? "Creator ready" : "Creator choosing"}
        </span>
        <span>
          {snapshot.opponentLocked ? "Opponent ready" : "Opponent choosing"}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {snapshot.settlementStatus === "failed" && (
        <p role="alert" className="mt-4 text-sm text-destructive">
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
            className="mt-4 min-h-12 w-full rounded-xl border border-destructive px-4 text-sm font-bold text-destructive disabled:opacity-50"
          >
            {isSending ? "Waiting for wallet…" : "Refund expired match"}
          </button>
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
}: {
  team: BattleCreature[];
  activeSlot: number;
  fighter:
    { currentHp: number; mana: number; stats: { hp: number } } | undefined;
  side: string;
  action: "strike" | "guard" | "recharge" | undefined;
}) {
  return (
    <div>
      <CombatCard
        creature={team[activeSlot]}
        fighter={fighter}
        side={side}
        action={action}
      />
      <div className="mt-2 flex gap-2" aria-label={`${side} bench`}>
        {team.map((creature, index) => (
          <div
            key={creature.creature.address}
            className={`relative h-12 flex-1 overflow-hidden rounded-lg border bg-cream ${index === activeSlot ? "border-emerald-500" : "border-border"} ${index < activeSlot ? "grayscale opacity-40" : ""}`}
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
            <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[9px] font-bold text-white">
              {index + 1}
            </span>
          </div>
        ))}
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
}: {
  creature: BattleCreature | undefined;
  fighter:
    { currentHp: number; mana: number; stats: { hp: number } } | undefined;
  side: string;
  action: "strike" | "guard" | "recharge" | undefined;
}) {
  const hp = fighter
    ? Math.round((fighter.currentHp / fighter.stats.hp) * 100)
    : 0;
  return (
    <article
      className={`rounded-2xl border border-border bg-cream p-4 transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${hp === 0 ? "grayscale opacity-50" : ""} ${action === "strike" ? "scale-[1.03] border-red-500" : ""} ${action === "guard" ? "ring-2 ring-sky-400" : ""} ${action === "recharge" ? "ring-2 ring-amber-300" : ""}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-muted">
        {side}
      </p>
      <h3 className="mt-1 text-xl font-black">
        {creature?.species?.name ?? "Unknown creature"}
      </h3>
      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-black/10"
        role="progressbar"
        aria-label={`${side} health`}
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${hp}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-bold">
        <span>
          HP {fighter?.currentHp ?? 0}/{fighter?.stats.hp ?? 0}
        </span>
        <span>Mana {fighter?.mana ?? 0}/5</span>
      </div>
    </article>
  );
}
