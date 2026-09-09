import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";
import { getCreatureSize } from "../generated/wildquest";
import { getOwnedCreatureFilters } from "./creatures";

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
});
