"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "@solana/kit";
import {
  battleAuthenticationMessage,
  type BattleServerMessage,
} from "../battle-protocol";
import type { BattleRoomSnapshot } from "../battle-room";
import type { BattleAction } from "../simultaneous-battle";
import type { WalletSession } from "../wallet/types";

const DEFAULT_BATTLE_SERVER_URL = "ws://localhost:3001";
const BATTLE_SERVER_URL =
  process.env.NEXT_PUBLIC_BATTLE_SERVER_URL ??
  (process.env.NODE_ENV === "production" ? null : DEFAULT_BATTLE_SERVER_URL);

export function useBattleRoom(input: {
  matchAddress: Address;
  wallet: WalletSession | undefined;
  isParticipant: boolean;
}) {
  const [snapshot, setSnapshot] = useState<BattleRoomSnapshot | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "reconnecting" | "watching" | "authenticated" | "unavailable"
  >(BATTLE_SERVER_URL ? "connecting" : "unavailable");
  const [error, setError] = useState<string | null>(
    BATTLE_SERVER_URL ? null : "The live battle server is not configured.",
  );
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!BATTLE_SERVER_URL) return;
    const url = new URL(BATTLE_SERVER_URL);
    url.searchParams.set("match", input.matchAddress);
    const sessionKey = `wildquest:battle-session:${input.matchAddress}:${input.wallet?.account.address ?? "spectator"}`;
    let stopped = false;
    let retryable = true;
    let reconnectTimer: number | null = null;
    let reconnectAttempt = 0;

    const connect = () => {
      if (stopped || !retryable) return;
      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
      } catch {
        setError("The battle server URL is invalid.");
        setStatus("unavailable");
        return;
      }
      socketRef.current = socket;
      socket.onopen = () => {
        reconnectAttempt = 0;
        setError(null);
      };
      socket.onmessage = (event) => {
        let message: BattleServerMessage;
        try {
          message = JSON.parse(String(event.data)) as BattleServerMessage;
        } catch {
          setError("The battle server returned an invalid message.");
          retryable = false;
          socket.close(1002, "Invalid server message");
          return;
        }
        if (message.type === "challenge") {
          if (!input.isParticipant || !input.wallet?.signMessage) {
            socket.send(JSON.stringify({ type: "watch" }));
            setStatus("watching");
            return;
          }
          const token = sessionStorage.getItem(sessionKey);
          if (token) {
            socket.send(JSON.stringify({ type: "resume", token }));
            return;
          }
          const wallet = input.wallet.account.address;
          const value = battleAuthenticationMessage(
            input.matchAddress,
            wallet,
            message.nonce,
          );
          void input.wallet
            .signMessage(new TextEncoder().encode(value))
            .then((signature) => {
              if (socket.readyState !== WebSocket.OPEN) return;
              let binary = "";
              for (const byte of signature) binary += String.fromCharCode(byte);
              socket.send(
                JSON.stringify({
                  type: "authenticate",
                  wallet,
                  signature: btoa(binary),
                }),
              );
            })
            .catch(() => {
              setError("Wallet message signing was rejected.");
              setStatus("unavailable");
            });
        } else if (message.type === "authenticated") {
          sessionStorage.setItem(sessionKey, message.token);
          setStatus("authenticated");
        } else if (message.type === "snapshot") {
          setSnapshot(message.snapshot);
        } else if (message.type === "error") {
          setError(message.message);
          if (message.code === "SESSION_EXPIRED") {
            sessionStorage.removeItem(sessionKey);
            socket.close();
          } else if (message.code === "MATCH_NOT_ACTIVE") {
            retryable = false;
            setStatus("unavailable");
            socket.close(1000, "Match is no longer active");
          }
        }
      };
      socket.onerror = () => {
        setError("The live battle server is unavailable. Reconnecting…");
      };
      socket.onclose = () => {
        if (stopped || !retryable) return;
        reconnectAttempt += 1;
        if (reconnectAttempt > 8) {
          setError("The live battle server could not be reached. Try again.");
          setStatus("unavailable");
          return;
        }
        setStatus("reconnecting");
        const delay = Math.min(15_000, 750 * 2 ** (reconnectAttempt - 1));
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };
    connect();
    return () => {
      stopped = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [input.isParticipant, input.matchAddress, input.wallet]);

  const choose = useCallback(
    (action: BattleAction) => {
      const socket = socketRef.current;
      if (
        !socket ||
        socket.readyState !== WebSocket.OPEN ||
        !snapshot ||
        status !== "authenticated"
      ) {
        return;
      }
      socket.send(
        JSON.stringify({ type: "choose", action, turn: snapshot.battle.turn }),
      );
    },
    [snapshot, status],
  );

  return { snapshot, status, error, choose };
}
