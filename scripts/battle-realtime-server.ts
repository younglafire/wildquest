import { createHash, randomBytes, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
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
  fetchMatch,
  findSpeciesConfigPda,
  MatchStatus,
} from "../app/generated/wildquest";
import { BattleRoom, serializeBattleResult } from "../app/lib/battle-room";
import {
  battleAuthenticationMessage,
  type BattleClientMessage,
  type BattleServerMessage,
} from "../app/lib/battle-protocol";
import { buildResolveMatchInstruction } from "../app/lib/matches";

const DEFAULT_PORT = 3_001;
const TICK_INTERVAL_MS = 100;
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const SESSION_DURATION_MS = 15 * 60 * 1_000;
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
};

type SocketState = {
  matchAddress: Address;
  nonce: string;
  side: "creator" | "opponent" | null;
  authenticated: boolean;
};

type AuthSession = {
  matchAddress: Address;
  wallet: Address;
  side: "creator" | "opponent";
  expiresAt: number;
};

async function loadResolver(): Promise<KeyPairSigner> {
  const encoded = process.env.CAPTURE_AUTHORITY_SECRET_KEY_BASE64;
  if (encoded) {
    return createKeyPairSignerFromBytes(
      Uint8Array.from(Buffer.from(encoded, "base64")),
    );
  }
  const keypairPath =
    process.env.WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH ??
    ".wildquest-keys/capture-authority.json";
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
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
  const resolver = await loadResolver();
  const client = createClient({ url: devnet(rpcUrl), payer: resolver });
  const rooms = new Map<Address, Promise<RoomSession>>();
  const authSessions = new Map<string, AuthSession>();

  const getRoom = (matchAddress: Address) => {
    const existing = rooms.get(matchAddress);
    if (existing) return existing;
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
      session.room = new BattleRoom(
        {
          matchAddress,
          creatorStats: stats.slice(0, 3),
          opponentStats: stats.slice(3, 6),
        },
        async (outcome, turnCount, events) => {
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
        },
      );
      return session;
    })().catch((error) => {
      rooms.delete(matchAddress);
      throw error;
    });
    rooms.set(matchAddress, created);
    return created;
  };

  const server = new WebSocketServer({
    port: Number(process.env.BATTLE_SERVER_PORT ?? DEFAULT_PORT),
  });

  server.on("connection", (socket, request) => {
    let state: SocketState;
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      state = {
        matchAddress: address(url.searchParams.get("match") ?? ""),
        nonce: randomBytes(24).toString("base64url"),
        side: null,
        authenticated: false,
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
    };

    socket.on("message", async (raw) => {
      try {
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
      } catch (error) {
        send(socket, {
          type: "error",
          code: "INVALID_MESSAGE",
          message: error instanceof Error ? error.message : "Invalid message.",
        });
      }
    });

    socket.on("close", async () => {
      const pending = rooms.get(state.matchAddress);
      if (!pending) return;
      const session = await pending;
      session.sockets.delete(socket);
      if (!state.side) return;
      const sideSockets =
        state.side === "creator"
          ? session.creatorSockets
          : session.opponentSockets;
      sideSockets.delete(socket);
      if (sideSockets.size === 0) session.room.disconnect(state.side);
    });
  });

  const timer = setInterval(async () => {
    for (const pending of rooms.values()) {
      const session = await pending;
      const snapshot = session.room.tick();
      if (snapshot.sequence === session.lastSequence) continue;
      session.lastSequence = snapshot.sequence;
      for (const socket of session.sockets) {
        send(socket, { type: "snapshot", snapshot });
      }
    }
  }, TICK_INTERVAL_MS);
  timer.unref();
  console.info(`WildQuest battle server listening on :${server.options.port}`);
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
