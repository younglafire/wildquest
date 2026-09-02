import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classifyImage } from "./classifier";
import { createImageProofHash } from "./proof";
import { getCaptureReward, getRarityCode } from "./rules";
import { identificationSchema } from "./schema";

const FIXTURES = [
  "dog",
  "cat",
  "bee",
  "chicken",
  "butterfly",
  "dragonfly",
  "frog",
  "ant",
] as const;

describe.runIf(process.env.RUN_RESNET_INTEGRATION === "1")(
  "local ResNet-50 fixtures",
  () => {
    for (const [fixtureIndex, speciesId] of FIXTURES.entries()) {
      it(`identifies ${speciesId}`, async () => {
        const bytes = await readFile(
          path.join(__dirname, "__fixtures__", `${speciesId}.jpg`),
        );
        const image = new Blob([new Uint8Array(bytes)], {
          type: "image/jpeg",
        });
        const result = await classifyImage(image);
        const reward = getCaptureReward(result.confidence, 50);
        const proofHash = await createImageProofHash(image);

        console.info(
          `${speciesId}: ${result.speciesId}, ${result.label}, ${result.confidence.toFixed(6)}`,
        );
        expect(result.speciesId).toBe(speciesId);

        expect(
          identificationSchema.safeParse({
            catalogue_id: String(fixtureIndex + 1),
            species_id: result.speciesId,
            common_name: speciesId,
            confidence: result.confidence,
            explanation: `ResNet-50 matched the ImageNet label "${result.label}".`,
            rarity: "Common",
            rarity_code: getRarityCode("Common"),
            base_xp: 50,
            facts: [`Fixture fact for ${speciesId}.`],
            target_for_quest: true,
            grade: reward.grade,
            grade_code: reward.gradeCode,
            awarded_xp: reward.awardedXp,
            proof_hash: proofHash,
          }).success,
        ).toBe(true);
      }, 120_000);
    }
  },
);
