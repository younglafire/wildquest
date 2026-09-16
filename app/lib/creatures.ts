import {
  getAddressEncoder,
  getBase58Decoder,
  parseBase64RpcAccount,
  type Account,
  type Address,
  type Base58EncodedBytes,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import {
  decodeCreature,
  getCreatureDiscriminatorBytes,
  getCreatureSize,
  getReleaseCreatureInstruction,
  getUpgradeCreatureBalanceInstruction,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
  type SpeciesConfig,
} from "../generated/wildquest";
import type { SolanaClient } from "./solana-client";

export type OwnedCreature = Account<Creature>;

export function getCreatureFilters() {
  const encodeBase58 = getBase58Decoder();
  return [
    { dataSize: BigInt(getCreatureSize()) },
    {
      memcmp: {
        offset: 0n,
        bytes: encodeBase58.decode(
          getCreatureDiscriminatorBytes(),
        ) as Base58EncodedBytes,
        encoding: "base58" as const,
      },
    },
  ] as const;
}

export function getOwnedCreatureFilters(owner: Address) {
  const encodeBase58 = getBase58Decoder();
  return [
    ...getCreatureFilters(),
    {
      memcmp: {
        offset: 8n,
        bytes: encodeBase58.decode(
          getAddressEncoder().encode(owner),
        ) as Base58EncodedBytes,
        encoding: "base58" as const,
      },
    },
  ] as const;
}

export async function fetchCreatures(
  rpc: SolanaClient["rpc"],
): Promise<Array<OwnedCreature>> {
  const accounts = await rpc
    .getProgramAccounts(WILDQUEST_PROGRAM_ADDRESS, {
      commitment: "confirmed",
      encoding: "base64",
      withContext: false,
      filters: getCreatureFilters(),
    })
    .send();
  return accounts.map(({ pubkey, account }) =>
    decodeCreature(parseBase64RpcAccount(pubkey, account)),
  );
}

export async function fetchOwnedCreatures(
  rpc: SolanaClient["rpc"],
  owner: Address,
): Promise<Array<OwnedCreature>> {
  const accounts = await rpc
    .getProgramAccounts(WILDQUEST_PROGRAM_ADDRESS, {
      commitment: "confirmed",
      encoding: "base64",
      withContext: false,
      filters: getOwnedCreatureFilters(owner),
    })
    .send();

  return accounts.map(({ pubkey, account }) =>
    decodeCreature(parseBase64RpcAccount(pubkey, account)),
  );
}

export function buildReleaseCreatureInstruction(
  signer: TransactionSigner,
  creature: OwnedCreature,
): Instruction {
  if (creature.data.owner !== signer.address) {
    throw new Error("Only the Creature owner can release this card.");
  }
  return getReleaseCreatureInstruction({
    owner: signer,
    creature: creature.address,
  });
}

export function buildUpgradeCreatureBalanceInstruction(
  signer: TransactionSigner,
  gameConfig: Address,
  speciesConfig: Account<SpeciesConfig>,
  creature: OwnedCreature,
): Instruction {
  if (creature.data.owner !== signer.address) {
    throw new Error("Only the Creature owner can upgrade this card.");
  }
  if (creature.data.catalogueId !== speciesConfig.data.catalogueId) {
    throw new Error("Creature and SpeciesConfig catalogue IDs do not match.");
  }
  return getUpgradeCreatureBalanceInstruction({
    owner: signer,
    gameConfig,
    speciesConfig: speciesConfig.address,
    creature: creature.address,
  });
}
