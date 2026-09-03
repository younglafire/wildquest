import {
  getBase58Decoder,
  getAddressEncoder,
  parseBase64RpcAccount,
  type Account,
  type Address,
  type Base58EncodedBytes,
  type ReadonlyUint8Array,
} from "@solana/kit";
import {
  decodeDiscovery,
  getDiscoveryDiscriminatorBytes,
  getDiscoverySize,
  WILDQUEST_PROGRAM_ADDRESS,
  type Discovery,
} from "../generated/wildquest";
import type { CatalogueSpecies } from "./catalogue-client";
import type { ConfirmedDiscovery } from "./expedition";
import type { SolanaClient } from "./solana-client";

export type PlayerDiscovery = Account<Discovery>;

export type CollectionCard = {
  species: CatalogueSpecies;
  count: number;
  bestGrade: "Bronze" | "Silver" | "Gold" | null;
  latestTimestamp: bigint | null;
};

const GRADE_NAMES = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
} as const;

export function getPlayerDiscoveryFilters(player: Address) {
  const encodeBase58 = getBase58Decoder();
  return [
    { dataSize: BigInt(getDiscoverySize()) },
    {
      memcmp: {
        offset: 0n,
        bytes: encodeBase58.decode(
          getDiscoveryDiscriminatorBytes(),
        ) as Base58EncodedBytes,
        encoding: "base58" as const,
      },
    },
    {
      memcmp: {
        offset: 8n,
        bytes: encodeBase58.decode(
          getAddressEncoder().encode(player),
        ) as Base58EncodedBytes,
        encoding: "base58" as const,
      },
    },
  ] as const;
}

export async function fetchPlayerDiscoveries(
  rpc: SolanaClient["rpc"],
  player: Address,
): Promise<Array<PlayerDiscovery>> {
  const accounts = await rpc
    .getProgramAccounts(WILDQUEST_PROGRAM_ADDRESS, {
      commitment: "confirmed",
      encoding: "base64",
      withContext: false,
      filters: getPlayerDiscoveryFilters(player),
    })
    .send();

  return accounts.map(({ pubkey, account }) =>
    decodeDiscovery(parseBase64RpcAccount(pubkey, account)),
  );
}

function gradeName(code: number): CollectionCard["bestGrade"] {
  return code === 1 || code === 2 || code === 3 ? GRADE_NAMES[code] : null;
}

function bytesToHex(bytes: ReadonlyUint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function buildCollectionCards(
  catalogue: Array<CatalogueSpecies>,
  discoveries: Array<PlayerDiscovery>,
  optimistic: ConfirmedDiscovery | null = null,
): Array<CollectionCard> {
  const grouped = new Map<
    string,
    { count: number; bestGradeCode: number; latestTimestamp: bigint }
  >();

  for (const discovery of discoveries) {
    const key = discovery.data.speciesId.toString();
    const current = grouped.get(key);
    grouped.set(key, {
      count: (current?.count ?? 0) + 1,
      bestGradeCode: Math.max(
        current?.bestGradeCode ?? 0,
        discovery.data.grade,
      ),
      latestTimestamp:
        current && current.latestTimestamp > discovery.data.timestamp
          ? current.latestTimestamp
          : discovery.data.timestamp,
    });
  }

  if (optimistic) {
    const proofAlreadyPresent = discoveries.some(
      (discovery) =>
        bytesToHex(discovery.data.proofHash) ===
        optimistic.identification.proof_hash,
    );
    if (!proofAlreadyPresent) {
      const key = optimistic.identification.catalogue_id;
      const current = grouped.get(key);
      grouped.set(key, {
        count: (current?.count ?? 0) + 1,
        bestGradeCode: Math.max(
          current?.bestGradeCode ?? 0,
          optimistic.identification.grade_code,
        ),
        latestTimestamp: current?.latestTimestamp ?? 0n,
      });
    }
  }

  return catalogue
    .map((species) => {
      const aggregate = grouped.get(String(species.id));
      return {
        species,
        count: aggregate?.count ?? 0,
        bestGrade: gradeName(aggregate?.bestGradeCode ?? 0),
        latestTimestamp: aggregate?.latestTimestamp ?? null,
      };
    })
    .sort((left, right) => {
      if (left.count > 0 !== right.count > 0) return left.count > 0 ? -1 : 1;
      return left.species.name.localeCompare(right.species.name);
    });
}
