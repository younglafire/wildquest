"use client";

import { playTactileClick } from "../lib/sfx";

const SYSTEMS = [
  {
    code: "01 // CAPTURE",
    title: "Field Camera",
    description:
      "Find wildlife outside and capture a clear photo with your phone camera.",
    icon: "📸",
    badge: "REAL-WORLD HUNT",
    accent: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    code: "02 // IDENTIFY",
    title: "Neural Field Scan",
    description:
      "On-device vision identifies one of WildQuest's supported species without uploading your photo.",
    icon: "🔬",
    badge: "PRIVATE AI SCAN",
    accent: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  {
    code: "03 // VERIFY",
    title: "Fair-Play Check",
    description:
      "A duplicate-photo and ownership check keeps every confirmed discovery unique.",
    icon: "🛡️",
    badge: "ANTI-CHEAT GATE",
    accent: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    code: "04 // PLAY",
    title: "Build Your Squad",
    description:
      "Your confirmed creature joins Collection. Build a trio, complete quests, and enter battles.",
    icon: "⚡",
    badge: "COLLECTION + BATTLE",
    accent: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
] as const;

export function GameSystemsGrid() {
  return (
    <section
      aria-label="Core expedition gameplay systems"
      className="mt-28 space-y-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative inline-flex min-h-8 items-center justify-center px-6 py-1.5 select-none sm:min-h-9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/tag_frame.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
          <span
            className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-[#f0e8d4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ⚙️ Expedition Engine
          </span>
        </div>
        <h2
          className="mt-3 text-3xl font-black tracking-tight text-[#f0e8d4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Four Core Gameplay Systems
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[#a89880]">
          Capture wildlife, build your collection, and battle with creatures you
          actually discovered.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {SYSTEMS.map((system) => (
          <article
            key={system.code}
            onMouseEnter={playTactileClick}
            className={`group relative flex h-[460px] w-full flex-col justify-between select-none transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_16px_36px_rgba(52,211,153,0.35)] ${system.accent}`}
            style={{
              backgroundImage: "url('/ui/system_card_frame.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.85))",
            }}
          >
            <div className="relative z-10 flex h-full flex-col justify-between px-[15%] pb-[12%] pt-[14%]">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ui/icon_socket.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      draggable={false}
                    />
                    <span className="relative z-10 text-2xl drop-shadow sm:text-3xl">
                      {system.icon}
                    </span>
                  </div>

                  <div className="relative inline-flex min-h-7 shrink-0 items-center justify-center px-4 py-1 select-none transition-transform duration-200 group-hover:scale-105 sm:min-h-8 sm:px-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ui/tag_frame.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] brightness-95 transition-all group-hover:brightness-110"
                      draggable={false}
                    />
                    <span className="relative z-10 font-mono text-[10px] font-black uppercase tracking-wider text-[#f0e8d4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-xs">
                      {system.badge}
                    </span>
                  </div>
                </div>

                <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.2em] text-emerald-400 drop-shadow sm:text-sm">
                  {system.code}
                </p>
                <h3
                  className="mt-1.5 text-xl font-black tracking-tight text-[#f0e8d4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {system.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#dfd4c0] sm:text-[15px]">
                  {system.description}
                </p>
              </div>

              <div className="mt-4 pt-1">
                <div className="mb-2 flex items-center justify-between px-1 font-mono text-xs text-[#a89880]">
                  <span>STATUS: READY</span>
                  <span className="font-bold text-emerald-400">0xDEVNET</span>
                </div>
                <div className="relative flex h-9 w-full items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] sm:h-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ui/status_verified_bar.png"
                    alt="System Verified"
                    className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(52,211,153,0.35)] transition-all group-hover:drop-shadow-[0_4px_16px_rgba(52,211,153,0.65)]"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
