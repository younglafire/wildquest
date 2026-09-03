import { describe, expect, it, vi } from "vitest";
import { DuplicateCheckUnavailableError } from "./duplicate";
import { InvalidImageError, ModelUnavailableError } from "./errors";
import { createIdentifyHandler, MAX_IMAGE_BYTES } from "./handler";
import {
  InvalidModelOutputError,
  type MappedClassification,
  UnsupportedSpeciesError,
} from "./mapping";
import { identificationSchema, identifySuccessSchema } from "./schema";

const classification: MappedClassification = {
  speciesId: "butterfly",
  confidence: 0.91,
  label: "monarch, monarch butterfly, milkweed butterfly, Danaus plexippus",
};

const PROOF_HASH =
  "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81";
const PERCEPTUAL_HASH = "01".repeat(32);
const WALLET = "11111111111111111111111111111111";
const GOLD_QUALITY = {
  sharpnessVariance: 200,
  centerLuminance: 128,
  centerEntropy: 6,
};

const species = {
  catalogueId: "8",
  speciesId: "butterfly",
  commonName: "Butterfly",
  rarity: "Common",
  baseXp: 50,
  facts: [
    "Butterfly wings are covered with thousands of tiny scales.",
    "Butterflies undergo complete metamorphosis.",
  ],
  targetForQuest: true,
};

const expectedIdentification = {
  catalogue_id: "8",
  species_id: "butterfly",
  common_name: "Butterfly",
  confidence: 0.91,
  explanation:
    'ResNet-50 matched the ImageNet label "monarch, monarch butterfly, milkweed butterfly, Danaus plexippus".',
  rarity: "Common",
  rarity_code: 0,
  base_xp: 50,
  facts: species.facts,
  target_for_quest: true,
  grade: "Gold",
  grade_code: 3,
  awarded_xp: 100,
  proof_hash: PROOF_HASH,
};

function multipartRequest(
  files: Array<File> = [],
  fieldName = "image",
  wallets: Array<FormDataEntryValue> = [WALLET],
) {
  const formData = new FormData();
  for (const file of files) formData.append(fieldName, file);
  for (const wallet of wallets) formData.append("wallet", wallet);

  return new Request("http://localhost/api/identify", {
    method: "POST",
    body: formData,
  });
}

function imageFile(
  bytes: BlobPart = new Uint8Array([1, 2, 3]),
  type = "image/jpeg",
) {
  return new File([bytes], "animal.jpg", { type });
}

function dependencies() {
  return {
    classify: vi.fn().mockResolvedValue(classification),
    getSpecies: vi.fn().mockResolvedValue(species),
    analyzeQuality: vi.fn().mockResolvedValue(GOLD_QUALITY),
    createProofHash: vi.fn().mockResolvedValue(PROOF_HASH),
    createPerceptualHash: vi.fn().mockResolvedValue(PERCEPTUAL_HASH),
    reserveDiscovery: vi.fn().mockResolvedValue({ duplicate: false }),
  };
}

async function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/identify", () => {
  it("returns a strictly validated identification response", async () => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );
    const body = await responseBody(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      identification: expectedIdentification,
    });
    expect(identificationSchema.safeParse(body.identification).success).toBe(
      true,
    );
    expect(identifySuccessSchema.safeParse(body).success).toBe(true);
    expect(deps.classify).toHaveBeenCalledOnce();
    expect(deps.getSpecies).toHaveBeenCalledWith("butterfly");
    expect(deps.analyzeQuality).toHaveBeenCalledOnce();
    expect(deps.createProofHash).toHaveBeenCalledOnce();
    expect(deps.createPerceptualHash).toHaveBeenCalledOnce();
    expect(deps.reserveDiscovery).toHaveBeenCalledWith({
      wallet: WALLET,
      catalogueId: "8",
      gradeCode: 3,
      rarity: "Common",
      proofHash: PROOF_HASH,
      perceptualHash: PERCEPTUAL_HASH,
    });
  });

  it("rejects extra fields in the response schema", () => {
    expect(
      identificationSchema.safeParse({
        ...expectedIdentification,
        extra: true,
      }).success,
    ).toBe(false);

    expect(
      identifySuccessSchema.safeParse({
        identification: expectedIdentification,
        extra: true,
      }).success,
    ).toBe(false);
  });

  it.each([
    ["missing", multipartRequest([])],
    ["wrong field", multipartRequest([imageFile()], "photo")],
    ["empty", multipartRequest([imageFile(new Uint8Array())])],
    ["multiple", multipartRequest([imageFile(), imageFile()])],
  ])("returns 400 for a %s image", async (_name, request) => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(request);

    expect(response.status).toBe(400);
    expect(deps.classify).not.toHaveBeenCalled();
  });

  it("returns 413 before inference for an oversized image", async () => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile(new Uint8Array(MAX_IMAGE_BYTES + 1))]),
    );

    expect(response.status).toBe(413);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "IMAGE_TOO_LARGE" },
    });
    expect(deps.classify).not.toHaveBeenCalled();
  });

  it("returns 415 before inference for an unsupported image MIME type", async () => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile(undefined, "image/heic")]),
    );

    expect(response.status).toBe(415);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "UNSUPPORTED_MEDIA_TYPE" },
    });
    expect(deps.classify).not.toHaveBeenCalled();
  });

  it("returns 415 when the request is not multipart", async () => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(
      new Request("http://localhost/api/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );

    expect(response.status).toBe(415);
    expect(deps.classify).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", []],
    ["empty", [""]],
    ["malformed", ["not-a-solana-address"]],
    ["multiple", [WALLET, WALLET]],
    ["file", [imageFile()]],
  ] as const)("returns 400 for a %s wallet", async (_name, wallets) => {
    const deps = dependencies();
    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()], "image", [...wallets]),
    );

    expect(response.status).toBe(400);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "INVALID_WALLET" },
    });
    expect(deps.classify).not.toHaveBeenCalled();
  });

  it("returns 422 before catalogue lookup when confidence is too low", async () => {
    const deps = dependencies();
    deps.classify.mockResolvedValue({
      ...classification,
      confidence: 0.699999,
    });

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(422);
    expect(await responseBody(response)).toEqual({
      error: {
        code: "LOW_CONFIDENCE",
        message: "The identification confidence is too low to claim.",
        confidence: 0.699999,
        minimum_confidence: 0.7,
      },
    });
    expect(deps.getSpecies).not.toHaveBeenCalled();
    expect(deps.analyzeQuality).not.toHaveBeenCalled();
    expect(deps.createProofHash).not.toHaveBeenCalled();
    expect(deps.createPerceptualHash).not.toHaveBeenCalled();
    expect(deps.reserveDiscovery).not.toHaveBeenCalled();
  });

  it("accepts the minimum confidence as a Bronze identification", async () => {
    const deps = dependencies();
    deps.classify.mockResolvedValue({
      ...classification,
      confidence: 0.7,
    });

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(200);
    expect(await responseBody(response)).toMatchObject({
      identification: {
        confidence: 0.7,
        target_for_quest: true,
        grade: "Bronze",
        grade_code: 1,
        awarded_xp: 50,
      },
    });
    expect(deps.getSpecies).toHaveBeenCalledWith("butterfly");
    expect(deps.createProofHash).toHaveBeenCalledOnce();
    expect(deps.reserveDiscovery).toHaveBeenCalledOnce();
  });

  it("downgrades a high-confidence low-quality capture to Bronze", async () => {
    const deps = dependencies();
    deps.analyzeQuality.mockResolvedValue({
      sharpnessVariance: 29.999,
      centerLuminance: 128,
      centerEntropy: 8,
    });

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(200);
    expect(await responseBody(response)).toMatchObject({
      identification: {
        confidence: 0.91,
        grade: "Bronze",
        grade_code: 1,
        awarded_xp: 50,
      },
    });
    expect(deps.reserveDiscovery).toHaveBeenCalledWith(
      expect.objectContaining({ gradeCode: 1 }),
    );
  });

  it("returns 422 before hashing for a quest-ineligible species", async () => {
    const deps = dependencies();
    deps.getSpecies.mockResolvedValue({
      ...species,
      targetForQuest: false,
    });

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(422);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "QUEST_INELIGIBLE" },
    });
    expect(deps.analyzeQuality).not.toHaveBeenCalled();
    expect(deps.createProofHash).not.toHaveBeenCalled();
    expect(deps.createPerceptualHash).not.toHaveBeenCalled();
    expect(deps.reserveDiscovery).not.toHaveBeenCalled();
  });

  it("returns 409 without identification data for a global duplicate", async () => {
    const deps = dependencies();
    deps.reserveDiscovery.mockResolvedValue({ duplicate: true, distance: 3 });

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(409);
    expect(await responseBody(response)).toEqual({
      error: {
        code: "DUPLICATE_IMAGE",
        message: "This photo has already been used for a discovery.",
        distance: 3,
      },
    });
    expect(deps.reserveDiscovery).toHaveBeenCalledOnce();
  });

  it("fails closed when the duplicate reservation is unavailable", async () => {
    const deps = dependencies();
    deps.reserveDiscovery.mockRejectedValue(
      new DuplicateCheckUnavailableError(),
    );

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(503);
    expect(await responseBody(response)).toEqual({
      error: {
        code: "DUPLICATE_CHECK_UNAVAILABLE",
        message: "The duplicate-image check is temporarily unavailable.",
      },
    });
  });

  it("returns 400 before proof generation when quality analysis fails", async () => {
    const deps = dependencies();
    deps.analyzeQuality.mockRejectedValue(new InvalidImageError());

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(400);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "INVALID_IMAGE" },
    });
    expect(deps.createProofHash).not.toHaveBeenCalled();
    expect(deps.createPerceptualHash).not.toHaveBeenCalled();
    expect(deps.reserveDiscovery).not.toHaveBeenCalled();
  });

  it.each([
    [new InvalidImageError(), 400, "INVALID_IMAGE"],
    [
      new UnsupportedSpeciesError("tench, Tinca tinca", 0.72),
      422,
      "UNSUPPORTED_SPECIES",
    ],
    [new InvalidModelOutputError("bad output"), 500, "INTERNAL_OUTPUT_INVALID"],
    [new ModelUnavailableError(), 503, "MODEL_UNAVAILABLE"],
  ])(
    "maps inference errors to their API status",
    async (error, status, code) => {
      const deps = dependencies();
      deps.classify.mockRejectedValue(error);
      const response = await createIdentifyHandler(deps)(
        multipartRequest([imageFile()]),
      );

      expect(response.status).toBe(status);
      expect(await responseBody(response)).toMatchObject({ error: { code } });
    },
  );

  it.each([
    ["catalogue ID", { catalogueId: "0" }],
    ["rarity", { rarity: "Mythic" }],
    ["base XP", { baseXp: 0 }],
    ["facts", { facts: [42] }],
  ])(
    "returns 500 when catalogue %s cannot satisfy the response schema",
    async (_field, metadata) => {
      const deps = dependencies();
      deps.getSpecies.mockResolvedValue({ ...species, ...metadata });

      const response = await createIdentifyHandler(deps)(
        multipartRequest([imageFile()]),
      );

      expect(response.status).toBe(500);
      expect(await responseBody(response)).toMatchObject({
        error: { code: "INTERNAL_OUTPUT_INVALID" },
      });
    },
  );

  it("returns 500 when the proof hash is invalid", async () => {
    const deps = dependencies();
    deps.createProofHash.mockResolvedValue("not-a-proof-hash");

    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(500);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "INTERNAL_OUTPUT_INVALID" },
    });
  });

  it("returns 500 when the classified species is absent from the catalogue", async () => {
    const deps = dependencies();
    deps.getSpecies.mockResolvedValue(null);
    const response = await createIdentifyHandler(deps)(
      multipartRequest([imageFile()]),
    );

    expect(response.status).toBe(500);
    expect(await responseBody(response)).toMatchObject({
      error: { code: "INTERNAL_ERROR" },
    });
    expect(deps.analyzeQuality).not.toHaveBeenCalled();
    expect(deps.createProofHash).not.toHaveBeenCalled();
    expect(deps.createPerceptualHash).not.toHaveBeenCalled();
    expect(deps.reserveDiscovery).not.toHaveBeenCalled();
  });
});
