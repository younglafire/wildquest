import {
  address,
  createNoopSigner,
  lamports,
  none,
  type Account,
  type Address,
} from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  findSpeciesConfigPda,
  MatchStatus,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
  type Match,
} from "../generated/wildquest";
import type { OwnedCreature } from "./creatures";
import {
  buildJoinMatchInstruction,
  buildOpenMatchInstruction,
  validateCreatureTeam,
} from "./matches";

const owner = address("11111111111111111111111111111111");
const opponent = address("Vote111111111111111111111111111111111111111");
const creatureAddresses = [
  address("SysvarRent111111111111111111111111111111111"),
  address("SysvarC1ock11111111111111111111111111111111"),
  address("Stake11111111111111111111111111111111111111"),
  address("Config1111111111111111111111111111111111111"),
  address("AddressLookupTab1e1111111111111111111111111"),
  address("ComputeBudget111111111111111111111111111111"),
] as const;

function creature(
  accountAddress: Address,
  creatureOwner: Address,
  catalogueId: bigint,
): OwnedCreature {
  return {
    address: accountAddress,
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 91n,
    data: {
      discriminator: new Uint8Array(8),
      owner: creatureOwner,
      catalogueId,
      proofHash: new Uint8Array(32),
      capturedAt: 1n,
      balanceVersion: 1,
      bump: 1,
    },
  } satisfies Account<Creature>;
}

function openMatch(creatorTeam: Array<OwnedCreature>): Account<Match> {
  return {
    address: address("BPFLoaderUpgradeab1e11111111111111111111111"),
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 337n,
    data: {
      discriminator: new Uint8Array(8),
      matchId: 7n,
      creator: owner,
      opponent: none<Address>(),
      creatorCreatures: creatorTeam.map((item) => item.address),
      opponentCreatures: [owner, owner, owner],
      stakeLamports: 10_000_000n,
      balanceVersion: 1,
      rulesVersion: 1,
      status: MatchStatus.Open,
      winner: none<Address>(),
      createdAt: 1n,
      settledAt: none<bigint>(),
      bump: 1,
    },
  } satisfies Account<Match>;
}

describe("Match transaction builders", () => {
  const creatorTeam = [
    creature(creatureAddresses[0], owner, 1001n),
    creature(creatureAddresses[1], owner, 1002n),
    creature(creatureAddresses[2], owner, 1003n),
  ];
  const opponentTeam = [
    creature(creatureAddresses[3], opponent, 1004n),
    creature(creatureAddresses[4], opponent, 1005n),
    creature(creatureAddresses[5], opponent, 1006n),
  ];

  it("requires three distinct Creatures owned by the signer", () => {
    expect(() => validateCreatureTeam(owner, creatorTeam)).not.toThrow();
    expect(() =>
      validateCreatureTeam(owner, [
        creatorTeam[0],
        creatorTeam[0],
        creatorTeam[2],
      ]),
    ).toThrow("different Creature");
    expect(() => validateCreatureTeam(owner, opponentTeam)).toThrow(
      "belong to this wallet",
    );
  });

  it("preserves the selected slot order when opening", async () => {
    const instruction = await buildOpenMatchInstruction(
      createNoopSigner(owner),
      creatorTeam,
      9n,
    );
    expect(
      instruction.accounts?.slice(3, 6).map((meta) => meta.address),
    ).toEqual(creatorTeam.map((item) => item.address));
  });

  it("appends the exact Creature, SpeciesConfig, and System Program order", async () => {
    const matchAccount = openMatch(creatorTeam);
    const instruction = await buildJoinMatchInstruction(
      createNoopSigner(opponent),
      matchAccount,
      creatorTeam,
      opponentTeam,
    );
    const creatorConfigs = await Promise.all(
      creatorTeam.map(
        async (item) =>
          (
            await findSpeciesConfigPda({ catalogueId: item.data.catalogueId })
          )[0],
      ),
    );
    const opponentConfigs = await Promise.all(
      opponentTeam.map(
        async (item) =>
          (
            await findSpeciesConfigPda({ catalogueId: item.data.catalogueId })
          )[0],
      ),
    );

    expect(instruction.accounts?.slice(4).map((meta) => meta.address)).toEqual([
      ...creatorTeam.map((item) => item.address),
      ...opponentTeam.map((item) => item.address),
      ...creatorConfigs,
      ...opponentConfigs,
      owner,
    ]);
  });
});
