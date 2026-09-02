import { z } from "zod";
import type { Rarity } from "@/app/lib/species";
import { PERCEPTUAL_HASH_DISTANCE_THRESHOLD } from "./perceptual-hash";
import type { GradeCode } from "./rules";

export type DiscoveryReservation = {
  wallet: string;
  catalogueId: string;
  gradeCode: GradeCode;
  rarity: Rarity;
  proofHash: string;
  perceptualHash: string;
};

export type DiscoveryReservationResult =
  { duplicate: false } | { duplicate: true; distance: number };

const reservationRowSchema = z
  .object({
    accepted: z.boolean(),
    distance: z
      .number()
      .int()
      .min(0)
      .max(PERCEPTUAL_HASH_DISTANCE_THRESHOLD)
      .nullable(),
  })
  .strict()
  .superRefine((row, context) => {
    if (row.accepted === (row.distance !== null)) {
      context.addIssue({
        code: "custom",
        path: ["distance"],
        message: "Reservation result is inconsistent.",
      });
    }
  });

export class DuplicateCheckUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("The duplicate-image check is temporarily unavailable.", options);
    this.name = "DuplicateCheckUnavailableError";
  }
}

export function parseDiscoveryReservationResult(
  value: unknown,
): DiscoveryReservationResult {
  const rows = z.array(reservationRowSchema).length(1).parse(value);
  const row = rows[0];
  return row.accepted
    ? { duplicate: false }
    : { duplicate: true, distance: row.distance! };
}
