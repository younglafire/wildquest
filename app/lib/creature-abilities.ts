export type CreatureAbility = {
  name: string;
  summary: string;
};

const ABILITIES: Record<number, CreatureAbility> = {
  1: {
    name: "Fearless Yap",
    summary: "32 damage; reduce an incoming Strike by 8.",
  },
  2: { name: "Loyal Rescue", summary: "Restore 24 HP." },
  3: { name: "K9 Discipline", summary: "38 damage and 10 Guard this turn." },
  4: { name: "Nine Lives", summary: "Survive this turn's knockout at 1 HP." },
  5: { name: "Silken Ward", summary: "Gain DEF + 14 Guard this turn." },
  6: { name: "Piercing Cry", summary: "Deal 44 direct damage." },
  7: { name: "Dawn Challenge", summary: "Deal 34 direct damage." },
  8: { name: "Brood Cover", summary: "Gain DEF Guard and restore 8 HP." },
  9: { name: "Tongue Lash", summary: "46 damage, plus 12 against Recharge." },
  10: {
    name: "Canopy Leap",
    summary: "Halve incoming Strike damage and deal 20.",
  },
  11: {
    name: "Venom Tide",
    summary: "Deal 62 direct damage in one venom burst.",
  },
  12: { name: "Perfect Mimic", summary: "Copy the enemy's action this turn." },
  13: {
    name: "Crushing Beak",
    summary: "50 damage, with a minimum of 18 after mitigation.",
  },
  14: {
    name: "Ankle Rush",
    summary: "28 damage; refund 1 mana unless enemy Guards.",
  },
  15: {
    name: "Tenacious Grip",
    summary: "Deal 45 damage and drain 1 enemy mana.",
  },
  16: {
    name: "Smart Feint",
    summary: "30 damage; regain 2 mana against Guard.",
  },
  17: { name: "Fetch Supplies", summary: "Restore 2 mana and 18 HP." },
  18: {
    name: "Flush Out",
    summary: "Deal 36 damage and drain 1 mana on Recharge.",
  },
  19: { name: "Brush Runner", summary: "30 damage and 12 Guard this turn." },
  20: {
    name: "Body Block",
    summary: "Gain DEF + 20 Guard and reflect 10 if struck.",
  },
  21: { name: "Endurance Run", summary: "Deal 38 damage and restore 1 mana." },
  22: { name: "Stubborn Stance", summary: "Gain DEF Guard and restore 12 HP." },
  23: { name: "Warm Shelter", summary: "Gain 42 Guard this turn." },
  24: { name: "Herding Nip", summary: "Deal 31 direct damage." },
  25: {
    name: "Focused Pounce",
    summary: "48 damage, plus 10 when cast from full mana.",
  },
  26: { name: "Street Instinct", summary: "Deal 30 damage and gain 40 Guard." },
  27: { name: "Barbed Sting", summary: "52 damage and take 12 recoil damage." },
  28: {
    name: "Colony Rush",
    summary: "Deal 24 damage twice; Guard applies to each hit.",
  },
  29: { name: "Aerial Ambush", summary: "46 damage, plus 8 against Recharge." },
  30: {
    name: "Slipstream",
    summary: "Reduce Strike damage by 40%; regain 1 if struck.",
  },
  31: {
    name: "False Eyes",
    summary: "Halve incoming damage by spending up to 2 mana.",
  },
  32: {
    name: "Garden Drift",
    summary: "Gain 34 Guard and 1 mana against Recharge.",
  },
  33: { name: "Wool Barrier", summary: "Gain DEF + 18 Guard this turn." },
  34: { name: "Cheek Pouch", summary: "Restore 6 mana, capped at maximum." },
  35: { name: "Truffle Charge", summary: "48 damage and 10 Guard this turn." },
  36: {
    name: "Ricefield Rampart",
    summary: "Gain 100 Guard, then take 8 recoil damage.",
  },
  37: {
    name: "Spring Kick",
    summary: "34 damage; regain 2 mana against Guard.",
  },
  38: {
    name: "Night Chorus",
    summary: "Gain 2 mana and reduce incoming damage by 20.",
  },
  39: { name: "Raptorial Slash", summary: "Deal 62 direct damage." },
  40: {
    name: "Sunscale",
    summary: "Restore 2 mana and gain 32 Guard this turn.",
  },
};

export function creatureAbility(abilityId: number): CreatureAbility {
  const ability = ABILITIES[abilityId];
  if (!ability) throw new Error(`Unsupported creature ability ${abilityId}.`);
  return ability;
}
