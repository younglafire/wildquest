import type { BattleRoomSnapshot } from "./battle-room";
import type { BattleAction, TurnEvent } from "./simultaneous-battle";

export type BattleClientMessage =
  | { type: "authenticate"; wallet: string; signature: string }
  | { type: "resume"; token: string }
  | { type: "watch" }
  | { type: "choose"; turn: number; action: BattleAction };

export type BattleServerMessage =
  | { type: "challenge"; nonce: string; message: string }
  | {
      type: "authenticated";
      side: "creator" | "opponent";
      token: string;
    }
  | { type: "snapshot"; snapshot: BattleRoomSnapshot }
  | { type: "turn"; event: TurnEvent }
  | { type: "error"; code: string; message: string };

export function battleAuthenticationMessage(
  matchAddress: string,
  wallet: string,
  nonce: string,
) {
  return `WildQuest battle\nmatch:${matchAddress}\nwallet:${wallet}\nnonce:${nonce}`;
}
