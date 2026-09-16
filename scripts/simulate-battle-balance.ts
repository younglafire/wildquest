import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import {
  simulateBalanceMatch,
  summarizeBalance,
} from "../app/lib/battle-balance";

async function loadCanonicalRoster() {
  const source = await readFile(
    path.resolve("programs/wildquest/src/constants.rs"),
    "utf8",
  );
  const idsBlock = source.match(
    /pub const BATTLE_CATALOGUE_IDS:[^=]+ = \[([\s\S]*?)\n\];/,
  )?.[1];
  const statsBlock = source.match(
    /pub const BATTLE_STATS:[^=]+ = \[([\s\S]*?)\n\];/,
  )?.[1];
  if (!idsBlock || !statsBlock) {
    throw new Error("Canonical battle constants could not be parsed.");
  }
  const ids = [...idsBlock.matchAll(/\d+/g)].map(([value]) => Number(value));
  const stats = [
    ...statsBlock.matchAll(
      /\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/g,
    ),
  ].map(
    ([
      ,
      hp,
      attack,
      defense,
      maxMana,
      strikeCost,
      guardCost,
      rechargeGain,
      abilityId,
      abilityCost,
    ]) => ({
      hp: Number(hp),
      attack: Number(attack),
      defense: Number(defense),
      maxMana: Number(maxMana),
      strikeCost: Number(strikeCost),
      guardCost: Number(guardCost),
      rechargeGain: Number(rechargeGain),
      abilityId: Number(abilityId),
      abilityCost: Number(abilityCost),
    }),
  );
  if (ids.length !== 40 || stats.length !== ids.length) {
    throw new Error(
      "Canonical battle roster must contain 40 complete entries.",
    );
  }
  return ids.map((id, index) => ({ id, stats: stats[index]! }));
}

async function main() {
  const roster = await loadCanonicalRoster();
  const matches = [];
  let randomState = 0x57_51_2026;
  const random = () => {
    randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0;
    return randomState / 0x1_0000_0000;
  };
  for (let sample = 0; sample < 10_000; sample += 1) {
    const shuffled = [...roster];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other]!, shuffled[index]!];
    }
    const creator = shuffled.slice(0, 3);
    const opponent = shuffled.slice(3, 6);
    for (let mirror = 0; mirror < 2; mirror += 1) {
      const creatorTeam = mirror === 0 ? creator : opponent;
      const opponentTeam = mirror === 0 ? opponent : creator;
      matches.push(
        simulateBalanceMatch({
          creatorIds: creatorTeam.map(({ id }) => id),
          creatorStats: creatorTeam.map(({ stats }) => stats),
          opponentIds: opponentTeam.map(({ id }) => id),
          opponentStats: opponentTeam.map(({ stats }) => stats),
          styleSeed: sample + mirror,
        }),
      );
    }
  }
  const report = summarizeBalance(matches);
  console.info(JSON.stringify(report, null, 2));
  const maximumActionRate = Math.max(...Object.values(report.actionRates));
  if (
    report.medianTurns < 12 ||
    report.medianTurns > 24 ||
    report.drawRate >= 0.1 ||
    maximumActionRate > 0.65 ||
    report.maximumCreatureWinRate > 0.65
  ) {
    throw new Error("The roster does not meet the frozen balance targets.");
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Balance simulation failed.",
    );
    process.exitCode = 1;
  });
}
