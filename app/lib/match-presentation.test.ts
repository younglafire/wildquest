import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";
import { MatchStatus } from "../generated/wildquest";
import { getPlayerMatchResult } from "./match-presentation";

const player = address("11111111111111111111111111111111");
const opponent = address("SysvarC1ock11111111111111111111111111111111");

describe("getPlayerMatchResult", () => {
  it("does not call an active Match a draw", () => {
    expect(
      getPlayerMatchResult({
        status: MatchStatus.Active,
        player,
        opponent,
        winner: null,
      }),
    ).toBeNull();
  });

  it("shows terminal win, loss, and draw results", () => {
    expect(
      getPlayerMatchResult({
        status: MatchStatus.Claimable,
        player,
        opponent,
        winner: player,
      }),
    ).toBe("Victory");
    expect(
      getPlayerMatchResult({
        status: MatchStatus.Claimable,
        player,
        opponent,
        winner: opponent,
      }),
    ).toBe("Defeat");
    expect(
      getPlayerMatchResult({
        status: MatchStatus.Settled,
        player,
        opponent,
        winner: null,
      }),
    ).toBe("Draw");
  });
});
