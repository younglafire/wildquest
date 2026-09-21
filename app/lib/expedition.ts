import {
  isAddress,
  isSignature,
  type Address,
  type Signature,
} from "@solana/kit";
import { z } from "zod";
import {
  identificationSchema,
  identifySuccessSchema,
  captureTransactionSchema,
  type CaptureTransaction,
  type Identification,
} from "./vision/schema";

const PENDING_KEY = "wildquest:pending-identification:v2";
const CONFIRMED_KEY = "wildquest:last-confirmed-discovery:v1";

const pendingIdentificationSchema = z
  .object({
    version: z.literal(2),
    wallet: z.string().refine(isAddress),
    identification: identificationSchema,
    captureTransaction: captureTransactionSchema,
  })
  .strict();

const confirmedDiscoverySchema = z
  .object({
    version: z.literal(1),
    wallet: z.string().refine(isAddress),
    identification: identificationSchema,
    signature: z.string().refine(isSignature),
  })
  .strict();

const identifyErrorSchema = z
  .object({
    error: z
      .object({
        code: z.string().trim().min(1),
        message: z.string().trim().min(1),
      })
      .passthrough(),
  })
  .strict();

export type PendingIdentification = z.infer<typeof pendingIdentificationSchema>;
export type ConfirmedDiscovery = z.infer<typeof confirmedDiscoverySchema>;

export class IdentifyRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "IdentifyRequestError";
  }
}

export async function identifyImage(
  image: File,
  wallet: Address,
): Promise<{
  identification: Identification;
  captureTransaction: CaptureTransaction;
}> {
  const formData = new FormData();
  formData.set("image", image);
  formData.set("wallet", wallet);

  const response = await fetch("/api/identify", {
    method: "POST",
    body: formData,
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new IdentifyRequestError(
      "INVALID_API_RESPONSE",
      "The identification service is temporarily unavailable. Please try again.",
    );
  }

  if (!response.ok) {
    const parsedError = identifyErrorSchema.safeParse(body);
    if (parsedError.success) {
      throw new IdentifyRequestError(
        parsedError.data.error.code,
        parsedError.data.error.message,
      );
    }
    throw new IdentifyRequestError(
      "INVALID_API_RESPONSE",
      "The identification service returned an invalid error response.",
    );
  }

  const parsed = identifySuccessSchema.parse(body);
  return {
    identification: parsed.identification,
    captureTransaction: parsed.capture_transaction,
  };
}

export function createPendingIdentification(
  wallet: Address,
  identification: Identification,
  captureTransaction: CaptureTransaction,
): PendingIdentification {
  return pendingIdentificationSchema.parse({
    version: 2,
    wallet,
    identification,
    captureTransaction,
  });
}

export function savePendingIdentification(value: PendingIdentification) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
}

export function loadPendingIdentification(): PendingIdentification | null {
  const serialized = sessionStorage.getItem(PENDING_KEY);
  if (!serialized) return null;

  try {
    return pendingIdentificationSchema.parse(JSON.parse(serialized));
  } catch {
    sessionStorage.removeItem(PENDING_KEY);
    return null;
  }
}

export function clearPendingIdentification() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function saveConfirmedDiscovery(
  pending: PendingIdentification,
  transactionSignature: Signature,
) {
  const confirmed = confirmedDiscoverySchema.parse({
    version: 1,
    wallet: pending.wallet,
    identification: pending.identification,
    signature: transactionSignature,
  });
  sessionStorage.setItem(CONFIRMED_KEY, JSON.stringify(confirmed));
  clearPendingIdentification();
  return confirmed;
}

export function loadConfirmedDiscovery(): ConfirmedDiscovery | null {
  const serialized = sessionStorage.getItem(CONFIRMED_KEY);
  if (!serialized) return null;

  try {
    return confirmedDiscoverySchema.parse(JSON.parse(serialized));
  } catch {
    sessionStorage.removeItem(CONFIRMED_KEY);
    return null;
  }
}

export function parseTransactionSignature(
  value: string | null,
): Signature | null {
  return value && isSignature(value) ? value : null;
}

export function proofHashToBytes(proofHash: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/.test(proofHash)) {
    throw new Error(
      "The proof hash must be 32 bytes of lowercase hexadecimal.",
    );
  }

  return Uint8Array.from(
    Array.from({ length: 32 }, (_, index) =>
      Number.parseInt(proofHash.slice(index * 2, index * 2 + 2), 16),
    ),
  );
}
