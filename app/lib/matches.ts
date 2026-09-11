import {
  AccountRole,
  address,
  getBase58Decoder,
  parseBase64RpcAccount,
  unwrapOption,
  type Account,
  type Address,
  type Base58EncodedBytes,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import {
  decodeMatch,
  findSpeciesConfigPda,
  getCancelMatchInstruction,
  getClaimMatchPayoutInstruction,
  getJoinMatchInstructionAsync,
  getMatchDiscriminatorBytes,
  getOpenMatchInstructionAsync,
  MatchStatus,
  WILDQUEST_PROGRAM_ADDRESS,
  type Match,
} from "../generated/wildquest";
import type { OwnedCreature } from "./creatures";
import type { SolanaClient } from "./solana-client";

export const MATCH_STAKE_LAMPORTS = 10_000_000n;
const SYSTEM_PROGRAM_ADDRESS = address("11111111111111111111111111111111");

export type GameMatch = Account<Match>;

export function validateCreatureTeam(
  owner: Address,
  creatures: Array<OwnedCreature>,
) {
  if (creatures.length !== 3) {
    throw new Error("Select exactly three Creatures.");
  }
  if (new Set(creatures.map((creature) => creature.address)).size !== 3) {
    throw new Error("Each team slot must use a different Creature.");
  }
  if (creatures.some((creature) => creature.data.owner !== owner)) {
    throw new Error("Every selected Creature must belong to this wallet.");
  }
  return creatures as [OwnedCreature, OwnedCreature, OwnedCreature];
}

export async function buildOpenMatchInstruction(
  signer: TransactionSigner,
  creatures: Array<OwnedCreature>,
  matchId: bigint,
): Promise<Instruction> {
  const [first, second, third] = validateCreatureTeam(
    signer.address,
    creatures,
  );
  return getOpenMatchInstructionAsync({
    creator: signer,
    creatorCreature1: first.address,
    creatorCreature2: second.address,
    creatorCreature3: third.address,
    matchId,
  });
}

export async function buildJoinMatchInstruction(
  signer: TransactionSigner,
  matchAccount: GameMatch,
  creatorCreatures: Array<OwnedCreature>,
  opponentCreatures: Array<OwnedCreature>,
): Promise<Instruction> {
  const opponentTeam = validateCreatureTeam(signer.address, opponentCreatures);
  if (matchAccount.data.status !== MatchStatus.Open) {
    throw new Error("This Match is no longer open.");
  }
  if (matchAccount.data.creator === signer.address) {
    throw new Error("The Match creator cannot join their own Match.");
  }

  if (
    creatorCreatures.length !== 3 ||
    creatorCreatures.some(
      (creature, index) =>
        creature.address !== matchAccount.data.creatorCreatures[index],
    )
  ) {
    throw new Error("The creator Creature data does not match this Match.");
  }

  const creatorConfigs = await Promise.all(
    creatorCreatures.map(
      async (creature) =>
        (
          await findSpeciesConfigPda({ catalogueId: creature.data.catalogueId })
        )[0],
    ),
  );
  const opponentConfigs = await Promise.all(
    opponentTeam.map(
      async (creature) =>
        (
          await findSpeciesConfigPda({ catalogueId: creature.data.catalogueId })
        )[0],
    ),
  );
  const base = await getJoinMatchInstructionAsync({
    opponent: signer,
    creator: matchAccount.data.creator,
    matchAccount: matchAccount.address,
  });

  return Object.freeze({
    ...base,
    accounts: [
      ...(base.accounts ?? []),
      ...matchAccount.data.creatorCreatures.map((creature) => ({
        address: creature,
        role: AccountRole.READONLY,
      })),
      ...opponentTeam.map((creature) => ({
        address: creature.address,
        role: AccountRole.READONLY,
      })),
      ...creatorConfigs.map((config) => ({
        address: config,
        role: AccountRole.READONLY,
      })),
      ...opponentConfigs.map((config) => ({
        address: config,
        role: AccountRole.READONLY,
      })),
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
  });
}

export function buildCancelMatchInstruction(
  signer: TransactionSigner,
  matchAccount: GameMatch,
): Instruction {
  if (matchAccount.data.creator !== signer.address) {
    throw new Error("Only the Match creator can cancel it.");
  }
  if (matchAccount.data.status !== MatchStatus.Open) {
    throw new Error("Only an open Match can be cancelled.");
  }
  return getCancelMatchInstruction({
    creator: signer,
    matchAccount: matchAccount.address,
  });
}

export function buildClaimMatchPayoutInstruction(
  signer: TransactionSigner,
  matchAccount: GameMatch,
): Instruction {
  if (matchAccount.data.status !== MatchStatus.Claimable) {
    throw new Error("This Match payout is not claimable.");
  }
  const winner = unwrapOption(matchAccount.data.winner);
  if (winner !== signer.address) {
    throw new Error("Only the recorded Match winner can claim the pot.");
  }
  return getClaimMatchPayoutInstruction({
    winner: signer,
    matchAccount: matchAccount.address,
  });
}

export function getMatchFilters() {
  return [
    {
      memcmp: {
        offset: 0n,
        bytes: getBase58Decoder().decode(
          getMatchDiscriminatorBytes(),
        ) as Base58EncodedBytes,
        encoding: "base58" as const,
      },
    },
  ] as const;
}

export async function fetchMatches(
  rpc: SolanaClient["rpc"],
): Promise<Array<GameMatch>> {
  const accounts = await rpc
    .getProgramAccounts(WILDQUEST_PROGRAM_ADDRESS, {
      commitment: "confirmed",
      encoding: "base64",
      withContext: false,
      filters: getMatchFilters(),
    })
    .send();
  return accounts.map(({ pubkey, account }) =>
    decodeMatch(parseBase64RpcAccount(pubkey, account)),
  );
}

export function getPlayerMatches(
  matches: readonly GameMatch[],
  wallet: Address,
): GameMatch[] {
  return matches
    .filter((match) => {
      const opponent = unwrapOption(match.data.opponent);
      return match.data.creator === wallet || opponent === wallet;
    })
    .sort((left, right) => Number(right.data.createdAt - left.data.createdAt));
}
