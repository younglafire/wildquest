"use client";

import { HeroCardsShowcase } from "./hero-cards-showcase";

export function HeroInteractiveDisplay() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center mx-auto">
      <div className="w-full">
        <HeroCardsShowcase />
      </div>
    </div>
  );
}
