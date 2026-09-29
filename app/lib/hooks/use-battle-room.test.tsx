// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { address } from "@solana/kit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BattleServerMessage } from "../battle-protocol";
import type { WalletSession } from "../wallet/types";
import { useBattleRoom } from "./use-battle-room";

class FakeWebSocket {
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];

  readonly sent: string[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(readonly url: string | URL) {
    FakeWebSocket.instances.push(this);
  }

  send(value: string) {
    this.sent.push(value);
  }

  close() {
    this.readyState = 3;
    this.onclose?.();
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  receive(message: BattleServerMessage) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

const matchAddress = address("11111111111111111111111111111111");

beforeEach(() => {
  FakeWebSocket.instances = [];
  sessionStorage.clear();
  vi.stubGlobal("WebSocket", FakeWebSocket);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useBattleRoom", () => {
  it("waits for a player gesture before requesting a wallet signature", async () => {
    const signMessage = vi.fn(async () => new Uint8Array([1, 2, 3]));
    const wallet = {
      account: {
        address: matchAddress,
        publicKey: new Uint8Array(32),
      },
      connector: { id: "Phantom", name: "Phantom" },
      signMessage,
      disconnect: vi.fn(),
    } satisfies WalletSession;

    const hook = renderHook(() =>
      useBattleRoom({ matchAddress, wallet, isParticipant: true }),
    );
    const socket = FakeWebSocket.instances[0]!;

    act(() => {
      socket.open();
      socket.receive({ type: "challenge", nonce: "nonce", message: "" });
    });

    expect(signMessage).not.toHaveBeenCalled();
    expect(socket.sent.map((value) => JSON.parse(value))).toContainEqual({
      type: "watch",
    });
    expect(hook.result.current.status).toBe("awaiting-authentication");

    await act(() => hook.result.current.authenticate());

    expect(signMessage).toHaveBeenCalledOnce();
    expect(socket.sent.map((value) => JSON.parse(value))).toContainEqual({
      type: "authenticate",
      wallet: matchAddress,
      signature: "AQID",
    });

    act(() => {
      socket.receive({
        type: "authenticated",
        side: "creator",
        token: "session-token",
      });
    });
    await waitFor(() =>
      expect(hook.result.current.status).toBe("authenticated"),
    );
  });
});
