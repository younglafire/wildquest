"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playChimeSound } from "../lib/sfx";

export interface CreatureHologramStageProps {
  speciesId: string;
  speciesName: string;
  catalogueId?: number | string;
  rarity?: string;
  role?: string | null;
  imageUrl?: string | null;
  confidence?: number;
  compact?: boolean;
  autoRotate?: boolean;
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  } | null;
  summary?: string | null;
  habitat?: string | null;
}

export interface AuraPalette {
  name: string;
  rootColor: string;
  flameMid: string;
  flameHighlight: string;
  flameCore: string;
  emberColors: [number, number, number][];
  lightningColor: number;
  lightColor: number;
  ambientGlow: string;
}

export function getRarityAuraPalette(rarityRaw?: string): AuraPalette {
  const r = (rarityRaw ?? "common").toLowerCase().trim();

  if (r.includes("legendary")) {
    return {
      name: "Divine Golden Ki (Super Saiyan)",
      rootColor: "rgba(180, 83, 9, 0.95)", // Amber 700
      flameMid: "rgba(245, 158, 11, 0.92)", // Amber 500
      flameHighlight: "rgba(253, 224, 71, 0.88)", // Yellow 300
      flameCore: "rgba(254, 240, 138, 1)", // Yellow 200
      emberColors: [
        [1.0, 0.95, 0.6], // white-gold
        [1.0, 0.75, 0.15], // bright amber
        [0.95, 0.45, 0.05], // deep gold
      ],
      lightningColor: 0x67e8f9, // Electric SSJ2 Cyan #67e8f9
      lightColor: 0xf59e0b, // Gold Light
      ambientGlow: "rgba(245, 158, 11, 0.22)",
    };
  }

  if (r.includes("epic")) {
    return {
      name: "Crimson Dragonfire",
      rootColor: "rgba(153, 27, 27, 0.95)", // Red 800
      flameMid: "rgba(239, 68, 68, 0.92)", // Red 500
      flameHighlight: "rgba(251, 146, 60, 0.88)", // Orange 400
      flameCore: "rgba(254, 202, 202, 1)", // Red 200
      emberColors: [
        [1.0, 0.85, 0.7], // pale red-hot
        [1.0, 0.25, 0.2], // crimson
        [0.85, 0.1, 0.1], // deep ruby
      ],
      lightningColor: 0xfde047, // Solar Golden Spark #fde047
      lightColor: 0xef4444, // Crimson Light
      ambientGlow: "rgba(239, 68, 68, 0.22)",
    };
  }

  if (r.includes("rare")) {
    return {
      name: "Arcane Amethyst Violet",
      rootColor: "rgba(91, 33, 182, 0.95)", // Violet 800
      flameMid: "rgba(139, 92, 246, 0.92)", // Violet 500
      flameHighlight: "rgba(216, 180, 254, 0.88)", // Violet 300
      flameCore: "rgba(243, 232, 255, 1)", // Violet 100
      emberColors: [
        [0.95, 0.85, 1.0], // pale violet
        [0.65, 0.35, 0.95], // bright purple
        [0.45, 0.15, 0.75], // dark violet
      ],
      lightningColor: 0xf472b6, // Arcane Neon Pink #f472b6
      lightColor: 0x8b5cf6, // Violet Light
      ambientGlow: "rgba(139, 92, 246, 0.22)",
    };
  }

  if (r.includes("uncommon")) {
    return {
      name: "Cobalt Storm Azure",
      rootColor: "rgba(30, 64, 175, 0.95)", // Blue 800
      flameMid: "rgba(59, 130, 246, 0.92)", // Blue 500
      flameHighlight: "rgba(147, 197, 253, 0.88)", // Blue 300
      flameCore: "rgba(224, 242, 254, 1)", // Sky 100
      emberColors: [
        [0.85, 0.95, 1.0], // ice white
        [0.2, 0.6, 1.0], // cobalt blue
        [0.1, 0.3, 0.85], // deep azure
      ],
      lightningColor: 0x38bdf8, // Sky Cyan Lightning #38bdf8
      lightColor: 0x3b82f6, // Cobalt Light
      ambientGlow: "rgba(59, 130, 246, 0.22)",
    };
  }

  // Default: Common -> Jade / Emerald Nature Flame
  return {
    name: "Jade Emerald Nature",
    rootColor: "rgba(6, 95, 70, 0.95)", // Emerald 800
    flameMid: "rgba(16, 185, 129, 0.92)", // Emerald 500
    flameHighlight: "rgba(110, 231, 183, 0.88)", // Emerald 300
    flameCore: "rgba(209, 250, 229, 1)", // Emerald 100
    emberColors: [
      [0.85, 1.0, 0.9], // mint white
      [0.2, 0.85, 0.55], // vibrant emerald
      [0.05, 0.5, 0.3], // deep forest jade
    ],
    lightningColor: 0x6ee7b7, // Mint Emerald Lightning #6ee7b7
    lightColor: 0x10b981, // Emerald Light
    ambientGlow: "rgba(16, 185, 129, 0.2)",
  };
}

function deriveDisplayStats(
  role?: string | null,
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  } | null,
) {
  if (stats && (stats.hp || stats.attack)) {
    return {
      hp: stats.hp ?? 85,
      attack: stats.attack ?? 80,
      defense: stats.defense ?? 65,
      speed: stats.speed ?? 75,
    };
  }

  const r = (role ?? "striker").toLowerCase();
  if (r.includes("guardian")) {
    return { hp: 120, attack: 68, defense: 98, speed: 52 };
  }
  if (r.includes("skirmisher")) {
    return { hp: 85, attack: 92, defense: 62, speed: 96 };
  }
  if (r.includes("scout")) {
    return { hp: 78, attack: 75, defense: 65, speed: 108 };
  }
  // Default: Striker
  return { hp: 88, attack: 96, defense: 64, speed: 82 };
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3,
): void {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (lineCount >= maxLines - 1) {
        ctx.fillText(line.trim() + "…", x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line.trim().length > 0 && lineCount < maxLines) {
    ctx.fillText(line.trim(), x, y);
  }
}

function createFlameTongueTexture(palette: AuraPalette): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Outer fiery tongue with rarity aura gradient
    const outerGrad = ctx.createLinearGradient(64, 256, 64, 10);
    outerGrad.addColorStop(0, palette.rootColor);
    outerGrad.addColorStop(0.25, palette.flameMid);
    outerGrad.addColorStop(0.68, palette.flameHighlight);
    outerGrad.addColorStop(1, "rgba(255, 255, 255, 0)"); // tip fade

    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(64, 8); // sharp licking tip
    ctx.bezierCurveTo(86, 45, 112, 105, 100, 185);
    ctx.bezierCurveTo(94, 230, 80, 256, 64, 256);
    ctx.bezierCurveTo(48, 256, 34, 230, 28, 185);
    ctx.bezierCurveTo(16, 105, 42, 45, 64, 8);
    ctx.closePath();
    ctx.fill();

    // Inner bright flame core
    const innerGrad = ctx.createLinearGradient(64, 256, 64, 45);
    innerGrad.addColorStop(0, palette.flameCore);
    innerGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.95)");
    innerGrad.addColorStop(0.75, palette.flameHighlight);
    innerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(64, 40);
    ctx.bezierCurveTo(76, 75, 88, 130, 82, 190);
    ctx.bezierCurveTo(78, 225, 70, 250, 64, 250);
    ctx.bezierCurveTo(58, 250, 50, 225, 46, 190);
    ctx.bezierCurveTo(40, 130, 52, 75, 64, 40);
    ctx.closePath();
    ctx.fill();

    // White-hot center spark
    const sparkGrad = ctx.createRadialGradient(64, 185, 0, 64, 185, 22);
    sparkGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    sparkGrad.addColorStop(0.5, palette.flameHighlight);
    sparkGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = sparkGrad;
    ctx.beginPath();
    ctx.arc(64, 185, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.35, "rgba(255, 255, 255, 0.9)");
    grad.addColorStop(0.75, "rgba(255, 255, 255, 0.4)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new THREE.CanvasTexture(canvas);
}

function createFlameWallTexture(palette: AuraPalette): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0, palette.rootColor);
    grad.addColorStop(0.22, palette.flameMid);
    grad.addColorStop(0.65, palette.flameHighlight);
    grad.addColorStop(0.88, palette.flameCore);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);

    const hGrad = ctx.createLinearGradient(0, 0, 128, 0);
    hGrad.addColorStop(0, "rgba(0,0,0,1)");
    hGrad.addColorStop(0.48, "rgba(0,0,0,0.85)");
    hGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, 128, 256);
  }
  return new THREE.CanvasTexture(canvas);
}

export function CreatureHologramStage({
  speciesId,
  speciesName,
  catalogueId,
  rarity = "Common",
  role,
  imageUrl,
  confidence,
  compact = false,
  autoRotate = true,
  stats,
  summary,
  habitat,
}: CreatureHologramStageProps) {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const creatureGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  const auraPalette = getRarityAuraPalette(rarity);

  useEffect(() => {
    const canvasMount = canvasMountRef.current;
    if (!canvasMount) return;

    setIsLoadingModel(true);

    // --- 1. Scene & Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = canvasMount.clientWidth || 420;
    const height = canvasMount.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Adjusted camera distance so the entire card, flames, and pedestal base fit completely in view
    camera.position.set(0, 0.02, compact ? 4.0 : 3.8);
    camera.lookAt(0, -0.06, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    canvasMount.replaceChildren(renderer.domElement);

    // --- 2. Lighting System with Rarity Tint ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xc8a96e, 4.0);
    goldKeyLight.position.set(4, 6, 5);
    goldKeyLight.castShadow = true;
    scene.add(goldKeyLight);

    const auraRimLight = new THREE.DirectionalLight(
      auraPalette.lightColor,
      3.4,
    );
    auraRimLight.position.set(-4, -1, -3);
    scene.add(auraRimLight);

    const topCyanLight = new THREE.PointLight(0x38bdf8, 1.8, 10);
    topCyanLight.position.set(0, 3, 1);
    scene.add(topCyanLight);

    // --- 3. Hologram Pedestal Base ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.25, 0);

    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.14, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x16120c,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Outer Glow Ring in Gold
    const goldRingGeo = new THREE.TorusGeometry(1.65, 0.035, 16, 64);
    const goldRingMat = new THREE.MeshBasicMaterial({ color: 0xc8a96e });
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.08;
    pedestalGroup.add(goldRing);

    // Holographic Polar Grid
    const polarGrid = new THREE.PolarGridHelper(
      1.55,
      8,
      6,
      32,
      0xc8a96e,
      0x3a2e1e,
    );
    polarGrid.position.y = 0.09;
    pedestalGroup.add(polarGrid);

    scene.add(pedestalGroup);

    // --- 4. Main Swivel Pivot (Contains 3D Card) ---
    const mainPivot = new THREE.Group();
    scene.add(mainPivot);
    cardGroupRef.current = mainPivot;

    // --- 5. Generate 3D Holographic Trading Card Canvas Textures (High-Res 1024x1432 for Mobile Clarity) ---
    const displayStats = deriveDisplayStats(role, stats);

    // Canvas 1: Front of Card (1024 x 1432 px - Ultra crisp text)
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = 1024;
    frontCanvas.height = 1432;
    const ctx = frontCanvas.getContext("2d");

    const drawCardFront = (imageElem?: HTMLImageElement) => {
      if (!ctx) return;

      // Deep obsidian gold background
      const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1432);
      bgGrad.addColorStop(0, "#1c1810");
      bgGrad.addColorStop(0.5, "#120f0a");
      bgGrad.addColorStop(1, "#0c0a07");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 1432);

      // Thick Gold ornate border
      ctx.strokeStyle = "#c8a96e";
      ctx.lineWidth = 26;
      ctx.strokeRect(20, 20, 984, 1392);

      ctx.strokeStyle = "#a07d48";
      ctx.lineWidth = 5;
      ctx.strokeRect(44, 44, 936, 1344);

      // Corner Runes
      ctx.fillStyle = "#c8a96e";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("✦", 60, 84);
      ctx.fillText("✦", 964, 84);
      ctx.fillText("✦", 60, 1370);
      ctx.fillText("✦", 964, 1370);

      // ==========================================
      // 1. TOP SECTION: CREATURE NAME & RARITY TAG (BIG & PROMINENT)
      // ==========================================
      ctx.fillStyle = "#f59e0b";
      ctx.font = "900 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `[ ${rarity.toUpperCase()} · ${role ? role.toUpperCase() : "CREATURE"} ]`,
        512,
        86,
      );

      // Main Creature Name (Extra Large, Ultra Readable on Phones)
      const nameStr = speciesName.toUpperCase();
      ctx.font =
        nameStr.length > 16 ? "900 42px sans-serif" : "900 48px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#c8a96e";
      ctx.shadowBlur = 10;
      ctx.fillText(nameStr, 512, 142);
      ctx.shadowBlur = 0; // reset shadow

      // ==========================================
      // 2. CENTER SECTION: ARTWORK SHOWCASE
      // ==========================================
      const artX = 64;
      const artY = 168;
      const artW = 896;
      const artH = 630;

      if (imageElem) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artW, artH, 20);
        ctx.clip();

        const imgW = imageElem.naturalWidth || imageElem.width || 1;
        const imgH = imageElem.naturalHeight || imageElem.height || 1;
        const targetAspect = artW / artH;
        const imgAspect = imgW / imgH;

        let sx = 0;
        let sy = 0;
        let sWidth = imgW;
        let sHeight = imgH;

        if (imgAspect > targetAspect) {
          sWidth = imgH * targetAspect;
          sx = (imgW - sWidth) / 2;
        } else {
          sHeight = imgW / targetAspect;
          sy = (imgH - sHeight) / 2;
        }

        ctx.drawImage(
          imageElem,
          sx,
          sy,
          sWidth,
          sHeight,
          artX,
          artY,
          artW,
          artH,
        );
        ctx.restore();

        // Inner frame border
        ctx.strokeStyle = "#c8a96e";
        ctx.lineWidth = 6;
        ctx.strokeRect(artX, artY, artW, artH);
      } else {
        // Fallback specimen scanning box
        ctx.fillStyle = "rgba(200, 169, 110, 0.12)";
        ctx.fillRect(artX, artY, artW, artH);
        ctx.strokeStyle = "#c8a96e";
        ctx.lineWidth = 4;
        ctx.strokeRect(artX, artY, artW, artH);

        ctx.fillStyle = "#c8a96e";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SCANNING SPECIMEN…", 512, 480);
      }

      // ==========================================
      // 3. BELOW ARTWORK: 4 CARD BATTLE STATS (CRISP, HUGE & ULTRA-READABLE)
      // ==========================================
      const statY = 820;
      const statH = 145;
      const statGap = 16;
      const statW = Math.floor((artW - statGap * 3) / 4); // ~212px each

      const statItems = [
        {
          label: "HP",
          value: displayStats.hp,
          color: "#4ade80",
          border: "#22c55e",
          bg: "rgba(34, 197, 94, 0.15)",
        },
        {
          label: "ATK",
          value: displayStats.attack,
          color: "#f87171",
          border: "#ef4444",
          bg: "rgba(239, 68, 68, 0.15)",
        },
        {
          label: "DEF",
          value: displayStats.defense,
          color: "#60a5fa",
          border: "#3b82f6",
          bg: "rgba(59, 130, 246, 0.15)",
        },
        {
          label: "SPD",
          value: displayStats.speed,
          color: "#facc15",
          border: "#eab308",
          bg: "rgba(234, 179, 8, 0.15)",
        },
      ];

      statItems.forEach((stat, idx) => {
        const x = artX + idx * (statW + statGap);

        // Deep solid black box background for maximum contrast
        ctx.fillStyle = "rgba(10, 8, 5, 0.98)";
        ctx.beginPath();
        ctx.roundRect(x, statY, statW, statH, 16);
        ctx.fill();

        // Inner tint
        ctx.fillStyle = stat.bg;
        ctx.beginPath();
        ctx.roundRect(x, statY, statW, statH, 16);
        ctx.fill();

        // Colored border
        ctx.strokeStyle = stat.border;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Stat Label
        ctx.fillStyle = stat.color;
        ctx.font = "900 26px monospace";
        ctx.textAlign = "center";
        ctx.fillText(stat.label, x + statW / 2, statY + 44);

        // Stat Value (Huge, Ultra High-Contrast White)
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 66px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(stat.value), x + statW / 2, statY + 118);
      });

      // ==========================================
      // 4. BOTTOM SECTION: LORE SUMMARY & VERIFICATION (RAZOR SHARP HIGH-CONTRAST)
      // ==========================================
      const infoBoxY = 985;
      const infoBoxH = 375;

      // Solid dark obsidian panel (no semi-transparency that washes out text)
      ctx.fillStyle = "rgba(8, 6, 4, 0.98)";
      ctx.beginPath();
      ctx.roundRect(artX, infoBoxY, artW, infoBoxH, 18);
      ctx.fill();

      ctx.strokeStyle = "rgba(200, 169, 110, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Habitat / Biome tag (Bold, bright gold)
      const habitatStr = habitat
        ? `🌍 HABITAT: ${habitat.toUpperCase()}`
        : "🌍 HABITAT: WILD HARMONY SANCTUARY";
      ctx.fillStyle = "#fbbf24";
      ctx.font = "900 28px monospace";
      ctx.textAlign = "left";
      ctx.fillText(habitatStr, artX + 28, infoBoxY + 48);

      // Trait / Specialty highlight
      const traitStr = `⚡ TRAIT: ${role ? role.toUpperCase() : "BALANCED CREATURE"} · ${rarity.toUpperCase()}`;
      ctx.fillStyle = "#34d399";
      ctx.font = "900 24px monospace";
      ctx.textAlign = "left";
      ctx.fillText(traitStr, artX + 28, infoBoxY + 86);

      // Brief summary / lore description (Pure solid white #ffffff, large 28px font, maximum clarity)
      const summaryText =
        summary ||
        `An authentic specimen from the WildQuest wilderness. Possesses sharp instincts and natural balance in the arena.`;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      wrapCanvasText(
        ctx,
        summaryText,
        artX + 28,
        infoBoxY + 135,
        artW - 56,
        42,
        3,
      );

      // Solana Onchain Verified Watermark
      const authStr =
        catalogueId != null
          ? `✦ SPECIES #${catalogueId} · SOLANA DEVNET ONCHAIN ✦`
          : "✦ WILDQUEST ONCHAIN SPECIMEN ✦";
      ctx.fillStyle = "#f3ba63";
      ctx.font = "900 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(authStr, 512, infoBoxY + 340);
    };

    drawCardFront();
    // Direct LinearFilter with NO mipmapping avoids the blur/haze of downscaled mipmap levels
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.minFilter = THREE.LinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;
    frontTexture.generateMipmaps = false;
    frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    frontTexture.needsUpdate = true;

    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawCardFront(img);
        frontTexture.needsUpdate = true;
      };
      img.src = imageUrl;
    }

    // Canvas 2: Back of Card (Guild Crest - 1024 x 1432)
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 1024;
    backCanvas.height = 1432;
    const backCtx = backCanvas.getContext("2d");
    if (backCtx) {
      // Obsidian gradient background
      const bGrad = backCtx.createLinearGradient(0, 0, 1024, 1432);
      bGrad.addColorStop(0, "#16120c");
      bGrad.addColorStop(0.5, "#0d0a07");
      bGrad.addColorStop(1, "#16120c");
      backCtx.fillStyle = bGrad;
      backCtx.fillRect(0, 0, 1024, 1432);

      // Double gold borders
      backCtx.strokeStyle = "#c8a96e";
      backCtx.lineWidth = 26;
      backCtx.strokeRect(20, 20, 984, 1392);

      backCtx.strokeStyle = "#a07d48";
      backCtx.lineWidth = 5;
      backCtx.strokeRect(44, 44, 936, 1344);

      // Central Mystical Circles
      backCtx.strokeStyle = "rgba(200, 169, 110, 0.4)";
      backCtx.lineWidth = 4;
      backCtx.beginPath();
      backCtx.arc(512, 716, 320, 0, Math.PI * 2);
      backCtx.stroke();

      backCtx.beginPath();
      backCtx.arc(512, 716, 240, 0, Math.PI * 2);
      backCtx.stroke();

      // WildQuest Guild Crest Emblem (Huge, Regal)
      backCtx.fillStyle = "#c8a96e";
      backCtx.font = "900 110px serif";
      backCtx.textAlign = "center";
      backCtx.fillText("WQ", 512, 690);

      backCtx.font = "900 46px sans-serif";
      backCtx.fillText("WILDQUEST", 512, 770);

      backCtx.font = "bold 24px monospace";
      backCtx.fillStyle = "#a07d48";
      backCtx.fillText("CHRONICLES OF SOLANA", 512, 820);

      // Runes at corners
      backCtx.font = "bold 36px monospace";
      backCtx.fillText("✦", 80, 120);
      backCtx.fillText("✦", 944, 120);
      backCtx.fillText("✦", 80, 1340);
      backCtx.fillText("✦", 944, 1340);
    }

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.minFilter = THREE.LinearFilter;
    backTexture.magFilter = THREE.LinearFilter;
    backTexture.generateMipmaps = false;
    backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    backTexture.needsUpdate = true;

    // Card geometry: Rounded slab with gold bevel sides
    const cardWidth = 1.9;
    const cardHeight = 2.65;
    const cardThickness = 0.05;
    const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0xc8a96e,
      metalness: 0.9,
      roughness: 0.2,
    });
    // Matte finish on card front eliminates specular glare from lights that washed out the text
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.02,
      roughness: 0.92,
    });
    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.5,
      roughness: 0.35,
    });

    const cardMesh = new THREE.Mesh(cardGeo, [
      sideMat,
      sideMat,
      sideMat,
      sideMat,
      frontMat,
      backMat,
    ]);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardMesh.position.set(0, 0.08, 0);
    mainPivot.add(cardMesh);

    // Floating energy particles around the 3D card
    const creatureGroup = new THREE.Group();
    mainPivot.add(creatureGroup);
    creatureGroupRef.current = creatureGroup;

    const particleCount = 48;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2.2;
      positions[i + 1] = (Math.random() - 0.5) * 2.8;
      positions[i + 2] = (Math.random() - 0.5) * 0.8;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: auraPalette.lightColor,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    creatureGroup.add(particles);

    setIsLoadingModel(false);

    // --- 7. Realistic Burning Fire & SSJ2 Lightning System (Rarity Tinted) ---
    const saiyanAuraGroup = new THREE.Group();
    mainPivot.add(saiyanAuraGroup);

    // A. Dancing Flame Tongues with dynamic rarity colors
    const flameTongueTex = createFlameTongueTexture(auraPalette);
    const flameTongueGeo = new THREE.PlaneGeometry(0.48, 0.95);
    const TONGUE_COUNT = 16;
    const flameTongueMeshes: Array<{
      mesh: THREE.Mesh;
      material: THREE.MeshBasicMaterial;
      baseY: number;
      baseRotZ: number;
      phase: number;
    }> = [];

    for (let i = 0; i < TONGUE_COUNT; i++) {
      const isRight = i >= TONGUE_COUNT / 2;
      const side = isRight ? 1 : -1;
      const step = i % (TONGUE_COUNT / 2);
      const baseY = -1.1 + step * 0.35 + (Math.random() - 0.5) * 0.08;
      const baseRotZ = side * (0.14 + (Math.random() - 0.5) * 0.08);

      const mat = new THREE.MeshBasicMaterial({
        map: flameTongueTex,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const tongueMesh = new THREE.Mesh(flameTongueGeo, mat);
      tongueMesh.position.set(
        side * (0.96 + Math.random() * 0.05),
        baseY,
        (Math.random() - 0.5) * 0.08,
      );
      tongueMesh.rotation.z = baseRotZ;
      saiyanAuraGroup.add(tongueMesh);

      flameTongueMeshes.push({
        mesh: tongueMesh,
        material: mat,
        baseY,
        baseRotZ,
        phase: i * 2.37,
      });
    }

    // B. Base Fire Sheaths (Continuous heat wall)
    const flameWallTex = createFlameWallTexture(auraPalette);
    const wallGeo = new THREE.PlaneGeometry(0.4, 2.75);

    const leftWallMat = new THREE.MeshBasicMaterial({
      map: flameWallTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leftWall = new THREE.Mesh(wallGeo, leftWallMat);
    leftWall.position.set(-1.01, 0.15, 0);
    saiyanAuraGroup.add(leftWall);

    const rightWallMat = new THREE.MeshBasicMaterial({
      map: flameWallTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rightWall = new THREE.Mesh(wallGeo, rightWallMat);
    rightWall.position.set(1.01, 0.15, 0);
    rightWall.rotation.y = Math.PI;
    saiyanAuraGroup.add(rightWall);

    // C. Rising Embers & Sparks tinted with rarity palette
    const EMBER_COUNT = 90;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(EMBER_COUNT * 3);
    const emberColors = new Float32Array(EMBER_COUNT * 3);
    const emberSpeeds = new Float32Array(EMBER_COUNT);
    const emberSides = new Float32Array(EMBER_COUNT);
    const emberPhases = new Float32Array(EMBER_COUNT);

    const [c1, c2, c3] = auraPalette.emberColors;

    for (let i = 0; i < EMBER_COUNT; i++) {
      const isRight = i >= EMBER_COUNT / 2;
      const side = isRight ? 1 : -1;
      emberSides[i] = side;

      const x = side * (0.95 + Math.random() * 0.1);
      const y = -1.15 + Math.random() * 2.6;
      const z = (Math.random() - 0.5) * 0.12;

      emberPositions[i * 3] = x;
      emberPositions[i * 3 + 1] = y;
      emberPositions[i * 3 + 2] = z;

      emberSpeeds[i] = 0.024 + Math.random() * 0.038;
      emberPhases[i] = Math.random() * Math.PI * 2;

      const cPick = Math.random();
      const chosenColor = cPick > 0.6 ? c1 : cPick > 0.2 ? c2 : c3;
      emberColors[i * 3] = chosenColor[0];
      emberColors[i * 3 + 1] = chosenColor[1];
      emberColors[i * 3 + 2] = chosenColor[2];
    }

    emberGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(emberPositions, 3),
    );
    emberGeo.setAttribute("color", new THREE.BufferAttribute(emberColors, 3));

    const emberTex = createEmberTexture();
    const emberMat = new THREE.PointsMaterial({
      size: 0.16,
      map: emberTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    saiyanAuraGroup.add(emberPoints);

    // D. Super Saiyan 2 Lightning Arcs
    const BOLT_COUNT = 8;
    const SEGMENTS_PER_BOLT = 4;
    const VERTICES_PER_BOLT = SEGMENTS_PER_BOLT * 2;
    const TOTAL_LIGHTNING_VERTICES = BOLT_COUNT * VERTICES_PER_BOLT;
    const lightningGeo = new THREE.BufferGeometry();
    const lightningPositions = new Float32Array(TOTAL_LIGHTNING_VERTICES * 3);
    lightningGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(lightningPositions, 3),
    );

    const lightningMat = new THREE.LineBasicMaterial({
      color: auraPalette.lightningColor,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const lightningMesh = new THREE.LineSegments(lightningGeo, lightningMat);
    saiyanAuraGroup.add(lightningMesh);

    const boltLifetimes = new Float32Array(BOLT_COUNT);

    // E. Point Lights matching rarity aura
    const leftFireLight = new THREE.PointLight(
      auraPalette.lightColor,
      2.5,
      3.8,
    );
    leftFireLight.position.set(-1.18, 0.15, 0.18);
    saiyanAuraGroup.add(leftFireLight);

    const rightFireLight = new THREE.PointLight(
      auraPalette.lightColor,
      2.5,
      3.8,
    );
    rightFireLight.position.set(1.18, 0.15, 0.18);
    saiyanAuraGroup.add(rightFireLight);

    // --- 8. Touch & Mouse Pointer Controls ---
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !cardGroupRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMouseRef.current.x;
      const deltaY = clientY - prevMouseRef.current.y;

      rotationVelocityRef.current = {
        x: deltaY * 0.005,
        y: deltaX * 0.007,
      };

      cardGroupRef.current.rotation.y += rotationVelocityRef.current.y;
      cardGroupRef.current.rotation.x = Math.max(
        -0.35,
        Math.min(
          0.35,
          cardGroupRef.current.rotation.x + rotationVelocityRef.current.x,
        ),
      );

      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    canvasMount.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    canvasMount.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // --- 9. Animation Loop (Smooth Continuous 360 Rotation) ---
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Continuous 360-degree rotation (smooth & majestic)
      if (autoRotate && !isDraggingRef.current && cardGroupRef.current) {
        cardGroupRef.current.rotation.y += 0.0035;
        cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          cardGroupRef.current.rotation.x,
          0,
          0.04,
        );
      }

      // Gentle breathing float
      if (creatureGroupRef.current) {
        creatureGroupRef.current.position.y =
          Math.sin(elapsedTime * 2.0) * 0.03;
      }

      // Animate Realistic Flame Tongues
      for (let i = 0; i < TONGUE_COUNT; i++) {
        const item = flameTongueMeshes[i];
        const side = i < TONGUE_COUNT / 2 ? -1 : 1;
        const p = item.phase;

        const scaleY =
          1.0 +
          Math.sin(elapsedTime * 15 + p) * 0.28 +
          Math.sin(elapsedTime * 29 + p * 1.5) * 0.14;
        const scaleX = 1.0 + Math.sin(elapsedTime * 18 + p * 2) * 0.22;
        item.mesh.scale.set(scaleX, scaleY, 1);

        item.mesh.rotation.z =
          item.baseRotZ + side * Math.sin(elapsedTime * 14 + p) * 0.1;
        item.mesh.position.y =
          item.baseY + Math.sin(elapsedTime * 12 + p) * 0.04;
        item.material.opacity =
          0.65 + Math.sin(elapsedTime * 21 + p * 3) * 0.25;
      }

      // Animate Base Flame Walls
      const wallPulse =
        Math.sin(elapsedTime * 20) * 0.12 + (Math.random() - 0.5) * 0.05;
      leftWall.scale.x = 1.0 + wallPulse;
      rightWall.scale.x = 1.0 + wallPulse;
      leftWallMat.opacity = 0.65 + Math.sin(elapsedTime * 18) * 0.18;
      rightWallMat.opacity = 0.65 + Math.sin(elapsedTime * 18 + 2.0) * 0.18;

      // Animate Rising Embers
      const ePos = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        const idx = i * 3;
        const side = emberSides[i];
        const speed = emberSpeeds[i];
        const phase = emberPhases[i];

        ePos[idx + 1] += speed;

        const curY = ePos[idx + 1];
        const drift = Math.sin(curY * 6 + elapsedTime * 5 + phase) * 0.035;
        ePos[idx] =
          side * (0.97 + Math.max(0, (curY - 0.15) * 0.07)) + side * drift;

        if (curY > 1.65) {
          ePos[idx + 1] = -1.2 + Math.random() * 0.35;
          ePos[idx + 2] = (Math.random() - 0.5) * 0.12;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      // Animate SSJ2 Lightning Arcs
      const lPos = lightningGeo.attributes.position.array as Float32Array;
      for (let b = 0; b < BOLT_COUNT; b++) {
        boltLifetimes[b] -= 0.14;
        const baseIdx = b * VERTICES_PER_BOLT * 3;

        if (boltLifetimes[b] <= 0) {
          if (Math.random() < 0.14) {
            boltLifetimes[b] = 1.0;
            const side = b < BOLT_COUNT / 2 ? -1 : 1;
            let curX = side * (0.95 + Math.random() * 0.05);
            let curY = -1.1 + Math.random() * 2.3;
            let curZ = (Math.random() - 0.5) * 0.08;

            for (let s = 0; s < SEGMENTS_PER_BOLT; s++) {
              const vStart = baseIdx + s * 2 * 3;
              const vEnd = vStart + 3;

              lPos[vStart] = curX;
              lPos[vStart + 1] = curY;
              lPos[vStart + 2] = curZ;

              curX +=
                side *
                (0.05 + Math.random() * 0.14) *
                (Math.random() > 0.28 ? 1 : -0.4);
              curY += Math.random() * 0.22 - 0.03;
              curZ += (Math.random() - 0.5) * 0.12;

              lPos[vEnd] = curX;
              lPos[vEnd + 1] = curY;
              lPos[vEnd + 2] = curZ;
            }
          } else {
            for (let k = 0; k < VERTICES_PER_BOLT * 3; k++) {
              lPos[baseIdx + k] = 0;
            }
          }
        }
      }
      lightningGeo.attributes.position.needsUpdate = true;

      // Firelight flicker
      const fireFlicker =
        Math.sin(elapsedTime * 24) * 0.4 + (Math.random() - 0.5) * 0.3;
      leftFireLight.intensity = 2.4 + fireFlicker;
      rightFireLight.intensity = 2.4 + fireFlicker;

      // Pedestal slow synchronized rotation
      pedestalGroup.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Sound chime
    playChimeSound();

    // --- 10. Responsive Resize ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(canvasMount);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      canvasMount.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);

      canvasMount.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      canvasMount.replaceChildren();
      frontTexture.dispose();
      backTexture.dispose();
      cardGeo.dispose();
      sideMat.dispose();
      frontMat.dispose();
      backMat.dispose();
      flameTongueGeo.dispose();
      flameTongueTex.dispose();
      flameWallTex.dispose();
      wallGeo.dispose();
      leftWallMat.dispose();
      rightWallMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      emberTex.dispose();
      lightningGeo.dispose();
      lightningMat.dispose();
      flameTongueMeshes.forEach((item) => item.material.dispose());
      renderer.dispose();
      scene.clear();
    };
  }, [
    autoRotate,
    compact,
    speciesId,
    speciesName,
    catalogueId,
    rarity,
    role,
    imageUrl,
    stats,
    summary,
    habitat,
    auraPalette,
  ]);

  return (
    <div className="relative flex w-full flex-col items-center select-none overflow-hidden">
      {/* Ambient Cyber Aura matching rarity */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl transition-colors duration-700"
        style={{
          background: auraPalette.ambientGlow,
          top: "12%",
        }}
        aria-hidden="true"
      />

      {/* Top HUD Badges */}
      {confidence != null && (
        <div className="absolute top-2.5 right-3 z-10 flex items-center pointer-events-none">
          <div
            className="rounded-full px-3 py-1 text-xs font-black tracking-wider backdrop-blur-md"
            style={{
              background: "rgba(28, 24, 16, 0.88)",
              border: "1px solid rgba(200, 169, 110, 0.4)",
              color: "#f0e8d4",
            }}
          >
            Match: {(confidence * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {/* Main 3D WebGL Canvas Stage - Generous height so entire card and pedestal base are 100% visible */}
      <div
        className={`relative w-full flex items-center justify-center ${
          compact ? "h-[490px] sm:h-[550px]" : "h-[540px] sm:h-[600px]"
        }`}
      >
        {/* Isolated DOM container for Three.js canvas */}
        <div
          ref={canvasMountRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Loading Overlay */}
        {isLoadingModel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-sm z-20">
            <div className="h-9 w-9 rounded-full border-2 border-[#c8a96e] border-t-transparent animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#c8a96e]">
              Materializing 3D Card…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
