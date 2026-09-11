import type { Metadata } from "next";
import { MatchDetail } from "../../battle/[matchAddress]/match-detail";
import { GameShell } from "../../components/game-shell";

export const metadata: Metadata = {
  title: "Match | WildQuest",
  description:
    "Watch a shared WildQuest match and inspect its onchain receipts.",
};

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchAddress: string }>;
}) {
  const { matchAddress } = await params;
  return (
    <GameShell>
      <MatchDetail matchAddress={matchAddress} />
    </GameShell>
  );
}
