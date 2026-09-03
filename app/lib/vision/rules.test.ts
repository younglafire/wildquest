import { describe, expect, it } from "vitest";
import type { CaptureQualityMeasurements } from "./quality";
import {
  calculateAwardedXp,
  getCaptureGrade,
  getCaptureQualityGrade,
  getCaptureReward,
  getConfidenceGrade,
  getRarityCode,
  GRADE_CODES,
  RARITY_CODES,
} from "./rules";

const bronzeQuality: CaptureQualityMeasurements = {
  sharpnessVariance: 29.999,
  centerLuminance: 128,
  centerEntropy: 8,
};

const silverQuality: CaptureQualityMeasurements = {
  sharpnessVariance: 30,
  centerLuminance: 40,
  centerEntropy: 4.5,
};

const goldQuality: CaptureQualityMeasurements = {
  sharpnessVariance: 200,
  centerLuminance: 55,
  centerEntropy: 5.5,
};

describe("identification game rules", () => {
  it.each([
    ["Common", 0],
    ["Uncommon", 1],
    ["Rare", 2],
    ["Epic", 3],
    ["Legendary", 4],
  ] as const)("maps %s rarity to code %i", (rarity, code) => {
    expect(getRarityCode(rarity)).toBe(code);
    expect(RARITY_CODES[rarity]).toBe(code);
  });

  it.each([
    [0.7, "Bronze"],
    [0.799999, "Bronze"],
    [0.8, "Silver"],
    [0.899999, "Silver"],
    [0.9, "Gold"],
    [1, "Gold"],
  ] as const)("maps confidence %f to %s", (confidence, grade) => {
    expect(getConfidenceGrade(confidence)).toBe(grade);
  });

  it.each([
    [bronzeQuality, "Bronze"],
    [silverQuality, "Silver"],
    [goldQuality, "Gold"],
    [{ ...silverQuality, centerLuminance: 220 }, "Silver"],
    [{ ...silverQuality, centerLuminance: 220.001 }, "Bronze"],
    [{ ...goldQuality, centerLuminance: 205 }, "Gold"],
    [{ ...goldQuality, centerLuminance: 205.001 }, "Silver"],
    [{ ...silverQuality, centerEntropy: 4.499 }, "Bronze"],
    [{ ...goldQuality, centerEntropy: 5.499 }, "Silver"],
    [{ ...goldQuality, sharpnessVariance: 199.999 }, "Silver"],
  ] as const)("maps quality measurements to %s", (quality, grade) => {
    expect(getCaptureQualityGrade(quality)).toBe(grade);
  });

  it("rejects invalid quality measurements", () => {
    expect(() =>
      getCaptureQualityGrade({
        sharpnessVariance: Number.NaN,
        centerLuminance: 128,
        centerEntropy: 6,
      }),
    ).toThrow("Capture quality measurements are invalid.");
  });

  it.each([
    [0.7, bronzeQuality, "Bronze", 1, 50],
    [0.8, bronzeQuality, "Bronze", 1, 50],
    [0.9, bronzeQuality, "Bronze", 1, 50],
    [0.7, silverQuality, "Bronze", 1, 50],
    [0.8, silverQuality, "Silver", 2, 75],
    [0.9, silverQuality, "Silver", 2, 75],
    [0.7, goldQuality, "Bronze", 1, 50],
    [0.8, goldQuality, "Silver", 2, 75],
    [0.9, goldQuality, "Gold", 3, 100],
  ] as const)(
    "caps confidence %f by image quality at %s",
    (confidence, quality, grade, gradeCode, awardedXp) => {
      expect(getCaptureGrade(confidence, quality)).toBe(grade);
      expect(getCaptureReward(confidence, quality, 50)).toEqual({
        grade,
        gradeCode,
        awardedXp,
      });
      expect(GRADE_CODES[grade]).toBe(gradeCode);
    },
  );

  it.each([0.699999, -0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects confidence %s",
    (confidence) => {
      expect(() => getConfidenceGrade(confidence)).toThrow();
    },
  );

  it.each([0, -1, 1.5, 51, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid quest base XP %s",
    (baseXp) => {
      expect(() => calculateAwardedXp(baseXp, "Bronze")).toThrow();
    },
  );
});
