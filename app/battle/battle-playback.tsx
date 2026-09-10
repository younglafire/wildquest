"use client";

import { useEffect, useMemo, useState } from "react";
import { unwrapOption, type Address } from "@solana/kit";
import { MatchStatus } from "../generated/wildquest";
import { CreatureCard } from "../components/creature-card";
import { battleStats, type BattleCreature } from "../lib/battle-creatures";
import { simulateBattle } from "../lib/battle-engine";
import { getBattleFrame } from "../lib/battle-timeline";
import type { GameMatch } from "../lib/matches";

type Props = {
  match: GameMatch;
  creatorTeam: BattleCreature[];
  opponentTeam: BattleCreature[];
  wallet: Address | null;
  isSending: boolean;
  onClaim: () => void;
};

export function BattlePlayback({
  match,
  creatorTeam,
  opponentTeam,
  wallet,
  isSending,
  onClaim,
}: Props) {
  const report = useMemo(
    () =>
      simulateBattle(
        creatorTeam.map(battleStats),
        opponentTeam.map(battleStats),
      ),
    [creatorTeam, opponentTeam],
  );
  const settledAt = unwrapOption(match.data.settledAt);
  const [now, setNow] = useState(() => Date.now());
  const frame = useMemo(
    () =>
      settledAt === null
        ? { eventCount: 0, countdownSeconds: 0, finished: false }
        : getBattleFrame(settledAt, report.events.length, now),
    [now, report.events.length, settledAt],
  );
  const { eventCount, finished } = frame;
  const current = report.events[Math.max(0, eventCount - 1)];

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [finished]);

  const health = useMemo(() => {
    const creator = creatorTeam.map((item) => ({
      hp: item.config.data.hp,
      shield: item.config.data.shield,
    }));
    const opponent = opponentTeam.map((item) => ({
      hp: item.config.data.hp,
      shield: item.config.data.shield,
    }));
    for (const event of report.events.slice(0, eventCount)) {
      const target = event.attackerSide === "creator" ? opponent : creator;
      target[event.defenderSlot] = {
        hp: event.hpAfter,
        shield: event.shieldAfter,
      };
    }
    return { creator, opponent };
  }, [creatorTeam, eventCount, opponentTeam, report.events]);

  const creatorSlot = current
    ? current.attackerSide === "creator"
      ? current.attackerSlot
      : current.defenderSlot
    : 0;
  const opponentSlot = current
    ? current.attackerSide === "opponent"
      ? current.attackerSlot
      : current.defenderSlot
    : 0;
  const winner = unwrapOption(match.data.winner);
  const replayWinner =
    report.outcome === "creator"
      ? match.data.creator
      : report.outcome === "opponent"
        ? unwrapOption(match.data.opponent)
        : null;
  const replayMatchesAccount = replayWinner === winner;
  const canClaim =
    finished &&
    replayMatchesAccount &&
    match.data.status === MatchStatus.Claimable &&
    winner === wallet;
  const outcome =
    report.outcome === "tie"
      ? "Draw — both stakes refunded"
      : report.outcome === "creator"
        ? "Creator wins"
        : "Opponent wins";

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
            Battle replay
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {frame.countdownSeconds > 0
              ? `Battle starts in ${frame.countdownSeconds}`
              : finished
                ? outcome
                : `Round ${current?.round ?? 1}`}
          </h2>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-muted">
          Live timeline · synchronized from the confirmed Match account
        </p>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
        <Combatant
          creature={creatorTeam[creatorSlot]!}
          state={health.creator[creatorSlot]!}
          attacking={current?.attackerSide === "creator" && !finished}
          side="creator"
        />
        <div className="text-center text-lg font-black text-muted">VS</div>
        <Combatant
          creature={opponentTeam[opponentSlot]!}
          state={health.opponent[opponentSlot]!}
          attacking={current?.attackerSide === "opponent" && !finished}
          side="opponent"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-bold text-muted">
        <p>Creator · slot {creatorSlot + 1}</p>
        <p>Opponent · slot {opponentSlot + 1}</p>
      </div>
      {current && !finished && (
        <p aria-live="polite" className="mt-4 text-center text-sm font-bold">
          {current.attackerSide === "creator" ? "Creator" : "Opponent"} dealt{" "}
          {current.damage} damage
        </p>
      )}

      {!replayMatchesAccount && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          Replay rules do not match the recorded onchain winner. Claim is
          disabled; refresh the app before continuing.
        </p>
      )}

      {finished && (
        <div className="mt-6 rounded-2xl bg-cream p-5 text-center">
          <p className="font-black">{outcome}</p>
          {canClaim ? (
            <button
              type="button"
              onClick={onClaim}
              disabled={isSending}
              className="mt-4 min-h-12 w-full rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-50 sm:w-auto"
            >
              {isSending ? "Waiting for wallet…" : "Claim 0.02 SOL pot"}
            </button>
          ) : match.data.status === MatchStatus.Claimable ? (
            <p className="mt-2 text-sm text-muted">
              The recorded winner must sign to claim the pot.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Payout settlement is complete.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Combatant({
  creature,
  state,
  attacking,
  side,
}: {
  creature: BattleCreature;
  state: { hp: number; shield: number };
  attacking: boolean;
  side: "creator" | "opponent";
}) {
  const defeated = state.hp === 0;
  const hpPercent = Math.round((state.hp / creature.config.data.hp) * 100);
  const shieldPercent =
    creature.config.data.shield === 0
      ? 0
      : Math.round((state.shield / creature.config.data.shield) * 100);
  return (
    <div
      className={`${attacking ? (side === "creator" ? "battle-hit-right" : "battle-hit-left") : ""} ${defeated ? "grayscale opacity-45" : ""} min-w-0 transition duration-300`}
    >
      <CreatureCard creature={creature} compact />
      <Meter
        label="HP"
        value={hpPercent}
        text={`${state.hp}/${creature.config.data.hp}`}
        color="bg-rose-500"
      />
      <Meter
        label="Shield"
        value={shieldPercent}
        text={`${state.shield}/${creature.config.data.shield}`}
        color="bg-sky-500"
      />
    </div>
  );
}

function Meter({
  label,
  value,
  text,
  color,
}: {
  label: string;
  value: number;
  text: string;
  color: string;
}) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] font-bold">
        <span>{label}</span>
        <span>{text}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
