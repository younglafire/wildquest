"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { playSlideTransitionSound, playTactileClick } from "../lib/sfx";

type CreatureType = "fox" | "parrot";

export function Creature3DStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCreature, setActiveCreature] = useState<CreatureType>("fox");
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  // References to keep track of mutable Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const creatureGroupRef = useRef<THREE.Group | null>(null);
  const wireframeMaterialsRef = useRef<THREE.Material[]>([]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
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

    setLoading(true);

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Adjusted camera so the entire pedestal and creature are 100% visible inside frustum
    camera.position.set(0, 0.85, 4.9);
    camera.lookAt(0, -0.05, 0);

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

    // --- 2. Studio & Cinematic Cyber Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x34d399, 4.0); // Emerald Green Key
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.2); // Amber Gold Rim
    rimLight.position.set(-5, -1, -4);
    scene.add(rimLight);

    const topCyanLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    topCyanLight.position.set(0, 4, 0);
    scene.add(topCyanLight);

    // --- 3. Bio-Scanner Pedestal (Positioned to fit 100% inside view) ---
    const pedestalGroup = new THREE.Group();
    // Move up to -0.75 so the bottom of the base (-0.95) has ample breathing room at the bottom of the screen
    pedestalGroup.position.set(0, -0.75, 0);

    const baseGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.2, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c1219,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Neon Edge Ring
    const edgeRingGeo = new THREE.TorusGeometry(2.05, 0.045, 16, 64);
    const edgeRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
    });
    const edgeRing = new THREE.Mesh(edgeRingGeo, edgeRingMat);
    edgeRing.rotation.x = Math.PI / 2;
    edgeRing.position.y = 0.11;
    pedestalGroup.add(edgeRing);

    // Holographic Polar Grid Disc
    const gridHelper = new THREE.PolarGridHelper(1.95, 10, 8, 36, 0x10b981, 0x064e3b);
    gridHelper.position.y = 0.12;
    pedestalGroup.add(gridHelper);

    scene.add(pedestalGroup);

    // --- 4. Scanning Laser Plane & Ring ---
    const scanRingGeo = new THREE.TorusGeometry(1.85, 0.03, 16, 48);
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
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 4 - 0.8;
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

    // --- 6. Load Authentic Animated 3D Animal via GLTFLoader ---
    const creatureGroup = new THREE.Group();
    scene.add(creatureGroup);
    creatureGroupRef.current = creatureGroup;
    wireframeMaterialsRef.current = [];

    const loader = new GLTFLoader();
    const modelPath = activeCreature === "fox" ? "/models/fox.glb" : "/models/parrot.glb";

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        if (activeCreature === "fox") {
          // Authentic Fox (Canid / Wild Dog)
          // Standing on top surface of pedestal (Y = -0.65)
          model.scale.set(0.022, 0.022, 0.022);
          model.position.set(0, -0.65, 0);
          model.rotation.set(0, Math.PI / 5, 0); // Natural 3/4 angle
        } else {
          // Exotic Flying Bird (Parrot)
          model.scale.set(0.026, 0.026, 0.026);
          model.position.set(0, 0.35, 0);
          model.rotation.set(0, Math.PI / 4, 0);
        }

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              wireframeMaterialsRef.current.push(...mesh.material);
            } else if (mesh.material) {
              wireframeMaterialsRef.current.push(mesh.material);
            }
          }
        });

        // Apply wireframe if enabled
        if (wireframeMode) {
          wireframeMaterialsRef.current.forEach((mat) => {
            if ("wireframe" in mat) (mat as THREE.MeshStandardMaterial).wireframe = true;
          });
        }

        creatureGroup.add(model);

        // Setup Skeletal Animation
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          // Play Survey/Idle animation for Fox, or flight animation for Parrot
          const action = mixer.clipAction(gltf.animations[0]);
          action.timeScale = 0.85;
          action.play();
          mixerRef.current = mixer;
        }

        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Failed to load 3D animal model:", error);
        setLoading(false);
      },
    );

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
        -0.3,
        Math.min(0.4, creatureGroupRef.current.rotation.x + rotationVelocityRef.current.x),
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
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update skeletal animation mixer (Fox breathing/tail/head, bird flapping)
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Auto-rotation if enabled and not currently dragging
      if (autoRotate && !isDraggingRef.current && creatureGroupRef.current) {
        creatureGroupRef.current.rotation.y += 0.006;
      }

      // Scanner laser vertical sweep
      if (scanRingRef.current) {
        scanRingRef.current.position.y = Math.sin(elapsedTime * 2.0) * 1.0 + 0.15;
        scanRingRef.current.rotation.z += 0.015;
      }

      // Pedestal slow rotation
      pedestalGroup.rotation.y += 0.0025;

      // Ambient particle floating
      const posAttr = particleGeo.attributes.position;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posAttr.array[i] += 0.003;
        if (posAttr.array[i] > 3) posAttr.array[i] = -0.8;
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
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [activeCreature, autoRotate, wireframeMode]);

  const triggerPulseScan = () => {
    setIsScanning(true);
    playTactileClick();
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
      {/* Main 3D Canvas Stage: Completely Frameless & Seamless on Page Background */}
      <div className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full flex items-center justify-center">
        {/* Soft Ambient Radial Glow behind the 3D creature */}
        <div
          className="pointer-events-none absolute h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-emerald-500/15 blur-3xl animate-pulse"
          aria-hidden="true"
        />

        {/* Rapid Scan Flash Effect */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 z-20 bg-emerald-500/15 animate-pulse rounded-full blur-2xl" />
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="font-mono text-xs text-emerald-400 font-bold animate-pulse">
              INITIALIZING 3D NEURAL SPECIMEN…
            </span>
          </div>
        )}

        {/* Three.js Canvas Element mounts here (Completely transparent) */}
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Click and drag to rotate creature in 3D"
        />

        {/* Floating Specimen Telemetry Pill (Sits cleanly in top right corner to not obscure pedestal) */}
        <div className="pointer-events-none absolute top-2 right-2 sm:right-4 z-10 flex items-center gap-2.5 rounded-full bg-black/60 px-3.5 py-1 font-mono text-[11px] backdrop-blur border border-emerald-500/30 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="font-bold text-white">
            {activeCreature === "fox" ? "Canis lupus (Wild Canid)" : "Psittaciformes (Falcon / Bird)"}
          </p>
          <span className="text-muted">·</span>
          <span className="text-emerald-400 font-bold">96.4% MATCH</span>
        </div>
      </div>

      {/* 3D Control Strip (Sleek floating glass pills) */}
      <div className="mt-1 flex w-full flex-wrap items-center justify-center gap-3 px-1 text-xs">
        {/* Creature Selector */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card/85 p-1 backdrop-blur shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveCreature("fox");
              playSlideTransitionSound();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1 font-black transition-all ${
              activeCreature === "fox"
                ? "bg-amber-600 text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>🦊</span>
            <span>Wild Canid</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCreature("parrot");
              playSlideTransitionSound();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1 font-black transition-all ${
              activeCreature === "parrot"
                ? "bg-emerald-600 text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>🦜</span>
            <span>Winged Fauna</span>
          </button>
        </div>

        {/* Action Buttons: Wireframe, Auto-Rotate & Pulse Scan */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              setWireframeMode(!wireframeMode);
              playTactileClick();
            }}
            className={`rounded-xl border px-3 py-1.5 font-bold transition-all ${
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
            className={`rounded-xl border px-3 py-1.5 font-bold transition-all ${
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
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
          >
            ✨ SCAN
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] font-mono text-muted text-center">
        CLICK & DRAG TO ROTATE 360° · REAL-TIME SKELETAL IDLE ANIMATION
      </p>
    </div>
  );
}
