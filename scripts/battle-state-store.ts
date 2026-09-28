import { createClient } from "@supabase/supabase-js";
import type { BattleOutcome } from "../app/lib/battle-types";
import type { BattleRoomState } from "../app/lib/battle-room";
import type { TurnEvent } from "../app/lib/simultaneous-battle";
import type { Database, Json } from "../app/lib/supabase/database.types";

const ROOM_TTL_MS = 20 * 60 * 1_000;

function isBattleRoomState(
  value: unknown,
  matchAddress: string,
): value is BattleRoomState {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1 &&
    "matchAddress" in value &&
    value.matchAddress === matchAddress
  );
}

export class BattleStateStore {
  readonly #client;

  constructor(url: string, serviceRoleKey: string) {
    this.#client = createClient<Database>(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  static fromEnvironment() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in production.",
        );
      }
      return null;
    }
    return new BattleStateStore(url, key);
  }

  async load(matchAddress: string): Promise<BattleRoomState | null> {
    const { data, error } = await this.#client
      .from("battle_room_states")
      .select("state, expires_at")
      .eq("match_address", matchAddress)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data && isBattleRoomState(data.state, matchAddress)
      ? data.state
      : null;
  }

  async save(state: BattleRoomState) {
    const { error } = await this.#client.rpc("save_battle_room_state", {
      p_match_address: state.matchAddress,
      p_sequence: state.sequence,
      p_state: state as unknown as Json,
      p_expires_at: new Date(Date.now() + ROOM_TTL_MS).toISOString(),
    });
    if (error) throw error;
  }

  async saveReplay(input: {
    matchAddress: string;
    rulesVersion: number;
    balanceVersion: number;
    outcome: BattleOutcome;
    turnCount: number;
    resultHash: Uint8Array;
    events: ReadonlyArray<TurnEvent>;
  }) {
    const resultHash = Buffer.from(input.resultHash).toString("hex");
    const { error } = await this.#client.from("battle_replays").insert({
      match_address: input.matchAddress,
      rules_version: input.rulesVersion,
      balance_version: input.balanceVersion,
      outcome: input.outcome,
      turn_count: input.turnCount,
      result_hash: resultHash,
      events: structuredClone(input.events) as unknown as Json,
    });
    if (!error) return;
    if (error.code !== "23505") throw error;
    const { data: existing, error: readError } = await this.#client
      .from("battle_replays")
      .select("result_hash")
      .eq("match_address", input.matchAddress)
      .single();
    if (readError) throw readError;
    if (existing.result_hash !== resultHash) {
      throw new Error("The stored battle replay has a different result hash.");
    }
  }
}
