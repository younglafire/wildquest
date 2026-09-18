"use client";

import { useId } from "react";
import type { SpeciesConfig } from "../generated/wildquest";
import type { BattleCreature } from "../lib/battle-creatures";
import type { CatalogueSpecies } from "../lib/catalogue-client";
import { creatureAbility } from "../lib/creature-abilities";

export type CreatureModelCardProps = {
  creature?: BattleCreature | null;
  species?: CatalogueSpecies | null;
  stats?: Pick<
    SpeciesConfig,
    | "catalogueId"
    | "hp"
    | "attack"
    | "defense"
    | "maxMana"
    | "strikeCost"
    | "guardCost"
    | "rechargeGain"
    | "abilityId"
    | "abilityCost"
  > | null;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  disabledBadge?: string | null;
  className?: string;
  slotIndex?: number;
};

function getRarityTemplate(rarity?: string): string {
  const r = (rarity ?? "common").toLowerCase().trim();
  if (r.includes("legend")) return "/cards/frames/legend.png";
  if (r.includes("epic")) return "/cards/frames/epic.png";
  if (r.includes("rare")) return "/cards/frames/rare.png";
  if (r.includes("uncommon")) return "/cards/frames/uncommon.png";
  return "/cards/frames/common.png";
}

function splitSummary(summary: string): [string, string | null] {
  if (summary.length <= 44) return [summary, null];
  const breakIndex = summary.lastIndexOf(" ", 44);
  const first = summary.slice(0, breakIndex > 24 ? breakIndex : 44).trim();
  const second = summary.slice(first.length).trim();
  return [
    first,
    second.length > 48 ? `${second.slice(0, 45).trim()}...` : second,
  ];
}

export function CreatureModelCard(props: CreatureModelCardProps) {
  const {
    selected = false,
    disabled = false,
    disabledBadge,
    className = "",
    slotIndex,
  } = props;

  const species =
    "creature" in props && props.creature
      ? props.creature.species
      : props.species;

  const config =
    "creature" in props && props.creature
      ? props.creature.config.data
      : props.stats;

  const rawId = useId().replace(/:/g, "_");
  const gradId = `card_grad_${rawId}`;
  const clipId = `art_clip_${rawId}`;

  const name =
    species?.name ??
    (config?.catalogueId != null
      ? `Creature #${config.catalogueId}`
      : "Creature");
  const rarity = species?.rarity ?? "Common";
  const role = species?.battleRole ?? "Creature";
  const imageSrc = species?.imageUrl ?? species?.iconUrl ?? null;
  const catalogueId =
    config?.catalogueId != null
      ? String(config.catalogueId)
      : species?.id != null
        ? String(species.id)
        : null;

  const hp = config?.hp ?? 100;
  const attack = config?.attack ?? 80;
  const defense = config?.defense ?? 65;
  const mana = config?.maxMana ?? 5;
  const ability = creatureAbility(config?.abilityId ?? 1);
  const [summaryLine1, summaryLine2] = splitSummary(
    species?.cardSummary ?? ability.summary,
  );
  const strikeCost = config?.strikeCost ?? 2;
  const guardCost = config?.guardCost ?? 1;
  const rechargeGain = config?.rechargeGain ?? 3;
  const abilityCost = config?.abilityCost ?? 3;

  const frameSrc = getRarityTemplate(rarity);

  return (
    <article
      className={`group relative aspect-[2/3] w-full select-none overflow-hidden rounded-2xl transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed opacity-40 grayscale"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
      } ${
        selected
          ? "scale-[1.02] ring-4 ring-[#fbbf24] shadow-[0_0_24px_rgba(251,191,36,0.6)]"
          : "border-2 border-[#5a4225] shadow-lg shadow-black/70"
      } ${className}`}
      style={{
        background: "#0c0a08",
      }}
    >
      {/* 2:3 Scalable Vector Card Canvas */}
      <svg
        viewBox="0 0 1024 1536"
        className="pointer-events-none block h-full w-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14100b" />
            <stop offset="50%" stopColor="#0b0907" />
            <stop offset="100%" stopColor="#080605" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="137" y="150" width="750" height="715" rx="20" />
          </clipPath>
        </defs>

        {/* 1. Base Obsidian Woodland Background */}
        <rect width="1024" height="1536" fill={`url(#${gradId})`} rx="32" />

        {/* 2. Creature Artwork in Upper Window */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="137" y="150" width="750" height="715" fill="#120e0a" />
          {imageSrc ? (
            <image
              href={imageSrc}
              x="137"
              y="150"
              width="750"
              height="715"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x="512"
              y="510"
              fill="#c8a96e"
              fontSize="34"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              SPECIMEN ARCHIVE
            </text>
          )}
        </g>

        {/* 3. Rarity Frame Overlay (common.png, rare.png, legend.png, etc.) */}
        <image
          href={frameSrc}
          x="0"
          y="0"
          width="1024"
          height="1536"
          preserveAspectRatio="none"
        />

        {/* 4. Top Header Bar: Rarity Tag & Creature Name */}
        <rect
          x="182"
          y="215"
          width="660"
          height="84"
          rx="14"
          fill="rgba(8, 7, 5, 0.88)"
          stroke="#c8a96e"
          strokeWidth="2"
        />
        <text
          x="512"
          y="244"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#fbbf24"
          textAnchor="middle"
          letterSpacing="2"
        >
          {`[ ${rarity.toUpperCase()} · ${role.toUpperCase()} ]`}
        </text>
        <text
          x="512"
          y="283"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={name.length > 20 ? "30" : name.length > 15 ? "34" : "38"}
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          {name.toUpperCase()}
        </text>

        {/* 5. Four Battle Stats Badges (Positioned inside lower frame tablet) */}
        {/* HP */}
        <rect
          x="115"
          y="996"
          width="182"
          height="86"
          rx="12"
          fill="rgba(12, 20, 14, 0.9)"
          stroke="#22c55e"
          strokeWidth="2"
        />
        <text
          x="206"
          y="1026"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#4ade80"
          textAnchor="middle"
        >
          HP
        </text>
        <text
          x="206"
          y="1068"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {hp}
        </text>

        {/* ATK */}
        <rect
          x="319"
          y="996"
          width="182"
          height="86"
          rx="12"
          fill="rgba(24, 12, 12, 0.9)"
          stroke="#ef4444"
          strokeWidth="2"
        />
        <text
          x="410"
          y="1026"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#f87171"
          textAnchor="middle"
        >
          ATK
        </text>
        <text
          x="410"
          y="1068"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {attack}
        </text>

        {/* DEF */}
        <rect
          x="523"
          y="996"
          width="182"
          height="86"
          rx="12"
          fill="rgba(12, 18, 26, 0.9)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <text
          x="614"
          y="1026"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#60a5fa"
          textAnchor="middle"
        >
          DEF
        </text>
        <text
          x="614"
          y="1068"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {defense}
        </text>

        {/* Mana */}
        <rect
          x="727"
          y="996"
          width="182"
          height="86"
          rx="12"
          fill="rgba(24, 20, 10, 0.9)"
          stroke="#eab308"
          strokeWidth="2"
        />
        <text
          x="818"
          y="1026"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#facc15"
          textAnchor="middle"
        >
          MANA
        </text>
        <text
          x="818"
          y="1068"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {mana}
        </text>

        {/* 6. Ability & Action Costs (Inside lower frame tablet) */}
        <text
          x="120"
          y="1120"
          fontFamily="ui-monospace, monospace"
          fontSize="19"
          fontWeight="900"
          fill="#f3ba63"
          letterSpacing="2"
        >
          ABILITY
        </text>
        <text
          x="120"
          y="1154"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={ability.name.length > 18 ? "26" : "32"}
          fontWeight="900"
          fill="#ffffff"
        >
          {`${ability.name.toUpperCase()} · ${abilityCost} MANA`}
        </text>

        {/* Action costs */}
        <rect
          x="115"
          y="1176"
          width="254"
          height="50"
          rx="10"
          fill="rgba(20, 10, 8, 0.85)"
          stroke="#ef4444"
          strokeWidth="1.8"
        />
        <text
          x="242"
          y="1208"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#fecaca"
          textAnchor="middle"
        >
          {`STRIKE ${strikeCost}`}
        </text>
        <rect
          x="385"
          y="1176"
          width="254"
          height="50"
          rx="10"
          fill="rgba(8, 14, 24, 0.85)"
          stroke="#3b82f6"
          strokeWidth="1.8"
        />
        <text
          x="512"
          y="1208"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#bfdbfe"
          textAnchor="middle"
        >
          {`GUARD ${guardCost}`}
        </text>
        <rect
          x="655"
          y="1176"
          width="254"
          height="50"
          rx="10"
          fill="rgba(8, 20, 12, 0.85)"
          stroke="#22c55e"
          strokeWidth="1.8"
        />
        <text
          x="782"
          y="1208"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#bbf7d0"
          textAnchor="middle"
        >
          {`RECHARGE +${rechargeGain}`}
        </text>

        {/* Lore / Description */}
        <text
          x="120"
          y="1264"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="#f7f0de"
        >
          {summaryLine1}
        </text>
        {summaryLine2 ? (
          <text
            x="120"
            y="1298"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="22"
            fontWeight="600"
            fill="#c8ba9e"
          >
            {summaryLine2}
          </text>
        ) : null}

        {/* Onchain Specimen Watermark */}
        <text
          x="512"
          y="1354"
          fontFamily="ui-monospace, monospace"
          fontSize="20"
          fontWeight="900"
          fill="#f3ba63"
          textAnchor="middle"
          letterSpacing="2"
        >
          {catalogueId
            ? `✦ SPECIES #${catalogueId} · SOLANA DEVNET ONCHAIN ✦`
            : "✦ WILDQUEST ONCHAIN SPECIMEN ✦"}
        </text>
      </svg>

      {/* Floating Armed / Selected Indicator */}
      {selected && (
        <div className="pointer-events-none absolute right-2 top-2 z-20 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-lg">
          ARMED
        </div>
      )}

      {/* Slot Badge if provided */}
      {slotIndex != null && (
        <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/85 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c8a96e] border border-[#c8a96e]/40 shadow-lg">
          Slot {slotIndex}
        </div>
      )}

      {/* Disabled / Badge Overlay */}
      {(() => {
        const badgeText =
          disabledBadge !== undefined
            ? disabledBadge
            : disabled
              ? "IN TEAM"
              : null;
        if (!badgeText) return null;
        return (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full border border-[#c8a96e]/40 bg-black/85 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#c8a96e] shadow-lg">
              {badgeText}
            </span>
          </div>
        );
      })()}
    </article>
  );
}
