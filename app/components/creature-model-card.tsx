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
  if (r.includes("legend")) return "/creatures/legend.png";
  if (r.includes("epic")) return "/creatures/epic.png";
  if (r.includes("rare")) return "/creatures/rare.png";
  if (r.includes("uncommon")) return "/creatures/uncommon.png";
  return "/creatures/common.png";
}

/**
 * Stationary 3D-Style Card Model Component (Đứng yên)
 * Displays the high-fidelity Trading Card Model with:
 * - 2:3 aspect ratio
 * - Custom rarity carved nature/elemental frame (common.png, rare.png, legend.png, etc.)
 * - Creature artwork framed in upper art window
 * - Top header with rarity tag and bold creature name
 * - 4 Battle Stats (HP, ATK, DEF, SPD) with distinct badge colors and high-contrast numbers
 * - Lower lore backing plate with habitat, trait, and Solana onchain watermark
 */
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
            <rect x="82" y="196" width="860" height="650" rx="16" />
          </clipPath>
        </defs>

        {/* 1. Base Obsidian Woodland Background */}
        <rect width="1024" height="1536" fill={`url(#${gradId})`} rx="32" />

        {/* 2. Creature Artwork in Upper Window */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="82" y="196" width="860" height="650" fill="#120e0a" />
          {imageSrc ? (
            <image
              href={imageSrc}
              x="82"
              y="196"
              width="860"
              height="650"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x="512"
              y="530"
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
          x="212"
          y="88"
          width="600"
          height="86"
          rx="12"
          fill="rgba(8, 6, 4, 0.92)"
          stroke="#c8a96e"
          strokeWidth="2.5"
        />
        <text
          x="512"
          y="118"
          fontFamily="ui-monospace, monospace"
          fontSize="23"
          fontWeight="900"
          fill="#fbbf24"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          {`[ ${rarity.toUpperCase()} · ${role.toUpperCase()} ]`}
        </text>
        <text
          x="512"
          y="156"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={name.length > 18 ? "36" : "44"}
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
          letterSpacing="1"
        >
          {name.toUpperCase()}
        </text>

        {/* 5. Four Battle Stats Badges */}
        {/* HP */}
        <rect
          x="82"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="#0c0f0d"
          stroke="#22c55e"
          strokeWidth="2.5"
        />
        <rect
          x="82"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="rgba(34, 197, 94, 0.16)"
        />
        <text
          x="184"
          y="916"
          fontFamily="ui-monospace, monospace"
          fontSize="24"
          fontWeight="900"
          fill="#4ade80"
          textAnchor="middle"
        >
          HP
        </text>
        <text
          x="184"
          y="984"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="62"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {hp}
        </text>

        {/* ATK */}
        <rect
          x="300"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="#120c0b"
          stroke="#ef4444"
          strokeWidth="2.5"
        />
        <rect
          x="300"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="rgba(239, 68, 68, 0.16)"
        />
        <text
          x="402"
          y="916"
          fontFamily="ui-monospace, monospace"
          fontSize="24"
          fontWeight="900"
          fill="#f87171"
          textAnchor="middle"
        >
          ATK
        </text>
        <text
          x="402"
          y="984"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="62"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {attack}
        </text>

        {/* DEF */}
        <rect
          x="518"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="#0b0f14"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />
        <rect
          x="518"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="rgba(59, 130, 246, 0.16)"
        />
        <text
          x="620"
          y="916"
          fontFamily="ui-monospace, monospace"
          fontSize="24"
          fontWeight="900"
          fill="#60a5fa"
          textAnchor="middle"
        >
          DEF
        </text>
        <text
          x="620"
          y="984"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="62"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {defense}
        </text>

        {/* Mana */}
        <rect
          x="736"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="#12100a"
          stroke="#eab308"
          strokeWidth="2.5"
        />
        <rect
          x="736"
          y="880"
          width="204"
          height="126"
          rx="14"
          fill="rgba(234, 179, 8, 0.16)"
        />
        <text
          x="838"
          y="916"
          fontFamily="ui-monospace, monospace"
          fontSize="24"
          fontWeight="900"
          fill="#facc15"
          textAnchor="middle"
        >
          MANA
        </text>
        <text
          x="838"
          y="984"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="62"
          fontWeight="900"
          fill="#ffffff"
          textAnchor="middle"
        >
          {mana}
        </text>

        {/* 6. Lower Lore Panel: Habitat, Trait, Lore & Watermark */}
        <rect
          x="82"
          y="1022"
          width="860"
          height="300"
          rx="14"
          fill="rgba(6, 5, 4, 0.82)"
          stroke="rgba(200, 169, 110, 0.35)"
          strokeWidth="1.5"
        />
        <text
          x="110"
          y="1066"
          fontFamily="ui-monospace, monospace"
          fontSize="28"
          fontWeight="900"
          fill="#fef08a"
          letterSpacing="1"
        >
          {`STRIKE ${config?.strikeCost ?? 2} · GUARD ${config?.guardCost ?? 1} · RECHARGE +${config?.rechargeGain ?? 3}`}
        </text>
        <text
          x="110"
          y="1106"
          fontFamily="ui-monospace, monospace"
          fontSize="25"
          fontWeight="900"
          fill="#4ade80"
          letterSpacing="1"
        >
          {`${ability.name.toUpperCase()} · ${config?.abilityCost ?? 3} MANA`}
        </text>
        <text
          x="110"
          y="1152"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="26"
          fontWeight="700"
          fill="#ffffff"
        >
          {ability.summary}
        </text>
        <text
          x="512"
          y="1288"
          fontFamily="ui-monospace, monospace"
          fontSize="22"
          fontWeight="900"
          fill="#f3ba63"
          textAnchor="middle"
          letterSpacing="1.5"
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
