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

    // Safari/Cyber-jungle palette: emerald, amber, cyber lime, electric cyan
    const colors = [
      { r: 16, g: 185, b: 129, glow: "rgba(52, 211, 153, 0.95)" }, // emerald
      { r: 52, g: 211, b: 153, glow: "rgba(110, 231, 183, 0.95)" }, // light emerald
      { r: 245, g: 158, b: 11, glow: "rgba(251, 191, 36, 0.95)" }, // amber
      { r: 251, g: 191, b: 36, glow: "rgba(253, 230, 138, 0.95)" }, // gold
      { r: 163, g: 230, b: 53, glow: "rgba(190, 242, 100, 0.95)" }, // lime
      { r: 56, g: 189, b: 248, glow: "rgba(125, 211, 252, 0.95)" }, // cyan
    ];

    // Rich density across the entire screen
    const particleCount = Math.min(
      110,
      Math.max(50, Math.floor((width * height) / 16000)),
    );
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 1.4, // 1.4px to 3.2px
        vx: (Math.random() - 0.5) * 0.4, // gentle drift
        vy: -(Math.random() * 0.5 + 0.25), // upward float (-0.25 to -0.75)
        color: `rgb(${c.r}, ${c.g}, ${c.b})`,
        glowColor: c.glow,
        baseAlpha: Math.random() * 0.4 + 0.45, // 0.45 to 0.85
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.015,
      });
    }

    // Gentle cursor interaction
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
          // Floating physics
          p.x += p.vx + Math.sin(p.pulsePhase) * 0.35;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Gentle mouse reaction (particles softly part around cursor)
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const minDist = 130;
          if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / minDist) * 1.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }

          // Screen boundaries wrap
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        // Bioluminescent pulsating glow
        const currentAlpha = Math.max(
          0.15,
          Math.min(1, p.baseAlpha + Math.sin(p.pulsePhase) * 0.3),
        );

        ctx.save();
        ctx.globalAlpha = currentAlpha;

        // Glowing outer halo
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = p.radius * 6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Luminous bright center spark
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
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
      {/* Jungle & Safari ambient aura glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: [
            "radial-gradient(ellipse 45% 40% at 20% 35%, rgba(16,185,129,0.14) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 40% at 80% 45%, rgba(245,158,11,0.12) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 30% at 50% 90%, rgba(5,150,105,0.08) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Subtle jungle canopy vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />

      {/* Explorer coordinates grid — subtle adventure map lines */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16,185,129,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16,185,129,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          mask: "radial-gradient(ellipse 55% 55% at 50% 45%, black 20%, transparent 80%)",
          WebkitMask: "radial-gradient(ellipse 55% 55% at 50% 45%, black 20%, transparent 80%)",
        }}
      />

      {/* Floating bioluminescent spores canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
