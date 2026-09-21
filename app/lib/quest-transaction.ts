import {
  AccountRole,
  unwrapOption,
  type Account,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import {
  getCompleteQuestInstructionAsync,
  MatchStatus,
  type Quest,
  type QuestCompletion,
} from "../generated/wildquest";
import type { OwnedCreature } from "./creatures";
import {
  QUEST_OBJECTIVE_BATTLE_PARTICIPATION,
  QUEST_OBJECTIVE_CAPTURE_ANY,
  QUEST_OBJECTIVE_CAPTURE_COUNT,
  getQuestDefinition,
} from "./game";
import type { GameMatch } from "./matches";

export async function buildQuestCompletionInstruction(
  signer: TransactionSigner,
  quest: Account<Quest>,
  previousCompletion: Account<QuestCompletion> | null,
  creatures: ReadonlyArray<OwnedCreature>,
  matches: ReadonlyArray<GameMatch>,
): Promise<Instruction> {
  const evidence = [];
  const definition = getQuestDefinition(quest.data.questId);
  if (quest.data.questId > 1n) {
    if (!previousCompletion) {
      throw new Error("Complete the previous quest first.");
    }
    evidence.push(previousCompletion.address);
  }

  if (definition.objective === QUEST_OBJECTIVE_CAPTURE_COUNT) {
    const distinctCreatures = Array.from(
      new Map(
        creatures.map((creature) => [
          creature.data.catalogueId.toString(),
          creature,
        ]),
      ).values(),
    ).slice(0, quest.data.speciesCount);
    if (distinctCreatures.length < quest.data.speciesCount) {
      throw new Error("Capture more animals before claiming this quest.");
    }
    evidence.push(...distinctCreatures.map((creature) => creature.address));
  } else if (definition.objective === QUEST_OBJECTIVE_CAPTURE_ANY) {
    const targets = new Set(
      quest.data.targets.map((catalogueId) => catalogueId.toString()),
    );
    const matchingCreatures = creatures
      .filter((creature) => targets.has(creature.data.catalogueId.toString()))
      .slice(0, quest.data.speciesCount);
    if (matchingCreatures.length < quest.data.speciesCount) {
      throw new Error("Capture the quest animal before claiming this reward.");
    }
    evidence.push(...matchingCreatures.map((creature) => creature.address));
  } else if (definition.objective === QUEST_OBJECTIVE_BATTLE_PARTICIPATION) {
    const participatedMatch = matches.find((match) => {
      const opponent = unwrapOption(match.data.opponent);
      return (
        opponent !== null &&
        (match.data.creator === signer.address ||
          opponent === signer.address) &&
        match.data.status !== MatchStatus.Open &&
        match.data.status !== MatchStatus.Cancelled
      );
    });
    if (!participatedMatch) {
      throw new Error("Attend a battle before claiming this reward.");
    }
    evidence.push(participatedMatch.address);
  } else {
    throw new Error("This quest objective is unsupported.");
  }

  const baseInstruction = await getCompleteQuestInstructionAsync({
    payer: signer,
    quest: quest.address,
    questId: quest.data.questId,
  });

  return Object.freeze({
    ...baseInstruction,
    accounts: [
      ...(baseInstruction.accounts ?? []),
      ...evidence.map((evidenceAddress) => ({
        address: evidenceAddress,
        role: AccountRole.READONLY,
      })),
    ],
  });
}
