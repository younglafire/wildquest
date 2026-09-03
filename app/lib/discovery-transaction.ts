import type { Instruction, TransactionSigner } from "@solana/kit";
import {
  getDiscoverSpeciesInstructionAsync,
  getInitializePlayerInstructionAsync,
} from "../generated/wildquest";
import type { Identification } from "./vision/schema";
import { proofHashToBytes } from "./expedition";

export async function buildDiscoveryInstructions(
  signer: TransactionSigner,
  identification: Identification,
  playerExists: boolean,
): Promise<Array<Instruction>> {
  const proofHash = proofHashToBytes(identification.proof_hash);
  const instructions: Array<Instruction> = [];

  if (!playerExists) {
    instructions.push(
      await getInitializePlayerInstructionAsync({ payer: signer }),
    );
  }

  instructions.push(
    await getDiscoverSpeciesInstructionAsync({
      payer: signer,
      speciesId: BigInt(identification.catalogue_id),
      grade: identification.grade_code,
      rarity: identification.rarity_code,
      proofHash,
    }),
  );

  return instructions;
}
