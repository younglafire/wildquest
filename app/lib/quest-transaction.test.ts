import { address, createNoopSigner, lamports, type Account } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  getCompleteQuestInstructionDataDecoder,
  WILDQUEST_PROGRAM_ADDRESS,
  type Creature,
  type Quest,
} from "../generated/wildquest";
import { buildQuestCompletionInstruction } from "./quest-transaction";

const payer = address("11111111111111111111111111111111");
const signer = createNoopSigner(payer);

function creature(
  catalogueId: bigint,
  accountAddress: string,
): Account<Creature> {
  return {
    address: address(accountAddress),
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 91n,
    data: {
      discriminator: new Uint8Array(8),
      owner: payer,
      catalogueId,
      proofHash: new Uint8Array(32),
      capturedAt: 1n,
      balanceVersion: 2,
      bump: 1,
    },
  };
}

function captureCountQuest(requiredCount: number): Account<Quest> {
  return {
    address: address("SysvarRent111111111111111111111111111111111"),
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 67n,
    data: {
      discriminator: new Uint8Array(8),
      questId: 1n,
      speciesCount: requiredCount,
      targets: [],
      rewardXp: 25n,
      bump: 1,
    },
  };
}

describe("quest completion transaction", () => {
  it("appends the required distinct Creature accounts as read-only evidence", async () => {
    const first = creature(
      1001n,
      "SysvarC1ock11111111111111111111111111111111",
    );
    const second = creature(
      1002n,
      "Vote111111111111111111111111111111111111111",
    );
    const instruction = await buildQuestCompletionInstruction(
      signer,
      captureCountQuest(2),
      null,
      [first, second],
      [],
    );
    const data = getCompleteQuestInstructionDataDecoder().decode(
      instruction.data!,
    );

    expect(data.questId).toBe(1n);
    expect(
      instruction.accounts?.slice(-2).map((account) => account.address),
    ).toEqual([first.address, second.address]);
  });

  it("rejects an incomplete capture quest before opening the wallet", async () => {
    await expect(
      buildQuestCompletionInstruction(
        signer,
        captureCountQuest(2),
        null,
        [creature(1001n, "SysvarC1ock11111111111111111111111111111111")],
        [],
      ),
    ).rejects.toThrow("Capture more animals");
  });
});
