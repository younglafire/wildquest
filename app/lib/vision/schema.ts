import { z } from "zod";
import { RARITIES } from "@/app/lib/species";

export const identificationSchema = z
  .object({
    species_id: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    common_name: z.string().trim().min(1).max(100),
    confidence: z.number().finite().min(0).max(1),
    explanation: z.string().trim().min(1).max(300),
    rarity: z.enum(RARITIES),
  })
  .strict();

export type Identification = z.infer<typeof identificationSchema>;

export const identifySuccessSchema = z
  .object({ identification: identificationSchema })
  .strict();
