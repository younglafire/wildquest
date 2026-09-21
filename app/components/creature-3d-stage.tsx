"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { playSlideTransitionSound, playTactileClick } from "../lib/sfx";

export function Creature3DStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  // References to keep track of mutable Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const creatureGroupRef = useRef<THREE.Group | null>(null);
  const wireframeMaterialsRef = useRef<THREE.Material[]>([]);
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
    // Framed specifically so the entire pedestal and the dog are 100% visible inside frustum
    camera.position.set(0, 0.65, 4.4);
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

    const keyLight = new THREE.DirectionalLight(0x34d399, 4.2); // Emerald Green Key
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.5); // Amber Gold Rim
    rimLight.position.set(-5, -1, -4);
    scene.add(rimLight);

    const topCyanLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    topCyanLight.position.set(0, 4, 0);
    scene.add(topCyanLight);

    // --- 3. Bio-Scanner Pedestal (Positioned to be completely visible) ---
    const pedestalGroup = new THREE.Group();
    // Positioned at Y = -0.75 so the bottom base (-0.93) has clear breathing room above canvas bottom
    pedestalGroup.position.set(0, -0.75, 0);

    const baseGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.18, 36);
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
    edgeRing.position.y = 0.1;
    pedestalGroup.add(edgeRing);

    // Holographic Polar Grid Disc
    const gridHelper = new THREE.PolarGridHelper(
      1.95,
      10,
      8,
      36,
      0x10b981,
      0x064e3b,
    );
    gridHelper.position.y = 0.11;
    pedestalGroup.add(gridHelper);

    scene.add(pedestalGroup);

    // --- 4. Scanning Laser Plane & Ring ---
    const scanRingGeo = new THREE.TorusGeometry(1.9, 0.03, 16, 48);
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

    // --- 5. Load Authentic 3D Dog (Canis lupus - Supported Species #1) ---
    const creatureGroup = new THREE.Group();
    scene.add(creatureGroup);
    creatureGroupRef.current = creatureGroup;
    wireframeMaterialsRef.current = [];

    const loader = new GLTFLoader();
    loader.load(
      "/models/dog.glb",
      (gltf) => {
        const model = gltf.scene;

        // Paws stand on pedestal top (Y = -0.66)
        model.scale.set(2.1, 2.1, 2.1);
        model.position.set(0, -0.66, 0.1);
        model.rotation.set(0, Math.PI / 4.5, 0); // Heroic 3/4 perspective

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
            if ("wireframe" in mat)
              (mat as THREE.MeshStandardMaterial).wireframe = true;
          });
        }

        creatureGroup.add(model);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Failed to load 3D dog model:", error);
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
        Math.min(
          0.4,
          creatureGroupRef.current.rotation.x + rotationVelocityRef.current.x,
        ),
      );

      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    container.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
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
        creatureGroupRef.current.rotation.y += 0.006;
      }

      // Scanner laser vertical sweep
      if (scanRingRef.current) {
        scanRingRef.current.position.y =
          Math.sin(elapsedTime * 2.0) * 1.0 + 0.15;
        scanRingRef.current.rotation.z += 0.015;
      }

      // Pedestal slow rotation
      pedestalGroup.rotation.y += 0.0025;

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
  }, [autoRotate, wireframeMode]);

  const triggerPulseScan = () => {
    setIsScanning(true);
    playTactileClick();
    setTimeout(() => setIsScanning(false), 800);
  };

  const setViewAngle = (yAngle: number) => {
    if (!creatureGroupRef.current) return;
    creatureGroupRef.current.rotation.set(0, yAngle, 0);
    playSlideTransitionSound();
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
      {/* Main 3D Canvas Stage: Frameless on Page Background with full pedestal view */}
      <div className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full flex items-center justify-center">
        {/* Soft Ambient Radial Glow behind the 3D dog */}
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
              INITIALIZING 3D CANIS LUPUS (DOG)…
            </span>
          </div>
        )}

        {/* Three.js Canvas Element mounts here (Completely transparent) */}
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Click and drag to rotate creature in 3D"
        />

        {/* Floating Specimen Telemetry Pill in Top Right Corner */}
        <div
          className="pointer-events-none absolute top-2 right-2 sm:right-4 z-10 flex items-center gap-2.5 rounded-xl px-3.5 py-1.5 font-mono text-[11px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)] select-none"
          style={{
            background: "rgba(18, 16, 11, 0.9)",
            border: "1px solid rgba(200, 169, 110, 0.35)",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200, 169, 110, 0.2)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <p className="font-bold text-[#f0e8d4]">
            Canis lupus{" "}
            <span className="text-[#8a7a62] font-normal">
              (Dog · German Shepherd)
            </span>
          </p>
          <span className="text-[#c8a96e]/40">·</span>
          <span className="text-emerald-400 font-bold tracking-wide">
            98.4% MATCH
          </span>
        </div>
      </div>

      {/* 3D Control Strip (Fantasy RPG Tactical Bar) */}
      <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-3 px-1 text-xs">
        {/* Camera Angle Presets */}
        <div
          className="flex items-center gap-1 rounded-xl p-1 font-mono text-[11px] shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md"
          style={{
            background: "rgba(18, 16, 11, 0.9)",
            border: "1px solid rgba(200, 169, 110, 0.3)",
          }}
        >
          <span className="px-2 font-bold text-[#8a7a62]">ANGLE:</span>
          <button
            type="button"
            onClick={() => setViewAngle(Math.PI / 4.5)}
            className="rounded-lg px-2.5 py-1 font-bold text-[#c8a96e]/80 transition hover:bg-[#c8a96e]/15 hover:text-[#f0e8d4] active:scale-95"
          >
            3/4 VIEW
          </button>
          <button
            type="button"
            onClick={() => setViewAngle(0)}
            className="rounded-lg px-2.5 py-1 font-bold text-[#c8a96e]/80 transition hover:bg-[#c8a96e]/15 hover:text-[#f0e8d4] active:scale-95"
          >
            FRONT
          </button>
          <button
            type="button"
            onClick={() => setViewAngle(Math.PI / 2)}
            className="rounded-lg px-2.5 py-1 font-bold text-[#c8a96e]/80 transition hover:bg-[#c8a96e]/15 hover:text-[#f0e8d4] active:scale-95"
          >
            PROFILE
          </button>
        </div>

        {/* Action Buttons: Wireframe, Auto-Rotate & Pulse Scan */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              setWireframeMode(!wireframeMode);
              playTactileClick();
            }}
            className="rounded-xl px-3 py-1.5 font-bold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-95"
            style={{
              background: wireframeMode
                ? "rgba(16, 185, 129, 0.22)"
                : "rgba(18, 16, 11, 0.9)",
              border: wireframeMode
                ? "1px solid rgba(52, 211, 153, 0.75)"
                : "1px solid rgba(200, 169, 110, 0.3)",
              color: wireframeMode ? "#6ee7b7" : "#c8a96e",
              boxShadow: wireframeMode
                ? "0 0 12px rgba(16, 185, 129, 0.35)"
                : "0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            {wireframeMode ? "⚡ X-RAY ON" : "🔬 AI X-RAY"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              playTactileClick();
            }}
            className="rounded-xl px-3 py-1.5 font-bold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-95"
            style={{
              background: autoRotate
                ? "rgba(200, 169, 110, 0.18)"
                : "rgba(18, 16, 11, 0.9)",
              border: autoRotate
                ? "1px solid rgba(200, 169, 110, 0.65)"
                : "1px solid rgba(200, 169, 110, 0.3)",
              color: autoRotate ? "#f0e8d4" : "#8a7a62",
              boxShadow: autoRotate
                ? "0 0 12px rgba(200, 169, 110, 0.25)"
                : "0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            {autoRotate ? "🔄 ORBIT" : "⏸️ HOLD"}
          </button>

          <button
            type="button"
            onClick={triggerPulseScan}
            className="rounded-xl px-3 py-1.5 font-bold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-95 hover:brightness-110"
            style={{
              background:
                "radial-gradient(100% 100% at 50% 0%, rgba(34, 197, 94, 0.35) 0%, rgba(18, 16, 11, 0.9) 100%)",
              border: "1px solid rgba(74, 222, 128, 0.65)",
              color: "#4ade80",
              boxShadow: "0 0 14px rgba(74, 222, 128, 0.35)",
            }}
          >
            ✨ SCAN
          </button>
        </div>
      </div>

      <p className="mt-2.5 text-[10.5px] font-mono text-[#8a7a62] text-center tracking-wider">
        SUPPORTED SPECIES: CANIS LUPUS (DOG) · CLICK & DRAG TO ROTATE 360°
      </p>
    </div>
  );
}
