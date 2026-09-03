import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { InvalidImageError } from "./errors";
import {
  analyzeCaptureQuality,
  measureCaptureQualityFromLuminance,
} from "./quality";
import { getCaptureQualityGrade } from "./rules";

const FIXTURE_DIRECTORY = path.join(
  process.cwd(),
  "app/lib/vision/__fixtures__",
);

function imageBlob(bytes: Uint8Array) {
  return new Blob([Uint8Array.from(bytes)], { type: "image/jpeg" });
}

describe("capture quality analysis", () => {
  it("measures a uniform luminance image deterministically", () => {
    const quality = measureCaptureQualityFromLuminance(
      new Uint8Array(25).fill(128),
      5,
      5,
    );

    expect(quality).toEqual({
      sharpnessVariance: 0,
      centerLuminance: 128,
      centerEntropy: 0,
    });
  });

  it("rejects inconsistent luminance dimensions", () => {
    expect(() =>
      measureCaptureQualityFromLuminance(new Uint8Array(24), 5, 5),
    ).toThrow("Luminance dimensions are invalid.");
  });

  it("grades a normal fixture as Gold", async () => {
    const original = Uint8Array.from(
      await readFile(path.join(FIXTURE_DIRECTORY, "butterfly.jpg")),
    );

    expect(
      getCaptureQualityGrade(await analyzeCaptureQuality(imageBlob(original))),
    ).toBe("Gold");
  });

  it.each([
    ["blurred", (input: Buffer) => sharp(input).blur(8).jpeg().toBuffer()],
    [
      "darkened",
      (input: Buffer) =>
        sharp(input).modulate({ brightness: 0.2 }).jpeg().toBuffer(),
    ],
    [
      "overexposed",
      (input: Buffer) =>
        sharp(input).modulate({ brightness: 2 }).jpeg().toBuffer(),
    ],
  ])("downgrades a %s fixture to Bronze", async (_name, transform) => {
    const original = await readFile(
      path.join(FIXTURE_DIRECTORY, "butterfly.jpg"),
    );
    const transformed = Uint8Array.from(await transform(original));

    expect(
      getCaptureQualityGrade(
        await analyzeCaptureQuality(imageBlob(transformed)),
      ),
    ).toBe("Bronze");
  });

  it("rejects corrupt image bytes", async () => {
    await expect(
      analyzeCaptureQuality(
        imageBlob(new TextEncoder().encode("not an image")),
      ),
    ).rejects.toBeInstanceOf(InvalidImageError);
  });
});
