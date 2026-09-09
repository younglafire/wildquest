import {
  getAddressEncoder,
  getBase58Decoder,
  parseBase64RpcAccount,
  type Account,
  type Address,
  type Base58EncodedBytes,
} from "@solana/kit";
import {
  decodeCreature,
  getCreatureDiscriminatorBytes,
  getCreatureSize,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
} from "../generated/wildquest";
import type { SolanaClient } from "./solana-client";

export type OwnedCreature = Account<Creature>;

export function getOwnedCreatureFilters(owner: Address) {
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
