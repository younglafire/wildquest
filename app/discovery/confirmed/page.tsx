import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "../../components/app-header";
import { GridBackground } from "../../components/grid-background";
import { ConfirmationContent } from "./confirmation-content";

export const metadata: Metadata = {
  title: "Discovery Confirmed | WildQuest",
  description: "Your wildlife discovery was recorded on Solana Devnet.",
};

export default function ConfirmedDiscoveryPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <AppHeader />
        <main className="px-5 pb-16 pt-12 sm:px-6 sm:pt-20">
          <Suspense
            fallback={
              <p className="mx-auto max-w-xl text-center text-sm text-muted">
                Loading confirmation…
              </p>
            }
          >
            <ConfirmationContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
