import { z } from "zod";
import { RARITIES } from "@/app/lib/species";
import {
  calculateAwardedXp,
  CAPTURE_GRADES,
  getCaptureGrade,
  GRADE_CODES,
  MIN_IDENTIFICATION_CONFIDENCE,
  RARITY_CODES,
} from "./rules";

const rarityCodeSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const gradeCodeSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const identificationSchema = z
  .object({
    catalogue_id: z.string().regex(/^[1-9]\d*$/),
    species_id: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    common_name: z.string().trim().min(1).max(100),
    confidence: z.number().finite().min(0).max(1),
    explanation: z.string().trim().min(1).max(300),
    rarity: z.enum(RARITIES),
    rarity_code: rarityCodeSchema,
    base_xp: z.number().int().positive().safe(),
    facts: z.array(z.string().trim().min(1).max(300)),
    target_for_quest: z.literal(true),
    grade: z.enum(CAPTURE_GRADES),
    grade_code: gradeCodeSchema,
    awarded_xp: z.number().int().positive().safe(),
    proof_hash: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict()
  .superRefine((identification, context) => {
    if (RARITY_CODES[identification.rarity] !== identification.rarity_code) {
      context.addIssue({
        code: "custom",
        path: ["rarity_code"],
        message: "Rarity code does not match rarity.",
      });
    }

    if (identification.confidence < MIN_IDENTIFICATION_CONFIDENCE) {
      context.addIssue({
        code: "custom",
        path: ["confidence"],
        message: "Confidence is below the minimum identification threshold.",
      });
      return;
    }

    const expectedGrade = getCaptureGrade(identification.confidence);
    if (identification.grade !== expectedGrade) {
      context.addIssue({
        code: "custom",
        path: ["grade"],
        message: "Grade does not match confidence.",
      });
    }

    if (GRADE_CODES[identification.grade] !== identification.grade_code) {
      context.addIssue({
        code: "custom",
        path: ["grade_code"],
        message: "Grade code does not match grade.",
      });
    }

    if (
      calculateAwardedXp(identification.base_xp, identification.grade) !==
      identification.awarded_xp
    ) {
      context.addIssue({
        code: "custom",
        path: ["awarded_xp"],
        message: "Awarded XP does not match base XP and grade.",
      });
    }
  });

export type Identification = z.infer<typeof identificationSchema>;

export const identifySuccessSchema = z
  .object({ identification: identificationSchema })
  .strict();
