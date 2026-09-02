import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classifyImage } from "./classifier";
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
    for (const speciesId of FIXTURES) {
      it(`identifies ${speciesId}`, async () => {
        const bytes = await readFile(
          path.join(__dirname, "__fixtures__", `${speciesId}.jpg`),
        );
        const result = await classifyImage(
          new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }),
        );

        console.info(
          `${speciesId}: ${result.speciesId}, ${result.label}, ${result.confidence.toFixed(6)}`,
        );
        expect(result.speciesId).toBe(speciesId);

        expect(
          identificationSchema.safeParse({
            species_id: result.speciesId,
            common_name: speciesId,
            confidence: result.confidence,
            explanation: `ResNet-50 matched the ImageNet label "${result.label}".`,
            rarity: "Common",
          }).success,
        ).toBe(true);
      }, 120_000);
    }
  },
);
