import type { Account, Address } from "@solana/kit";
import {
  fetchAllSpeciesConfig,
  findCreaturePda,
  findSpeciesConfigPda,
  type SpeciesConfig,
} from "../generated/wildquest";
import type { CatalogueSpecies } from "./catalogue-client";
import type { OwnedCreature } from "./creatures";
import type { SolanaClient } from "./solana-client";

export type BattleCreature = {
  creature: { address: Address };
  species: CatalogueSpecies | null;
  config: Account<SpeciesConfig>;
};

export async function resolveMatchCatalogueIds(
  owner: Address,
  creatureAddresses: readonly Address[],
  catalogue: readonly CatalogueSpecies[],
): Promise<bigint[]> {
  const playable = catalogue.filter(
    (species) => species.isActive && species.captureEnabled,
  );
  const candidates = await Promise.all(
    playable.map(async (species) => ({
      catalogueId: BigInt(species.id),
      address: (
        await findCreaturePda({ owner, catalogueId: BigInt(species.id) })
      )[0],
    })),
  );
  const catalogueIdByAddress = new Map(
    candidates.map((candidate) => [candidate.address, candidate.catalogueId]),
  );
  return creatureAddresses.map((address) => {
    const catalogueId = catalogueIdByAddress.get(address);
    if (catalogueId === undefined) {
      throw new Error("A Match Creature is not in the playable catalogue.");
    }
    return catalogueId;
  });
}

export async function fetchMatchBattleCreatures(
  rpc: SolanaClient["rpc"],
  owner: Address,
  creatureAddresses: readonly Address[],
  catalogue: readonly CatalogueSpecies[],
): Promise<BattleCreature[]> {
  const catalogueIds = await resolveMatchCatalogueIds(
    owner,
    creatureAddresses,
    catalogue,
  );
  const configAddresses = await Promise.all(
    catalogueIds.map(
      async (catalogueId) => (await findSpeciesConfigPda({ catalogueId }))[0],
    ),
  );
  const configs = await fetchAllSpeciesConfig(rpc, configAddresses, {
    commitment: "confirmed",
  });
  const catalogueById = new Map(
    catalogue.map((species) => [BigInt(species.id).toString(), species]),
  );
  return creatureAddresses.map((address, index) => {
    const config = configs[index]!;
    if (
      config.data.catalogueId !== catalogueIds[index] ||
      !config.data.active
    ) {
      throw new Error("A Match SpeciesConfig is inactive or mismatched.");
    }
    return {
      creature: { address },
      species: catalogueById.get(catalogueIds[index]!.toString()) ?? null,
      config,
    };
  });
}

export type CatalogueBattleCreature = {
  species: CatalogueSpecies;
  config: Account<SpeciesConfig>;
};

export async function fetchBattleCatalogue(
  rpc: SolanaClient["rpc"],
  catalogue: readonly CatalogueSpecies[],
): Promise<Array<CatalogueBattleCreature>> {
  const supported = catalogue.filter(
    (species) => species.isActive && species.captureEnabled,
  );
  const addresses = await Promise.all(
    supported.map(
      async (species) =>
        (await findSpeciesConfigPda({ catalogueId: BigInt(species.id) }))[0],
    ),
  );
  const configs = await fetchAllSpeciesConfig(rpc, addresses, {
    commitment: "confirmed",
  });
  return supported.map((species, index) => ({
    species,
    config: configs[index]!,
  }));
}

export async function fetchBattleCreatures(
  rpc: SolanaClient["rpc"],
  creatures: readonly OwnedCreature[],
  catalogue: readonly CatalogueSpecies[],
): Promise<BattleCreature[]> {
  const addresses = await Promise.all(
    creatures.map(
      async (creature) =>
        (
          await findSpeciesConfigPda({ catalogueId: creature.data.catalogueId })
        )[0],
    ),
  );
  const configs = await fetchAllSpeciesConfig(rpc, addresses, {
    commitment: "confirmed",
  });
  const catalogueById = new Map(
    catalogue.map((species) => [BigInt(species.id).toString(), species]),
  );
  return creatures.map((creature, index) => {
    const config = configs[index]!;
    if (
      config.data.catalogueId !== creature.data.catalogueId ||
      config.data.balanceVersion !== creature.data.balanceVersion ||
      !config.data.active
    ) {
      throw new Error(
        "Creature battle configuration is inactive or out of date.",
      );
    }
    return {
      creature,
      config,
      species: catalogueById.get(creature.data.catalogueId.toString()) ?? null,
    };
  });
}

export function battleStats(creature: BattleCreature) {
  const { hp, attack, defense, speed, shield } = creature.config.data;
  return { hp, attack, defense, speed, shield };
}

export function battleCreatureByAddress(
  creatures: readonly BattleCreature[],
  address: Address,
) {
  return creatures.find((item) => item.creature.address === address) ?? null;
}
