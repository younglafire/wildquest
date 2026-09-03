import type { Metadata } from "next";
import { GameShell } from "../components/game-shell";
import { HomeContent } from "./home-content";

export const metadata: Metadata = {
  title: "Expedition Home | WildQuest",
  description: "Track your wildlife expedition and choose your next action.",
};

export default function ExpeditionHomePage() {
  return (
    <GameShell>
      <HomeContent />
    </GameShell>
  );
}
