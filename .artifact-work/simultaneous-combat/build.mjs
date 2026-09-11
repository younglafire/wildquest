import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/doanbao/code/solana/wildquest/outputs/simultaneous-combat-backlog-20260911";
const outputPath = `${outputDir}/WildQuest-Simultaneous-Turn-Combat-Backlog.xlsx`;
const previewDir = `${outputDir}/previews`;

const wb = Workbook.create();
const backlog = wb.worksheets.add("Backlog");
const rules = wb.worksheets.add("Combat Rules");
const ux = wb.worksheets.add("UX and Sync");
const tests = wb.worksheets.add("Acceptance Tests");

const FONT = "Arial";
const COLORS = {
  ink: "#172033",
  muted: "#667085",
  green: "#166534",
  green2: "#22C55E",
  greenLight: "#DCFCE7",
  blue: "#1D4ED8",
  blueLight: "#DBEAFE",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  red: "#B42318",
  redLight: "#FEE4E2",
  gray: "#F2F4F7",
  border: "#D0D5DD",
  white: "#FFFFFF",
};

for (const sheet of [backlog, rules, ux, tests]) {
  sheet.showGridLines = false;
  sheet.getRange("A1:Z250").format.font = { name: FONT, size: 10, color: COLORS.ink };
}
backlog.tabColor = COLORS.green;
rules.tabColor = COLORS.green2;
ux.tabColor = COLORS.blue;
tests.tabColor = COLORS.amber;

function title(sheet, name, context, endColumn) {
  sheet.getRange(`A2:${endColumn}2`).merge();
  sheet.getRange("A2").values = [[name]];
  sheet.getRange("A2").format.font = { name: FONT, size: 16, bold: true, color: COLORS.ink };
  sheet.getRange(`A3:${endColumn}3`).merge();
  sheet.getRange("A3").values = [[context]];
  sheet.getRange("A3").format.font = { name: FONT, size: 10, italic: true, color: COLORS.muted };
  sheet.getRange(`A4:${endColumn}4`).format.borders = {
    bottom: { style: "thin", color: COLORS.border },
  };
}

function sectionHeader(range) {
  range.format = {
    fill: COLORS.green,
    font: { name: FONT, size: 10, bold: true, color: COLORS.white },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.green },
  };
}

function body(range, wrap = true) {
  range.format = {
    font: { name: FONT, size: 10, color: COLORS.ink },
    verticalAlignment: "top",
    wrapText: wrap,
    borders: {
      insideHorizontal: { style: "thin", color: "#E4E7EC" },
      bottom: { style: "thin", color: "#E4E7EC" },
    },
  };
}

title(
  backlog,
  "WildQuest simultaneous-turn combat backlog",
  "Five-day vertical slice first. The live battle server owns turn state; Solana owns escrow and settlement.",
  "J",
);

backlog.getRange("A6:B9").values = [
  ["Slice tasks", null],
  ["Slice hours", null],
  ["MUST tasks", null],
  ["Done tasks", null],
];
backlog.getRange("A6:A9").format = {
  fill: COLORS.gray,
  font: { name: FONT, size: 10, bold: true, color: COLORS.ink },
};
backlog.getRange("B6").formulas = [["=COUNTIFS(J12:J60,\"Yes\")"]];
backlog.getRange("B7").formulas = [["=SUMIFS(F12:F60,J12:J60,\"Yes\")"]];
backlog.getRange("B8").formulas = [["=COUNTIFS(H12:H60,\"MUST\")"]];
backlog.getRange("B9").formulas = [["=COUNTIFS(I12:I60,\"Done\")"]];
backlog.getRange("B6:B9").format = {
  fill: COLORS.greenLight,
  font: { name: FONT, size: 12, bold: true, color: COLORS.green },
  horizontalAlignment: "right",
};
backlog.getRange("B6:B9").format.numberFormat = "0.0";

backlog.getRange("D6:J9").merge();
backlog.getRange("D6").values = [[
  "Prototype rule: each five-second turn collects one hidden action from each player, then the authoritative server validates and resolves both actions from the same pre-turn snapshot. Wallet signatures remain outside the turn loop.",
]];
backlog.getRange("D6:J9").format = {
  fill: COLORS.blueLight,
  font: { name: FONT, size: 10, color: COLORS.ink },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#93C5FD" },
};

const backlogHeaders = [
  "Day",
  "ID",
  "Area",
  "Task",
  "Done when",
  "Hours",
  "Depends on",
  "Priority",
  "Status",
  "Vertical slice",
];
const backlogRows = [
  ["Day 1", "ST-01", "Game design", "Approve Strike, Guard, and Recharge rules", "The three actions, mana costs, simultaneous resolution, double KO, and invalid-action behavior match the Combat Rules sheet.", 1, "-", "MUST", "To Do", "Yes"],
  ["Day 1", "ST-02", "Game design", "Freeze formulas and battle limits", "Damage, temporary guard, mana, 30-turn cap, timeout loss, and draw rules have shared constants and rules_version=2.", 1.5, "ST-01", "MUST", "To Do", "Yes"],
  ["Day 1", "ST-03", "Architecture", "Define authoritative live-match state", "A typed contract covers players, ordered teams, active slots, HP, mana, turn number, deadline, hidden choices, events, and result.", 1.5, "ST-01", "MUST", "To Do", "Yes"],
  ["Day 1", "ST-04", "Architecture", "Separate live play from Solana settlement", "The server owns five-second turns. Solana owns teams, stake escrow, resolver authorization, final result hash, payout, and refund escape hatch.", 1.5, "ST-03", "MUST", "To Do", "Yes"],
  ["Day 1", "ST-05", "Setup", "Record baseline and version boundary", "Current auto-battle tests and program ID are recorded. New work does not silently reuse rules_version=1 matches.", 1, "ST-04", "MUST", "To Do", "Yes"],

  ["Day 2", "ST-06", "Shared engine", "Build a pure simultaneous-turn reducer", "Given a pre-turn snapshot and two actions, one deterministic function returns mana changes, damage, KOs, next active slots, events, and match status.", 2.5, "ST-02, ST-03", "MUST", "To Do", "Yes"],
  ["Day 2", "ST-07", "Testing", "Test the complete 3 by 3 action matrix", "All nine action pairs, insufficient mana, both attackers acting before KO, double KO, bench advance, and final draw are covered.", 1.5, "ST-06", "MUST", "To Do", "Yes"],
  ["Day 2", "ST-08", "Balance", "Run deterministic roster simulations", "Every active SpeciesConfig has legal stats. Automated matchups report win rate, median turns, guard use, recharge use, and draw rate.", 1.5, "ST-06", "MUST", "To Do", "Yes"],
  ["Day 2", "ST-09", "Realtime", "Create a server-authoritative match room", "A dedicated TypeScript room starts only with both players, accepts validated actions, owns the deadline, and broadcasts one shared state.", 2.5, "ST-03, ST-06", "MUST", "To Do", "Yes"],

  ["Day 3", "ST-10", "Realtime", "Authenticate each match participant once", "Each room seat maps to the correct wallet. Turn choices do not open a wallet prompt. Spectators cannot submit actions.", 1.5, "ST-09", "MUST", "To Do", "Yes"],
  ["Day 3", "ST-11", "Realtime", "Implement hidden choice and five-second deadline", "A player's choice is acknowledged privately but not revealed before both lock or the server deadline. A missing or invalid choice becomes Recharge.", 1.5, "ST-09, ST-10", "MUST", "To Do", "Yes"],
  ["Day 3", "ST-12", "Realtime", "Implement reconnect and missed-turn policy", "Reloading restores the latest authoritative snapshot. Three consecutive missed turns forfeit. A reconnect never restarts or pauses a deadline.", 1.5, "ST-11", "MUST", "To Do", "Yes"],
  ["Day 3", "ST-13", "Program", "Change Match from auto-resolve to Active", "join_match records both teams and stake, changes status to Active, and no longer calculates or pays a winner immediately.", 2, "ST-04, ST-05", "MUST", "To Do", "Yes"],
  ["Day 3", "ST-14", "Program", "Authorize an offchain match resolver", "GameConfig stores one resolver authority. Only that signer can record winner, turn count, and final event-log hash for an Active match.", 2, "ST-13", "MUST", "To Do", "Yes"],
  ["Day 3", "ST-15", "Program", "Add stale-match refund escape hatch", "If no valid result is recorded before the fixed expiry, either player can trigger an equal stake refund. Resolved matches cannot be refunded.", 1.5, "ST-13", "MUST", "To Do", "Yes"],

  ["Day 4", "ST-16", "Frontend", "Route both players to /match/[address]", "Creating or joining a match navigates both players to the same canonical match URL and restores that URL after reload.", 1, "ST-09, ST-13", "MUST", "To Do", "Yes"],
  ["Day 4", "ST-17", "Frontend", "Build the mobile battle layout", "Opponent card and bench sit at the top, turn state in the middle, own card and bench above a sticky three-button action tray.", 2, "ST-16", "MUST", "To Do", "Yes"],
  ["Day 4", "ST-18", "Frontend", "Build clear action controls", "Strike, Guard, and Recharge are at least 48px high, show mana cost or gain, disable impossible actions, expose keyboard focus, and show the five-second countdown.", 1.5, "ST-17", "MUST", "To Do", "Yes"],
  ["Day 4", "ST-19", "Frontend", "Animate simultaneous resolution", "Both cards animate from the same event. HP and mana bars interpolate, Guard flashes, Recharge pulses, and KO cards turn gray without changing game timing.", 1.5, "ST-17, ST-18", "MUST", "To Do", "Yes"],
  ["Day 4", "ST-20", "Frontend", "Support reduced motion and spectators", "Reduced-motion mode uses fades and bar changes only. Spectators see the same deadline and events but no action controls.", 1, "ST-19", "MUST", "To Do", "Yes"],
  ["Day 4", "ST-21", "Frontend", "Show network and recovery states", "Connecting, waiting, choice locked, opponent locked, reconnecting, forfeited, draw, and settlement unavailable states each have one clear message.", 1, "ST-12, ST-18", "MUST", "To Do", "Yes"],

  ["Day 5", "ST-22", "Settlement", "Persist and hash the authoritative event log", "The server stores the ordered input and result events, derives one canonical SHA-256 result hash, and never accepts a client-provided winner.", 1.5, "ST-06, ST-14", "MUST", "To Do", "Yes"],
  ["Day 5", "ST-23", "Settlement", "Record the resolved result on Solana", "The resolver signs a resolve transaction containing the match address, winner, turn count, and final hash. The Match account becomes Resolved once.", 1.5, "ST-14, ST-22", "MUST", "To Do", "Yes"],
  ["Day 5", "ST-24", "Settlement", "Let the winner claim the pot", "Only the recorded winner can sign the claim. A draw refunds both. The exact transaction appears in match history.", 1, "ST-23", "MUST", "To Do", "Yes"],
  ["Day 5", "ST-25", "Integration", "Run two-browser end-to-end battles", "Two wallets see the same 10 consecutive turns, HP, mana, KOs, result, transaction state, and claim outcome after refresh and one reconnect.", 2, "ST-12, ST-19, ST-24", "MUST", "To Do", "Yes"],
  ["Day 5", "ST-26", "Balance", "Tune from recorded matches", "Median match length is 12 to 24 turns, draw rate is below 10%, no action is selected above 65%, and no sample creature exceeds 65% win rate.", 1.5, "ST-08, ST-25", "MUST", "To Do", "Yes"],
  ["Day 5", "ST-27", "Delivery", "Update demo script and operating notes", "The demo explains simultaneous choices, one wallet signature for claim, current central resolver trust, and how to recover or refund a stuck match.", 0.5, "ST-25", "MUST", "To Do", "Yes"],

  ["After slice", "ST-28", "Scale", "Move room presence and recovery to shared infrastructure", "A room can recover after one server process restarts and multiple nodes can find the same match without split-brain state.", 4, "ST-25", "SHOULD", "To Do", "No"],
  ["After slice", "ST-29", "Security", "Replace trusted resolver with stronger settlement", "Choose and prototype mutual result signatures, commit-reveal, or a replay-verifiable onchain result without changing the UI contract.", 6, "ST-23", "SHOULD", "To Do", "No"],
  ["After slice", "ST-30", "Game design", "Add skills only after action telemetry", "No skill ships until base action pick rates, match length, disconnect rate, and dominant strategies meet the V1 targets.", 3, "ST-26", "COULD", "To Do", "No"],
];

backlog.getRange("A11:J11").values = [backlogHeaders];
backlog.getRange(`A12:J${11 + backlogRows.length}`).values = backlogRows;
sectionHeader(backlog.getRange("A11:J11"));
body(backlog.getRange(`A12:J${11 + backlogRows.length}`));
backlog.getRange(`F12:F${11 + backlogRows.length}`).format.numberFormat = "0.0";
backlog.getRange(`A12:C${11 + backlogRows.length}`).format.verticalAlignment = "top";
backlog.getRange(`H12:J${11 + backlogRows.length}`).format.horizontalAlignment = "center";
backlog.getRange(`H12:H${11 + backlogRows.length}`).dataValidation = { rule: { type: "list", values: ["MUST", "SHOULD", "COULD"] } };
backlog.getRange(`I12:I${11 + backlogRows.length}`).dataValidation = { rule: { type: "list", values: ["To Do", "In Progress", "Blocked", "Done"] } };
backlog.getRange(`J12:J${11 + backlogRows.length}`).dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
backlog.getRange(`I12:I${11 + backlogRows.length}`).conditionalFormats.add("containsText", { text: "Blocked", format: { fill: COLORS.redLight, font: { bold: true, color: COLORS.red } } });
backlog.getRange(`I12:I${11 + backlogRows.length}`).conditionalFormats.add("containsText", { text: "Done", format: { fill: COLORS.greenLight, font: { bold: true, color: COLORS.green } } });
backlog.getRange(`H12:H${11 + backlogRows.length}`).conditionalFormats.add("containsText", { text: "MUST", format: { fill: COLORS.amberLight, font: { bold: true, color: COLORS.amber } } });
const backlogTable = backlog.tables.add(`A11:J${11 + backlogRows.length}`, true, "CombatBacklogTable");
backlogTable.style = "TableStyleMedium4";
backlog.freezePanes.freezeRows(11);
backlog.getRange("A1:J60").format.verticalAlignment = "center";
backlog.getRange(`D12:E${11 + backlogRows.length}`).format.verticalAlignment = "top";
backlog.getRange("A:A").format.columnWidth = 13;
backlog.getRange("B:B").format.columnWidth = 11;
backlog.getRange("C:C").format.columnWidth = 15;
backlog.getRange("D:D").format.columnWidth = 32;
backlog.getRange("E:E").format.columnWidth = 58;
backlog.getRange("F:F").format.columnWidth = 9;
backlog.getRange("G:G").format.columnWidth = 18;
backlog.getRange("H:J").format.columnWidth = 13;
backlog.getRange(`11:${11 + backlogRows.length}`).format.autofitRows();

title(
  rules,
  "Combat rules version 2",
  "Editable design assumptions are highlighted in light green. All resolution is deterministic and uses integer arithmetic.",
  "I",
);

rules.getRange("A6:D6").values = [["Rule", "Value", "Unit", "Reason"]];
const assumptions = [
  ["Team size", 3, "creatures", "Keeps current ordered-team collection and match setup."],
  ["Choice window", 5000, "milliseconds", "Both clients count down from one server deadline."],
  ["Animation window", 1250, "milliseconds", "Plays after resolution and never changes the deadline."],
  ["Starting mana", 5, "points", "Allows two early Strikes but creates a Recharge decision."],
  ["Maximum mana", 5, "points", "One visible resource shared by every creature."],
  ["Strike cost", 2, "mana", "Prevents permanent attack spam."],
  ["Guard cost", 1, "mana", "Prevents permanent zero-risk defense."],
  ["Recharge gain", 3, "mana", "A vulnerable turn usually funds one Strike and one Guard."],
  ["Turn limit", 30, "turns", "Caps stalling and keeps a match near two to four minutes."],
  ["Missed-turn forfeit", 3, "consecutive turns", "Reconnect is possible, but an absent player cannot stall forever."],
  ["Rules version", 2, "integer", "Version 1 remains the existing automatic battle."],
];
rules.getRange(`A7:D${6 + assumptions.length}`).values = assumptions;
sectionHeader(rules.getRange("A6:D6"));
body(rules.getRange(`A7:D${6 + assumptions.length}`));
rules.getRange(`B7:B${6 + assumptions.length}`).format.fill = COLORS.greenLight;
rules.getRange(`B7:B${6 + assumptions.length}`).format.font = { name: FONT, size: 10, bold: true, color: COLORS.green };
rules.getRange(`B7:B${6 + assumptions.length}`).format.numberFormat = "#,##0";

rules.getRange("F6:I6").values = [["Action", "Mana", "Effect", "Player-facing label"]];
rules.getRange("F7:I9").values = [
  ["Strike", -2, "Deal deterministic damage to the opposing active creature.", "Strike · 2 mana"],
  ["Guard", -1, "Create temporary block equal to Shield for this turn. Unused block expires.", "Guard · 1 mana"],
  ["Recharge", 3, "Restore mana up to 5. Does not heal HP or create Shield.", "Recharge · +3 mana"],
];
sectionHeader(rules.getRange("F6:I6"));
body(rules.getRange("F7:I9"));

rules.getRange("A20:I20").values = [["Pair", "Player A", "Player B", "A mana", "B mana", "Damage to A", "Damage to B", "Resolve", "Notes"]];
const matrix = [
  [1, "Strike", "Strike", -2, -2, "B raw damage", "A raw damage", "Simultaneous", "Both living cards act from the pre-turn snapshot. Double KO is valid."],
  [2, "Strike", "Guard", -2, -1, 0, "MAX(0, A raw - B Shield)", "Simultaneous", "Guard applies only to incoming damage this turn."],
  [3, "Strike", "Recharge", -2, 3, 0, "A raw damage", "Simultaneous", "Recharge is exposed to full damage."],
  [4, "Guard", "Strike", -1, -2, "MAX(0, B raw - A Shield)", 0, "Simultaneous", "Mirrors Strike versus Guard."],
  [5, "Guard", "Guard", -1, -1, 0, 0, "Simultaneous", "Both spend mana. Temporary block expires unused."],
  [6, "Guard", "Recharge", -1, 3, 0, 0, "Simultaneous", "Guard is wasted; Recharge gains mana."],
  [7, "Recharge", "Strike", 3, -2, "B raw damage", 0, "Simultaneous", "Recharge is exposed to full damage."],
  [8, "Recharge", "Guard", 3, -1, 0, 0, "Simultaneous", "Recharge gains mana; Guard expires unused."],
  [9, "Recharge", "Recharge", 3, 3, 0, 0, "Simultaneous", "Both gain mana up to the cap."],
];
rules.getRange("A21:I29").values = matrix;
sectionHeader(rules.getRange("A20:I20"));
body(rules.getRange("A21:I29"));

rules.getRange("A32:I32").values = [["Catalogue ID", "Creature", "HP", "Attack", "Defense", "Speed", "Shield", "Strike power", "Raw damage vs Defense 50"]];
const examples = [
  [1001, "Chihuahua", 80, 55, 35, 95, 35],
  [1002, "Golden Retriever", 115, 60, 55, 45, 25],
  [1003, "German Shepherd", 100, 72, 55, 55, 18],
  [1004, "Tabby Cat", 90, 60, 40, 80, 30],
  [1005, "Persian Cat", 105, 55, 60, 35, 45],
  [1006, "Monarch Butterfly", 75, 55, 35, 100, 35],
];
rules.getRange("A33:G38").values = examples;
for (let row = 33; row <= 38; row += 1) {
  rules.getRange(`H${row}`).formulas = [[`=D${row}+INT(F${row}/5)`]];
  rules.getRange(`I${row}`).formulas = [[`=MAX(1,INT(H${row}*100/(100+50)))`]];
}
sectionHeader(rules.getRange("A32:I32"));
body(rules.getRange("A33:I38"));
rules.getRange("H33:I38").format.fill = COLORS.blueLight;

rules.getRange("A41:I41").merge();
rules.getRange("A41").values = [["Resolution rules"]];
sectionHeader(rules.getRange("A41:I41"));
rules.getRange("A42:I48").merge(true);
rules.getRange("A42:A48").values = [
  ["1. Raw damage = MAX(1, FLOOR((Attack + FLOOR(Speed / 5)) × 100 / (100 + defender Defense)))."],
  ["2. Guarded damage = MAX(0, raw damage - defender Shield). Guard does not persist and Recharge does not restore HP or Shield."],
  ["3. Action eligibility is captured at turn start. Both living active creatures complete their selected action before KO checks."],
  ["4. If both active creatures reach 0 HP, both teams advance to the next slot together. If both final creatures fall, the result is Draw."],
  ["5. A choice is private until both players lock or the five-second deadline expires. Invalid or missing input becomes Recharge."],
  ["6. At turn 30, compare remaining HP as a percentage of each team's starting HP, then total mana. Equal values produce Draw and refund."],
  ["7. No random numbers, critical hits, dodge, healing, swapping, items, upgrades, or skills exist in this slice."],
];
rules.getRange("A42:I48").format = { wrapText: true, verticalAlignment: "center", fill: "#F8FAFC" };
rules.getRange("A:A").format.columnWidth = 20;
rules.getRange("B:B").format.columnWidth = 22;
rules.getRange("C:C").format.columnWidth = 16;
rules.getRange("D:D").format.columnWidth = 46;
rules.getRange("E:E").format.columnWidth = 14;
rules.getRange("F:F").format.columnWidth = 18;
rules.getRange("G:G").format.columnWidth = 24;
rules.getRange("H:H").format.columnWidth = 30;
rules.getRange("I:I").format.columnWidth = 46;
rules.getRange("6:48").format.autofitRows();
rules.freezePanes.freezeRows(5);

title(
  ux,
  "Battle screen, timing, and authority",
  "One shared server clock drives both players. The UI renders authoritative events and never calculates the winner.",
  "H",
);

ux.getRange("A6:H6").values = [["Stage", "Mobile placement", "Primary content", "Player action", "Server state", "Animation", "Fallback", "Acceptance"]];
const uxRows = [
  ["Waiting", "Cards centered; action tray hidden", "Two ordered teams and opponent connection", "Wait or leave before stake lock", "WaitingForOpponent", "Soft card entrance", "Show reconnect and cancel", "Both clients use the same match URL"],
  ["Choose", "Opponent card top; own card above bottom tray", "HP, mana, three bench thumbnails, turn 1, 5.0s timer", "Tap Strike, Guard, or Recharge", "Choosing with server deadline", "Selected button compresses and shows Locked", "No input becomes Recharge", "Buttons are at least 48px high and usable by keyboard"],
  ["Locked", "Action tray remains visible but disabled", "Your choice is shown; opponent shows Ready, never its action", "Wait", "One or both inputs stored privately", "Countdown ring continues", "Reconnect restores locked state", "No early choice leak"],
  ["Resolve", "Cards remain in stable positions", "Both action names and exact changes", "Watch", "Authoritative event appended", "250ms anticipation; 450ms simultaneous action; 500ms bars", "Reduced motion uses fade and instant positions", "Animation never affects rules or deadlines"],
  ["KO", "Defeated card stays visible briefly", "0 HP, KO label, next slot preview", "Watch", "Active slot advances", "Card desaturates and lowers; next card enters", "Static opacity change", "Double KO advances both sides together"],
  ["Finished", "Result sheet above disabled battlefield", "Winner or Draw, turns, stake result, event-log hash status", "Winner claims; both can inspect history", "AwaitingSettlement or Resolved", "Short result reveal", "Pending settlement keeps honest status", "No client-declared winner"],
];
ux.getRange("A7:H12").values = uxRows;
sectionHeader(ux.getRange("A6:H6"));
body(ux.getRange("A7:H12"));

ux.getRange("A15:H15").values = [["Field", "Example", "Browser", "Live server", "Supabase", "Solana", "Public to opponent", "Rule"]];
const authorityRows = [
  ["catalogue_id", 1003, "Read", "Read", "Metadata mirror", "SpeciesConfig authority", "Yes", "Numeric ID joins catalogue and onchain stats"],
  ["ordered team", "[Creature A, B, C]", "Select", "Read", "No", "Match authority", "Yes", "Three distinct owned Creature accounts"],
  ["turn deadline", "T+5000ms", "Display", "Authority", "No", "No", "Yes", "Never use a client countdown as truth"],
  ["turn choice", "Strike", "Submit", "Private authority until reveal", "No", "No", "No before reveal", "Do not broadcast early"],
  ["HP and mana", "HP 64, mana 3", "Render", "Authority", "No", "No during match", "Yes", "Derived only by deterministic reducer"],
  ["event log", "Turn 8 result", "Cache", "Authority and persistence", "No", "Final hash only", "Yes after reveal", "Ordered canonical serialization"],
  ["stake", "0.01 SOL each", "Display", "Read", "No", "Match escrow authority", "Yes", "No offchain balance decides payout"],
  ["winner", "Opponent", "Display", "Compute for preview only", "No", "Resolved Match authority", "Yes", "Resolver attests; program records once"],
  ["claim", "signature", "Request wallet", "No", "No", "Winner-signed transaction", "Yes", "Only recorded winner can claim"],
];
ux.getRange("A16:H24").values = authorityRows;
sectionHeader(ux.getRange("A15:H15"));
body(ux.getRange("A16:H24"));

ux.getRange("A27:H27").values = [["Timing event", "T+0ms", "T+250ms", "T+700ms", "T+1200ms", "T+1500ms", "Can skip", "Reduced motion"]];
ux.getRange("A28:H31").values = [
  ["Turn reveal", "Reveal both actions", "Cards brace", "Strike collision / Guard flash / Recharge pulse", "HP and mana settle", "Next timer starts", "No", "Fade labels and update bars"],
  ["Strike", "Show Strike", "Move 6px inward", "Both attackers collide simultaneously", "Return to slot", "KO check", "No", "Brief border highlight"],
  ["Guard", "Show Guard", "Shield outline appears", "Incoming hit flashes against outline", "Outline expires", "KO check", "No", "Static shield icon"],
  ["Recharge", "Show Recharge", "Mana bar glows", "Add mana", "Glow fades", "KO check", "No", "Instant mana update with label"],
];
sectionHeader(ux.getRange("A27:H27"));
body(ux.getRange("A28:H31"));

ux.getRange("A34:H34").merge();
ux.getRange("A34").values = [["Implementation recommendation"]];
sectionHeader(ux.getRange("A34:H34"));
ux.getRange("A35:H38").merge(true);
ux.getRange("A35:A38").values = [
  ["Use a dedicated server-authoritative TypeScript room for the prototype. Current Next.js request handlers and Solana account subscriptions are not a hidden-choice, five-second game loop."],
  ["Authenticate a wallet when entering the room, then submit ordinary signed or authenticated room messages. Do not open the wallet for each turn."],
  ["The current trusted resolver is acceptable only for the vertical slice. The UI and event schema should allow a later mutual-signature or replay-verifiable settlement without changing combat controls."],
  ["Reconnect from sessionStorage, request the full authoritative snapshot, and continue the existing server deadline. Never pause or restart a live turn for one client."],
];
ux.getRange("A35:H38").format = { wrapText: true, verticalAlignment: "center", fill: COLORS.blueLight };

ux.getRange("A41:B46").values = [
  ["Source", "URL"],
  ["Server-authoritative active turn-based matches", "https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/"],
  ["Server-owned state synchronization", "https://docs.colyseus.io/state"],
  ["Reconnection snapshots and tokens", "https://docs.colyseus.io/room/reconnection"],
  ["Mobile game control placement and 44pt minimum", "https://developer.apple.com/design/human-interface-guidelines/game-controls"],
  ["Reduced-motion preference", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion"],
];
sectionHeader(ux.getRange("A41:B41"));
body(ux.getRange("A42:B46"), true);
ux.getRange("A:A").format.columnWidth = 20;
ux.getRange("B:B").format.columnWidth = 31;
ux.getRange("C:C").format.columnWidth = 34;
ux.getRange("D:D").format.columnWidth = 30;
ux.getRange("E:E").format.columnWidth = 27;
ux.getRange("F:F").format.columnWidth = 32;
ux.getRange("G:G").format.columnWidth = 28;
ux.getRange("H:H").format.columnWidth = 34;
ux.getRange("6:46").format.autofitRows();
ux.freezePanes.freezeRows(5);

title(
  tests,
  "Acceptance tests",
  "Run the deterministic reducer first, then the room, program, UI, and two-browser loop.",
  "H",
);
tests.getRange("A6:H6").values = [["ID", "Layer", "Given", "When", "Expected", "Priority", "Automate", "Status"]];
const testRows = [
  ["AT-01", "Engine", "Both active creatures are alive and choose Strike", "The turn resolves", "Both spend 2 mana and both damages apply from the same pre-turn snapshot", "MUST", "Unit", "To Do"],
  ["AT-02", "Engine", "Both attacks reduce both active creatures to 0 HP", "The turn resolves", "Both actions land, both creatures show KO, and both teams advance together", "MUST", "Unit", "To Do"],
  ["AT-03", "Engine", "A chooses Strike; B chooses Guard", "The turn resolves", "B damage is MAX(0, A raw damage - B Shield); temporary block expires", "MUST", "Unit", "To Do"],
  ["AT-04", "Engine", "A chooses Strike; B chooses Recharge", "The turn resolves", "B gains mana up to 5 and receives full damage", "MUST", "Unit", "To Do"],
  ["AT-05", "Engine", "A has 1 mana and submits Strike", "The server validates", "Strike is rejected; if no replacement arrives before deadline, Recharge resolves", "MUST", "Unit", "To Do"],
  ["AT-06", "Engine", "A uses Recharge at 4 mana", "The turn resolves", "A finishes at 5 mana, never 7", "MUST", "Unit", "To Do"],
  ["AT-07", "Engine", "Both final creatures reach 0 HP together", "KO is evaluated", "Match is Draw and both stakes are refundable", "MUST", "Unit", "To Do"],
  ["AT-08", "Engine", "Turn 30 ends with both teams alive", "The cap resolves", "Higher remaining HP percentage wins; then total mana; exact equality is Draw", "MUST", "Unit", "To Do"],
  ["AT-09", "Room", "Only player A locks Strike", "Before deadline", "A receives an acknowledgement; B cannot learn A's action", "MUST", "Integration", "To Do"],
  ["AT-10", "Room", "Both players lock valid choices", "The second choice arrives", "Server resolves immediately once and broadcasts identical event IDs", "MUST", "Integration", "To Do"],
  ["AT-11", "Room", "Player B sends nothing", "The five-second deadline passes", "B uses Recharge and missed-turn count increments", "MUST", "Integration", "To Do"],
  ["AT-12", "Room", "A disconnects for one turn", "A reconnects with token", "A receives the current snapshot and the original deadline is unchanged", "MUST", "Integration", "To Do"],
  ["AT-13", "Room", "A misses three consecutive turns", "Third deadline passes", "A forfeits and match finishes exactly once", "MUST", "Integration", "To Do"],
  ["AT-14", "Program", "Both stakes and teams are valid", "Opponent joins", "Match becomes Active; no winner or payout exists yet", "MUST", "LiteSVM", "To Do"],
  ["AT-15", "Program", "An unauthorized signer submits a result", "resolve_match executes", "Transaction fails and escrow stays intact", "MUST", "LiteSVM", "To Do"],
  ["AT-16", "Program", "Authorized resolver submits one canonical result", "resolve_match executes twice", "First succeeds; second fails without changing winner or hash", "MUST", "LiteSVM", "To Do"],
  ["AT-17", "Program", "Winner claims a Resolved match", "claim executes", "Winner receives the pot once and match becomes Claimed", "MUST", "LiteSVM", "To Do"],
  ["AT-18", "Program", "Active match passes expiry without a result", "Either participant requests refund", "Each receives its stake and no later result or claim can succeed", "MUST", "LiteSVM", "To Do"],
  ["AT-19", "UI", "A turn enters Choose state", "Small-phone viewport renders", "Three sticky actions fit above safe area and each target is at least 48px high", "MUST", "Component", "To Do"],
  ["AT-20", "UI", "Player selects Guard", "Choice is accepted", "Guard shows Locked; other buttons disable; opponent action stays hidden", "MUST", "Component", "To Do"],
  ["AT-21", "UI", "Server emits a double KO event", "Animation plays", "Both cards animate together, both bars reach zero, then both bench cards enter", "MUST", "Browser", "To Do"],
  ["AT-22", "UI", "prefers-reduced-motion is enabled", "Strike resolves", "No collision movement occurs; labels and bars still communicate the result", "MUST", "Browser", "To Do"],
  ["AT-23", "End to end", "Two wallets join one canonical URL", "Ten turns plus one reconnect complete", "Both screens show identical turn IDs, deadlines, HP, mana, result, and settlement transaction", "MUST", "Browser", "To Do"],
  ["AT-24", "Balance", "Representative roster teams play a deterministic matchup matrix", "Metrics are calculated", "Median 12-24 turns, draw below 10%, action picks below 65%, creature win rate below 65%", "MUST", "Simulation", "To Do"],
];
tests.getRange(`A7:H${6 + testRows.length}`).values = testRows;
sectionHeader(tests.getRange("A6:H6"));
body(tests.getRange(`A7:H${6 + testRows.length}`));
tests.getRange(`F7:F${6 + testRows.length}`).dataValidation = { rule: { type: "list", values: ["MUST", "SHOULD", "COULD"] } };
tests.getRange(`H7:H${6 + testRows.length}`).dataValidation = { rule: { type: "list", values: ["To Do", "In Progress", "Blocked", "Passed"] } };
tests.getRange(`H7:H${6 + testRows.length}`).conditionalFormats.add("containsText", { text: "Passed", format: { fill: COLORS.greenLight, font: { bold: true, color: COLORS.green } } });
tests.getRange(`H7:H${6 + testRows.length}`).conditionalFormats.add("containsText", { text: "Blocked", format: { fill: COLORS.redLight, font: { bold: true, color: COLORS.red } } });
const testsTable = tests.tables.add(`A6:H${6 + testRows.length}`, true, "CombatAcceptanceTable");
testsTable.style = "TableStyleMedium4";
tests.freezePanes.freezeRows(6);
tests.getRange("A:A").format.columnWidth = 11;
tests.getRange("B:B").format.columnWidth = 15;
tests.getRange("C:C").format.columnWidth = 36;
tests.getRange("D:D").format.columnWidth = 30;
tests.getRange("E:E").format.columnWidth = 55;
tests.getRange("F:F").format.columnWidth = 12;
tests.getRange("G:G").format.columnWidth = 14;
tests.getRange("H:H").format.columnWidth = 14;
tests.getRange(`6:${6 + testRows.length}`).format.autofitRows();

await fs.mkdir(previewDir, { recursive: true });
wb.recalculate();

const inspections = [];
for (const [sheetName, range] of [
  ["Backlog", "A1:J41"],
  ["Combat Rules", "A1:I48"],
  ["UX and Sync", "A1:H46"],
  ["Acceptance Tests", "A1:H30"],
]) {
  const inspection = await wb.inspect({
    kind: "table",
    range: `${sheetName}!${range}`,
    include: "values,formulas",
    tableMaxRows: 60,
    tableMaxCols: 12,
    maxChars: 22000,
  });
  inspections.push(inspection.ndjson);
  const preview = await wb.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${previewDir}/${sheetName.replaceAll(" ", "-")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(`${outputDir}/inspection.ndjson`, `${inspections.join("\n")}\n${errors.ndjson}\n`, "utf8");

const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, previewDir, errors: errors.ndjson }));
