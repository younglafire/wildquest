import { describe, expect, it, vi } from "vitest";
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

const species = {
  speciesId: "butterfly",
  commonName: "Butterfly",
  rarity: "Common",
};

function multipartRequest(files: File[] = [], fieldName = "image") {
  const formData = new FormData();
  for (const file of files) formData.append(fieldName, file);

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
      identification: {
        species_id: "butterfly",
        common_name: "Butterfly",
        confidence: 0.91,
        explanation:
          'ResNet-50 matched the ImageNet label "monarch, monarch butterfly, milkweed butterfly, Danaus plexippus".',
        rarity: "Common",
      },
    });
    expect(identificationSchema.safeParse(body.identification).success).toBe(
      true,
    );
    expect(identifySuccessSchema.safeParse(body).success).toBe(true);
    expect(deps.classify).toHaveBeenCalledOnce();
    expect(deps.getSpecies).toHaveBeenCalledWith("butterfly");
  });

  it("rejects extra fields in the response schema", () => {
    expect(
      identificationSchema.safeParse({
        species_id: "bee",
        common_name: "Bee",
        confidence: 0.8,
        explanation: 'ResNet-50 matched the ImageNet label "bee".',
        rarity: "Common",
        extra: true,
      }).success,
    ).toBe(false);

    expect(
      identifySuccessSchema.safeParse({
        identification: {
          species_id: "bee",
          common_name: "Bee",
          confidence: 0.8,
          explanation: 'ResNet-50 matched the ImageNet label "bee".',
          rarity: "Common",
        },
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

  it("returns 500 when catalogue metadata cannot satisfy the response schema", async () => {
    const deps = dependencies();
    deps.getSpecies.mockResolvedValue({ ...species, rarity: "Mythic" });
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
  });
});
