import { describe, expect, it } from "vitest";
import {
  IMAGE_INPUT_ACCEPT,
  MAX_IMAGE_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
  validateImageUpload,
} from "./upload";

describe("image upload rules", () => {
  it("publishes the capture input contract", () => {
    expect(IMAGE_INPUT_ACCEPT).toBe(
      ".jpg,.jpeg,image/jpeg,image/jpg,image/png,image/webp",
    );
    expect(SUPPORTED_IMAGE_MIME_TYPES).toEqual([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);
    expect(MAX_IMAGE_BYTES).toBe(4_000_000);
  });

  it.each(SUPPORTED_IMAGE_MIME_TYPES)("accepts %s", (type) => {
    expect(validateImageUpload({ size: MAX_IMAGE_BYTES, type })).toEqual({
      valid: true,
    });
  });

  it.each([
    [0, "image/jpeg", "EMPTY_IMAGE"],
    [MAX_IMAGE_BYTES + 1, "image/jpeg", "IMAGE_TOO_LARGE"],
    [1, "image/heic", "UNSUPPORTED_MEDIA_TYPE"],
    [1, "", "UNSUPPORTED_MEDIA_TYPE"],
  ] as const)("rejects invalid upload metadata", (size, type, code) => {
    expect(validateImageUpload({ size, type })).toEqual({
      valid: false,
      code,
    });
  });
});
