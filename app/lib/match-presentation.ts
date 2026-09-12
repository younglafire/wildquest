import type { Address } from "@solana/kit";
import { MatchStatus } from "../generated/wildquest";

export function getPlayerMatchResult(input: {
  status: MatchStatus;
  player: Address | null;
  opponent: Address | null;
  winner: Address | null;
}) {
  const hasResult =
    input.status === MatchStatus.Claimable ||
    input.status === MatchStatus.Settled;
  if (!hasResult || !input.player || !input.opponent) return null;
  if (input.winner === input.player) return "Victory";
  if (input.winner === null) return "Draw";
  return "Defeat";
}
