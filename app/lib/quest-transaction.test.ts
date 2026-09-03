import { address, createNoopSigner, lamports } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  getCompleteQuestInstructionDataDecoder,
  WILDQUEST_PROGRAM_ADDRESS,
  type Quest,
} from "../generated/wildquest";
import type { PlayerDiscovery } from "./collection";
import { buildQuestCompletionInstruction } from "./quest-transaction";

const payer = address("11111111111111111111111111111111");
const signer = createNoopSigner(payer);

function discovery(speciesId: bigint, accountAddress: string): PlayerDiscovery {
  return {
    address: address(accountAddress),
    executable: false,
    lamports: lamports(1n),
    programAddress: WILDQUEST_PROGRAM_ADDRESS,
    space: 90n,
    data: {
      discriminator: new Uint8Array(8),
      player: payer,
      speciesId,
      timestamp: 1n,
      grade: 1,
      rarity: 0,
      proofHash: new Uint8Array(32),
    },
  };
}

describe("quest completion transaction", () => {
  it("appends one read-only Discovery account for every ordered target", async () => {
    const quest = {
      address: address("SysvarRent111111111111111111111111111111111"),
      executable: false,
      lamports: lamports(1n),
      programAddress: WILDQUEST_PROGRAM_ADDRESS,
      space: 64n,
      data: {
        discriminator: new Uint8Array(8),
        questId: 1n,
        speciesCount: 2,
        targets: [3n, 8n],
        rewardXp: 100n,
        bump: 1,
      },
    } satisfies import("@solana/kit").Account<Quest>;
    const bee = discovery(3n, "SysvarC1ock11111111111111111111111111111111");
    const butterfly = discovery(
      8n,
      "Vote111111111111111111111111111111111111111",
    );
    const instruction = await buildQuestCompletionInstruction(signer, quest, [
      butterfly,
      bee,
    ]);
    const data = getCompleteQuestInstructionDataDecoder().decode(
      instruction.data!,
    );

    expect(data.questId).toBe(1n);
    expect(
      instruction.accounts?.slice(-2).map((account) => account.address),
    ).toEqual([bee.address, butterfly.address]);
  });

  it("rejects an incomplete quest before opening the wallet", async () => {
    const quest = {
      address: address("SysvarRent111111111111111111111111111111111"),
      executable: false,
      lamports: lamports(1n),
      programAddress: WILDQUEST_PROGRAM_ADDRESS,
      space: 64n,
      data: {
        discriminator: new Uint8Array(8),
        questId: 1n,
        speciesCount: 2,
        targets: [3n, 8n],
        rewardXp: 100n,
        bump: 1,
      },
    } satisfies import("@solana/kit").Account<Quest>;
    await expect(
      buildQuestCompletionInstruction(signer, quest, [
        discovery(3n, "SysvarC1ock11111111111111111111111111111111"),
      ]),
    ).rejects.toThrow("Quest target 8 is incomplete");
  });
});
