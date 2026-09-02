import { describe, expect, it } from "vitest";
import {
  calculateAwardedXp,
  getCaptureGrade,
  getCaptureReward,
  getRarityCode,
  GRADE_CODES,
  RARITY_CODES,
} from "./rules";

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
    [0.7, "Bronze", 1, 50],
    [0.799999, "Bronze", 1, 50],
    [0.8, "Silver", 2, 75],
    [0.899999, "Silver", 2, 75],
    [0.9, "Gold", 3, 100],
    [1, "Gold", 3, 100],
  ] as const)(
    "scores confidence %f as %s",
    (confidence, grade, gradeCode, awardedXp) => {
      expect(getCaptureGrade(confidence)).toBe(grade);
      expect(getCaptureReward(confidence, 50)).toEqual({
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
      expect(() => getCaptureGrade(confidence)).toThrow();
    },
  );

  it("rounds XP derived from an odd base value", () => {
    expect(calculateAwardedXp(51, "Silver")).toBe(77);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid base XP %s",
    (baseXp) => {
      expect(() => calculateAwardedXp(baseXp, "Bronze")).toThrow();
    },
  );
});
