import { createHash, randomBytes, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  address,
  createKeyPairSignerFromBytes,
  devnet,
  getBase58Encoder,
  unwrapOption,
  type Address,
  type KeyPairSigner,
} from "@solana/kit";
import { createClient } from "@solana/kit-client-rpc";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";
import {
  fetchAllCreature,
  fetchAllSpeciesConfig,
  fetchMatchResolverConfig,
  fetchMatch,
  findMatchResolverConfigPda,
  findSpeciesConfigPda,
  MatchStatus,
} from "../app/generated/wildquest";
import { BattleRoom, serializeBattleResult } from "../app/lib/battle-room";
import type { BattleOutcome } from "../app/lib/battle-types";
import {
  battleAuthenticationMessage,
  type BattleClientMessage,
  type BattleServerMessage,
} from "../app/lib/battle-protocol";
import { buildResolveMatchInstruction } from "../app/lib/matches";
import type { TurnEvent } from "../app/lib/simultaneous-battle";
import { BattleStateStore } from "./battle-state-store";

const DEFAULT_PORT = 3_001;
const TICK_INTERVAL_MS = 100;
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const SESSION_DURATION_MS = 15 * 60 * 1_000;
const MESSAGE_WINDOW_MS = 10_000;
const MAX_MESSAGES_PER_WINDOW = 30;
const MAX_MESSAGE_BYTES = 16 * 1_024;
const FINISHED_ROOM_TTL_MS = 5 * 60 * 1_000;
const MAX_ROOMS = Number(process.env.BATTLE_SERVER_MAX_ROOMS ?? 1_000);
const MAX_SOCKETS = Number(process.env.BATTLE_SERVER_MAX_SOCKETS ?? 500);
const inputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("watch") }).strict(),
  z.object({ type: z.literal("resume"), token: z.string().min(32) }).strict(),
  z
    .object({
      type: z.literal("authenticate"),
      wallet: z.string().min(1),
      signature: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("choose"),
      turn: z.number().int().positive(),
      action: z.enum(["strike", "guard", "ability", "recharge"]),
    })
    .strict(),
]);

type RoomSession = {
  room: BattleRoom;
  sockets: Set<WebSocket>;
  creatorSockets: Set<WebSocket>;
  opponentSockets: Set<WebSocket>;
  lastSequence: number;
  finishedAt: number | null;
};

type SocketState = {
  matchAddress: Address;
  nonce: string;
  side: "creator" | "opponent" | null;
  authenticated: boolean;
  messageCount: number;
  messageWindowStartedAt: number;
};

type AuthSession = {
  matchAddress: Address;
  wallet: Address;
  side: "creator" | "opponent";
  expiresAt: number;
};

async function loadResolver(): Promise<KeyPairSigner> {
  const encoded = process.env.MATCH_RESOLVER_SECRET_KEY_BASE64;
  if (encoded) {
    return createKeyPairSignerFromBytes(
      Uint8Array.from(Buffer.from(encoded, "base64")),
    );
  }
  const keypairPath =
    process.env.WQ_MATCH_RESOLVER_KEYPAIR_PATH ??
    ".wildquest-keys/match-resolver.json";
  const value: unknown = JSON.parse(
    await readFile(path.resolve(keypairPath), "utf8"),
  );
  return createKeyPairSignerFromBytes(
    Uint8Array.from(
      z.array(z.number().int().min(0).max(255)).length(64).parse(value),
    ),
  );
}

function verifyWalletSignature(
  wallet: Address,
  signedMessage: string,
  signature: string,
) {
  const publicKey = getBase58Encoder().encode(wallet);
  const key = Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKey)]);
  return verify(
    null,
    Buffer.from(signedMessage),
    { key, format: "der", type: "spki" },
    Buffer.from(signature, "base64"),
  );
}

function send(socket: WebSocket, message: BattleServerMessage) {
  if (socket.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify(message));
}

async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl && process.env.NODE_ENV === "production") {
    throw new Error("SOLANA_RPC_URL is required in production.");
  }
  const resolvedRpcUrl =
    rpcUrl ??
    process.env.NEXT_PUBLIC_RPC_URL ??
    "https://api.devnet.solana.com";
  const resolver = await loadResolver();
  const client = createClient({ url: devnet(resolvedRpcUrl), payer: resolver });
  const rooms = new Map<Address, Promise<RoomSession>>();
  const authSessions = new Map<string, AuthSession>();
  const stateStore = BattleStateStore.fromEnvironment();
  const allowedOrigins = new Set(
    (process.env.BATTLE_SERVER_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  if (process.env.NODE_ENV === "production" && allowedOrigins.size === 0) {
    throw new Error("BATTLE_SERVER_ALLOWED_ORIGINS is required in production.");
  }
  const persistRoom = (session: RoomSession) => {
    if (!stateStore) return;
    void stateStore.save(session.room.exportState()).catch((error: unknown) => {
      console.error(
        error instanceof Error
          ? `Battle room persistence failed: ${error.message}`
          : "Battle room persistence failed.",
      );
    });
  };

  const getRoom = (matchAddress: Address) => {
    const existing = rooms.get(matchAddress);
    if (existing) return existing;
    if (rooms.size >= MAX_ROOMS) {
      throw new Error("The battle server is at room capacity. Try again soon.");
    }
    const created = (async () => {
      const match = await fetchMatch(client.rpc, matchAddress, {
        commitment: "confirmed",
      });
      const opponent = unwrapOption(match.data.opponent);
      if (match.data.status !== MatchStatus.Active || !opponent) {
        throw new Error("The onchain Match is not active.");
      }
      const creatureAddresses = [
        ...match.data.creatorCreatures,
        ...match.data.opponentCreatures,
      ];
      const creatures = await fetchAllCreature(client.rpc, creatureAddresses, {
        commitment: "confirmed",
      });
      const configAddresses = await Promise.all(
        creatures.map(
          async (creature) =>
            (
              await findSpeciesConfigPda({
                catalogueId: creature.data.catalogueId,
              })
            )[0],
        ),
      );
      const configs = await fetchAllSpeciesConfig(client.rpc, configAddresses, {
        commitment: "confirmed",
      });
      for (let index = 0; index < configs.length; index += 1) {
        const config = configs[index]!;
        const creature = creatures[index]!;
        if (
          !config.data.active ||
          config.data.catalogueId !== creature.data.catalogueId ||
          config.data.balanceVersion !== match.data.balanceVersion ||
          creature.data.balanceVersion !== match.data.balanceVersion
        ) {
          throw new Error(
            "A battle Creature has stale or inactive onchain stats.",
          );
        }
      }
      const stats = configs.map(({ data }) => ({
        hp: data.hp,
        attack: data.attack,
        defense: data.defense,
        maxMana: data.maxMana,
        strikeCost: data.strikeCost,
        guardCost: data.guardCost,
        rechargeGain: data.rechargeGain,
        abilityId: data.abilityId,
        abilityCost: data.abilityCost,
      }));
      const session = {} as RoomSession;
      session.sockets = new Set();
      session.creatorSockets = new Set();
      session.opponentSockets = new Set();
      session.lastSequence = -1;
      session.finishedAt = null;
      const roomConfig = {
        matchAddress,
        creatorStats: stats.slice(0, 3),
        opponentStats: stats.slice(3, 6),
      };
      const finishHandler = async (
        outcome: BattleOutcome,
        turnCount: number,
        events: ReadonlyArray<TurnEvent>,
      ) => {
        const payload = serializeBattleResult(
          matchAddress,
          outcome,
          turnCount,
          events,
          match.data.rulesVersion,
          match.data.balanceVersion,
        );
        const resultHash = new Uint8Array(
          createHash("sha256").update(payload).digest(),
        );
        await stateStore?.saveReplay({
          matchAddress,
          rulesVersion: match.data.rulesVersion,
          balanceVersion: match.data.balanceVersion,
          outcome,
          turnCount,
          resultHash,
          events,
        });
        const winner =
          outcome === "creator"
            ? match.data.creator
            : outcome === "opponent"
              ? opponent
              : null;
        const latestMatch = await fetchMatch(client.rpc, matchAddress, {
          commitment: "confirmed",
        });
        if (latestMatch.data.status !== MatchStatus.Active) {
          if (
            latestMatch.data.turnCount === turnCount &&
            Buffer.from(latestMatch.data.resultHash).equals(
              Buffer.from(resultHash),
            )
          ) {
            return;
          }
          throw new Error("The onchain Match has a different result.");
        }
        const instruction = await buildResolveMatchInstruction(
          resolver,
          latestMatch,
          winner,
          turnCount,
          resultHash,
        );
        await client.sendTransaction([instruction]);
      };
      const storedState = await stateStore?.load(matchAddress);
      session.room = storedState
        ? BattleRoom.restore(roomConfig, storedState, finishHandler)
        : new BattleRoom(roomConfig, finishHandler);
      persistRoom(session);
      return session;
    })().catch((error) => {
      rooms.delete(matchAddress);
      throw error;
    });
    rooms.set(matchAddress, created);
    return created;
  };

  const port = Number(
    process.env.PORT ?? process.env.BATTLE_SERVER_PORT ?? DEFAULT_PORT,
  );
  const httpServer = createServer(async (request, response) => {
    if (request.url === "/healthz") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          status: "ok",
          activeRooms: rooms.size,
          sockets: server?.clients.size ?? 0,
          authSessions: authSessions.size,
          heapUsedBytes: process.memoryUsage().heapUsed,
        }),
      );
      return;
    }
    if (request.url === "/readyz") {
      try {
        const [resolverConfigAddress] = await findMatchResolverConfigPda();
        const resolverConfig = await fetchMatchResolverConfig(
          client.rpc,
          resolverConfigAddress,
          {
            commitment: "confirmed",
          },
        );
        if (resolverConfig.data.resolver !== resolver.address) {
          throw new Error("The configured resolver is not authorized onchain.");
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ status: "ready" }));
      } catch (error) {
        response.writeHead(503, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            status: "not-ready",
            reason:
              error instanceof Error
                ? error.message
                : "Readiness check failed.",
          }),
        );
      }
      return;
    }
    response.writeHead(404).end();
  });
  const server = new WebSocketServer({
    server: httpServer,
    maxPayload: MAX_MESSAGE_BYTES,
  });

  server.on("connection", (socket, request) => {
    if (server.clients.size > MAX_SOCKETS) {
      socket.close(1013, "Battle server is at capacity");
      return;
    }
    const origin = request.headers.origin;
    if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
      socket.close(1008, "Origin is not allowed");
      return;
    }
    let state: SocketState;
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      state = {
        matchAddress: address(url.searchParams.get("match") ?? ""),
        nonce: randomBytes(24).toString("base64url"),
        side: null,
        authenticated: false,
        messageCount: 0,
        messageWindowStartedAt: Date.now(),
      };
    } catch {
      socket.close(1008, "Invalid Match address");
      return;
    }
    const challenge = battleAuthenticationMessage(
      state.matchAddress,
      "<wallet>",
      state.nonce,
    );
    send(socket, { type: "challenge", nonce: state.nonce, message: challenge });

    const attachParticipant = (
      session: RoomSession,
      side: "creator" | "opponent",
    ) => {
      state = { ...state, side, authenticated: true };
      session.sockets.add(socket);
      const sideSockets =
        side === "creator" ? session.creatorSockets : session.opponentSockets;
      const wasDisconnected = sideSockets.size === 0;
      sideSockets.add(socket);
      if (wasDisconnected) session.room.connect(side);
      persistRoom(session);
    };

    socket.on("message", async (raw) => {
      try {
        const now = Date.now();
        if (now - state.messageWindowStartedAt >= MESSAGE_WINDOW_MS) {
          state.messageWindowStartedAt = now;
          state.messageCount = 0;
        }
        state.messageCount += 1;
        if (state.messageCount > MAX_MESSAGES_PER_WINDOW) {
          socket.close(1008, "Message rate limit exceeded");
          return;
        }
        const input = inputSchema.parse(
          JSON.parse(raw.toString()),
        ) as BattleClientMessage;
        const session = await getRoom(state.matchAddress);
        if (input.type === "watch") {
          session.sockets.add(socket);
          send(socket, { type: "snapshot", snapshot: session.room.snapshot() });
          return;
        }
        if (input.type === "resume") {
          const authSession = authSessions.get(input.token);
          if (
            !authSession ||
            authSession.matchAddress !== state.matchAddress ||
            authSession.expiresAt <= Date.now()
          ) {
            authSessions.delete(input.token);
            throw new Error("The battle session expired. Sign in again.");
          }
          attachParticipant(session, authSession.side);
          send(socket, {
            type: "authenticated",
            side: authSession.side,
            token: input.token,
          });
          send(socket, { type: "snapshot", snapshot: session.room.snapshot() });
          return;
        }
        if (input.type === "authenticate") {
          const wallet = address(input.wallet);
          const match = await fetchMatch(client.rpc, state.matchAddress, {
            commitment: "confirmed",
          });
          const opponent = unwrapOption(match.data.opponent);
          const side =
            wallet === match.data.creator
              ? "creator"
              : wallet === opponent
                ? "opponent"
                : null;
          const message = battleAuthenticationMessage(
            state.matchAddress,
            wallet,
            state.nonce,
          );
          if (
            !side ||
            !verifyWalletSignature(wallet, message, input.signature)
          ) {
            throw new Error("Wallet authentication failed.");
          }
          attachParticipant(session, side);
          const token = randomBytes(32).toString("base64url");
          authSessions.set(token, {
            matchAddress: state.matchAddress,
            wallet,
            side,
            expiresAt: Date.now() + SESSION_DURATION_MS,
          });
          send(socket, { type: "authenticated", side, token });
          send(socket, { type: "snapshot", snapshot: session.room.snapshot() });
          return;
        }
        if (!state.authenticated || !state.side) {
          throw new Error("Authenticate before choosing an action.");
        }
        session.room.submit(state.side, input.action, input.turn);
        persistRoom(session);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid message.";
        const code = message.includes("session expired")
          ? "SESSION_EXPIRED"
          : message === "The onchain Match is not active."
            ? "MATCH_NOT_ACTIVE"
            : "INVALID_MESSAGE";
        send(socket, {
          type: "error",
          code,
          message,
        });
      }
    });

    socket.on("close", async () => {
      const pending = rooms.get(state.matchAddress);
      if (!pending) return;
      // The socket can close while an onchain room lookup is still rejecting.
      // That rejection was already returned to the message handler, so there is
      // no participant state to clean up here.
      const session = await pending.catch(() => null);
      if (!session) return;
      session.sockets.delete(socket);
      if (!state.side) return;
      const sideSockets =
        state.side === "creator"
          ? session.creatorSockets
          : session.opponentSockets;
      sideSockets.delete(socket);
      if (sideSockets.size === 0) {
        session.room.disconnect(state.side);
        persistRoom(session);
      }
    });
  });

  const timer = setInterval(async () => {
    for (const pending of rooms.values()) {
      // A stale Match can disappear from the map while this tick still holds
      // its rejected promise. Never let that socket-scoped failure terminate
      // the process-wide room clock.
      const session = await pending.catch(() => null);
      if (!session) continue;
      const snapshot = session.room.tick();
      if (snapshot.phase === "finished" && session.finishedAt === null) {
        session.finishedAt = Date.now();
      }
      if (snapshot.sequence === session.lastSequence) continue;
      session.lastSequence = snapshot.sequence;
      persistRoom(session);
      for (const socket of session.sockets) {
        send(socket, { type: "snapshot", snapshot });
      }
    }
    const now = Date.now();
    for (const [token, authSession] of authSessions) {
      if (authSession.expiresAt <= now) authSessions.delete(token);
    }
    for (const [matchAddress, pending] of rooms) {
      const session = await pending.catch(() => null);
      if (
        session?.finishedAt !== null &&
        session?.finishedAt !== undefined &&
        now - session.finishedAt >= FINISHED_ROOM_TTL_MS &&
        session.sockets.size === 0
      ) {
        rooms.delete(matchAddress);
      }
    }
  }, TICK_INTERVAL_MS);
  timer.unref();
  httpServer.listen(port, "0.0.0.0", () => {
    console.info(`WildQuest battle server listening on :${port}`);
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Battle server failed.",
    );
    process.exitCode = 1;
  });
}
