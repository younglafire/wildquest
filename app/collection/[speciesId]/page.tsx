import type { Metadata } from "next";
import { GameShell } from "../../components/game-shell";
import { SpeciesDetail } from "./species-detail";

export const metadata: Metadata = {
  title: "Species Field Guide | WildQuest",
  description: "Learn about a WildQuest catalogue species.",
};

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ speciesId: string }>;
}) {
  const { speciesId } = await params;
  return (
    <GameShell>
      <SpeciesDetail speciesId={speciesId} />
    </GameShell>
  );
}
