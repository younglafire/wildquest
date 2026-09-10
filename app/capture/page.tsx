import type { Metadata } from "next";
import Link from "next/link";
import { GameShell } from "@/app/components/game-shell";
import { CaptureExperience } from "./capture-experience";

export const metadata: Metadata = {
  title: "Capture a Creature | WildQuest",
  description: "Photograph or upload one of the 36 battle creatures.",
};

export default function CapturePage() {
  return (
    <GameShell>
      <main className="px-5 pb-16 pt-8 sm:px-6 sm:pt-14">
        <CaptureExperience />
        <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between gap-4 px-1 text-xs text-muted">
          <Link href="/home" className="transition hover:text-foreground">
            ← Back to home
          </Link>
          <span>Photos are processed in memory</span>
        </div>
      </main>
    </GameShell>
  );
}
