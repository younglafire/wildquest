"use client";

export function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
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

      {/* Floating fireflies / pollen dust motes */}
      <div className="absolute inset-0">
        <span
          className="animate-firefly absolute left-[15%] top-[25%] h-1.5 w-1.5 rounded-full bg-emerald-400/70 blur-[1px]"
          style={{ animationDuration: "5s", animationDelay: "0s" }}
        />
        <span
          className="animate-firefly absolute left-[28%] top-[60%] h-2 w-2 rounded-full bg-amber-300/80 blur-[1.5px]"
          style={{ animationDuration: "6.5s", animationDelay: "1.2s" }}
        />
        <span
          className="animate-firefly absolute left-[72%] top-[20%] h-1.5 w-1.5 rounded-full bg-amber-400/70 blur-[1px]"
          style={{ animationDuration: "5.5s", animationDelay: "2.4s" }}
        />
        <span
          className="animate-firefly absolute left-[85%] top-[55%] h-2 w-2 rounded-full bg-emerald-300/80 blur-[1.5px]"
          style={{ animationDuration: "7s", animationDelay: "0.8s" }}
        />
        <span
          className="animate-firefly absolute left-[45%] top-[78%] h-1.5 w-1.5 rounded-full bg-yellow-200/60 blur-[1px]"
          style={{ animationDuration: "4.8s", animationDelay: "3.1s" }}
        />
      </div>
    </div>
  );
}
