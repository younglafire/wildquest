import { z } from "zod";
import { isAddress } from "@solana/kit";
import type { IdentificationSpecies } from "./catalogue";
import {
  DuplicateCheckUnavailableError,
  type DiscoveryReservation,
  type DiscoveryReservationResult,
} from "./duplicate";
import {
  InvalidCatalogueMetadataError,
  InvalidImageError,
  ModelUnavailableError,
} from "./errors";
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
import {
  getCaptureReward,
  getRarityCode,
  MIN_IDENTIFICATION_CONFIDENCE,
  type CaptureReward,
} from "./rules";
import type { CaptureQualityMeasurements } from "./quality";
import { validateImageUpload } from "./upload";

type IdentifyDependencies = {
  classify: (image: Blob) => Promise<MappedClassification>;
  getSpecies: (speciesId: string) => Promise<IdentificationSpecies | null>;
  createProofHash: (image: Blob) => Promise<string>;
  analyzeQuality: (image: Blob) => Promise<CaptureQualityMeasurements>;
  createPerceptualHash: (image: Blob) => Promise<string>;
  reserveDiscovery: (
    reservation: DiscoveryReservation,
  ) => Promise<DiscoveryReservationResult>;
};

type ErrorCode =
  | "INVALID_MULTIPART"
  | "IMAGE_REQUIRED"
  | "INVALID_WALLET"
  | "INVALID_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNSUPPORTED_SPECIES"
  | "LOW_CONFIDENCE"
  | "QUEST_INELIGIBLE"
  | "DUPLICATE_IMAGE"
  | "DUPLICATE_CHECK_UNAVAILABLE"
  | "MODEL_UNAVAILABLE"
  | "INTERNAL_OUTPUT_INVALID"
  | "INTERNAL_ERROR";

function errorResponse(code: ErrorCode, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

function createIdentification(
  classification: MappedClassification,
  species: IdentificationSpecies,
  quality: CaptureQualityMeasurements,
  proofHash: string,
): Identification {
  let reward: CaptureReward;
  try {
    reward = getCaptureReward(
      classification.confidence,
      quality,
      species.baseXp,
    );
  } catch (error) {
    throw new InvalidCatalogueMetadataError(
      "The species catalogue contains invalid reward metadata.",
      { cause: error },
    );
  }

  return identificationSchema.parse({
    catalogue_id: species.catalogueId,
    species_id: species.speciesId,
    common_name: species.commonName,
    confidence: classification.confidence,
    explanation: `ResNet-50 matched the ImageNet label "${classification.label}".`,
    rarity: species.rarity,
    rarity_code: getRarityCode(species.rarity),
    base_xp: species.baseXp,
    facts: species.facts,
    target_for_quest: species.targetForQuest,
    grade: reward.grade,
    grade_code: reward.gradeCode,
    awarded_xp: reward.awardedXp,
    proof_hash: proofHash,
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

    const wallets = formData.getAll("wallet");
    if (
      wallets.length !== 1 ||
      typeof wallets[0] !== "string" ||
      !isAddress(wallets[0])
    ) {
      return errorResponse(
        "INVALID_WALLET",
        "Provide exactly one valid Solana wallet address.",
        400,
      );
    }
    const wallet = wallets[0];

    const uploadValidation = validateImageUpload(image);
    if (!uploadValidation.valid && uploadValidation.code === "EMPTY_IMAGE") {
      return errorResponse("INVALID_IMAGE", "The image file is empty.", 400);
    }

    if (
      !uploadValidation.valid &&
      uploadValidation.code === "IMAGE_TOO_LARGE"
    ) {
      return errorResponse(
        "IMAGE_TOO_LARGE",
        "The image must be 4,000,000 bytes or smaller.",
        413,
      );
    }

    if (
      !uploadValidation.valid &&
      uploadValidation.code === "UNSUPPORTED_MEDIA_TYPE"
    ) {
      return errorResponse(
        "UNSUPPORTED_MEDIA_TYPE",
        "Supported image types are JPEG, PNG, and WebP.",
        415,
      );
    }

    try {
      const classification = await dependencies.classify(image);
      if (classification.confidence < MIN_IDENTIFICATION_CONFIDENCE) {
        return Response.json(
          {
            error: {
              code: "LOW_CONFIDENCE",
              message: "The identification confidence is too low to claim.",
              confidence: classification.confidence,
              minimum_confidence: MIN_IDENTIFICATION_CONFIDENCE,
            },
          },
          { status: 422 },
        );
      }

      const species = await dependencies.getSpecies(classification.speciesId);

      if (!species) {
        return errorResponse(
          "INTERNAL_ERROR",
          "The identified species is missing from the catalogue.",
          500,
        );
      }

      if (!species.targetForQuest) {
        return errorResponse(
          "QUEST_INELIGIBLE",
          "The identified species is not eligible for the current quest.",
          422,
        );
      }

      const quality = await dependencies.analyzeQuality(image);
      const proofHash = await dependencies.createProofHash(image);

      const response = identifySuccessSchema.parse({
        identification: createIdentification(
          classification,
          species,
          quality,
          proofHash,
        ),
      });

      const perceptualHash = await dependencies.createPerceptualHash(image);
      const reservation = await dependencies.reserveDiscovery({
        wallet,
        catalogueId: response.identification.catalogue_id,
        gradeCode: response.identification.grade_code,
        rarity: response.identification.rarity,
        proofHash: response.identification.proof_hash,
        perceptualHash,
      });

      if (reservation.duplicate) {
        return Response.json(
          {
            error: {
              code: "DUPLICATE_IMAGE",
              message: "This photo has already been used for a discovery.",
              distance: reservation.distance,
            },
          },
          { status: 409 },
        );
      }

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

      if (error instanceof DuplicateCheckUnavailableError) {
        return errorResponse("DUPLICATE_CHECK_UNAVAILABLE", error.message, 503);
      }

      if (
        error instanceof InvalidModelOutputError ||
        error instanceof InvalidCatalogueMetadataError ||
        error instanceof z.ZodError
      ) {
        return errorResponse(
          "INTERNAL_OUTPUT_INVALID",
          "The identification result could not be validated.",
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
