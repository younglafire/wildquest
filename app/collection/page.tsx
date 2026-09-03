import type { Metadata } from "next";
import { AppHeader } from "../components/app-header";
import { GridBackground } from "../components/grid-background";
import { CollectionContent } from "./collection-content";

export const metadata: Metadata = {
  title: "Collection | WildQuest",
  description: "View wildlife discoveries recorded on Solana Devnet.",
};

export default function CollectionPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <AppHeader />
        <CollectionContent />
      </div>
    </div>
  );
}
