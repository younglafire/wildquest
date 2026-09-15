import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = new URL("./", import.meta.url).pathname;
const outputPath = `${outputDir}WildQuest-Mana-Balance-Backlog.xlsx`;

const roster = [
  [
    1001,
    "chihuahua",
    "Chihuahua",
    "Common",
    "Skirmisher",
    72,
    58,
    30,
    7,
    2,
    1,
    4,
    "Fearless Yap",
    3,
    "Deal 32 damage; if the foe Strikes, reduce incoming damage by 8.",
    "Cheap tempo fighter; fragile if read correctly.",
  ],
  [
    1002,
    "golden_retriever",
    "Golden Retriever",
    "Common",
    "Support",
    108,
    60,
    52,
    6,
    2,
    2,
    3,
    "Loyal Rescue",
    4,
    "Restore 24 HP to self; excess healing becomes Guard this turn.",
    "Reliable sustain without burst dominance.",
  ],
  [
    1003,
    "german_shepherd",
    "German Shepherd",
    "Common",
    "Balanced",
    102,
    68,
    56,
    6,
    2,
    2,
    3,
    "K9 Discipline",
    4,
    "Deal 38 damage and gain 10 Guard this turn.",
    "Strong generalist with an expensive hybrid ability.",
  ],
  [
    1004,
    "tabby_cat",
    "Tabby Cat",
    "Common",
    "Skirmisher",
    84,
    62,
    38,
    7,
    2,
    2,
    3,
    "Nine Lives",
    4,
    "Prevent the next knockout once, remaining at 1 HP; one use per battle.",
    "Evasive clutch specialist.",
  ],
  [
    1005,
    "persian_cat",
    "Persian Cat",
    "Common",
    "Guardian",
    104,
    52,
    64,
    6,
    3,
    1,
    3,
    "Silken Ward",
    3,
    "Gain Guard equal to DEF plus 14 this turn.",
    "Low pressure, efficient protection.",
  ],
  [
    1006,
    "siamese_cat",
    "Siamese Cat",
    "Common",
    "Striker",
    78,
    72,
    32,
    6,
    2,
    2,
    3,
    "Piercing Cry",
    4,
    "Deal 44 damage; ignores 30% of DEF.",
    "Fast-cycle glass cannon without a speed stat.",
  ],
  [
    1007,
    "rooster",
    "Rooster",
    "Common",
    "Balanced",
    94,
    65,
    46,
    6,
    2,
    2,
    3,
    "Dawn Challenge",
    3,
    "Deal 34 damage and make the foe's next Guard cost +1 mana.",
    "Disrupts defensive loops.",
  ],
  [
    1008,
    "hen",
    "Hen",
    "Common",
    "Guardian",
    112,
    54,
    60,
    6,
    3,
    1,
    3,
    "Brood Cover",
    3,
    "Gain Guard equal to DEF and restore 8 HP.",
    "Steady low-cost defender.",
  ],
  [
    1009,
    "bullfrog",
    "Bullfrog",
    "Uncommon",
    "Brawler",
    106,
    66,
    52,
    5,
    3,
    2,
    3,
    "Tongue Lash",
    4,
    "Deal 46 damage; +12 if the foe Recharges.",
    "Punishes greedy mana recovery.",
  ],
  [
    1010,
    "tree_frog",
    "Tree Frog",
    "Common",
    "Skirmisher",
    76,
    58,
    34,
    8,
    1,
    2,
    4,
    "Canopy Leap",
    3,
    "Evade 50% of incoming Strike damage and deal 20 damage.",
    "High-mana, low-body tactical scout.",
  ],
  [
    1011,
    "sea_snake",
    "Sea Snake",
    "Rare",
    "Striker",
    82,
    76,
    34,
    6,
    2,
    2,
    3,
    "Venom Tide",
    5,
    "Deal 38 damage plus 12 damage after each of the next 2 turns.",
    "High commitment damage-over-time finisher.",
  ],
  [
    1012,
    "african_grey_parrot",
    "African Grey Parrot",
    "Uncommon",
    "Controller",
    86,
    58,
    40,
    8,
    2,
    2,
    4,
    "Perfect Mimic",
    4,
    "Repeat the foe's previous paid action at one less mana, minimum 1.",
    "Flexible counterplay; requires action-history rules.",
  ],
  [
    1013,
    "macaw",
    "Macaw",
    "Uncommon",
    "Striker",
    90,
    74,
    38,
    6,
    2,
    2,
    3,
    "Crushing Beak",
    4,
    "Deal 50 damage; cannot be reduced below 18.",
    "Consistent heavy hit.",
  ],
  [
    1014,
    "toy_terrier",
    "Toy Terrier",
    "Common",
    "Skirmisher",
    70,
    60,
    28,
    8,
    1,
    2,
    4,
    "Ankle Rush",
    3,
    "Deal 28 damage; refund 1 mana if the foe did not Guard.",
    "Repeated cheap pressure.",
  ],
  [
    1015,
    "staffordshire_bull_terrier",
    "Staffordshire Bull Terrier",
    "Uncommon",
    "Brawler",
    110,
    72,
    48,
    5,
    3,
    2,
    3,
    "Tenacious Grip",
    4,
    "Deal 45 damage and reduce foe Recharge by 2 next turn.",
    "Durable pressure with economy denial.",
  ],
  [
    1016,
    "boston_terrier",
    "Boston Terrier",
    "Uncommon",
    "Balanced",
    92,
    64,
    46,
    7,
    2,
    2,
    3,
    "Smart Feint",
    3,
    "Deal 30 damage; if foe Guards, regain 2 mana.",
    "Reads defense and cycles quickly.",
  ],
  [
    1017,
    "labrador_retriever",
    "Labrador Retriever",
    "Common",
    "Support",
    112,
    62,
    54,
    6,
    2,
    2,
    3,
    "Fetch Supplies",
    4,
    "Restore 2 mana and 18 HP to self.",
    "Endurance and resource recovery.",
  ],
  [
    1018,
    "english_springer_spaniel",
    "English Springer Spaniel",
    "Uncommon",
    "Controller",
    92,
    64,
    42,
    7,
    2,
    2,
    4,
    "Flush Out",
    4,
    "Deal 36 damage; foe cannot gain bonus Recharge next turn.",
    "Controls high-recharge creatures.",
  ],
  [
    1019,
    "cocker_spaniel",
    "Cocker Spaniel",
    "Common",
    "Skirmisher",
    88,
    62,
    40,
    7,
    2,
    2,
    3,
    "Brush Runner",
    3,
    "Deal 30 damage and gain 12 Guard this turn.",
    "Small hybrid tempo play.",
  ],
  [
    1020,
    "bull_mastiff",
    "Bullmastiff",
    "Uncommon",
    "Guardian",
    132,
    60,
    74,
    5,
    3,
    1,
    2,
    "Body Block",
    4,
    "Gain Guard equal to DEF plus 20; reflect 10 damage if struck.",
    "Roster anchor with slow mana recovery.",
  ],
  [
    1021,
    "siberian_husky",
    "Siberian Husky",
    "Common",
    "Brawler",
    108,
    68,
    50,
    6,
    2,
    2,
    3,
    "Endurance Run",
    4,
    "Deal 38 damage and gain +1 Recharge for the next 2 Recharges.",
    "Ramps over longer fights.",
  ],
  [
    1022,
    "pug",
    "Pug",
    "Common",
    "Guardian",
    108,
    50,
    66,
    6,
    3,
    1,
    3,
    "Stubborn Stance",
    3,
    "Gain Guard equal to DEF; unused Guard restores up to 12 HP.",
    "Efficient survival, limited offense.",
  ],
  [
    1023,
    "samoyed",
    "Samoyed",
    "Common",
    "Support",
    110,
    60,
    56,
    6,
    2,
    2,
    3,
    "Warm Shelter",
    4,
    "Gain 42 Guard; next active ally enters with 12 Guard.",
    "Team-order utility.",
  ],
  [
    1024,
    "pembroke_corgi",
    "Pembroke Welsh Corgi",
    "Common",
    "Controller",
    88,
    63,
    42,
    7,
    2,
    2,
    3,
    "Herding Nip",
    3,
    "Deal 31 damage and increase foe's next Strike cost by 1.",
    "Mana-tax disruption.",
  ],
  [
    1025,
    "siamese_cat",
    "Siamese Cat",
    "Common",
    "Striker",
    80,
    73,
    32,
    6,
    2,
    2,
    3,
    "Focused Pounce",
    4,
    "Deal 48 damage; +10 when at full mana before paying.",
    "Rewards resource setup.",
  ],
  [
    1026,
    "egyptian_cat",
    "Domestic Shorthair",
    "Common",
    "Balanced",
    90,
    62,
    44,
    7,
    2,
    2,
    3,
    "Street Instinct",
    3,
    "Choose after reveal: deal 30 damage or gain 40 Guard.",
    "Flexible but moderate output.",
  ],
  [
    1027,
    "bee",
    "Honey Bee",
    "Common",
    "Striker",
    58,
    66,
    22,
    7,
    1,
    2,
    4,
    "Barbed Sting",
    4,
    "Deal 52 damage and take 12 recoil damage.",
    "Very fragile burst threat.",
  ],
  [
    1028,
    "ant",
    "Ant",
    "Common",
    "Energizer",
    56,
    58,
    20,
    8,
    1,
    1,
    5,
    "Colony Rush",
    3,
    "Deal 24 damage twice; each hit is reduced separately by Guard.",
    "Very low HP and DEF; cheapest actions and best Recharge.",
  ],
  [
    1029,
    "dragonfly",
    "Dragonfly",
    "Common",
    "Striker",
    68,
    72,
    26,
    7,
    2,
    2,
    4,
    "Aerial Ambush",
    4,
    "Deal 46 damage; +8 if foe Recharges.",
    "Fragile recharge hunter.",
  ],
  [
    1030,
    "damselfly",
    "Damselfly",
    "Common",
    "Skirmisher",
    64,
    58,
    28,
    8,
    1,
    2,
    4,
    "Slipstream",
    3,
    "Take 40% less Strike damage this turn; regain 1 mana if struck.",
    "Defense through timing.",
  ],
  [
    1031,
    "ringlet_butterfly",
    "Ringlet Butterfly",
    "Common",
    "Controller",
    66,
    52,
    30,
    8,
    2,
    1,
    4,
    "False Eyes",
    3,
    "Redirect 50% of incoming damage into mana loss, 1 mana per 10 damage.",
    "Trades resource for survival.",
  ],
  [
    1032,
    "cabbage_butterfly",
    "Cabbage Butterfly",
    "Common",
    "Support",
    68,
    50,
    32,
    8,
    2,
    1,
    4,
    "Garden Drift",
    3,
    "Gain 34 Guard and +1 mana if foe Recharges.",
    "Light body with economy reads.",
  ],
  [
    1033,
    "angora_rabbit",
    "Angora Rabbit",
    "Uncommon",
    "Guardian",
    100,
    50,
    68,
    6,
    3,
    1,
    3,
    "Wool Barrier",
    4,
    "Gain Guard equal to DEF plus 18; Guard persists at 50% next turn.",
    "Strong ability defense, modest damage.",
  ],
  [
    1034,
    "hamster",
    "Hamster",
    "Common",
    "Energizer",
    72,
    52,
    30,
    8,
    1,
    1,
    4,
    "Cheek Pouch",
    3,
    "Store this turn's Recharge; gain 6 mana total next turn, capped at max.",
    "Cheap actions and delayed battery.",
  ],
  [
    1035,
    "pig",
    "Domestic Pig",
    "Common",
    "Brawler",
    120,
    70,
    54,
    5,
    3,
    2,
    3,
    "Truffle Charge",
    4,
    "Deal 48 damage and gain 10 Guard this turn.",
    "High body and pressure; expensive basic Strike.",
  ],
  [
    1036,
    "water_buffalo",
    "Water Buffalo",
    "Common",
    "Guardian",
    140,
    62,
    78,
    5,
    3,
    1,
    2,
    "Ricefield Rampart",
    5,
    "Gain 100 Guard; take 8 recoil damage after resolution.",
    "Highest durability, slowest economy.",
  ],
  [
    1037,
    "grasshopper",
    "Grasshopper",
    "Common",
    "Skirmisher",
    62,
    62,
    24,
    8,
    1,
    2,
    5,
    "Spring Kick",
    3,
    "Deal 34 damage; if foe Guards, regain 2 mana.",
    "Extreme action frequency, fragile frame.",
  ],
  [
    1038,
    "cricket",
    "Cricket",
    "Common",
    "Support",
    70,
    54,
    34,
    8,
    2,
    1,
    4,
    "Night Chorus",
    4,
    "Gain 2 mana now and reduce incoming damage by 20 this turn.",
    "Resource support with light defense.",
  ],
  [
    1039,
    "praying_mantis",
    "Praying Mantis",
    "Common",
    "Striker",
    70,
    76,
    28,
    6,
    2,
    2,
    3,
    "Raptorial Slash",
    5,
    "Deal 62 damage; costs 1 less after Guarding last turn.",
    "Highest insect burst, setup rewarded.",
  ],
  [
    1040,
    "garden_lizard",
    "Garden Lizard",
    "Common",
    "Balanced",
    96,
    65,
    50,
    6,
    2,
    2,
    3,
    "Sunscale",
    4,
    "Restore 2 mana and gain 32 Guard this turn.",
    "Stable all-rounder with resource defense.",
  ],
];

const implementedStats = [
  [78, 58, 30, 7, 2, 1, 4, 3],
  [100, 56, 46, 6, 2, 2, 3, 4],
  [86, 58, 44, 6, 2, 2, 3, 4],
  [90, 62, 40, 7, 2, 2, 3, 4],
  [104, 52, 64, 6, 3, 1, 3, 3],
  [78, 72, 32, 6, 2, 2, 3, 4],
  [88, 60, 40, 6, 2, 2, 3, 3],
  [106, 50, 54, 6, 3, 1, 3, 3],
  [106, 66, 52, 5, 3, 2, 3, 4],
  [76, 58, 34, 8, 1, 2, 4, 3],
  [82, 76, 34, 6, 2, 2, 3, 5],
  [86, 58, 40, 8, 2, 2, 4, 4],
  [84, 68, 34, 6, 2, 2, 3, 4],
  [70, 60, 28, 8, 1, 2, 4, 3],
  [104, 68, 44, 5, 3, 2, 3, 4],
  [86, 60, 42, 7, 2, 2, 3, 3],
  [100, 56, 46, 6, 2, 2, 3, 4],
  [86, 60, 38, 7, 2, 2, 4, 4],
  [88, 62, 40, 7, 2, 2, 3, 3],
  [118, 54, 64, 5, 3, 1, 2, 4],
  [90, 58, 38, 6, 2, 2, 3, 4],
  [108, 50, 66, 6, 3, 1, 3, 3],
  [98, 54, 48, 6, 2, 2, 3, 4],
  [88, 63, 42, 7, 2, 2, 3, 3],
  [80, 73, 32, 6, 2, 2, 3, 4],
  [86, 58, 40, 7, 2, 2, 3, 3],
  [70, 70, 26, 7, 1, 2, 4, 4],
  [72, 62, 22, 8, 1, 1, 5, 3],
  [76, 74, 28, 7, 2, 2, 4, 4],
  [72, 62, 34, 8, 1, 2, 4, 3],
  [80, 58, 36, 8, 2, 1, 4, 3],
  [76, 56, 38, 8, 2, 1, 4, 3],
  [100, 50, 68, 6, 3, 1, 3, 4],
  [80, 58, 36, 8, 1, 1, 4, 3],
  [105, 62, 46, 5, 3, 2, 3, 4],
  [115, 52, 60, 5, 3, 1, 2, 5],
  [72, 66, 26, 8, 1, 2, 5, 3],
  [78, 58, 38, 8, 2, 1, 4, 4],
  [70, 76, 28, 6, 2, 2, 3, 5],
  [90, 60, 44, 6, 2, 2, 3, 4],
];
const implementedEffects = [
  "32 damage; reduce an incoming Strike by 8.",
  "Restore 24 HP.",
  "38 damage and 10 Guard this turn.",
  "Survive this turn's knockout at 1 HP.",
  "Gain DEF + 14 Guard this turn.",
  "Deal 44 direct damage.",
  "Deal 34 direct damage.",
  "Gain DEF Guard and restore 8 HP.",
  "46 damage, plus 12 against Recharge.",
  "Halve incoming Strike damage and deal 20.",
  "Deal 62 direct damage in one venom burst.",
  "Copy the enemy's action this turn.",
  "50 damage, with a minimum of 18 after mitigation.",
  "28 damage; refund 1 mana unless enemy Guards.",
  "Deal 45 damage and drain 1 enemy mana.",
  "30 damage; regain 2 mana against Guard.",
  "Restore 2 mana and 18 HP.",
  "Deal 36 damage and drain 1 mana on Recharge.",
  "30 damage and 12 Guard this turn.",
  "Gain DEF + 20 Guard and reflect 10 if struck.",
  "Deal 38 damage and restore 1 mana.",
  "Gain DEF Guard and restore 12 HP.",
  "Gain 42 Guard this turn.",
  "Deal 31 direct damage.",
  "48 damage, plus 10 when cast from full mana.",
  "Deal 30 damage and gain 40 Guard.",
  "52 damage and take 12 recoil damage.",
  "Deal 24 damage twice; Guard applies to each hit.",
  "46 damage, plus 8 against Recharge.",
  "Reduce Strike damage by 40%; regain 1 if struck.",
  "Halve incoming damage by spending up to 2 mana.",
  "Gain 34 Guard and 1 mana against Recharge.",
  "Gain DEF + 18 Guard this turn.",
  "Restore 6 mana, capped at maximum.",
  "48 damage and 10 Guard this turn.",
  "Gain 100 Guard, then take 8 recoil damage.",
  "34 damage; regain 2 mana against Guard.",
  "Gain 2 mana and reduce incoming damage by 20.",
  "Deal 62 direct damage.",
  "Restore 2 mana and gain 32 Guard this turn.",
];
roster.forEach((row, index) => {
  const [
    hp,
    attack,
    defense,
    maxMana,
    strikeCost,
    guardCost,
    recharge,
    abilityCost,
  ] = implementedStats[index];
  row.splice(
    5,
    9,
    hp,
    attack,
    defense,
    maxMana,
    strikeCost,
    guardCost,
    recharge,
    row[12],
    abilityCost,
  );
  row[14] = implementedEffects[index];
});

const currentStats = [
  [80, 55, 35, 95, 35],
  [115, 60, 55, 45, 25],
  [100, 72, 55, 55, 18],
  [90, 60, 40, 80, 30],
  [102, 55, 57, 35, 40],
  [75, 55, 35, 100, 35],
  [92, 62, 42, 72, 20],
  [100, 55, 48, 55, 28],
  [96, 58, 38, 68, 36],
  [72, 52, 32, 94, 42],
  [82, 66, 36, 78, 24],
  [86, 58, 40, 82, 32],
  [88, 68, 34, 86, 18],
  [78, 57, 34, 96, 30],
  [104, 70, 52, 58, 20],
  [88, 62, 44, 84, 22],
  [108, 64, 50, 60, 24],
  [94, 64, 42, 82, 22],
  [92, 62, 40, 86, 24],
  [110, 63, 58, 42, 30],
  [104, 64, 50, 70, 26],
  [92, 58, 46, 70, 42],
  [102, 62, 50, 56, 34],
  [86, 60, 42, 88, 30],
  [88, 62, 38, 90, 28],
  [90, 58, 42, 82, 34],
  [68, 58, 28, 96, 28],
  [64, 54, 30, 98, 32],
  [72, 60, 32, 100, 26],
  [66, 52, 30, 102, 38],
  [74, 54, 36, 92, 38],
  [76, 56, 38, 88, 36],
  [84, 54, 42, 78, 44],
  [76, 50, 34, 84, 40],
  [108, 64, 52, 48, 26],
  [104, 58, 56, 40, 32],
  [70, 58, 32, 104, 26],
  [74, 56, 34, 100, 30],
  [78, 70, 36, 94, 22],
  [98, 64, 48, 76, 32],
];

const backlog = [
  [
    "MB-01",
    "P0",
    "Rules",
    "Freeze mana combat contract",
    "Approve simultaneous resolution, 30-turn cap, timeout fallback, tie-break, stat ranges, per-creature costs, and ability timing.",
    "One signed rules version defines every action, timing window, cap, fallback, and tie-break; no open design questions remain.",
    "-",
    "Ready",
    "S",
  ],
  [
    "MB-02",
    "P0",
    "Program",
    "Create balance version 2 account layout",
    "Replace speed and starting shield in SpeciesConfig with max_mana, strike_cost, guard_cost, ability_cost, recharge_gain, ability_id; preserve deterministic u16/u8 bounds.",
    "Rust layout builds; IDL exposes exact new fields; account sizing and bounds tests pass.",
    "MB-01",
    "Backlog",
    "M",
  ],
  [
    "MB-03",
    "P0",
    "Program",
    "Add versioned SpeciesConfig initialization",
    "Initialize all 40 catalogue IDs using the approved v2 values without mutating v1 accounts.",
    "Every supported catalogue ID derives a v2 PDA and stores the workbook values exactly; unsupported IDs fail closed.",
    "MB-02",
    "Backlog",
    "M",
  ],
  [
    "MB-04",
    "P0",
    "Engine",
    "Remove speed initiative and permanent shield",
    "Resolve both choices from one pre-turn snapshot; Guard is temporary mitigation derived from DEF and ability effects.",
    "Double KO remains possible; no code path reads speed or starting shield; golden vectors cover all nine action pairs.",
    "MB-01, MB-02",
    "Backlog",
    "L",
  ],
  [
    "MB-05",
    "P0",
    "Engine",
    "Implement per-creature mana economy",
    "Start each fighter at max mana; apply its Strike, Guard, ability costs and Recharge gain with cap enforcement.",
    "Unaffordable choices are rejected before lock; timeout/invalid choice becomes Recharge; mana never leaves 0..max.",
    "MB-02, MB-04",
    "Backlog",
    "M",
  ],
  [
    "MB-06",
    "P0",
    "Engine",
    "Implement 40 deterministic abilities",
    "Add one ability ID and integer-only effect for every roster entry.",
    "Each ability matches the roster sheet, has timing and cap tests, and produces deterministic events on server and client.",
    "MB-03, MB-05",
    "Backlog",
    "XL",
  ],
  [
    "MB-07",
    "P0",
    "Protocol",
    "Add ability action and event payloads",
    "Extend strict client/server schemas for ability selection, mana changes, Guard, status effects, and ability results.",
    "Old or malformed payloads fail with explicit protocol errors; opponent choices remain private until resolution.",
    "MB-05, MB-06",
    "Backlog",
    "M",
  ],
  [
    "MB-08",
    "P0",
    "Security",
    "Bind settlement hash to rules and balance versions",
    "Include rules version, balance version, both choices, ability effects, and ordered events in the canonical result payload.",
    "Changing any bound field changes the hash; replay and mismatched-version tests fail closed.",
    "MB-03, MB-07",
    "Backlog",
    "M",
  ],
  [
    "MB-09",
    "P0",
    "Generated client",
    "Rebuild IDL and Codama client",
    "Build the program, inspect the IDL, then regenerate clients from source.",
    "Generated diffs contain the expected v2 fields and program ID only; no generated file is hand-edited.",
    "MB-02, MB-03",
    "Backlog",
    "S",
  ],
  [
    "MB-10",
    "P0",
    "Data",
    "Update catalogue role copy for mana combat",
    "Replace speed/shield descriptions and expand role constraint for Support, Controller, Brawler, and Energizer.",
    "A timestamped migration updates all affected copy and database types; catalogue remains descriptive, not battle-authoritative.",
    "MB-01",
    "Backlog",
    "M",
  ],
  [
    "MB-11",
    "P1",
    "UI",
    "Show four mobile battle actions",
    "Present Strike, Guard, Ability, Recharge as 48px+ controls with the active creature's live costs and disabled reasons.",
    "All actions fit supported phone widths; focus is visible; unaffordable actions cannot be submitted.",
    "MB-07",
    "Backlog",
    "M",
  ],
  [
    "MB-12",
    "P1",
    "UI",
    "Show mana and temporary Guard clearly",
    "Display current/max mana, projected cost, Recharge gain, and one-turn Guard without implying persistent shield.",
    "Values update only from authoritative snapshots; reconnect restores exact state.",
    "MB-07",
    "Backlog",
    "M",
  ],
  [
    "MB-13",
    "P1",
    "UI",
    "Explain abilities in one tap",
    "Add concise effect, timing, cost, and status text beside the Ability action.",
    "Every ability has readable mobile copy; no hover-only explanation; screen readers announce costs and disabled state.",
    "MB-06, MB-11",
    "Backlog",
    "M",
  ],
  [
    "MB-14",
    "P1",
    "UX",
    "Animate resolution without hiding state",
    "Animate both actions, damage, Guard, mana, and knockouts in a deterministic 1.25-second sequence.",
    "Reduced motion uses instant state plus fades; input stays locked until the next authoritative turn.",
    "MB-07, MB-11",
    "Backlog",
    "M",
  ],
  [
    "MB-15",
    "P1",
    "Simulation",
    "Replace speed-based balance simulator",
    "Model per-creature costs, Recharge, Guard, abilities, action policies, team order, and mirrored sides.",
    "Seeded runs reproduce exactly and export per-creature pick, win, action, mana-starvation, and turn metrics.",
    "MB-04, MB-06",
    "Backlog",
    "L",
  ],
  [
    "MB-16",
    "P1",
    "Simulation",
    "Run matchup and team Monte Carlo",
    "Run every 1v1 pairing plus at least 100,000 seeded 3v3 matches across several action policies.",
    "Median 3v3 length is 12-24 turns; draw rate <5%; side delta <1.5pp; no creature adjusted win rate outside 45-55% without documented niche tradeoff.",
    "MB-15",
    "Backlog",
    "L",
  ],
  [
    "MB-17",
    "P1",
    "Balance",
    "Tune outliers and economy loops",
    "Adjust stats/costs in one source, rerun simulations, and document changes.",
    "No infinite Guard/Recharge loop; no dominant action >60%; mana-starved turns <15%; all deviations link to evidence.",
    "MB-16",
    "Backlog",
    "M",
  ],
  [
    "MB-18",
    "P1",
    "Tests",
    "Add engine boundary and golden-vector tests",
    "Cover 0 mana, exact cost, cap, simultaneous KO, status expiry, overflow, timeout, and turn 30.",
    "Tests call production resolution logic and assert state plus emitted events.",
    "MB-04, MB-06",
    "Backlog",
    "L",
  ],
  [
    "MB-19",
    "P1",
    "Tests",
    "Add server privacy and reconnect tests",
    "Verify private choice storage, duplicate lock rejection, stale turn rejection, timeout Recharge, reconnect, and terminal errors.",
    "No choice leaks before resolution and terminal matches do not reconnect-loop.",
    "MB-07",
    "Backlog",
    "M",
  ],
  [
    "MB-20",
    "P1",
    "Tests",
    "Add UI interaction and accessibility tests",
    "Cover costs, disabled actions, ability details, keyboard focus, reduced motion, and authoritative state changes.",
    "Automated tests pass at 320px, 390px, and desktop spectator width.",
    "MB-11, MB-12, MB-13, MB-14",
    "Backlog",
    "M",
  ],
  [
    "MB-21",
    "P1",
    "Migration",
    "Define v1 match and creature compatibility",
    "Choose whether existing v1 creatures can enter only v1 matches or require an explicit v2 upgrade flow.",
    "Opening/joining a match rejects mixed versions with a user-facing reason; existing ownership is never lost.",
    "MB-03",
    "Backlog",
    "M",
  ],
  [
    "MB-22",
    "P1",
    "Operations",
    "Add v2 initialization and verification script",
    "Create an idempotent admin script that initializes and verifies all 40 v2 SpeciesConfig accounts.",
    "Dry run reports intended PDAs; live run requires explicit cluster confirmation; post-run reads compare every field.",
    "MB-03, MB-09",
    "Backlog",
    "M",
  ],
  [
    "MB-23",
    "P2",
    "Telemetry",
    "Record balance-safe aggregate events",
    "Measure anonymous action rates, turn length, mana starvation, ability use, disconnects, and outcomes by balance version.",
    "No wallet or photo data enters analytics; event schema and retention are documented.",
    "MB-07",
    "Backlog",
    "M",
  ],
  [
    "MB-24",
    "P2",
    "Release",
    "Gate v2 behind version activation",
    "Activate rules/balance version only after program, server, client, configs, and tests are deployed and verified.",
    "Preflight refuses partial activation; rollback returns matchmaking to v1 without changing existing accounts.",
    "MB-09, MB-17, MB-22",
    "Backlog",
    "M",
  ],
  [
    "MB-25",
    "P2",
    "Devnet",
    "Verify full v2 battle loop",
    "On Devnet, capture/own six creatures, open/join, play abilities, settle, and claim with both winner sides plus a draw.",
    "Confirmed signatures and account reads are recorded; failures identify the exact instruction or protocol boundary.",
    "MB-24",
    "Backlog",
    "L",
  ],
];

const locallyCompleted = new Set([
  "MB-01",
  "MB-02",
  "MB-03",
  "MB-04",
  "MB-05",
  "MB-06",
  "MB-07",
  "MB-08",
  "MB-09",
  "MB-10",
  "MB-11",
  "MB-12",
  "MB-13",
  "MB-14",
  "MB-15",
  "MB-17",
  "MB-18",
  "MB-19",
  "MB-21",
  "MB-22",
]);
backlog.forEach((row) => {
  if (locallyCompleted.has(row[0])) row[7] = "Done";
});

const rules = [
  [
    "Resolution",
    "Both players choose privately during a 5-second window; resolve from one pre-turn snapshot.",
    "Prevents speed/latency advantage and preserves simultaneous double KOs.",
  ],
  [
    "Starting mana",
    "Each active creature enters at its own Max Mana.",
    "Makes Max Mana immediately meaningful and prevents dead opening turns.",
  ],
  [
    "Strike",
    "Pay the creature's Strike Cost; raw damage = MAX(1, FLOOR(ATK*100/(100+target DEF))).",
    "Removes speed from damage and keeps DEF diminishing rather than absolute.",
  ],
  [
    "Guard",
    "Pay Guard Cost; block FLOOR(DEF*0.70)+12 damage for this turn only.",
    "DEF supports both passive mitigation and active defense without a persistent shield stat.",
  ],
  [
    "Ability",
    "Pay Ability Cost and apply the roster-defined deterministic effect.",
    "One authored identity hook per creature; no randomness in settlement-critical logic.",
  ],
  [
    "Recharge",
    "Gain the creature's Recharge Gain, capped at Max Mana; deals no damage and heals no HP.",
    "Creates a readable resource risk window.",
  ],
  [
    "Unaffordable action",
    "Reject before choice lock. A missing, invalid, or timed-out choice resolves as Recharge and counts as missed.",
    "Players get agency while timeout handling remains deterministic.",
  ],
  [
    "Knockout",
    "Apply both selected actions, then advance each knocked-out side to its next creature.",
    "Simultaneous knockout can advance both teams.",
  ],
  [
    "Turn cap",
    "30 turns. Compare remaining team HP percentage, then total mana; exact tie refunds the stake.",
    "Bounds server time and avoids raw-HP advantage for tank teams.",
  ],
  [
    "Forfeit",
    "Three consecutive missed turns loses the match; both reaching three on the same turn is a draw/refund.",
    "Handles abandonment consistently.",
  ],
  [
    "Versions",
    "Match locks rules_version and balance_version at creation; all six creatures must match.",
    "No mixed schema or stat interpretation inside one match.",
  ],
  [
    "Authority",
    "Realtime server resolves turns; Solana owns Creature/SpeciesConfig/Match state and stake settlement.",
    "No wallet signature inside the five-second turn loop.",
  ],
];

const tests = [
  [
    "VAL-01",
    "Roster completeness",
    "Exactly 40 unique catalogue IDs and species IDs; every proposed numeric field is an integer in its allowed range.",
    "Automated schema test",
  ],
  [
    "VAL-02",
    "Speed removal",
    "Repository search finds no runtime read of SpeciesConfig.speed after migration; generated artifacts match the new IDL.",
    "rg + build diff review",
  ],
  [
    "VAL-03",
    "Action matrix",
    "All 16 Strike/Guard/Ability/Recharge pairs resolve from one snapshot and reveal together.",
    "Golden vectors",
  ],
  [
    "VAL-04",
    "Damage boundaries",
    "Damage remains at least 1; Guard cannot create healing; integer arithmetic cannot overflow.",
    "Unit/property tests",
  ],
  [
    "VAL-05",
    "Mana boundaries",
    "Exact-cost actions succeed; below-cost actions fail before lock; Recharge caps at Max Mana.",
    "Unit tests",
  ],
  [
    "VAL-06",
    "Ability catalogue",
    "All 40 ability IDs have implementation, display copy, timing, cost, and deterministic tests.",
    "Schema + parameterized tests",
  ],
  [
    "VAL-07",
    "Ant identity",
    "Ant has HP 72, DEF 22, ATK 62, Mana 8, Strike 1, Guard 1, Recharge 5, Ability 3.",
    "Exact-value test",
  ],
  [
    "VAL-08",
    "No endless defense",
    "Guard/Recharge policies cannot create a non-terminating match; turn cap always settles/refunds.",
    "Adversarial simulation",
  ],
  [
    "VAL-09",
    "Match length",
    "Seeded 3v3 median is 12-24 turns and P90 <= 28 turns.",
    "100k+ Monte Carlo",
  ],
  [
    "VAL-10",
    "Fairness",
    "Mirrored side win-rate delta <1.5 percentage points; draw rate <5%.",
    "Mirrored simulation",
  ],
  [
    "VAL-11",
    "Roster spread",
    "Adjusted creature win rates target 45-55%; exceptions require a documented role/policy explanation.",
    "Per-creature report",
  ],
  [
    "VAL-12",
    "Action diversity",
    "No action exceeds 60% overall; Ability is used by every creature under at least one rational policy.",
    "Policy simulation",
  ],
  [
    "VAL-13",
    "Mana pressure",
    "Mana-starved forced Recharge turns remain below 15%; no positive infinite mana loop exists.",
    "Economy metrics",
  ],
  [
    "VAL-14",
    "Version safety",
    "Mixed v1/v2 creatures cannot enter one match; v1 ownership remains readable.",
    "Program + client integration",
  ],
  [
    "VAL-15",
    "Reconnect privacy",
    "Reconnect restores authoritative mana/status without exposing an opponent's locked action.",
    "WebSocket integration",
  ],
  [
    "VAL-16",
    "Mobile controls",
    "Four actions remain usable at 320px; touch targets are at least 48px; costs and disabled reasons are visible.",
    "Component/browser tests",
  ],
  [
    "VAL-17",
    "Reduced motion",
    "Resolution remains understandable with motion disabled and no information is animation-only.",
    "Component test",
  ],
  [
    "VAL-18",
    "Settlement binding",
    "Canonical result hash changes when an action, cost, effect, version, or event order changes.",
    "Hash fixture tests",
  ],
  [
    "VAL-19",
    "Devnet round trip",
    "Confirmed v2 configs are read, a full battle settles, and only the recorded winner claims.",
    "Explicit live Devnet run",
  ],
];

const wb = Workbook.create();
const summary = wb.worksheets.add("Summary");
const balance = wb.worksheets.add("Creature Balance");
const combat = wb.worksheets.add("Combat Rules");
const tasks = wb.worksheets.add("Backlog");
const validation = wb.worksheets.add("Validation");
const source = wb.worksheets.add("Source Snapshot");

for (const s of [summary, balance, combat, tasks, validation, source]) {
  s.showGridLines = false;
}
const navy = "#102A43",
  blue = "#1F5F8B",
  cyan = "#D9EEF7",
  gold = "#D6A84B",
  cream = "#FFF9EE",
  red = "#FCE3E3",
  gray = "#E8EDF2",
  ink = "#17212B",
  white = "#FFFFFF";
const title = (sheet, text, endCol) => {
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[text]];
  sheet.getRange("A2").format = {
    font: { bold: true, size: 16, color: navy },
    rowHeight: 26,
    verticalAlignment: "center",
  };
  sheet.getRange(`A3:${endCol}3`).format = {
    borders: { bottom: { style: "medium", color: gold } },
  };
};
const header = (range) => {
  range.format = {
    fill: navy,
    font: { bold: true, color: white },
    wrapText: true,
    verticalAlignment: "center",
    horizontalAlignment: "center",
    borders: {
      insideVertical: { style: "thin", color: white },
      bottom: { style: "medium", color: gold },
    },
  };
  range.format.rowHeight = 34;
};
const body = (range) => {
  range.format = {
    font: { color: ink, size: 10 },
    verticalAlignment: "center",
  };
};

title(summary, "WildQuest Mana Combat - Candidate Balance v2", "L");
summary.getRange("A5:B10").values = [
  ["Decision", "Candidate roster and implementation backlog"],
  ["Roster", 40],
  ["Core stats", "HP / ATK / DEF / Max Mana"],
  ["Actions", "Strike / Guard / Ability / Recharge"],
  [
    "Repository status",
    "Balance v2 implemented locally; generated client and migration are synchronized",
  ],
  [
    "Release gate",
    "Deploy, initialize v2 accounts, activate the version, and verify the Devnet loop",
  ],
];
summary.getRange("A5:A10").format = {
  fill: navy,
  font: { bold: true, color: white },
};
summary.getRange("B5:B10").format = {
  fill: cream,
  font: { color: ink },
  wrapText: true,
};
summary.getRange("D5:E10").values = [
  ["Balance KPI", "Value"],
  ["Avg HP", null],
  ["Avg ATK", null],
  ["Avg DEF", null],
  ["Avg Max Mana", null],
  ["Avg Recharge", null],
];
header(summary.getRange("D5:E5"));
summary.getRange("E6:E10").formulas = [
  ["=AVERAGE('Creature Balance'!H6:H45)"],
  ["=AVERAGE('Creature Balance'!I6:I45)"],
  ["=AVERAGE('Creature Balance'!J6:J45)"],
  ["=AVERAGE('Creature Balance'!K6:K45)"],
  ["=AVERAGE('Creature Balance'!N6:N45)"],
];
summary.getRange("D6:D10").format = {
  fill: gray,
  font: { bold: true, color: ink },
};
summary.getRange("E6:E10").format = {
  fill: white,
  font: { bold: true, color: blue },
  numberFormat: "0.0",
};
summary.getRange("A13:E20").values = [
  [
    "Recommended decision",
    "Why it works",
    "Hard constraint",
    "Owner",
    "Status",
  ],
  [
    "Replace Speed + base Shield with mana fields",
    "Simultaneous turns remove initiative; temporary Guard is easier to read.",
    "New balance version; no mutation of v1 accounts.",
    "Game design + program",
    "Proposed",
  ],
  [
    "Start at personal Max Mana",
    "Every creature can act on turn 1 and Max Mana affects opening options.",
    "Mana always remains within 0..Max.",
    "Engine",
    "Proposed",
  ],
  [
    "Use diminishing DEF damage formula",
    "Keeps DEF valuable without allowing immunity.",
    "Raw damage >= 1; integer-only settlement.",
    "Engine",
    "Proposed",
  ],
  [
    "Give each creature one deterministic ability",
    "Creature identity comes from timing and mana, not speed.",
    "No settlement-critical randomness.",
    "Design + engine",
    "Proposed",
  ],
  [
    "Use versioned rollout",
    "Existing creatures and matches retain interpretable stats.",
    "Match locks both rules and balance versions.",
    "Program + operations",
    "Required",
  ],
  [
    "Tune with mirrored simulations",
    "Candidate numbers are hypotheses until tested.",
    "Meet all Validation thresholds before activation.",
    "Balance",
    "Required",
  ],
  [
    "Keep catalogue descriptive",
    "Solana SpeciesConfig remains authoritative for battle values.",
    "Supabase never awards or overrides battle stats.",
    "Data",
    "Required",
  ],
];
header(summary.getRange("A13:E13"));
body(summary.getRange("A14:E20"));
summary.getRange("A14:E20").format.wrapText = true;

// Role chart source and chart.
const roles = [
  "Balanced",
  "Brawler",
  "Controller",
  "Energizer",
  "Guardian",
  "Skirmisher",
  "Striker",
  "Support",
];
summary.getRange("G5:J13").values = [
  ["Role", "Avg HP", "Avg ATK", "Avg DEF"],
  ...roles.map((r) => [r, null, null, null]),
];
header(summary.getRange("G5:J5"));
for (let i = 0; i < roles.length; i++) {
  const row = 6 + i;
  summary.getRange(`H${row}`).formulas = [
    [
      `=AVERAGEIF('Creature Balance'!$E$6:$E$45,G${row},'Creature Balance'!$H$6:$H$45)`,
    ],
  ];
  summary.getRange(`I${row}`).formulas = [
    [
      `=AVERAGEIF('Creature Balance'!$E$6:$E$45,G${row},'Creature Balance'!$I$6:$I$45)`,
    ],
  ];
  summary.getRange(`J${row}`).formulas = [
    [
      `=AVERAGEIF('Creature Balance'!$E$6:$E$45,G${row},'Creature Balance'!$J$6:$J$45)`,
    ],
  ];
}
const ch = summary.charts.add("bar", summary.getRange("G5:J13"));
ch.title = "Average proposed stats by role";
ch.legend = { position: "top" };
ch.setPosition("G15", "L30");
summary.getRange("A23:E27").values = [
  ["Reading the workbook", "Use"],
  [
    "Creature Balance",
    "Exact candidate numbers, costs, abilities, and formula-driven diagnostics.",
  ],
  [
    "Combat Rules",
    "Frozen rules that make the proposed numbers interpretable.",
  ],
  [
    "Backlog",
    "Sequenced implementation work with dependencies and acceptance criteria.",
  ],
  [
    "Validation",
    "Release thresholds; candidate balance is not production-approved until these pass.",
  ],
];
header(summary.getRange("A23:B23"));
summary.getRange("A24:B27").format.wrapText = true;

title(balance, "Creature Balance - 40-Creature Candidate Roster", "V");
balance.getRange("A4:V4").values = [
  [
    "Catalogue ID",
    "Species ID",
    "Creature",
    "Rarity",
    "Role",
    "Current HP",
    "Current Speed",
    "Proposed HP",
    "ATK",
    "DEF",
    "Max Mana",
    "Strike Cost",
    "Guard Cost",
    "Recharge",
    "Ability",
    "Ability Cost",
    "Ability Effect",
    "Play Pattern",
    "Effective HP",
    "Basic Damage vs 50 DEF",
    "Full-Mana Strikes",
    "Review Flag",
  ],
];
header(balance.getRange("A4:V4"));
const rows = roster.map((r, i) => [
  r[0],
  r[1],
  r[2],
  r[3],
  r[4],
  currentStats[i][0],
  currentStats[i][3],
  r[5],
  r[6],
  r[7],
  r[8],
  r[9],
  r[10],
  r[11],
  r[12],
  r[13],
  r[14],
  r[15],
  null,
  null,
  null,
  null,
]);
balance.getRange("A6:V45").values = rows;
for (let row = 6; row <= 45; row++) {
  balance.getRange(`S${row}`).formulas = [
    [`=ROUND(H${row}*(100+J${row})/100,1)`],
  ];
  balance.getRange(`T${row}`).formulas = [
    [`=MAX(1,FLOOR(I${row}*100/(100+50),1))`],
  ];
  balance.getRange(`U${row}`).formulas = [[`=FLOOR(K${row}/L${row},1)`]];
  balance.getRange(`V${row}`).formulas = [
    [
      `=IF(OR(H${row}<50,H${row}>150,I${row}<45,I${row}>80,J${row}<20,J${row}>80,K${row}<5,K${row}>8,L${row}<1,L${row}>3,M${row}<1,M${row}>2,N${row}<2,N${row}>5,P${row}<3,P${row}>5),"CHECK","OK")`,
    ],
  ];
}
body(balance.getRange("A6:V45"));
balance.getRange("A6:V45").format.rowHeight = 42;
balance.getRange("Q6:R45").format.wrapText = true;
balance.getRange("F6:G45").format = {
  fill: gray,
  font: { color: "#586575" },
  numberFormat: "0",
};
balance.getRange("H6:P45").format = {
  fill: cream,
  font: { color: ink },
  numberFormat: "0",
};
balance.getRange("S6:U45").format = {
  fill: cyan,
  font: { color: ink },
  numberFormat: "0.0",
};
balance.getRange("V6:V45").conditionalFormats.add("containsText", {
  text: "CHECK",
  format: { fill: red, font: { bold: true, color: "#9C1C1C" } },
});
balance.freezePanes.freezeRows(4);
balance.freezePanes.freezeColumns(3);
const balanceTable = balance.tables.add("A4:V45", true, "CreatureBalanceTable");
balanceTable.style = "TableStyleMedium2";

title(combat, "Combat Rules - Mana Model v2", "C");
combat.getRange("A5:C5").values = [["Rule", "Decision", "Reason / Constraint"]];
header(combat.getRange("A5:C5"));
combat.getRange(`A6:C${5 + rules.length}`).values = rules;
body(combat.getRange(`A6:C${5 + rules.length}`));
combat.getRange(`A6:C${5 + rules.length}`).format.wrapText = true;
combat.getRange("A20:C25").values = [
  ["Parameter", "Allowed range", "Candidate roster"],
  ["HP", "50-150", "56-140"],
  ["ATK", "45-80", "50-76"],
  ["DEF", "20-80", "20-78"],
  ["Max Mana", "5-8", "5-8"],
  ["Recharge Gain", "2-5", "2-5"],
];
header(combat.getRange("A20:C20"));
combat.getRange("A28:C33").values = [
  ["Timing order", "Step", "Detail"],
  [1, "Lock", "Validate affordability and store choice privately."],
  [2, "Reveal", "Reveal both choices only after both lock or deadline."],
  [
    3,
    "Spend/Gain",
    "Apply mana costs or Recharge gain from the pre-turn snapshot.",
  ],
  [
    4,
    "Resolve",
    "Apply Guard, abilities, and Strike effects according to explicit ability timing.",
  ],
  [
    5,
    "Finalize",
    "Apply simultaneous knockouts, status expiry, turn advance, cap, or outcome.",
  ],
];
header(combat.getRange("A28:C28"));
combat.getRange("A29:C33").format.wrapText = true;

title(tasks, "Implementation Backlog - Mana Combat v2", "I");
tasks.getRange("A4:I4").values = [
  [
    "ID",
    "Priority",
    "Area",
    "Task",
    "Scope",
    "Acceptance Criteria",
    "Depends On",
    "Status",
    "Size",
  ],
];
header(tasks.getRange("A4:I4"));
tasks.getRange(`A5:I${4 + backlog.length}`).values = backlog;
body(tasks.getRange(`A5:I${4 + backlog.length}`));
tasks.getRange(`D5:H${4 + backlog.length}`).format.wrapText = true;
tasks
  .getRange(`B5:B${4 + backlog.length}`)
  .conditionalFormats.add("containsText", {
    text: "P0",
    format: { fill: red, font: { bold: true, color: "#9C1C1C" } },
  });
tasks
  .getRange(`B5:B${4 + backlog.length}`)
  .conditionalFormats.add("containsText", {
    text: "P1",
    format: { fill: "#FFF0C9", font: { bold: true, color: "#7A5200" } },
  });
tasks.getRange(`H5:H${4 + backlog.length}`).dataValidation = {
  rule: {
    type: "list",
    values: ["Backlog", "Ready", "In Progress", "Blocked", "Done"],
  },
};
tasks.freezePanes.freezeRows(4);
tasks.freezePanes.freezeColumns(1);
const backlogTable = tasks.tables.add(
  `A4:I${4 + backlog.length}`,
  true,
  "ManaBacklogTable",
);
backlogTable.style = "TableStyleMedium2";

title(validation, "Validation and Release Gates", "D");
validation.getRange("A4:D4").values = [
  ["ID", "Gate", "Pass condition", "Method"],
];
header(validation.getRange("A4:D4"));
validation.getRange(`A5:D${4 + tests.length}`).values = tests;
body(validation.getRange(`A5:D${4 + tests.length}`));
validation.getRange(`B5:D${4 + tests.length}`).format.wrapText = true;
validation.tables.add(
  `A4:D${4 + tests.length}`,
  true,
  "ValidationTable",
).style = "TableStyleMedium2";
validation.getRange("A27:D31").values = [
  ["Release decision", "Formula / owner", "Current result", "Meaning"],
  [
    "Roster range checks",
    "Creature Balance review flags",
    null,
    "All must be OK",
  ],
  [
    "Backlog P0 remaining",
    "Backlog priority/status",
    null,
    "Must be 0 before activation",
  ],
  [
    "Validation evidence",
    "QA / Balance",
    "Passed locally",
    "Devnet verification remains",
  ],
  [
    "Candidate activation",
    "Release owner",
    null,
    "Blocked until every gate passes",
  ],
];
header(validation.getRange("A27:D27"));
validation.getRange("C28").formulas = [
  ["=COUNTIF('Creature Balance'!V6:V45,\"CHECK\")"],
];
validation.getRange("C29").formulas = [
  ['=COUNTIFS(Backlog!B5:B29,"P0",Backlog!H5:H29,"<>Done")'],
];
validation.getRange("C31").formulas = [
  ['=IF(AND(C28=0,C29=0,C30="Passed"),"READY","BLOCKED")'],
];
validation.getRange("C28:C31").format = {
  fill: cream,
  font: { bold: true, color: ink },
};
validation.getRange("C31").conditionalFormats.add("containsText", {
  text: "BLOCKED",
  format: { fill: red, font: { bold: true, color: "#9C1C1C" } },
});

title(source, "Repository Source Snapshot", "F");
source.getRange("A5:F5").values = [
  [
    "Source",
    "Repository path",
    "Observed truth",
    "Used for",
    "As of",
    "Status",
  ],
];
header(source.getRange("A5:F5"));
source.getRange("A6:F13").values = [
  [
    "Onchain constants",
    "programs/wildquest/src/constants.rs",
    "40 IDs; v2 tuple stores HP/ATK/DEF/Mana/action economy/ability",
    "Implemented balance and exact roster count",
    "2026-09-15",
    "Implemented",
  ],
  [
    "Onchain account",
    "programs/wildquest/src/state.rs",
    "SpeciesConfig contains mana and action fields; speed and shield are removed",
    "Account layout",
    "2026-09-15",
    "Implemented",
  ],
  [
    "Species initialization",
    "programs/wildquest/src/instructions/initialize_species_config.rs",
    "Initializer writes all v2 stats for the 40 supported IDs",
    "Versioned initialization",
    "2026-09-15",
    "Implemented",
  ],
  [
    "Realtime rules",
    "app/lib/simultaneous-battle.ts",
    "Per-creature mana, four actions, temporary Guard, and 40 deterministic abilities",
    "Authoritative gameplay",
    "2026-09-15",
    "Implemented",
  ],
  [
    "Realtime authority",
    "app/lib/battle-room.ts",
    "Private choices, timeout resolution, missed-turn forfeit, settlement retry",
    "Preserved lifecycle rules",
    "2026-09-15",
    "Read",
  ],
  [
    "Catalogue",
    "supabase/migrations/20260910120000_expand_playable_species.sql",
    "Species names, rarity, descriptive battle roles",
    "Names and rarity",
    "2026-09-15",
    "Read",
  ],
  [
    "Roster extension",
    "supabase/migrations/20260911070000_add_vietnam_insects_and_lizard.sql",
    "Adds IDs 1037-1040",
    "Names and rarity",
    "2026-09-15",
    "Read",
  ],
  [
    "Prior approved proposal",
    "outputs/simultaneous-combat-backlog-20260911/WildQuest-Simultaneous-Turn-Combat-Backlog.xlsx",
    "5-second simultaneous prototype and acceptance boundaries",
    "Continuity for rules",
    "2026-09-15",
    "Historical proposal",
  ],
];
body(source.getRange("A6:F13"));
source.getRange("A6:F13").format.wrapText = true;
source.getRange("A16:F19").values = [
  [
    "Interpretation",
    "Decision",
    "Why",
    "Implementation implication",
    "Risk",
    "Resolution",
  ],
  [
    "Database wording",
    "Battle stats are authoritative in Solana SpeciesConfig, while Supabase stores catalogue role/copy.",
    "Matches repository boundaries.",
    "Do not add authoritative mana stats only to Supabase.",
    "Two sources drift",
    "Generate/verify v2 configs from one canonical table.",
  ],
  [
    "Version migration",
    "Existing v1 ownership remains intact and can be upgraded with an owner signature.",
    "Creature PDAs do not change between balance versions.",
    "Activate balance v2 only after all SpeciesConfig accounts exist.",
    "Partial rollout",
    "Program rejects mismatched creatures and matches.",
  ],
  [
    "Balance confidence",
    "A deterministic 20,000-match run produced 21 median turns and 44.8%-54.9% creature win rates.",
    "One scripted policy cannot prove a live metagame.",
    "Keep telemetry and Devnet validation before production activation.",
    "Policy bias",
    "Tune again from live aggregate evidence.",
  ],
];
header(source.getRange("A16:F16"));
source.getRange("A17:F19").format.wrapText = true;

// Widths and row fitting.
const widths = (sheet, map) => {
  for (const [col, w] of Object.entries(map))
    sheet.getRange(`${col}:${col}`).format.columnWidth = w;
};
widths(summary, {
  A: 24,
  B: 45,
  C: 42,
  D: 24,
  E: 18,
  F: 3,
  G: 18,
  H: 13,
  I: 13,
  J: 13,
  K: 3,
  L: 3,
});
widths(balance, {
  A: 12,
  B: 24,
  C: 24,
  D: 12,
  E: 14,
  F: 11,
  G: 13,
  H: 12,
  I: 9,
  J: 9,
  K: 12,
  L: 12,
  M: 12,
  N: 11,
  O: 22,
  P: 12,
  Q: 58,
  R: 42,
  S: 14,
  T: 19,
  U: 17,
  V: 13,
});
widths(combat, { A: 24, B: 72, C: 62 });
widths(tasks, { A: 10, B: 10, C: 18, D: 34, E: 58, F: 72, G: 24, H: 16, I: 9 });
widths(validation, { A: 18, B: 30, C: 82, D: 28 });
widths(source, { A: 24, B: 60, C: 68, D: 42, E: 14, F: 20 });
combat.getRange("A6:C17").format.rowHeight = 48;
tasks.getRange("A5:I29").format.rowHeight = 64;
validation.getRange("A5:D23").format.rowHeight = 50;
source.getRange("A6:F19").format.rowHeight = 52;
summary.getRange("B9:B10").format.font = { bold: true, color: "#1F5F8B" };
balance.tabColor = blue;
summary.tabColor = navy;
combat.tabColor = gold;
tasks.tabColor = "#C75146";
validation.tabColor = "#4C8C4A";
source.tabColor = "#718096";

wb.recalculate();
const checks = [];
checks.push(
  (
    await wb.inspect({
      kind: "table",
      range: "Summary!A1:L27",
      include: "values,formulas",
      tableMaxRows: 30,
      tableMaxCols: 12,
      maxChars: 12000,
    })
  ).ndjson,
);
checks.push(
  (
    await wb.inspect({
      kind: "table",
      range: "Creature Balance!A4:V45",
      include: "values,formulas",
      tableMaxRows: 8,
      tableMaxCols: 22,
      maxChars: 12000,
    })
  ).ndjson,
);
checks.push(
  (
    await wb.inspect({
      kind: "table",
      range: "Validation!A27:D31",
      include: "values,formulas",
      tableMaxRows: 10,
      tableMaxCols: 6,
      maxChars: 6000,
    })
  ).ndjson,
);
checks.push(
  (
    await wb.inspect({
      kind: "match",
      searchTerm:
        "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
      options: { useRegex: true, maxResults: 300 },
      summary: "final formula error scan",
    })
  ).ndjson,
);
await fs.writeFile(`${outputDir}inspection.ndjson`, checks.join("\n"));
for (const s of [summary, balance, combat, tasks, validation, source]) {
  const preview = await wb.render({
    sheetName: s.name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    `${outputDir}preview-${s.name.replaceAll(" ", "-")}.png`,
    new Uint8Array(await preview.arrayBuffer()),
  );
}
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(outputPath);
