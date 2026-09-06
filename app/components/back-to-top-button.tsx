"use client";

import { useEffect, useState } from "react";
import { playTactileClick } from "../lib/sfx";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    playTactileClick();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-emerald-500/50 bg-card/90 text-emerald-600 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-500 hover:text-white dark:border-emerald-400/40 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-black"
    >
      <span className="font-mono text-base font-black" aria-hidden="true">
        ▲
      </span>
    </button>
  );
}
