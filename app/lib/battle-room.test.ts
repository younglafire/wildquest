import { describe, expect, it, vi } from "vitest";
import { BattleRoom } from "./battle-room";
import type { BattleStats } from "./battle-engine";

const stats: BattleStats = {
  hp: 100,
  attack: 60,
  defense: 50,
  speed: 50,
  shield: 25,
};
const team = [stats, stats, stats];

describe("BattleRoom", () => {
  it("starts one server deadline only after both players connect", () => {
    const room = new BattleRoom({
      matchAddress: "match",
      creatorStats: team,
      opponentStats: team,
    });
    expect(room.connect("creator", 1_000).phase).toBe("waiting");
    const snapshot = room.connect("opponent", 1_200);
    expect(snapshot.phase).toBe("choosing");
    expect(snapshot.deadline).toBe(6_200);
  });

  it("keeps the first choice hidden and resolves after the second", () => {
    const room = new BattleRoom({
      matchAddress: "match",
      creatorStats: team,
      opponentStats: team,
    });
    room.connect("creator", 0);
    room.connect("opponent", 0);
    const locked = room.submit("creator", "strike", 1, 1_000);
    expect(locked.creatorLocked).toBe(true);
    expect(locked.events).toHaveLength(0);
    expect(() => room.submit("creator", "guard", 1, 1_050)).toThrow(
      "already locked",
    );
    const resolved = room.submit("opponent", "recharge", 1, 1_100);
    expect(resolved.phase).toBe("resolving");
    expect(resolved.events[0]?.creatorAction).toBe("strike");
  });

  it("uses Recharge at the deadline and preserves the server clock", () => {
    const room = new BattleRoom({
      matchAddress: "match",
      creatorStats: team,
      opponentStats: team,
    });
    room.connect("creator", 0);
    room.connect("opponent", 0);
    room.submit("creator", "strike", 1, 1_000);
    const resolved = room.tick(5_000);
    expect(resolved.events[0]?.opponentAction).toBe("recharge");
    expect(resolved.opponentMissedTurns).toBe(1);
    expect(resolved.turnStartsAt).toBe(6_250);
  });

  it("forfeits after three consecutive missed turns", () => {
    const finish = vi.fn();
    const room = new BattleRoom(
      { matchAddress: "match", creatorStats: team, opponentStats: team },
      finish,
    );
    room.connect("creator", 0);
    room.connect("opponent", 0);
    room.submit("opponent", "guard", 1, 100);
    room.tick(5_000);
    room.tick(6_250);
    room.submit("opponent", "guard", 2, 6_300);
    room.tick(11_250);
    room.tick(12_500);
    room.submit("opponent", "guard", 3, 12_600);
    const result = room.tick(17_500);
    expect(result.phase).toBe("finished");
    expect(result.battle.outcome).toBe("opponent");
    expect(finish).toHaveBeenCalledOnce();
  });

  it("does not restart a deadline after reconnect", () => {
    const room = new BattleRoom({
      matchAddress: "match",
      creatorStats: team,
      opponentStats: team,
    });
    room.connect("creator", 0);
    room.connect("opponent", 0);
    room.disconnect("creator");
    expect(room.connect("creator", 4_000).deadline).toBe(5_000);
  });

  it("retries a failed settlement without resolving the battle twice", async () => {
    const finish = vi
      .fn()
      .mockRejectedValueOnce(new Error("RPC unavailable"))
      .mockResolvedValueOnce(undefined);
    const room = new BattleRoom(
      { matchAddress: "match", creatorStats: team, opponentStats: team },
      finish,
    );
    room.connect("creator", 0);
    room.connect("opponent", 0);
    for (let turn = 1; turn <= 3; turn += 1) {
      room.submit("opponent", "guard", turn, (turn - 1) * 6_250 + 100);
      room.tick((turn - 1) * 6_250 + 5_000);
      if (turn < 3) room.tick(turn * 6_250);
    }
    await Promise.resolve();
    expect(room.snapshot().settlementStatus).toBe("failed");
    room.tick(20_500);
    await Promise.resolve();
    expect(finish).toHaveBeenCalledTimes(2);
    expect(room.snapshot().settlementStatus).toBe("confirmed");
  });
});
