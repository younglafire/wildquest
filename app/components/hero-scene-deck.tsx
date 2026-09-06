"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playSlideTransitionSound,
  playTactileClick,
  toggleSound,
} from "../lib/sfx";

type SceneKey = "cards" | "scanner" | "rewards" | "bounty";

const SCENES = [
  { id: "cards" as SceneKey, label: "01 · Wild Cards", icon: "🃏" },
  { id: "scanner" as SceneKey, label: "02 · AI Bio-Scanner", icon: "🔬" },
  { id: "rewards" as SceneKey, label: "03 · Reward Tiers", icon: "🥇" },
  { id: "bounty" as SceneKey, label: "04 · Bounty Quest", icon: "🎯" },
] as const;

export function HeroSceneDeck() {
  const [activeScene, setActiveScene] = useState<SceneKey>("cards");
  const [soundOn, setSoundOn] = useState(true);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [autoPlay, setAutoPlay] = useState(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 3D Card tilt state for Scene 1
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentIndex = SCENES.findIndex((s) => s.id === activeScene);

  const switchScene = useCallback((target: SceneKey, direction: "next" | "prev" = "next") => {
    setSlideDirection(direction);
    setActiveScene(target);
    playSlideTransitionSound();
  }, []);

  const goToNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SCENES.length;
    switchScene(SCENES[nextIdx].id, "next");
  }, [currentIndex, switchScene]);

  const goToPrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + SCENES.length) % SCENES.length;
    switchScene(SCENES[prevIdx].id, "prev");
  }, [currentIndex, switchScene]);

  // Keyboard arrow keys for PPT slide navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "ArrowLeft") {
        goToPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Auto-play timer (pauses on user interaction)
  useEffect(() => {
    if (!autoPlay) return;
    autoPlayTimerRef.current = setTimeout(() => {
      setSlideDirection("next");
      setActiveScene(SCENES[(currentIndex + 1) % SCENES.length].id);
    }, 7000);
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [activeScene, autoPlay, currentIndex]);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    // Max tilt: 15 degrees
    const rotateY = (x / (rect.width / 2)) * 14;
    const rotateX = -(y / (rect.height / 2)) * 14;
    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-3xl border-2 border-emerald-900/30 bg-card/85 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.7)] backdrop-blur-md dark:border-emerald-500/25"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Top Slide Control Bar (PowerPoint / Game Terminal Tabs) */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-cream/50 px-4 py-3 dark:bg-black/30 sm:px-6">
        {/* Slide Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {SCENES.map((scene, idx) => {
            const isActive = scene.id === activeScene;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  switchScene(scene.id, idx > currentIndex ? "next" : "prev");
                  playTactileClick();
                }}
                className={`group relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md dark:bg-emerald-500"
                    : "bg-transparent text-muted hover:bg-cream hover:text-foreground dark:hover:bg-card"
                }`}
              >
                <span>{scene.icon}</span>
                <span className="hidden sm:inline">{scene.label}</span>
                {isActive && (
                  <span className="absolute -bottom-3 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Audio Toggle & PPT Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSoundToggle}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:border-emerald-500 hover:text-foreground"
            title={soundOn ? "Mute game SFX" : "Enable game SFX"}
          >
            <span>{soundOn ? "🔊" : "🔇"}</span>
            <span className="hidden sm:inline">{soundOn ? "SFX ON" : "MUTED"}</span>
          </button>

          <div className="flex items-center rounded-xl border border-border bg-card/80 p-0.5">
            <button
              type="button"
              onClick={() => {
                goToPrev();
                playTactileClick();
              }}
              aria-label="Previous slide"
              className="rounded-lg px-2 py-1 text-xs font-black text-muted transition hover:bg-cream hover:text-foreground dark:hover:bg-card"
            >
              ❮
            </button>
            <span className="px-1 font-mono text-[10px] font-bold text-muted">
              {currentIndex + 1}/{SCENES.length}
            </span>
            <button
              type="button"
              onClick={() => {
                goToNext();
                playTactileClick();
              }}
              aria-label="Next slide"
              className="rounded-lg px-2 py-1 text-xs font-black text-muted transition hover:bg-cream hover:text-foreground dark:hover:bg-card"
            >
              ❯
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Stage (Scene Viewport with PPT Slide Animation) */}
      <div className="relative min-h-[460px] p-6 sm:p-8">
        {/* ===================== SCENE 1: WILD CARDS ===================== */}
        {activeScene === "cards" && (
          <div
            className={`transition-all duration-500 ease-out ${
              slideDirection === "next"
                ? "animate-in fade-in slide-in-from-right-8"
                : "animate-in fade-in slide-in-from-left-8"
            }`}
          >
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
              {/* Telemetry Info */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <span>✨ 3D TCG CARD ENGINE</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Inspect Your Collectibles in 3D
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Hover your cursor or tilt your device over the cards to feel the physical holo-foil reflection. Every capture is graded with cryptographic metadata on Solana.
                </p>

                <div className="space-y-2.5 pt-2 text-xs font-mono">
                  <div className="flex items-center justify-between rounded-xl bg-cream/70 p-2.5 dark:bg-black/30">
                    <span className="text-muted">LIVE TELEMETRY:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">10.7769° N, 106.7009° E</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-cream/70 p-2.5 dark:bg-black/30">
                    <span className="text-muted">BIOMETRIC RADAR:</span>
                    <span className="font-bold text-amber-500">8 CATALOGUE SPECIES DETECTED</span>
                  </div>
                </div>
              </div>

              {/* 3D Tilt Hero Card */}
              <div className="flex justify-center [perspective:1000px]">
                <div
                  ref={cardRef}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                    transition: cardTilt.x === 0 ? "transform 0.5s ease" : "none",
                  }}
                  className="relative h-[380px] w-[270px] cursor-pointer rounded-3xl border-2 border-amber-500/70 bg-gradient-to-b from-card via-card to-background p-5 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.45)] transition-shadow duration-300 hover:shadow-[0_25px_75px_-10px_rgba(245,158,11,0.65)]"
                >
                  {/* Dynamic Specular Glare */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-40 mix-blend-overlay"
                    style={{
                      background: `radial-gradient(circle at ${50 + cardTilt.y * 3}% ${
                        50 + cardTilt.x * 3
                      }%, rgba(255,255,255,0.8), transparent 60%)`,
                    }}
                  />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between text-xs font-black uppercase">
                    <span className="rounded-full bg-amber-500/25 px-2.5 py-0.5 text-amber-700 dark:text-amber-300">
                      🥇 Gold Tier
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      +100 XP
                    </span>
                  </div>

                  {/* Art Box */}
                  <div className="relative mt-3.5 flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-teal-500/20 text-7xl shadow-inner">
                    <span className="drop-shadow-xl">🐕</span>
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-mono text-amber-300 backdrop-blur">
                      Laplacian 340
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-lg font-black tracking-tight">Golden Retriever</h4>
                      <span className="text-[10px] font-bold text-muted">COMMON</span>
                    </div>
                    <p className="text-xs text-muted">
                      Confidence 96.4% · Certified sharpness & center luminance.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-2.5 text-[11px] font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">✓ Onchain PDA</span>
                    <span className="font-mono text-muted">pHash verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SCENE 2: BIO-SCANNER ===================== */}
        {activeScene === "scanner" && (
          <div
            className={`transition-all duration-500 ease-out ${
              slideDirection === "next"
                ? "animate-in fade-in slide-in-from-right-8"
                : "animate-in fade-in slide-in-from-left-8"
            }`}
          >
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Scanner Viewport Simulation */}
              <div className="relative mx-auto flex h-[360px] w-full max-w-sm flex-col justify-between overflow-hidden rounded-3xl border-2 border-emerald-500/60 bg-black/90 p-5 font-mono text-xs text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                {/* 4 Neon Viewfinder Brackets */}
                <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-emerald-400" />
                <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-emerald-400" />
                <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-emerald-400" />
                <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-emerald-400" />

                {/* Laser Scanning Line */}
                <div className="animate-shimmer pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]" />

                {/* Reticle Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-28 w-28 rounded-full border border-emerald-500/30 border-dashed animate-spin [animation-duration:12s]" />
                  <span className="text-6xl drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">🦋</span>
                </div>

                {/* HUD Top Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    TARGET LOCKED
                  </span>
                  <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] text-emerald-300">
                    RESNET-50 ONNX
                  </span>
                </div>

                {/* HUD Bottom Readout */}
                <div className="relative z-10 space-y-1.5 rounded-xl bg-black/70 p-3 backdrop-blur">
                  <div className="flex justify-between">
                    <span>SPECIES:</span>
                    <span className="font-bold text-white">Papilio machaon (Butterfly)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CONFIDENCE:</span>
                    <span className="text-amber-300 font-bold">94.8% [||||||||||||||.]</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>pHash DISTANCE:</span>
                    <span className="text-emerald-400">0 / 64 (Unique Proof)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <span>🔬 ON-DEVICE AI VISION</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Neural Classification Without Servers
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  WildQuest runs local inference via Microsoft ResNet-50. Zero photos leave your browser or get stored in the cloud. Sharpness and center luminance are evaluated in real time to prevent low-effort captures.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs">
                  <li className="flex items-center gap-2 text-foreground font-semibold">
                    <span className="text-emerald-500">✓</span> Minimum 70% confidence gate to prevent false detections
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-semibold">
                    <span className="text-emerald-500">✓</span> 64-bit Perceptual Hash ensures no reused or duplicate photos
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-semibold">
                    <span className="text-emerald-500">✓</span> Fully offline-capable local vision engine
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SCENE 3: REWARDS ===================== */}
        {activeScene === "rewards" && (
          <div
            className={`transition-all duration-500 ease-out ${
              slideDirection === "next"
                ? "animate-in fade-in slide-in-from-right-8"
                : "animate-in fade-in slide-in-from-left-8"
            }`}
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <span>🥇 EXPEDITION GRADE TIERS</span>
              </div>
              <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Earn More XP with Superior Photo Quality
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
                The smart contract derives XP strictly from validated quality grades. Better framing, focus, and illumination award higher tier points.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {/* Bronze */}
              <div className="rounded-2xl border-2 border-amber-900/30 bg-card p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-amber-700">
                <span className="text-4xl">🥉</span>
                <h4 className="mt-3 text-lg font-black text-amber-800 dark:text-amber-400">Bronze Tier</h4>
                <p className="mt-1 font-mono text-2xl font-black text-foreground">+50 XP</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Confidence ≥ 70%. Standard capture with recognizable species anatomy.
                </p>
              </div>

              {/* Silver */}
              <div className="rounded-2xl border-2 border-slate-400/50 bg-card p-5 text-center shadow-md transition hover:-translate-y-1 hover:border-slate-300">
                <span className="text-4xl">🥈</span>
                <h4 className="mt-3 text-lg font-black text-slate-600 dark:text-slate-300">Silver Tier</h4>
                <p className="mt-1 font-mono text-2xl font-black text-foreground">+75 XP</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Confidence ≥ 80% with sharp focus and balanced center illumination.
                </p>
              </div>

              {/* Gold */}
              <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-500/15 via-card to-card p-5 text-center shadow-lg transition hover:-translate-y-1 hover:border-amber-400">
                <span className="text-4xl">🥇</span>
                <h4 className="mt-3 text-lg font-black text-amber-600 dark:text-amber-400">Gold Tier</h4>
                <p className="mt-1 font-mono text-2xl font-black text-foreground">+100 XP</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Confidence ≥ 90% with maximum sharpness variance ≥ 200 and prime lighting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SCENE 4: BOUNTY QUEST ===================== */}
        {activeScene === "bounty" && (
          <div
            className={`transition-all duration-500 ease-out ${
              slideDirection === "next"
                ? "animate-in fade-in slide-in-from-right-8"
                : "animate-in fade-in slide-in-from-left-8"
            }`}
          >
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <span>🎯 ACTIVE ONCHAIN CAMPAIGN</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Campus Field Survey #01
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  The flagship expedition mission is live on Solana Devnet. Find all 5 target species in the wild, submit your Discovery accounts as proof, and claim the exclusive Founder Badge!
                </p>

                <div className="rounded-2xl border border-border bg-cream/60 p-4 dark:bg-black/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Bounty Reward</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">+100 Bonus XP</span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      🏆 1 Founder Badge
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Quest Targets Visual */}
              <div className="rounded-3xl border-2 border-emerald-900/30 bg-card/90 p-5 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Target Species Checklist (5/5)
                </p>
                <div className="mt-4 space-y-2.5">
                  {[
                    { icon: "🐝", name: "Bee", biome: "Meadow / Pollinator" },
                    { icon: "🐔", name: "Chicken", biome: "Farm / Rural" },
                    { icon: "🦋", name: "Butterfly", biome: "Forest Canopy" },
                    { icon: "🦗", name: "Dragonfly", biome: "Wetlands" },
                    { icon: "🐸", name: "Frog", biome: "Riverbed" },
                  ].map((target) => (
                    <div
                      key={target.name}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold transition hover:border-emerald-500"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{target.icon}</span>
                        <div>
                          <p className="font-black text-foreground">{target.name}</p>
                          <p className="text-[10px] text-muted">{target.biome}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        TARGET
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide Progress Indicator Bar */}
      <div className="flex h-1.5 w-full bg-border/40">
        {SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            className={`h-full flex-1 transition-all duration-300 ${
              idx === currentIndex
                ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                : idx < currentIndex
                  ? "bg-emerald-700/60"
                  : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
