import type { SpeciesConfig } from "../generated/wildquest";
import type { BattleCreature } from "../lib/battle-creatures";
import type { CatalogueSpecies } from "../lib/catalogue-client";
import { SpeciesArt } from "./species-art";

type Props = {
  creature: BattleCreature;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
};

type PreviewProps = Omit<Props, "creature"> & {
  creature?: never;
  species: CatalogueSpecies;
  stats: Pick<
    SpeciesConfig,
    "catalogueId" | "hp" | "attack" | "defense" | "speed" | "shield"
  >;
};

export function CreatureCard(props: Props | PreviewProps) {
  const { compact = false, selected, disabled, className = "" } = props;
  const species =
    "creature" in props && props.creature
      ? props.creature.species
      : props.species;
  const config =
    "creature" in props && props.creature
      ? props.creature.config.data
      : props.stats;
  const name = species?.name ?? `Creature #${config.catalogueId}`;
  const stats = [
    ["HP",      config.hp],
    ["Damage",  config.attack],
    ["Defense", config.defense],
    ["Speed",   config.speed],
    ["Shield",  config.shield],
  ] as const;

  return (
    <article
      className={`overflow-hidden rounded-xl text-left transition-all ${disabled ? "opacity-40 grayscale" : ""} ${className}`}
      style={{
        background: "#1c1810",
        border: selected
          ? "1px solid #c8a96e"
          : "1px solid #3a2e1e",
        boxShadow: selected
          ? "0 0 0 2px rgba(200,169,110,0.2), 0 4px 20px rgba(200,169,110,0.15)"
          : "0 2px 12px rgba(0,0,0,0.4)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
    >
      {/* Image area */}
      <div
        className={`relative overflow-hidden ${compact ? "h-28" : "h-44"}`}
        style={{ background: "#221d14" }}
      >
        <SpeciesArt
          src={species?.iconUrl ?? species?.imageUrl}
          alt={name}
          className="object-contain p-3"
        />
        {/* Role badge — wax pill */}
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-display)",
            background: "rgba(16,14,9,0.85)",
            color: "#c8a96e",
            border: "1px solid rgba(200,169,110,0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          {species?.battleRole ?? "Creature"}
        </span>
        {/* Gold shimmer accent top border */}
        <div
          className="absolute inset-x-0 top-0 h-[1px]"
          style={{ background: selected ? "linear-gradient(90deg, transparent, #c8a96e, transparent)" : "linear-gradient(90deg, transparent, rgba(200,169,110,0.2), transparent)" }}
        />
      </div>

      {/* Content */}
      <div className={compact ? "p-3" : "p-4"}>
        <h3
          className="truncate text-base font-black"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          {name}
        </h3>
        {!compact && (
          <p
            className="mt-1 line-clamp-2 min-h-10 text-xs leading-relaxed"
            style={{ color: "#8a7a62" }}
          >
            {species?.cardSummary ??
              "A field-discovered creature ready for deterministic battle."}
          </p>
        )}

        {/* Stats grid — JetBrains Mono */}
        <dl className="mt-3 grid grid-cols-5 gap-1">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded px-1 py-2 text-center"
              style={{ background: "#100e09" }}
            >
              <dt
                className="truncate text-[8px] font-bold uppercase"
                style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
              >
                {label}
              </dt>
              <dd
                className="mt-0.5 text-xs font-black tabular-nums"
                style={{ color: "#c8a96e", fontFamily: "var(--font-mono)" }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {!compact && species?.originRegion && (
          <p
            className="mt-3 text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "#8a7a62", fontFamily: "var(--font-display)" }}
          >
            Origin · {species.originRegion}
          </p>
        )}
      </div>
    </article>
  );
}
