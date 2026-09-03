export const MAX_IMAGE_BYTES = 4_000_000;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_INPUT_ACCEPT = SUPPORTED_IMAGE_MIME_TYPES.join(",");

export const SUPPORTED_IMAGE_TYPES = new Set<string>(
  SUPPORTED_IMAGE_MIME_TYPES,
);

export type ImageUploadValidation =
  | { valid: true }
  | {
      valid: false;
      code: "EMPTY_IMAGE" | "IMAGE_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE";
    };

export function validateImageUpload(file: {
  size: number;
  type: string;
}): ImageUploadValidation {
  if (file.size === 0) {
    return { valid: false, code: "EMPTY_IMAGE" };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, code: "IMAGE_TOO_LARGE" };
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return { valid: false, code: "UNSUPPORTED_MEDIA_TYPE" };
  }

  return { valid: true };
}
