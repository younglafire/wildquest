import { isAddress } from "@solana/kit";
import { z } from "zod";
import { captureTransactionSchema } from "../vision/schema";

export const generateRequestSchema = z.object({
  wallet: z.string().refine(isAddress),
  catalogue_id: z.string().regex(/^[1-9]\d{0,19}$/).refine((value) => BigInt(value) <= 18446744073709551615n),
  cluster: z.literal("devnet"),
}).strict();

export const generateChallengeSchema = z.object({
  message: z.string().min(1).max(2000),
  token: z.string().min(1).max(4000),
}).strict();

export const generateSignedRequestSchema = generateRequestSchema.extend({
  token: z.string().min(1).max(4000),
  signature: z.string().regex(/^[0-9a-f]{128}$/),
}).strict();

export const generateResponseSchema = z.object({
  catalogue_id: z.string(),
  capture_transaction: captureTransactionSchema,
}).strict();
