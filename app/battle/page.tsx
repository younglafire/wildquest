import type { Metadata } from "next";
import { Suspense } from "react";
import { GameShell } from "../components/game-shell";
import { BattleContent } from "./battle-content";

export const metadata: Metadata = {
  title: "Battle | WildQuest",
  description: "Build a three-Creature team and play a deterministic match.",
};

export default function BattlePage() {
  return (
    <GameShell>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-5 py-14 text-sm text-muted">
            Loading battle arena…
          </main>
        }
      >
        <BattleContent />
      </Suspense>
    </GameShell>
  );
}
