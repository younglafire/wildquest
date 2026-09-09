// @vitest-environment jsdom

import { address, getBase58Decoder } from "@solana/kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingIdentification,
  createPendingIdentification,
  identifyImage,
  loadPendingIdentification,
  parseTransactionSignature,
  proofHashToBytes,
  savePendingIdentification,
} from "./expedition";
import type { Identification } from "./vision/schema";
import { WILDQUEST_PROGRAM_ADDRESS } from "../generated/wildquest";

const wallet = address("11111111111111111111111111111111");
const identification: Identification = {
  catalogue_id: "3",
  species_id: "bee",
  common_name: "Bee",
  model_class_id: 309,
  model_label: "bee",
  balance_version: 1,
  confidence: 0.85,
  explanation: 'ResNet-50 matched the ImageNet label "bee".',
  rarity: "Common",
  rarity_code: 0,
  base_xp: 50,
  facts: ["Honey bees collect nectar and pollen from flowers."],
  target_for_quest: true,
  capture_enabled: true,
  grade: "Silver",
  grade_code: 2,
  awarded_xp: 75,
  proof_hash:
    "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81",
};
const captureTransaction = {
  program_id: WILDQUEST_PROGRAM_ADDRESS,
  transaction_base64: "partially-signed-transaction",
  last_valid_block_height: "123456",
} as const;

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("expedition client contract", () => {
  it("submits one image and wallet and validates the response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        identification,
        capture_transaction: captureTransaction,
      }),
    );
    const image = new File([new Uint8Array([1, 2, 3])], "bee.jpg", {
      type: "image/jpeg",
    });

    await expect(identifyImage(image, wallet)).resolves.toEqual({
      identification,
      captureTransaction,
    });
    const [, init] = fetchMock.mock.calls[0];
    const formData = init?.body as FormData;
    expect(formData.get("image")).toBe(image);
    expect(formData.get("wallet")).toBe(wallet);
  });

  it("rejects malformed successful output", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        identification: { ...identification, extra: true },
        capture_transaction: captureTransaction,
      }),
    );
    const image = new File([new Uint8Array([1])], "bee.jpg", {
      type: "image/jpeg",
    });

    await expect(identifyImage(image, wallet)).rejects.toThrow();
  });

  it("persists only validated result metadata in the current tab", () => {
    const pending = createPendingIdentification(
      wallet,
      identification,
      captureTransaction,
    );
    savePendingIdentification(pending);

    expect(loadPendingIdentification()).toEqual(pending);
    const serialized = sessionStorage.getItem(
      "wildquest:pending-identification:v2",
    );
    expect(serialized).toContain('"species_id":"bee"');
    expect(serialized).not.toContain("bee.jpg");

    clearPendingIdentification();
    expect(loadPendingIdentification()).toBeNull();
  });

  it("converts a validated SHA-256 proof to exactly 32 bytes", () => {
    const bytes = proofHashToBytes(identification.proof_hash);
    expect(bytes).toHaveLength(32);
    expect(Array.from(bytes.slice(0, 4))).toEqual([3, 144, 88, 198]);
    expect(() => proofHashToBytes("ABC")).toThrow(/32 bytes/);
  });

  it("accepts only structurally valid transaction signatures", () => {
    const transactionSignature = getBase58Decoder().decode(
      new Uint8Array(64).fill(7),
    );
    expect(parseTransactionSignature(transactionSignature)).toBe(
      transactionSignature,
    );
    expect(parseTransactionSignature("not-a-signature")).toBeNull();
  });
});
