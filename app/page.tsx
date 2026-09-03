"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lamports as sol } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "./lib/wallet/context";
import { useBalance } from "./lib/hooks/use-balance";
import { useSendTransaction } from "./lib/hooks/use-send-transaction";
import { lamportsToSolString } from "./lib/lamports";
import { useSolanaClient } from "./lib/solana-client-context";
import { ellipsify } from "./lib/explorer";
import { GridBackground } from "./components/grid-background";
import { ThemeToggle } from "./components/theme-toggle";
import { ClusterSelect } from "./components/cluster-select";
import { WalletButton } from "./components/wallet-button";
import { useCluster } from "./components/cluster-context";
import {
  fetchMaybePlayer,
  findPlayerPda,
  getInitializePlayerInstructionAsync,
} from "./generated/wildquest";

type PlayerStats = {
  xp: bigint;
  level: bigint;
  discoveryCount: bigint;
  badgeCount: bigint;
};

type PlayerSnapshot = {
  address: string;
  stats: PlayerStats;
};

export default function Home() {
  const { wallet, status, signer } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  const client = useSolanaClient();
  const { send, isSending } = useSendTransaction();

  const address = wallet?.account.address;
  const balance = useBalance(address);
  const [copied, setCopied] = useState(false);
  const [playerSnapshot, setPlayerSnapshot] = useState<PlayerSnapshot | null>(
    null,
  );
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const player =
    playerSnapshot && playerSnapshot.address === address
      ? playerSnapshot.stats
      : null;

  useEffect(() => {
    if (!address || !client || status !== "connected") return;

    let cancelled = false;

    const fetchPlayer = async () => {
      try {
        const [playerAddress] = await findPlayerPda({ payer: address });
        const maybePlayer = await fetchMaybePlayer(client.rpc, playerAddress);

        if (cancelled) return;

        if (!maybePlayer.exists) {
          setPlayerSnapshot(null);
          return;
        }

        setPlayerSnapshot({
          address,
          stats: {
            xp: maybePlayer.data.xp,
            level: maybePlayer.data.level,
            discoveryCount: maybePlayer.data.discoveryCount,
            badgeCount: maybePlayer.data.badgeCount,
          },
        });
      } catch (err) {
        console.error("Failed to fetch player:", err);
        if (!cancelled) {
          setPlayerSnapshot(null);
        }
      }
    };

    void fetchPlayer();

    return () => {
      cancelled = true;
    };
  }, [address, client, status]);

  useEffect(() => {
    if (!address || !signer || status !== "connected") return;

    let cancelled = false;

    const ensurePlayer = async () => {
      try {
        const [playerAddress] = await findPlayerPda({ payer: address });
        const maybePlayer = await fetchMaybePlayer(client.rpc, playerAddress);

        if (cancelled) return;

        if (maybePlayer.exists) {
          setPlayerSnapshot({
            address,
            stats: {
              xp: maybePlayer.data.xp,
              level: maybePlayer.data.level,
              discoveryCount: maybePlayer.data.discoveryCount,
              badgeCount: maybePlayer.data.badgeCount,
            },
          });
          return;
        }

        setIsCreatingPlayer(true);
        const instruction = await getInitializePlayerInstructionAsync({
          payer: signer,
        });
        const signature = await send({ instructions: [instruction] });

        if (cancelled) return;

        const createdPlayer = await fetchMaybePlayer(client.rpc, playerAddress);
        if (createdPlayer.exists) {
          setPlayerSnapshot({
            address,
            stats: {
              xp: createdPlayer.data.xp,
              level: createdPlayer.data.level,
              discoveryCount: createdPlayer.data.discoveryCount,
              badgeCount: createdPlayer.data.badgeCount,
            },
          });
        }

        toast.success("Player created successfully!", {
          description: (
            <a
              href={getExplorerUrl(`/tx/${signature}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          ),
        });
      } catch (err) {
        console.error("Failed to initialize player:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to create the player.",
        );
      } finally {
        if (!cancelled) {
          setIsCreatingPlayer(false);
        }
      }
    };

    void ensurePlayer();

    return () => {
      cancelled = true;
    };
  }, [address, client, getExplorerUrl, send, signer, status]);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    if (!address) return;
    try {
      toast.info("Requesting airdrop...");
      const sig = await client.airdrop(address, sol(1_000_000_000n));
      toast.success("Airdrop received!", {
        description: sig ? (
          <a
            href={getExplorerUrl(`/tx/${sig}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ) : undefined,
      });
    } catch (err) {
      console.error("Airdrop failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimited =
        msg.includes("429") || msg.includes("Internal JSON-RPC error");
      toast.error(
        isRateLimited
          ? "Devnet faucet rate-limited. Use the web faucet instead."
          : "Airdrop failed. Try again later.",
        isRateLimited
          ? {
              description: (
                <a
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open faucet.solana.com
                </a>
              ),
            }
          : undefined,
      );
    }
  };

  const handleCallProgram = async () => {
    if (!signer) {
      toast.error("Connect your wallet first.");
      return;
    }

    try {
      toast.info("Creating your WildQuest player...");
      const instruction = await getInitializePlayerInstructionAsync({
        payer: signer,
      });
      const signature = await send({ instructions: [instruction] });
      const [playerAddress] = await findPlayerPda({ payer: address! });
      const createdPlayer = await fetchMaybePlayer(client.rpc, playerAddress);

      if (createdPlayer.exists) {
        setPlayerSnapshot({
          address: address!,
          stats: {
            xp: createdPlayer.data.xp,
            level: createdPlayer.data.level,
            discoveryCount: createdPlayer.data.discoveryCount,
            badgeCount: createdPlayer.data.badgeCount,
          },
        });
      }

      toast.success("Player initialized successfully!", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${signature}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
    } catch (err) {
      console.error("WildQuest call failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize the player.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">
            Solana Starter Kit
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6">
          {/* Hero */}
          <section className="pt-6 pb-20 md:pt-8 md:pb-32">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-black tracking-tight text-foreground">
                  <span className="block text-6xl md:text-7xl">Wild</span>
                  <span className="block text-7xl md:text-8xl">Quest</span>
                </h1>
              </div>

              <div className="flex max-w-2xl flex-col gap-3">
                <p className="text-base leading-relaxed text-foreground/50">
                  Connect your wallet to create your on-chain player profile,
                  start earning XP, and track discoveries and badges as your
                  adventure unfolds.
                </p>
                <p className="text-sm leading-relaxed text-foreground/40">
                  Your player is stored in a Program Derived Address (PDA) owned
                  by your wallet, so the game state is persistent on Solana.
                </p>
                <div className="pt-2">
                  <Link
                    href="/capture"
                    className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90"
                  >
                    Capture a discovery
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Template content */}
          <div className="space-y-10 pb-20">
            {/* Wallet Balance */}
            {status === "connected" && address && (
              <section className="relative w-full overflow-hidden rounded-2xl border border-border-low bg-card px-5 py-5">
                <div
                  className="pointer-events-none absolute inset-0 opacity-100 dark:opacity-0"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: "24px 24px",
                    mask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                    WebkitMask:
                      "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: "24px 24px",
                    mask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                    WebkitMask:
                      "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-foreground/70"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Wallet Balance</span>
                    <button
                      onClick={handleCopy}
                      className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted transition hover:text-foreground"
                    >
                      {ellipsify(address, 4)}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        {copied ? (
                          <path d="M20 6 9 17l-5-5" />
                        ) : (
                          <>
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {cluster !== "mainnet" && (
                    <button
                      onClick={handleAirdrop}
                      className="cursor-pointer rounded-lg border border-border-low px-3 py-1.5 text-xs font-medium transition hover:bg-cream"
                    >
                      Airdrop
                    </button>
                  )}
                </div>
                <p className="relative mt-4 font-mono text-4xl font-bold tabular-nums tracking-tight">
                  {balance.lamports != null
                    ? lamportsToSolString(balance.lamports)
                    : "\u2014"}
                  <span className="ml-1.5 text-lg font-normal text-muted">
                    SOL
                  </span>
                </p>
              </section>
            )}

            <section className="w-full rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]">
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-lg font-semibold">Player status</p>
                  <p className="text-sm text-muted">
                    Your wallet is automatically registered as a WildQuest
                    player on first connect.
                  </p>
                </div>

                {status === "connected" && address ? (
                  <div className="space-y-4">
                    {player ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-border-low bg-cream/40 p-3">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted">
                            XP
                          </div>
                          <div className="mt-2 text-2xl font-bold tabular-nums">
                            {Number(player.xp)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border-low bg-cream/40 p-3">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted">
                            Level
                          </div>
                          <div className="mt-2 text-2xl font-bold tabular-nums">
                            {Number(player.level)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border-low bg-cream/40 p-3">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted">
                            Discoveries
                          </div>
                          <div className="mt-2 text-2xl font-bold tabular-nums">
                            {Number(player.discoveryCount)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border-low bg-cream/40 p-3">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted">
                            Badges
                          </div>
                          <div className="mt-2 text-2xl font-bold tabular-nums">
                            {Number(player.badgeCount)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">
                        {isCreatingPlayer
                          ? "Creating your player profile on-chain..."
                          : "Loading player data..."}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleCallProgram}
                      disabled={!signer || isSending || isCreatingPlayer}
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSending || isCreatingPlayer
                        ? "Initializing player..."
                        : "Create / Refresh Player"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Connect a wallet to create your player PDA and load the
                    stats.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
