import type { Metadata } from "next";
import { Suspense } from "react";
import { GameShell } from "../../components/game-shell";
import { ConfirmationContent } from "./confirmation-content";

export const metadata: Metadata = {
  title: "Discovery Confirmed | WildQuest",
  description: "Your wildlife discovery was recorded on Solana Devnet.",
};

export default function ConfirmedDiscoveryPage() {
  return (
    <GameShell>
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
    </GameShell>
  );
}
