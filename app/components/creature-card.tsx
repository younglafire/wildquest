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
    ["HP", config.hp],
    ["Damage", config.attack],
    ["Defense", config.defense],
    ["Speed", config.speed],
    ["Shield", config.shield],
  ] as const;
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition ${selected ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-border"} ${disabled ? "opacity-40 grayscale" : ""} ${className}`}
    >
      <div
        className={`relative overflow-hidden bg-cream ${compact ? "h-28" : "h-44"}`}
      >
        <SpeciesArt
          src={species?.iconUrl ?? species?.imageUrl}
          alt={name}
          className="object-contain p-3"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white">
          {species?.battleRole ?? "Creature"}
        </span>
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <h3 className="truncate text-base font-black">{name}</h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted">
            {species?.cardSummary ??
              "A field-discovered creature ready for deterministic battle."}
          </p>
        )}
        <dl className="mt-3 grid grid-cols-5 gap-1">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg bg-cream px-1 py-2 text-center"
            >
              <dt className="truncate text-[8px] font-bold uppercase text-muted">
                {label}
              </dt>
              <dd className="mt-0.5 text-xs font-black tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        {!compact && species?.originRegion && (
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Origin · {species.originRegion}
          </p>
        )}
      </div>
    </article>
  );
}
