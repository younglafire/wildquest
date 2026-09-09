import type { Metadata } from "next";
import { GameShell } from "../components/game-shell";
import { BattleContent } from "./battle-content";

export const metadata: Metadata = {
  title: "Battle | WildQuest",
  description: "Build a three-Creature team and play a deterministic match.",
};

export default function BattlePage() {
  return (
    <GameShell>
      <BattleContent />
    </GameShell>
  );
}
