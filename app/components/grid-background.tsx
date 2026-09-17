"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvas();

    // Forest Guild Codex palette: amber gold, forest green, warm cream
    const colors = [
      { r: 200, g: 169, b: 110, glow: "rgba(224, 197, 138, 0.9)" }, // aged gold
      { r: 224, g: 197, b: 138, glow: "rgba(200, 169, 110, 0.9)" }, // gold light
      { r: 160, g: 125, b: 72, glow: "rgba(200, 169, 110, 0.8)" }, // gold dim
      { r: 74, g: 124, b: 89, glow: "rgba(106, 171, 122, 0.85)" }, // forest deep
      { r: 106, g: 171, b: 122, glow: "rgba(74, 124, 89, 0.85)" }, // forest light
      { r: 240, g: 220, b: 180, glow: "rgba(240, 232, 212, 0.7)" }, // parchment cream
    ];

    const particleCount = Math.min(
      90,
      Math.max(40, Math.floor((width * height) / 18000)),
    );
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 1.0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.15),
        color: `rgb(${c.r}, ${c.g}, ${c.b})`,
        glowColor: c.glow,
        baseAlpha: Math.random() * 0.35 + 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.012,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      setupCanvas();
    };
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(p.pulsePhase) * 0.28;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const minDist = 110;
          if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / minDist) * 1.2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }

          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        const currentAlpha = Math.max(
          0.1,
          Math.min(0.9, p.baseAlpha + Math.sin(p.pulsePhase) * 0.25),
        );

        ctx.save();
        ctx.globalAlpha = currentAlpha;

        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = p.radius * 5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 245, 220, 0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Warm amber & forest ambient aura */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: [
            "radial-gradient(ellipse 50% 45% at 20% 30%, rgba(200,169,110,0.1) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 40% at 80% 50%, rgba(74,124,89,0.09) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 35% at 50% 95%, rgba(160,125,72,0.08) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Vignette — deep forest darkness at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Aged map grid lines — warm amber */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(200,169,110,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(200,169,110,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          mask: "radial-gradient(ellipse 60% 50% at 50% 45%, black 20%, transparent 80%)",
          WebkitMask:
            "radial-gradient(ellipse 60% 50% at 50% 45%, black 20%, transparent 80%)",
        }}
      />

      {/* Floating amber spores / fireflies */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
