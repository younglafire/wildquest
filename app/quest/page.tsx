import type { Metadata } from "next";
import { GameShell } from "../components/game-shell";
import { QuestContent } from "./quest-content";

export const metadata: Metadata = {
  title: "Quest | WildQuest",
  description: "Complete wildlife targets and claim an onchain reward.",
};

export default function QuestPage() {
  return (
    <GameShell>
      <QuestContent />
    </GameShell>
  );
}
