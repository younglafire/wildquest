import type { Metadata } from "next";
import { GameShell } from "../components/game-shell";
import { CollectionContent } from "./collection-content";

export const metadata: Metadata = {
  title: "Collection | WildQuest",
  description: "View wildlife discoveries recorded on Solana Devnet.",
};

export default function CollectionPage() {
  return (
    <GameShell>
      <CollectionContent />
    </GameShell>
  );
}
