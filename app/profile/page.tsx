import type { Metadata } from "next";
import { GameShell } from "../components/game-shell";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = {
  title: "Explorer Passport | WildQuest",
  description: "View your WildQuest Player account and onchain progress.",
};

export default function ProfilePage() {
  return (
    <GameShell>
      <ProfileContent />
    </GameShell>
  );
}
