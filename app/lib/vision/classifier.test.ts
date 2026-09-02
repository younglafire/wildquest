import { describe, expect, it } from "vitest";
import { classifyImage } from "./classifier";
import { InvalidImageError } from "./errors";

describe("classifyImage", () => {
  it("rejects bytes that cannot be decoded as an image before model inference", async () => {
    const corruptImage = new Blob(["not image data"], { type: "image/jpeg" });

    await expect(classifyImage(corruptImage)).rejects.toBeInstanceOf(
      InvalidImageError,
    );
  });
});
