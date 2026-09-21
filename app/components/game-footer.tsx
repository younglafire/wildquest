"use client";

import Link from "next/link";
import { playTactileClick } from "../lib/sfx";

export function GameFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Studio Brand & Mission */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ui/logo.png"
                alt="WildQuest"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
              />
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                DEVNET V1
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              The truthful real-world wildlife RPG on Solana. Spot fauna in
              nature, classify species on-device with zero cloud exposure, and
              mint permanent Discovery accounts.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CLUSTER: SOLANA DEVNET OPERATIONAL</span>
            </div>
          </div>

          {/* Column 1: Expedition Nav */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-black uppercase tracking-wider text-foreground">
              Expedition
            </p>
            <ul className="space-y-2 text-muted">
              <li>
                <Link
                  href="/home"
                  onClick={playTactileClick}
                  className="transition hover:text-foreground"
                >
                  Expedition Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/quest"
                  onClick={playTactileClick}
                  className="transition hover:text-foreground"
                >
                  Active Bounty Quest
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  onClick={playTactileClick}
                  className="transition hover:text-foreground"
                >
                  Species Bio-Dex
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  onClick={playTactileClick}
                  className="transition hover:text-foreground"
                >
                  Explorer Passport
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: System Spec */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-black uppercase tracking-wider text-foreground">
              Architecture
            </p>
            <ul className="space-y-2 font-mono text-[11px] text-muted">
              <li>Engine: ResNet-50 ONNX</li>
              <li>Integrity: 64-bit pHash</li>
              <li>Smart Contract: Anchor 0.31</li>
              <li>Network: Solana Devnet</li>
              <li>Framework: Next.js 16</li>
            </ul>
          </div>

          {/* Column 3: Security & Privacy */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-black uppercase tracking-wider text-foreground">
              Privacy & Truth
            </p>
            <ul className="space-y-2 text-muted">
              <li>Zero Cloud Photo Storage</li>
              <li>In-Memory Model Inference</li>
              <li>Non-Custodial Wallet Login</li>
              <li>Deterministic Grade XP</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Contract ID */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-[11px] font-mono text-muted sm:flex-row">
          <p>© 2026 WildQuest. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>PROGRAM ID:</span>
            <span className="rounded bg-cream px-2 py-0.5 font-bold text-foreground dark:bg-black/40">
              3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
