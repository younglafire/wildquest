import { z } from "zod";
import { InvalidImageError, ModelUnavailableError } from "./errors";
import {
  InvalidModelOutputError,
  UnsupportedSpeciesError,
  type MappedClassification,
} from "./mapping";
import {
  identificationSchema,
  identifySuccessSchema,
  type Identification,
} from "./schema";
import type { IdentificationSpecies } from "./species";

export const MAX_IMAGE_BYTES = 4_000_000;
export const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type IdentifyDependencies = {
  classify: (image: Blob) => Promise<MappedClassification>;
  getSpecies: (speciesId: string) => Promise<IdentificationSpecies | null>;
};

type ErrorCode =
  | "INVALID_MULTIPART"
  | "IMAGE_REQUIRED"
  | "INVALID_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNSUPPORTED_SPECIES"
  | "MODEL_UNAVAILABLE"
  | "INTERNAL_OUTPUT_INVALID"
  | "INTERNAL_ERROR";

function errorResponse(code: ErrorCode, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

function createIdentification(
  classification: MappedClassification,
  species: IdentificationSpecies,
): Identification {
  return identificationSchema.parse({
    species_id: species.speciesId,
    common_name: species.commonName,
    confidence: classification.confidence,
    explanation: `ResNet-50 matched the ImageNet label "${classification.label}".`,
    rarity: species.rarity,
  });
}

export function createIdentifyHandler(dependencies: IdentifyDependencies) {
  return async function POST(request: Request): Promise<Response> {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return errorResponse(
        "INVALID_MULTIPART",
        "Use multipart/form-data with one image field.",
        415,
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse(
        "INVALID_MULTIPART",
        "The multipart request could not be parsed.",
        400,
      );
    }

    const images = formData.getAll("image");
    if (images.length !== 1 || typeof images[0] === "string") {
      return errorResponse(
        "IMAGE_REQUIRED",
        "Provide exactly one image file.",
        400,
      );
    }

    const image = images[0];
    if (image.size === 0) {
      return errorResponse("INVALID_IMAGE", "The image file is empty.", 400);
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return errorResponse(
        "IMAGE_TOO_LARGE",
        "The image must be 4,000,000 bytes or smaller.",
        413,
      );
    }

    if (!SUPPORTED_IMAGE_TYPES.has(image.type.toLowerCase())) {
      return errorResponse(
        "UNSUPPORTED_MEDIA_TYPE",
        "Supported image types are JPEG, PNG, and WebP.",
        415,
      );
    }

    try {
      const classification = await dependencies.classify(image);
      const species = await dependencies.getSpecies(classification.speciesId);

      if (!species) {
        return errorResponse(
          "INTERNAL_ERROR",
          "The identified species is missing from the catalogue.",
          500,
        );
      }

      const response = identifySuccessSchema.parse({
        identification: createIdentification(classification, species),
      });
      return Response.json(response);
    } catch (error) {
      if (error instanceof InvalidImageError) {
        return errorResponse("INVALID_IMAGE", error.message, 400);
      }

      if (error instanceof UnsupportedSpeciesError) {
        return Response.json(
          {
            error: {
              code: "UNSUPPORTED_SPECIES",
              message: "The image does not match a supported quest species.",
              prediction: {
                label: error.label,
                confidence: error.confidence,
              },
            },
          },
          { status: 422 },
        );
      }

      if (error instanceof ModelUnavailableError) {
        return errorResponse("MODEL_UNAVAILABLE", error.message, 503);
      }

      if (
        error instanceof InvalidModelOutputError ||
        error instanceof z.ZodError
      ) {
        return errorResponse(
          "INTERNAL_OUTPUT_INVALID",
          "The classifier produced an invalid result.",
          500,
        );
      }

      console.error("Image identification failed:", error);
      return errorResponse(
        "INTERNAL_ERROR",
        "Image identification failed.",
        500,
      );
    }
  };
}
