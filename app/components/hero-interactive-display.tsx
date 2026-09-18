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
      <div className="mb-4 flex items-center justify-center gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={() => switchMode("3d")}
          aria-label="3D Bio-Scanner View"
          className={`group relative inline-flex min-h-10 sm:min-h-12 items-center justify-center px-6 sm:px-9 py-2 select-none transition-all duration-200 active:scale-95 ${
            viewMode === "3d" ? "scale-105" : "opacity-75 hover:opacity-100"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/button_tab.png"
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full object-fill transition-all ${
              viewMode === "3d"
                ? "drop-shadow-[0_0_14px_rgba(74,222,128,0.75)] brightness-125 saturate-125"
                : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] brightness-85 group-hover:brightness-105"
            }`}
            draggable={false}
          />
          <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-black tracking-wider">
            <span>🔬</span>
            <span
              className={
                viewMode === "3d"
                  ? "text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.9)]"
                  : "text-[#d4c5a9] group-hover:text-white"
              }
            >
              3D BIO-SCANNER
            </span>
            {viewMode === "3d" && (
              <span className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse" />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => switchMode("cards")}
          aria-label="Expedition Cards View"
          className={`group relative inline-flex min-h-10 sm:min-h-12 items-center justify-center px-6 sm:px-9 py-2 select-none transition-all duration-200 active:scale-95 ${
            viewMode === "cards" ? "scale-105" : "opacity-75 hover:opacity-100"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/button_tab.png"
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full object-fill transition-all ${
              viewMode === "cards"
                ? "drop-shadow-[0_0_14px_rgba(251,191,36,0.75)] brightness-125 saturate-125"
                : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] brightness-85 group-hover:brightness-105"
            }`}
            draggable={false}
          />
          <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-black tracking-wider">
            <span>🃏</span>
            <span
              className={
                viewMode === "cards"
                  ? "text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  : "text-[#d4c5a9] group-hover:text-white"
              }
            >
              EXPEDITION CARDS
            </span>
            {viewMode === "cards" && (
              <span className="h-2 w-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24] animate-pulse" />
            )}
          </div>
        </button>
      </div>

      {/* Render Active Interactive View */}
      <div className="w-full">
        {viewMode === "3d" ? <Creature3DStage /> : <HeroCardsShowcase />}
      </div>
    </div>
  );
}
