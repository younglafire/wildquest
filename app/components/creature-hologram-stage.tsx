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
    // Lowered camera and shifted target to center the floating card with ample top margin
    camera.position.set(0, -0.05, compact ? 4.15 : 3.95);
    camera.lookAt(0, -0.15, 0);

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

    // --- 3. Main Swivel Pivot (Floating 3D Card lowered for top clearance) ---
    const mainPivot = new THREE.Group();
    mainPivot.position.set(0, -0.15, 0);
    scene.add(mainPivot);
    cardGroupRef.current = mainPivot;

    // --- 5. Generate 3D Holographic Trading Card Canvas Textures (2:3 Aspect 1024x1536) ---
    const displayStats = deriveDisplayStats(role, stats);

    // Canvas 1: Front of Card (1024 x 1536 px - Matches 2:3 nature frame overlay)
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = 1024;
    frontCanvas.height = 1536;
    const ctx = frontCanvas.getContext("2d");

    let creatureImg: HTMLImageElement | null = null;
    let frameImg: HTMLImageElement | null = null;

    const drawCardFront = (
      imageElem?: HTMLImageElement | null,
      frameElem?: HTMLImageElement | null,
    ) => {
      if (!ctx) return;

      // 1. Base dark obsidian woodland background
      const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1536);
      bgGrad.addColorStop(0, "#14100b");
      bgGrad.addColorStop(0.5, "#0b0907");
      bgGrad.addColorStop(1, "#080605");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 1536);

      // =========================================================================
      // 2. UPPER WINDOW: CREATURE ARTWORK SHOWCASE
      // (Drawn underneath the master template so the ornate gold borders,
      //  ivy leaves and gemstones frame the photo with zero gaps)
      // =========================================================================
      const artX = 82;
      const artY = 150;
      const artW = 860;
      const artH = 620;

      if (imageElem) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(artX, artY, artW, artH);
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
      } else {
        // Fallback specimen scanning box
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(artX, artY, artW, artH);
        ctx.fillStyle = "#c8a96e";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SCANNING SPECIMEN…", 512, 450);
      }

      // =========================================================================
      // 3. MASTER RARITY TEMPLATE OVERLAY (common.png, rare.png, legend.png, etc.)
      // (Upper window is transparent, revealing creature photo through the frame)
      // =========================================================================
      if (frameElem) {
        ctx.drawImage(frameElem, 0, 0, 1024, 1536);
      } else {
        // Fallback gold ornate border if template is still loading
        ctx.strokeStyle = "#c8a96e";
        ctx.lineWidth = 26;
        ctx.strokeRect(20, 20, 984, 1496);
      }

      // =========================================================================
      // 4. TOP HEADER: RARITY & CREATURE NAME
      // (Resting in the header bar with dark backing panel for high contrast)
      // =========================================================================
      ctx.fillStyle = "rgba(8, 6, 4, 0.92)";
      ctx.beginPath();
      ctx.roundRect(212, 88, 600, 86, 10);
      ctx.fill();
      ctx.strokeStyle = "#c8a96e";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "900 23px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `[ ${rarity.toUpperCase()} · ${role ? role.toUpperCase() : "CREATURE"} ]`,
        512,
        118,
      );

      // Main Creature Name (Bold, Prominent, Gold-glow)
      const nameStr = speciesName.toUpperCase();
      ctx.font =
        nameStr.length > 18 ? "900 38px sans-serif" : "900 44px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.fillText(nameStr, 512, 156);
      ctx.shadowBlur = 0; // reset shadow

      // =========================================================================
      // 5. LOWER PANEL: 4 CARD BATTLE STATS
      // (Mounted seamlessly onto the slate stone panel texture at y = 880)
      // =========================================================================
      const statY = 880;
      const statH = 126;
      const statGap = 14;
      const statW = Math.floor((artW - statGap * 3) / 4); // ~204px each

      const statItems = [
        {
          label: "HP",
          value: displayStats.hp,
          color: "#4ade80",
          border: "#22c55e",
          bg: "rgba(34, 197, 94, 0.16)",
        },
        {
          label: "ATK",
          value: displayStats.attack,
          color: "#f87171",
          border: "#ef4444",
          bg: "rgba(239, 68, 68, 0.16)",
        },
        {
          label: "DEF",
          value: displayStats.defense,
          color: "#60a5fa",
          border: "#3b82f6",
          bg: "rgba(59, 130, 246, 0.16)",
        },
        {
          label: "SPD",
          value: displayStats.speed,
          color: "#facc15",
          border: "#eab308",
          bg: "rgba(234, 179, 8, 0.16)",
        },
      ];

      statItems.forEach((stat, idx) => {
        const x = artX + idx * (statW + statGap);

        // Dark matte badge background
        ctx.fillStyle = "#0c0f0d";
        ctx.beginPath();
        ctx.roundRect(x, statY, statW, statH, 14);
        ctx.fill();

        // Inner tint
        ctx.fillStyle = stat.bg;
        ctx.beginPath();
        ctx.roundRect(x, statY, statW, statH, 14);
        ctx.fill();

        // Colored border
        ctx.strokeStyle = stat.border;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Stat Label
        ctx.fillStyle = stat.color;
        ctx.font = "900 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(stat.label, x + statW / 2, statY + 36);

        // Stat Value (Huge, Ultra High-Contrast White)
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 62px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(stat.value), x + statW / 2, statY + 104);
      });

      // =========================================================================
      // 6. LOWER PANEL: LORE SUMMARY & VERIFICATION
      // (Clean matte backing plate for high contrast and crystal-clear readability)
      // =========================================================================
      const loreY = 1022;
      const loreH = 300;

      // Clean matte slate backing plate
      ctx.fillStyle = "rgba(6, 5, 4, 0.78)";
      ctx.beginPath();
      ctx.roundRect(artX, loreY, artW, loreH, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 169, 110, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Habitat / Biome tag (Bold, bright gold)
      const habitatStr = habitat
        ? `🌍 HABITAT: ${habitat.toUpperCase()}`
        : "🌍 HABITAT: WILD HARMONY SANCTUARY";
      ctx.fillStyle = "#fef08a";
      ctx.font = "900 28px monospace";
      ctx.textAlign = "left";
      ctx.fillText(habitatStr, artX + 28, loreY + 44);

      // Trait / Specialty highlight
      const traitStr = `⚡ TRAIT: ${role ? role.toUpperCase() : "BALANCED CREATURE"} · ${rarity.toUpperCase()}`;
      ctx.fillStyle = "#4ade80";
      ctx.font = "900 25px monospace";
      ctx.textAlign = "left";
      ctx.fillText(traitStr, artX + 28, loreY + 84);

      // Brief summary / lore description
      const summaryText =
        summary ||
        `An authentic specimen from the WildQuest wilderness. Possesses sharp instincts and natural balance in the arena.`;
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 26px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      wrapCanvasText(
        ctx,
        summaryText,
        artX + 28,
        loreY + 134,
        artW - 56,
        38,
        3,
      );

      // Solana Onchain Verified Watermark
      const authStr =
        catalogueId != null
          ? `✦ SPECIES #${catalogueId} · SOLANA DEVNET ONCHAIN ✦`
          : "✦ WILDQUEST ONCHAIN SPECIMEN ✦";
      ctx.fillStyle = "#f3ba63";
      ctx.font = "900 22px monospace";
      ctx.textAlign = "center";
      ctx.fillText(authStr, 512, loreY + 266);
    };

    const renderFrontCard = () => {
      drawCardFront(creatureImg, frameImg);
      frontTexture.needsUpdate = true;
    };

    drawCardFront(null, null);

    // Direct LinearFilter with NO mipmapping avoids blurriness
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.minFilter = THREE.LinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;
    frontTexture.generateMipmaps = false;
    frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    frontTexture.needsUpdate = true;

    // Load Creature Artwork
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        creatureImg = img;
        renderFrontCard();
      };
      img.src = imageUrl;
    }

    // Load Rarity-themed Card Base Template (/creatures/common.png, rare.png, legend.png, etc.)
    const frameImage = new Image();
    frameImage.onload = () => {
      frameImg = frameImage;
      renderFrontCard();
    };
    frameImage.onerror = () => {
      // Fallback to common.png if specific rarity template is missing
      if (!frameImage.src.endsWith("/creatures/common.png")) {
        frameImage.src = "/creatures/common.png";
      }
    };
    const getRarityTemplateSrc = (r: string) => {
      const lower = (r || "common").toLowerCase();
      if (lower === "legendary" || lower === "legend") {
        return "/creatures/legend.png";
      }
      return `/creatures/${lower}.png`;
    };
    frameImage.src = getRarityTemplateSrc(rarity);

    // Canvas 2: Back of Card (Universal WILDCARD Back - 1024 x 1536)
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 1024;
    backCanvas.height = 1536;
    const backCtx = backCanvas.getContext("2d");

    const renderCardBack = (backImg?: HTMLImageElement | null) => {
      if (!backCtx) return;
      if (backImg) {
        backCtx.drawImage(backImg, 0, 0, 1024, 1536);
      } else {
        // Obsidian gradient fallback
        const bGrad = backCtx.createLinearGradient(0, 0, 1024, 1536);
        bGrad.addColorStop(0, "#16120c");
        bGrad.addColorStop(0.5, "#0d0a07");
        bGrad.addColorStop(1, "#16120c");
        backCtx.fillStyle = bGrad;
        backCtx.fillRect(0, 0, 1024, 1536);

        // Double gold borders
        backCtx.strokeStyle = "#c8a96e";
        backCtx.lineWidth = 26;
        backCtx.strokeRect(20, 20, 984, 1496);

        backCtx.strokeStyle = "#a07d48";
        backCtx.lineWidth = 5;
        backCtx.strokeRect(44, 44, 936, 1448);

        // Central Mystical Circles
        backCtx.strokeStyle = "rgba(200, 169, 110, 0.4)";
        backCtx.lineWidth = 4;
        backCtx.beginPath();
        backCtx.arc(512, 768, 320, 0, Math.PI * 2);
        backCtx.stroke();

        // WildQuest Guild Crest Emblem
        backCtx.fillStyle = "#c8a96e";
        backCtx.font = "900 110px serif";
        backCtx.textAlign = "center";
        backCtx.fillText("WQ", 512, 740);

        backCtx.font = "900 46px sans-serif";
        backCtx.fillText("WILDCARD", 512, 820);
      }
    };

    renderCardBack(null);

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.minFilter = THREE.LinearFilter;
    backTexture.magFilter = THREE.LinearFilter;
    backTexture.generateMipmaps = false;
    backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    backTexture.needsUpdate = true;

    // Load custom card back image (/creatures/background_wildcard.png)
    const cardBackImage = new Image();
    cardBackImage.onload = () => {
      renderCardBack(cardBackImage);
      backTexture.needsUpdate = true;
    };
    cardBackImage.src = "/creatures/background_wildcard.png";

    // Card geometry: Rounded slab with gold bevel sides (2:3 aspect ratio matching frame)
    const cardWidth = 1.84;
    const cardHeight = 2.76;
    const cardThickness = 0.05;
    const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x5a4225, // Deep ancient wood bronze side
      metalness: 0.7,
      roughness: 0.35,
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
    cardMesh.position.set(0, 0.06, 0);
    mainPivot.add(cardMesh);
    setIsLoadingModel(false);

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

      // Gentle breathing float for the 3D card
      cardMesh.position.y = 0.06 + Math.sin(elapsedTime * 2.0) * 0.03;

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

      {/* Main 3D WebGL Canvas Stage - Generous height for floating 3D card */}
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
