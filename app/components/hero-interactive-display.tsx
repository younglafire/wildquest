"use client";

import { useState } from "react";
import { Creature3DStage } from "./creature-3d-stage";
import { HeroCardsShowcase } from "./hero-cards-showcase";
import { playSlideTransitionSound } from "../lib/sfx";

export function HeroInteractiveDisplay() {
  const [viewMode, setViewMode] = useState<"3d" | "cards">("3d");

  const switchMode = (mode: "3d" | "cards") => {
    if (mode === viewMode) return;
    setViewMode(mode);
    playSlideTransitionSound();
  };

  return (
    <div className="flex w-full max-w-4xl flex-col items-center mx-auto">
      {/* Top Selector Tabs: 3D Stage vs Cards Showcase */}
      <div className="mb-3 flex items-center gap-1.5 rounded-2xl border border-border bg-card/85 p-1 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => switchMode("3d")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all ${
            viewMode === "3d"
              ? "bg-emerald-600 text-white shadow-md dark:bg-emerald-500"
              : "text-muted hover:bg-cream hover:text-foreground dark:hover:bg-black/40"
          }`}
        >
          <span>🔬</span>
          <span>3D BIO-SCANNER</span>
          {viewMode === "3d" && (
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => switchMode("cards")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all ${
            viewMode === "cards"
              ? "bg-emerald-600 text-white shadow-md dark:bg-emerald-500"
              : "text-muted hover:bg-cream hover:text-foreground dark:hover:bg-black/40"
          }`}
        >
          <span>🃏</span>
          <span>EXPEDITION CARDS</span>
        </button>
      </div>

      {/* Render Active Interactive View */}
      <div className="w-full">
        {viewMode === "3d" ? <Creature3DStage /> : <HeroCardsShowcase />}
      </div>
    </div>
  );
}
