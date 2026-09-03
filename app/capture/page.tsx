import type { Metadata } from "next";
import Link from "next/link";
import { ClusterSelect } from "@/app/components/cluster-select";
import { GridBackground } from "@/app/components/grid-background";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { WalletButton } from "@/app/components/wallet-button";
import { CaptureForm } from "./capture-form";

export const metadata: Metadata = {
  title: "Capture a Discovery | WildQuest",
  description: "Photograph or upload a wildlife discovery.",
};

export default function CapturePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight transition hover:text-muted"
          >
            WildQuest
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="px-5 pb-16 pt-8 sm:px-6 sm:pt-14">
          <CaptureForm />
          <div className="mx-auto mt-5 flex max-w-2xl items-center justify-between gap-4 px-1 text-xs text-muted">
            <Link href="/" className="transition hover:text-foreground">
              ← Back to dashboard
            </Link>
            <span>Identification comes next</span>
          </div>
        </main>
      </div>
    </div>
  );
}
