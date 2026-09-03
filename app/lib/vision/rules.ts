import type { Rarity } from "@/app/lib/species";
import type { CaptureQualityMeasurements } from "./quality";

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
export const QUEST_BASE_XP = 50;

export const SILVER_MIN_SHARPNESS_VARIANCE = 30;
export const GOLD_MIN_SHARPNESS_VARIANCE = 200;
export const SILVER_MIN_CENTER_LUMINANCE = 40;
export const SILVER_MAX_CENTER_LUMINANCE = 220;
export const GOLD_MIN_CENTER_LUMINANCE = 55;
export const GOLD_MAX_CENTER_LUMINANCE = 205;
export const SILVER_MIN_CENTER_ENTROPY = 4.5;
export const GOLD_MIN_CENTER_ENTROPY = 5.5;

const GRADE_XP_MULTIPLIERS = {
  Bronze: 1,
  Silver: 1.5,
  Gold: 2,
} as const satisfies Record<CaptureGrade, number>;

const GRADE_RANK = GRADE_CODES;

export type CaptureReward = {
  grade: CaptureGrade;
  gradeCode: GradeCode;
  awardedXp: number;
};

export function getRarityCode(rarity: Rarity): RarityCode {
  return RARITY_CODES[rarity];
}

export function getConfidenceGrade(confidence: number): CaptureGrade {
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

export function getCaptureQualityGrade(
  quality: CaptureQualityMeasurements,
): CaptureGrade {
  if (
    !Number.isFinite(quality.sharpnessVariance) ||
    !Number.isFinite(quality.centerLuminance) ||
    !Number.isFinite(quality.centerEntropy) ||
    quality.sharpnessVariance < 0 ||
    quality.centerLuminance < 0 ||
    quality.centerLuminance > 255 ||
    quality.centerEntropy < 0 ||
    quality.centerEntropy > 8
  ) {
    throw new Error("Capture quality measurements are invalid.");
  }

  const hasGoldVisibility =
    quality.centerLuminance >= GOLD_MIN_CENTER_LUMINANCE &&
    quality.centerLuminance <= GOLD_MAX_CENTER_LUMINANCE &&
    quality.centerEntropy >= GOLD_MIN_CENTER_ENTROPY;
  if (
    quality.sharpnessVariance >= GOLD_MIN_SHARPNESS_VARIANCE &&
    hasGoldVisibility
  ) {
    return "Gold";
  }

  const hasSilverVisibility =
    quality.centerLuminance >= SILVER_MIN_CENTER_LUMINANCE &&
    quality.centerLuminance <= SILVER_MAX_CENTER_LUMINANCE &&
    quality.centerEntropy >= SILVER_MIN_CENTER_ENTROPY;
  if (
    quality.sharpnessVariance >= SILVER_MIN_SHARPNESS_VARIANCE &&
    hasSilverVisibility
  ) {
    return "Silver";
  }

  return "Bronze";
}

export function getCaptureGrade(
  confidence: number,
  quality: CaptureQualityMeasurements,
): CaptureGrade {
  const confidenceGrade = getConfidenceGrade(confidence);
  const qualityGrade = getCaptureQualityGrade(quality);
  return GRADE_RANK[confidenceGrade] <= GRADE_RANK[qualityGrade]
    ? confidenceGrade
    : qualityGrade;
}

export function calculateAwardedXp(
  baseXp: number,
  grade: CaptureGrade,
): number {
  if (!Number.isSafeInteger(baseXp) || baseXp <= 0) {
    throw new Error("Base XP must be a positive safe integer.");
  }
  if (baseXp !== QUEST_BASE_XP) {
    throw new Error(`Quest base XP must be ${QUEST_BASE_XP}.`);
  }

  return Math.round(baseXp * GRADE_XP_MULTIPLIERS[grade]);
}

export function getCaptureReward(
  confidence: number,
  quality: CaptureQualityMeasurements,
  baseXp: number,
): CaptureReward {
  const grade = getCaptureGrade(confidence, quality);

  return {
    grade,
    gradeCode: GRADE_CODES[grade],
    awardedXp: calculateAwardedXp(baseXp, grade),
  };
}
