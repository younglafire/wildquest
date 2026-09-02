import type { Rarity } from "@/app/lib/species";

export const RARITY_CODES = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
} as const satisfies Record<Rarity, number>;

export type RarityCode = (typeof RARITY_CODES)[Rarity];

export const CAPTURE_GRADES = ["Bronze", "Silver", "Gold"] as const;
export type CaptureGrade = (typeof CAPTURE_GRADES)[number];

export const GRADE_CODES = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
} as const satisfies Record<CaptureGrade, number>;

export type GradeCode = (typeof GRADE_CODES)[CaptureGrade];

export const MIN_IDENTIFICATION_CONFIDENCE = 0.7;
export const SILVER_MIN_CONFIDENCE = 0.8;
export const GOLD_MIN_CONFIDENCE = 0.9;

const GRADE_XP_MULTIPLIERS = {
  Bronze: 1,
  Silver: 1.5,
  Gold: 2,
} as const satisfies Record<CaptureGrade, number>;

export type CaptureReward = {
  grade: CaptureGrade;
  gradeCode: GradeCode;
  awardedXp: number;
};

export function getRarityCode(rarity: Rarity): RarityCode {
  return RARITY_CODES[rarity];
}

export function getCaptureGrade(confidence: number): CaptureGrade {
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new Error("Confidence must be a finite number between 0 and 1.");
  }

  if (confidence < MIN_IDENTIFICATION_CONFIDENCE) {
    throw new Error(
      "Confidence is below the minimum identification threshold.",
    );
  }

  if (confidence >= GOLD_MIN_CONFIDENCE) return "Gold";
  if (confidence >= SILVER_MIN_CONFIDENCE) return "Silver";
  return "Bronze";
}

export function calculateAwardedXp(
  baseXp: number,
  grade: CaptureGrade,
): number {
  if (!Number.isSafeInteger(baseXp) || baseXp <= 0) {
    throw new Error("Base XP must be a positive safe integer.");
  }

  return Math.round(baseXp * GRADE_XP_MULTIPLIERS[grade]);
}

export function getCaptureReward(
  confidence: number,
  baseXp: number,
): CaptureReward {
  const grade = getCaptureGrade(confidence);

  return {
    grade,
    gradeCode: GRADE_CODES[grade],
    awardedXp: calculateAwardedXp(baseXp, grade),
  };
}
