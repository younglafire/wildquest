import { describe, expect, it } from "vitest";
import {
  buildImageNetLabelIndex,
  InvalidModelOutputError,
  mapImageNetPredictions,
  speciesIdForImageNetClass,
  UnsupportedSpeciesError,
} from "./mapping";

const EXPECTED_MAPPINGS = new Map<number, string>([
  [7, "rooster"],
  [8, "hen"],
  [30, "bullfrog"],
  [31, "tree_frog"],
  [65, "sea_snake"],
  [87, "african_grey_parrot"],
  [88, "macaw"],
  [151, "chihuahua"],
  [158, "toy_terrier"],
  [179, "staffordshire_bull_terrier"],
  [195, "boston_terrier"],
  [207, "golden_retriever"],
  [208, "labrador_retriever"],
  [217, "english_springer_spaniel"],
  [219, "cocker_spaniel"],
  [235, "german_shepherd"],
  [243, "bull_mastiff"],
  [250, "siberian_husky"],
  [254, "pug"],
  [258, "samoyed"],
  [263, "pembroke_corgi"],
  [281, "tabby_cat"],
  [283, "persian_cat"],
  [284, "siamese_cat"],
  [285, "egyptian_cat"],
  [309, "bee"],
  [310, "ant"],
  [319, "dragonfly"],
  [320, "damselfly"],
  [322, "ringlet_butterfly"],
  [323, "monarch_butterfly"],
  [324, "cabbage_butterfly"],
  [332, "angora_rabbit"],
  [333, "hamster"],
  [341, "pig"],
  [346, "water_buffalo"],
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
    "207": "golden retriever",
    "281": "tabby, tabby cat",
    "283": "Persian cat",
    "999": "toilet tissue",
  });

  it("maps the highest exact supported class without breed aggregation", () => {
    expect(
      mapImageNetPredictions(
        [
          { label: "Chihuahua", score: 0.31 },
          { label: "tabby, tabby cat", score: 0.4 },
          { label: "golden retriever", score: 0.3 },
        ],
        labels,
      ),
    ).toEqual({
      speciesId: "tabby_cat",
      classId: 281,
      confidence: 0.4,
      label: "tabby, tabby cat",
    });
  });

  it("rejects an unsupported highest raw prediction", () => {
    expect(() =>
      mapImageNetPredictions(
        [
          { label: "toilet tissue", score: 0.5 },
          { label: "Chihuahua", score: 0.3 },
          { label: "golden retriever", score: 0.25 },
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
