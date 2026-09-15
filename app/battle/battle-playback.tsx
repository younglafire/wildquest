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
    const creator = creatorTeam.map((item) => ({ hp: item.config.data.hp }));
    const opponent = opponentTeam.map((item) => ({ hp: item.config.data.hp }));
    for (const event of report.events.slice(0, eventCount)) {
      const target = event.attackerSide === "creator" ? opponent : creator;
      target[event.defenderSlot] = { hp: event.hpAfter };
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
    <section
      className="mt-5 overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-8"
      style={{
        background: "#1c1810",
        border: "1px solid #3a2e1e",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="wax-badge wax-badge-forest">Battle replay</p>
          <h2
            className="mt-2 text-2xl font-black sm:text-3xl"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            {frame.countdownSeconds > 0
              ? `Battle starts in ${frame.countdownSeconds}s`
              : finished
                ? outcome
                : `Round ${current?.round ?? 1}`}
          </h2>
        </div>
        <p
          className="max-w-xs text-xs leading-relaxed"
          style={{ color: "#8a7a62" }}
        >
          Live deterministic timeline from Solana Devnet
        </p>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
        <Combatant
          creature={creatorTeam[creatorSlot]!}
          state={health.creator[creatorSlot]!}
          attacking={current?.attackerSide === "creator" && !finished}
          side="creator"
        />
        <div
          className="text-center text-sm font-black sm:text-lg"
          style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
        >
          VS
        </div>
        <Combatant
          creature={opponentTeam[opponentSlot]!}
          state={health.opponent[opponentSlot]!}
          attacking={current?.attackerSide === "opponent" && !finished}
          side="opponent"
        />
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-xs"
        style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
      >
        <p>Creator · slot {creatorSlot + 1}</p>
        <p>Opponent · slot {opponentSlot + 1}</p>
      </div>
      {current && !finished && (
        <p
          aria-live="polite"
          className="mt-3 text-center text-xs font-bold sm:text-sm"
          style={{ color: "#c8a96e", fontFamily: "var(--font-display)" }}
        >
          {current.attackerSide === "creator" ? "Creator" : "Opponent"} dealt{" "}
          {current.damage} damage ✦
        </p>
      )}

      {!replayMatchesAccount && (
        <p
          role="alert"
          className="mt-4 rounded-xl p-3 text-xs font-semibold sm:text-sm"
          style={{
            background: "rgba(192,57,43,0.12)",
            color: "#f8c8c4",
            border: "1px solid rgba(192,57,43,0.3)",
          }}
        >
          Replay rules do not match the recorded onchain winner. Claim is
          disabled; refresh the app before continuing.
        </p>
      )}

      {finished && (
        <div
          className="mt-5 rounded-xl p-4 text-center sm:p-6"
          style={{ background: "#221d14", border: "1px solid #3a2e1e" }}
        >
          <p
            className="text-lg font-black"
            style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
          >
            {outcome}
          </p>
          {canClaim ? (
            <button
              type="button"
              onClick={onClaim}
              disabled={isSending}
              className="btn-guild mt-4 w-full sm:w-auto"
            >
              {isSending ? "Waiting for wallet…" : "✦ Claim 0.02 SOL pot"}
            </button>
          ) : match.data.status === MatchStatus.Claimable ? (
            <p className="mt-2 text-xs sm:text-sm" style={{ color: "#8a7a62" }}>
              The recorded winner must sign to claim the pot.
            </p>
          ) : (
            <p className="mt-2 text-xs sm:text-sm" style={{ color: "#8a7a62" }}>
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
  state: { hp: number };
  attacking: boolean;
  side: "creator" | "opponent";
}) {
  const defeated = state.hp === 0;
  const hpPercent = Math.round((state.hp / creature.config.data.hp) * 100);
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
