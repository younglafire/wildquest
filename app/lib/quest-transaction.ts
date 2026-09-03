import {
  AccountRole,
  type Account,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import {
  getCompleteQuestInstructionAsync,
  type Quest,
} from "../generated/wildquest";
import type { PlayerDiscovery } from "./collection";

export async function buildQuestCompletionInstruction(
  signer: TransactionSigner,
  quest: Account<Quest>,
  discoveries: Array<PlayerDiscovery>,
): Promise<Instruction> {
  const selectedDiscoveries = quest.data.targets.map((target) => {
    const discovery = discoveries.find(
      (candidate) => candidate.data.speciesId === target,
    );
    if (!discovery) {
      throw new Error(`Quest target ${target.toString()} is incomplete.`);
    }
    return discovery;
  });

  const baseInstruction = await getCompleteQuestInstructionAsync({
    payer: signer,
    quest: quest.address,
    questId: quest.data.questId,
  });

  return Object.freeze({
    ...baseInstruction,
    accounts: [
      ...(baseInstruction.accounts ?? []),
      ...selectedDiscoveries.map((discovery) => ({
        address: discovery.address,
        role: AccountRole.READONLY,
      })),
    ],
  });
}
