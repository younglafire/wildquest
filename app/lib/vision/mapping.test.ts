import { describe, expect, it } from "vitest";
import {
  buildImageNetLabelIndex,
  InvalidModelOutputError,
  mapImageNetPredictions,
  speciesIdForImageNetClass,
  UnsupportedSpeciesError,
} from "./mapping";

const EXPECTED_MAPPINGS = new Map<number, string>([
  ...Array.from({ length: 118 }, (_, index) => [151 + index, "dog"] as const),
  ...Array.from({ length: 5 }, (_, index) => [281 + index, "cat"] as const),
  [309, "bee"],
  [7, "chicken"],
  [8, "chicken"],
  ...Array.from(
    { length: 5 },
    (_, index) => [322 + index, "butterfly"] as const,
  ),
  [319, "dragonfly"],
  [30, "frog"],
  [31, "frog"],
  [32, "frog"],
  [310, "ant"],
]);

describe("speciesIdForImageNetClass", () => {
  it("maps every exact supported ImageNet class and rejects every other class", () => {
    for (let classId = 0; classId < 1_000; classId += 1) {
      expect(speciesIdForImageNetClass(classId)).toBe(
        EXPECTED_MAPPINGS.get(classId) ?? null,
      );
    }
  });
});

describe("mapImageNetPredictions", () => {
  const labels = buildImageNetLabelIndex({
    "151": "Chihuahua",
    "152": "Japanese spaniel",
    "281": "tabby, tabby cat",
    "309": "bee",
    "319": "dragonfly",
    "999": "toilet tissue",
  });

  it("aggregates mapped probabilities and keeps the strongest winning label", () => {
    expect(
      mapImageNetPredictions(
        [
          { label: "Chihuahua", score: 0.31 },
          { label: "tabby, tabby cat", score: 0.4 },
          { label: "Japanese spaniel", score: 0.3 },
        ],
        labels,
      ),
    ).toEqual({
      speciesId: "dog",
      confidence: 0.61,
      label: "Chihuahua",
    });
  });

  it("rejects an unsupported highest raw prediction even if mapped totals are higher", () => {
    expect(() =>
      mapImageNetPredictions(
        [
          { label: "toilet tissue", score: 0.5 },
          { label: "Chihuahua", score: 0.3 },
          { label: "Japanese spaniel", score: 0.25 },
        ],
        labels,
      ),
    ).toThrow(UnsupportedSpeciesError);
  });

  it.each([
    [[], "no predictions"],
    [[{ label: "", score: 0.5 }], "empty label"],
    [[{ label: "bee", score: -0.1 }], "negative score"],
    [[{ label: "bee", score: 1.1 }], "score over one"],
    [[{ label: "unknown", score: 0.5 }], "unknown label"],
  ])("rejects invalid model output: %s (%s)", (predictions) => {
    expect(() => mapImageNetPredictions(predictions, labels)).toThrow(
      InvalidModelOutputError,
    );
  });

  it("rejects malformed label configuration", () => {
    expect(() => buildImageNetLabelIndex({ bad: "bee" })).toThrow(
      InvalidModelOutputError,
    );
  });
});
