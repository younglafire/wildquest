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

export function useBattleRoom(input: {
  matchAddress: Address;
  wallet: WalletSession | undefined;
  isParticipant: boolean;
}) {
  const [snapshot, setSnapshot] = useState<BattleRoomSnapshot | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "reconnecting" | "watching" | "authenticated" | "unavailable"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const walletRef = useRef(input.wallet);
  const isParticipantRef = useRef(input.isParticipant);

  useEffect(() => {
    walletRef.current = input.wallet;
    isParticipantRef.current = input.isParticipant;
  }, [input.isParticipant, input.wallet]);

  useEffect(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BATTLE_SERVER_URL ?? DEFAULT_BATTLE_SERVER_URL;
    const url = new URL(baseUrl);
    url.searchParams.set("match", input.matchAddress);
    const walletAddress = input.wallet?.account.address;
    const sessionKey = `wildquest:battle-session:${input.matchAddress}:${walletAddress ?? "spectator"}`;
    let stopped = false;
    let retryable = true;
    let reconnectTimer: number | null = null;
    let currentSocket: WebSocket | null = null;

    const connect = () => {
      const socket = new WebSocket(url);
      currentSocket = socket;
      socketRef.current = socket;
      socket.onopen = () => setError(null);
      socket.onmessage = (event) => {
        const message = JSON.parse(String(event.data)) as BattleServerMessage;
        if (message.type === "challenge") {
          const wallet = walletRef.current;
          if (!isParticipantRef.current || !wallet?.signMessage) {
            socket.send(JSON.stringify({ type: "watch" }));
            setStatus("watching");
            return;
          }
          const token = sessionStorage.getItem(sessionKey);
          if (token) {
            socket.send(JSON.stringify({ type: "resume", token }));
            return;
          }
          const walletAddress = wallet.account.address;
          const value = battleAuthenticationMessage(
            input.matchAddress,
            walletAddress,
            message.nonce,
          );
          void wallet
            .signMessage(new TextEncoder().encode(value))
            .then((signature) => {
              if (socket.readyState !== WebSocket.OPEN) return;
              let binary = "";
              for (const byte of signature) binary += String.fromCharCode(byte);
              socket.send(
                JSON.stringify({
                  type: "authenticate",
                  wallet: walletAddress,
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
        setStatus("reconnecting");
        reconnectTimer = window.setTimeout(connect, 1_000);
      };
    };
    connect();
    return () => {
      stopped = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      currentSocket?.close();
      if (socketRef.current === currentSocket) socketRef.current = null;
    };
  }, [input.isParticipant, input.matchAddress, input.wallet?.account.address]);

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
