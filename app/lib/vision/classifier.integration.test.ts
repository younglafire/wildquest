import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classifyImage } from "./classifier";
import { createImageProofHash } from "./proof";
import { analyzeCaptureQuality } from "./quality";
import { getCaptureReward, getRarityCode } from "./rules";
import { identificationSchema } from "./schema";

const FIXTURES = [
  { file: "dog", speciesId: "golden_retriever", catalogueId: "1002" },
  {
    file: "butterfly",
    speciesId: "monarch_butterfly",
    catalogueId: "1006",
  },
] as const;

describe.runIf(process.env.RUN_RESNET_INTEGRATION === "1")(
  "local ResNet-50 fixtures",
  () => {
    for (const fixture of FIXTURES) {
      it(`identifies ${fixture.speciesId}`, async () => {
        const bytes = await readFile(
          path.join(__dirname, "__fixtures__", `${fixture.file}.jpg`),
        );
        const image = new Blob([new Uint8Array(bytes)], {
          type: "image/jpeg",
        });
        const result = await classifyImage(image);
        const quality = await analyzeCaptureQuality(image);
        const reward = getCaptureReward(result.confidence, quality, 50);
        const proofHash = await createImageProofHash(image);

        console.info(
          `${fixture.speciesId}: ${result.speciesId}, ${result.label}, ${result.confidence.toFixed(6)}`,
        );
        expect(result.speciesId).toBe(fixture.speciesId);

        expect(
          identificationSchema.safeParse({
            catalogue_id: fixture.catalogueId,
            species_id: result.speciesId,
            common_name: fixture.speciesId,
            model_class_id: result.classId,
            model_label: result.label,
            balance_version: 2,
            confidence: result.confidence,
            explanation: `ResNet-50 matched the ImageNet label "${result.label}".`,
            rarity: "Common",
            rarity_code: getRarityCode("Common"),
            base_xp: 50,
            facts: [`Fixture fact for ${fixture.speciesId}.`],
            target_for_quest: false,
            capture_enabled: true,
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
