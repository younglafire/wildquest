export type BattleStats = {
  hp: number;
  attack: number;
  defense: number;
  maxMana: number;
  strikeCost: number;
  guardCost: number;
  rechargeGain: number;
  abilityId: number;
  abilityCost: number;
};

export type BattleSide = "creator" | "opponent";
export type BattleOutcome = BattleSide | "tie";
