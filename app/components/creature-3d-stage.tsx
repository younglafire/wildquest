"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playSlideTransitionSound, playTactileClick } from "../lib/sfx";

type CreatureType = "butterfly" | "frog";

export function Creature3DStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCreature, setActiveCreature] = useState<CreatureType>("butterfly");
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // References to keep track of mutable Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const creatureGroupRef = useRef<THREE.Group | null>(null);
  const wireframeMaterialsRef = useRef<THREE.Material[]>([]);
  const wingsRef = useRef<{ left: THREE.Group; right: THREE.Group } | null>(null);
  const frogRef = useRef<{ throat: THREE.Mesh } | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  // Update wireframe mode in real-time
  useEffect(() => {
    wireframeMaterialsRef.current.forEach((mat) => {
      if ("wireframe" in mat) {
        (mat as THREE.MeshStandardMaterial).wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 580;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 4.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x34d399, 4.0); // Emerald Green
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.0); // Amber Gold
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    const topCyanLight = new THREE.PointLight(0x38bdf8, 2.5, 10);
    topCyanLight.position.set(0, 3.5, 0);
    scene.add(topCyanLight);

    // --- 3. Bio-Scanner Cybernetic Pedestal ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.35, 0);

    const baseGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.28, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f14,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Neon Edge Ring
    const edgeRingGeo = new THREE.TorusGeometry(2.35, 0.05, 16, 64);
    const edgeRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: false,
    });
    const edgeRing = new THREE.Mesh(edgeRingGeo, edgeRingMat);
    edgeRing.rotation.x = Math.PI / 2;
    edgeRing.position.y = 0.15;
    pedestalGroup.add(edgeRing);

    // Holographic Grid Disc
    const gridHelper = new THREE.PolarGridHelper(2.2, 10, 8, 36, 0x10b981, 0x064e3b);
    gridHelper.position.y = 0.16;
    pedestalGroup.add(gridHelper);

    scene.add(pedestalGroup);

    // --- 4. Scanning Laser Plane & Ring ---
    const scanRingGeo = new THREE.TorusGeometry(2.0, 0.035, 16, 48);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.y = 0;
    scene.add(scanRing);
    scanRingRef.current = scanRing;

    // --- 5. Depth Ambient Fireflies / Particle Dust ---
    const particleCount = 110;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 5 - 1.5;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const fireflyPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(fireflyPoints);

    // --- 6. Build Procedural 3D Creature ---
    const creatureGroup = new THREE.Group();
    scene.add(creatureGroup);
    creatureGroupRef.current = creatureGroup;
    wireframeMaterialsRef.current = [];

    if (activeCreature === "butterfly") {
      // ===== 3D SWALLOWTAIL BUTTERFLY =====
      creatureGroup.position.set(0, 0.4, 0);
      creatureGroup.scale.set(1.4, 1.4, 1.4);

      // Body (Thorax & Abdomen)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        metalness: 0.6,
        roughness: 0.3,
      });
      wireframeMaterialsRef.current.push(bodyMat);

      const thoraxGeo = new THREE.CapsuleGeometry(0.12, 0.7, 8, 16);
      const thorax = new THREE.Mesh(thoraxGeo, bodyMat);
      thorax.rotation.x = Math.PI / 3;
      creatureGroup.add(thorax);

      // Head
      const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 0.28, 0.28);
      creatureGroup.add(head);

      // Antennae
      const antMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const leftAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.45, 6), antMat);
      leftAnt.position.set(-0.08, 0.48, 0.35);
      leftAnt.rotation.set(0.4, 0, -0.35);
      creatureGroup.add(leftAnt);

      const rightAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.45, 6), antMat);
      rightAnt.position.set(0.08, 0.48, 0.35);
      rightAnt.rotation.set(0.4, 0, 0.35);
      creatureGroup.add(rightAnt);

      // Wings with Iridescent Shimmer Material
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6, // Violet / Purple Epic
        emissive: 0x4c1d95,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });
      wireframeMaterialsRef.current.push(wingMat);

      // Custom Wing Shape
      const forewingShape = new THREE.Shape();
      forewingShape.moveTo(0, 0);
      forewingShape.lineTo(0.5, 1.2);
      forewingShape.lineTo(1.4, 1.4);
      forewingShape.lineTo(1.6, 0.7);
      forewingShape.lineTo(1.1, -0.2);
      forewingShape.closePath();

      const wingGeometry = new THREE.ShapeGeometry(forewingShape);

      // Left Wing Group
      const leftWingGroup = new THREE.Group();
      leftWingGroup.position.set(-0.05, 0.1, 0);
      const leftForewing = new THREE.Mesh(wingGeometry, wingMat);
      leftForewing.scale.set(-0.9, 0.9, 0.9);
      leftWingGroup.add(leftForewing);
      creatureGroup.add(leftWingGroup);

      // Right Wing Group
      const rightWingGroup = new THREE.Group();
      rightWingGroup.position.set(0.05, 0.1, 0);
      const rightForewing = new THREE.Mesh(wingGeometry, wingMat);
      rightForewing.scale.set(0.9, 0.9, 0.9);
      rightWingGroup.add(rightForewing);
      creatureGroup.add(rightWingGroup);

      wingsRef.current = { left: leftWingGroup, right: rightWingGroup };
    } else {
      // ===== 3D CYBER TREE FROG =====
      creatureGroup.position.set(0, -0.4, 0);
      creatureGroup.scale.set(1.35, 1.35, 1.35);

      const frogMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x064e3b,
        emissiveIntensity: 0.25,
      });
      wireframeMaterialsRef.current.push(frogMat);

      // Body
      const bodyGeo = new THREE.DodecahedronGeometry(0.7, 1);
      const body = new THREE.Mesh(bodyGeo, frogMat);
      body.scale.set(1.1, 0.75, 1.25);
      creatureGroup.add(body);

      // Head & Eyes
      const eyeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.1 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.4, 0.45, 0.45);
      creatureGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.4, 0.45, 0.45);
      creatureGroup.add(rightEye);

      // Pupil
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.05), pupilMat);
      pupil.position.set(-0.4, 0.45, 0.6);
      creatureGroup.add(pupil);

      const pupilRight = pupil.clone();
      pupilRight.position.set(0.4, 0.45, 0.6);
      creatureGroup.add(pupilRight);

      // Throat Sac for breathing animation
      const throatGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const throatMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.4 });
      const throat = new THREE.Mesh(throatGeo, throatMat);
      throat.position.set(0, -0.15, 0.65);
      throat.scale.set(0.8, 0.6, 0.8);
      creatureGroup.add(throat);
      frogRef.current = { throat };

      // Front Legs
      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
      const leftLeg = new THREE.Mesh(legGeo, frogMat);
      leftLeg.position.set(-0.6, -0.25, 0.35);
      leftLeg.rotation.set(0, 0, 0.6);
      creatureGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, frogMat);
      rightLeg.position.set(0.6, -0.25, 0.35);
      rightLeg.rotation.set(0, 0, -0.6);
      creatureGroup.add(rightLeg);
    }

    // Apply wireframe state if active
    if (wireframeMode) {
      wireframeMaterialsRef.current.forEach((mat) => {
        if ("wireframe" in mat) (mat as THREE.MeshStandardMaterial).wireframe = true;
      });
    }

    // --- 7. Mouse & Touch Drag Controls ---
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !creatureGroupRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMouseRef.current.x;
      const deltaY = clientY - prevMouseRef.current.y;

      rotationVelocityRef.current = {
        x: deltaY * 0.005,
        y: deltaX * 0.007,
      };

      creatureGroupRef.current.rotation.y += rotationVelocityRef.current.y;
      creatureGroupRef.current.rotation.x = Math.max(
        -0.5,
        Math.min(0.5, creatureGroupRef.current.rotation.x + rotationVelocityRef.current.x),
      );

      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    container.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // --- 8. Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation if enabled and not currently dragging
      if (autoRotate && !isDraggingRef.current && creatureGroupRef.current) {
        creatureGroupRef.current.rotation.y += 0.007;
      }

      // Scanner laser vertical sweep
      if (scanRingRef.current) {
        scanRingRef.current.position.y = Math.sin(elapsedTime * 2.2) * 1.3 + 0.2;
        scanRingRef.current.rotation.z += 0.02;
      }

      // Pedestal slow rotation
      pedestalGroup.rotation.y += 0.003;

      // Creature specific animations
      if (activeCreature === "butterfly" && wingsRef.current) {
        const flapAngle = Math.sin(elapsedTime * 8) * 0.65;
        wingsRef.current.left.rotation.y = flapAngle;
        wingsRef.current.right.rotation.y = -flapAngle;
        // Floating hovering motion
        if (creatureGroupRef.current) {
          creatureGroupRef.current.position.y = 0.4 + Math.sin(elapsedTime * 2.5) * 0.12;
        }
      } else if (activeCreature === "frog" && frogRef.current) {
        // Frog throat breathing pulse
        const breath = 0.8 + Math.sin(elapsedTime * 4) * 0.25;
        frogRef.current.throat.scale.set(breath, breath * 0.7, breath);
      }

      // Ambient particle floating
      const posAttr = particleGeo.attributes.position;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posAttr.array[i] += 0.004;
        if (posAttr.array[i] > 3) posAttr.array[i] = -1;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- 9. Responsive Resize ---
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
    resizeObserver.observe(container);

    // --- 10. Clean Up ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      container.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);

      container.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      renderer.dispose();
      scene.clear();
    };
  }, [activeCreature, autoRotate, wireframeMode]);

  const triggerPulseScan = () => {
    setIsScanning(true);
    playTactileClick();
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
      {/* Top HUD Telemetry Bar */}
      <div className="flex w-full items-center justify-between px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">
            3D NEURAL BIO-SCANNER
          </span>
        </div>
        <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] text-muted border border-border/60">
          WEBGL LIVE // 60 FPS
        </span>
      </div>

      {/* Main 3D Canvas Stage Container */}
      <div className="relative h-[460px] sm:h-[560px] lg:h-[600px] w-full overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-card via-black/85 to-black p-2 shadow-[0_0_80px_-20px_rgba(16,185,129,0.4)] backdrop-blur-md">
        {/* 4 Cyber Viewfinder Corner Brackets */}
        <span className="absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-emerald-400 pointer-events-none z-10" />
        <span className="absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-emerald-400 pointer-events-none z-10" />
        <span className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none z-10" />
        <span className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none z-10" />

        {/* Rapid Scan Flash Effect */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 z-20 bg-emerald-500/20 animate-pulse" />
        )}

        {/* Three.js Canvas Element mounts here */}
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Click and drag to rotate creature in 3D"
        />

        {/* Floating Specimen Telemetry Readout */}
        <div className="pointer-events-none absolute bottom-4 inset-x-4 z-10 flex items-center justify-between rounded-xl bg-black/70 p-2.5 font-mono text-[11px] backdrop-blur border border-emerald-500/30">
          <div>
            <p className="font-black text-white">
              {activeCreature === "butterfly"
                ? "Papilio machaon (Swallowtail)"
                : "Hyla arborea (Tree Frog)"}
            </p>
            <p className="text-[10px] text-emerald-400">
              Confidence: 96.4% · ResNet-50 Validated
            </p>
          </div>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">
            {activeCreature === "butterfly" ? "EPIC QUEST" : "RARE TIER"}
          </span>
        </div>
      </div>

      {/* 3D Control Strip */}
      <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Creature Selector */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveCreature("butterfly");
              playSlideTransitionSound();
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-black transition-all ${
              activeCreature === "butterfly"
                ? "bg-purple-600 text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>🦋</span>
            <span>Butterfly</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCreature("frog");
              playSlideTransitionSound();
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-black transition-all ${
              activeCreature === "frog"
                ? "bg-emerald-600 text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>🐸</span>
            <span>Tree Frog</span>
          </button>
        </div>

        {/* Action Buttons: Wireframe & Pulse Scan */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              setWireframeMode(!wireframeMode);
              playTactileClick();
            }}
            className={`rounded-xl border px-2.5 py-1.5 font-bold transition-all ${
              wireframeMode
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                : "border-border bg-card/80 text-muted hover:border-emerald-500 hover:text-foreground"
            }`}
          >
            {wireframeMode ? "⚡ X-RAY ON" : "🔬 AI X-RAY"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              playTactileClick();
            }}
            className={`rounded-xl border px-2.5 py-1.5 font-bold transition-all ${
              autoRotate
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-card/80 text-muted hover:border-foreground/30"
            }`}
          >
            {autoRotate ? "🔄 ORBIT" : "⏸️ HOLD"}
          </button>

          <button
            type="button"
            onClick={triggerPulseScan}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
          >
            ✨ SCAN
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] font-mono text-muted">
        DRAG TO ROTATE 360° · SCROLL TO ZOOM · TOGGLE AI X-RAY
      </p>
    </div>
  );
}
