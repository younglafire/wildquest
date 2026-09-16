import { address, createNoopSigner } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  getDiscoverSpeciesInstructionDataDecoder,
  getInitializePlayerDiscriminatorBytes,
} from "../generated/wildquest";
import { buildDiscoveryInstructions } from "./discovery-transaction";
import type { Identification } from "./vision/schema";

const signer = createNoopSigner(address("11111111111111111111111111111111"));
const identification: Identification = {
  catalogue_id: "42",
  species_id: "frog",
  common_name: "Frog",
  model_class_id: 31,
  model_label: "tree frog, tree-frog",
  balance_version: 2,
  confidence: 0.91,
  explanation: "Matched frog.",
  rarity: "Rare",
  rarity_code: 2,
  base_xp: 50,
  facts: ["Frogs are amphibians."],
  target_for_quest: true,
  capture_enabled: true,
  grade: "Gold",
  grade_code: 3,
  awarded_xp: 100,
  proof_hash: "ab".repeat(32),
};

describe("discovery transaction construction", () => {
  it("initializes a missing Player before recording the Discovery", async () => {
    const instructions = await buildDiscoveryInstructions(
      signer,
      identification,
      false,
    );

    expect(instructions).toHaveLength(2);
    expect(instructions[0].data).toEqual(
      getInitializePlayerDiscriminatorBytes(),
    );
  });

  it("passes only validated identification values to an existing Player", async () => {
    const instructions = await buildDiscoveryInstructions(
      signer,
      identification,
      true,
    );
    const instructionData = instructions[0].data;

    if (!instructionData) {
      throw new Error("DiscoverSpecies instruction data is missing");
    }

    const data =
      getDiscoverSpeciesInstructionDataDecoder().decode(instructionData);

    expect(instructions).toHaveLength(1);
    expect(data.speciesId).toBe(42n);
    expect(data.grade).toBe(3);
    expect(data.rarity).toBe(2);
    expect(Array.from(data.proofHash)).toEqual(new Array(32).fill(0xab));
  });
});
