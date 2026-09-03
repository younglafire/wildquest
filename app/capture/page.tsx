import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/app/components/app-header";
import { GridBackground } from "@/app/components/grid-background";
import { CaptureExperience } from "./capture-experience";

export const metadata: Metadata = {
  title: "Capture a Discovery | WildQuest",
  description: "Photograph or upload a wildlife discovery.",
};

export default function CapturePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <AppHeader />

        <main className="px-5 pb-16 pt-8 sm:px-6 sm:pt-14">
          <CaptureExperience />
          <div className="mx-auto mt-5 flex max-w-2xl items-center justify-between gap-4 px-1 text-xs text-muted">
            <Link href="/" className="transition hover:text-foreground">
              ← Back to dashboard
            </Link>
            <span>Photos are processed in memory</span>
          </div>
        </main>
      </div>
    </div>
  );
}
