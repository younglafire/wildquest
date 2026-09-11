import { address, createNoopSigner, lamports, type Account } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  getCreatureSize,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
} from "../generated/wildquest";
import {
  buildReleaseCreatureInstruction,
  getCreatureFilters,
  getOwnedCreatureFilters,
} from "./creatures";

describe("owned Creature account queries", () => {
  it("filters by Creature discriminator, account size, and owner", () => {
    const owner = address("11111111111111111111111111111111");
    const filters = getOwnedCreatureFilters(owner);

    expect(filters[0]).toEqual({ dataSize: BigInt(getCreatureSize()) });
    expect(filters[1]).toMatchObject({
      memcmp: { offset: 0n, encoding: "base58" },
    });
    expect(filters[2]).toMatchObject({
      memcmp: { offset: 8n, encoding: "base58" },
    });
  });

  it("can query every Creature for an administrator reset", () => {
    expect(getCreatureFilters()).toHaveLength(2);
  });

  it("builds a release only for the recorded owner", () => {
    const owner = address("11111111111111111111111111111111");
    const creature = {
      address: address("SysvarRent111111111111111111111111111111111"),
      executable: false,
      lamports: lamports(1n),
      programAddress: WILDQUEST_PROGRAM_ADDRESS,
      space: BigInt(getCreatureSize()),
      data: {
        discriminator: new Uint8Array(8),
        owner,
        catalogueId: 1001n,
        proofHash: new Uint8Array(32),
        capturedAt: 1n,
        balanceVersion: 1,
        bump: 1,
      },
    } satisfies Account<Creature>;
    expect(
      buildReleaseCreatureInstruction(createNoopSigner(owner), creature)
        .accounts?.[1]?.address,
    ).toBe(creature.address);
    expect(() =>
      buildReleaseCreatureInstruction(
        createNoopSigner(
          address("Vote111111111111111111111111111111111111111"),
        ),
        creature,
      ),
    ).toThrow("owner");
  });
});
