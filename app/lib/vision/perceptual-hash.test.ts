import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { InvalidImageError } from "./errors";
import {
  createPerceptualHashFromLuminance,
  createPerceptualImageHash,
  getPerceptualHashDistance,
  PERCEPTUAL_HASH_DISTANCE_THRESHOLD,
} from "./perceptual-hash";

const FIXTURE_DIRECTORY = path.join(
  process.cwd(),
  "app/lib/vision/__fixtures__",
);
const FIXTURE_NAMES = [
  "ant",
  "bee",
  "butterfly",
  "cat",
  "chicken",
  "dog",
  "dragonfly",
  "frog",
] as const;

async function fixtureBlob(name: (typeof FIXTURE_NAMES)[number]) {
  return new Blob(
    [
      Uint8Array.from(
        await readFile(path.join(FIXTURE_DIRECTORY, `${name}.jpg`)),
      ),
    ],
    {
      type: "image/jpeg",
    },
  );
}

describe("perceptual image hashing", () => {
  it("matches a SciPy ImageHash-compatible golden vector", () => {
    const pixels = Uint8Array.from({ length: 32 * 32 }, (_, index) => {
      const y = Math.floor(index / 32);
      const x = index % 32;
      return (x * 7 + y * 11 + ((x * y) % 17)) % 256;
    });

    expect(createPerceptualHashFromLuminance(pixels)).toBe(
      "1001011101001000100101000011111101100000001011010101111011111000",
    );
  });

  it("rejects a luminance buffer with the wrong dimensions", () => {
    expect(() => createPerceptualHashFromLuminance(new Uint8Array(63))).toThrow(
      "Expected 1024 luminance values.",
    );
  });

  it("counts Hamming distance and rejects malformed hashes", () => {
    const left = "0".repeat(64);
    const right = `${"1".repeat(5)}${"0".repeat(59)}`;

    expect(getPerceptualHashDistance(left, right)).toBe(5);
    expect(() => getPerceptualHashDistance(left, "01")).toThrow();
  });

  it("keeps resized and recompressed copies within the duplicate threshold", async () => {
    const original = await readFile(path.join(FIXTURE_DIRECTORY, "dog.jpg"));
    const transformed = await sharp(original)
      .resize({ width: 720, withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toBuffer();

    const originalHash = await createPerceptualImageHash(
      new Blob([Uint8Array.from(original)], { type: "image/jpeg" }),
    );
    const transformedHash = await createPerceptualImageHash(
      new Blob([Uint8Array.from(transformed)], { type: "image/jpeg" }),
    );

    expect(
      getPerceptualHashDistance(originalHash, transformedHash),
    ).toBeLessThanOrEqual(PERCEPTUAL_HASH_DISTANCE_THRESHOLD);
  });

  it("normalizes EXIF orientation before hashing", async () => {
    const source = await sharp({
      create: {
        width: 80,
        height: 40,
        channels: 3,
        background: "white",
      },
    })
      .composite([
        {
          input: Buffer.from(
            '<svg width="25" height="15"><rect width="25" height="15" fill="black"/></svg>',
          ),
          left: 5,
          top: 4,
        },
      ])
      .png()
      .toBuffer();
    const tagged = await sharp(source)
      .withMetadata({ orientation: 6 })
      .jpeg({ quality: 95 })
      .toBuffer();
    const physicallyRotated = await sharp(source)
      .rotate(90)
      .jpeg({ quality: 95 })
      .toBuffer();

    const taggedHash = await createPerceptualImageHash(
      new Blob([Uint8Array.from(tagged)], { type: "image/jpeg" }),
    );
    const rotatedHash = await createPerceptualImageHash(
      new Blob([Uint8Array.from(physicallyRotated)], { type: "image/jpeg" }),
    );

    expect(
      getPerceptualHashDistance(taggedHash, rotatedHash),
    ).toBeLessThanOrEqual(PERCEPTUAL_HASH_DISTANCE_THRESHOLD);
  });

  it("keeps unrelated catalogue fixtures outside the duplicate threshold", async () => {
    const hashes = new Map<string, string>();
    for (const name of FIXTURE_NAMES) {
      hashes.set(
        name,
        await createPerceptualImageHash(await fixtureBlob(name)),
      );
    }

    for (let leftIndex = 0; leftIndex < FIXTURE_NAMES.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < FIXTURE_NAMES.length;
        rightIndex += 1
      ) {
        const left = hashes.get(FIXTURE_NAMES[leftIndex])!;
        const right = hashes.get(FIXTURE_NAMES[rightIndex])!;
        expect(getPerceptualHashDistance(left, right)).toBeGreaterThan(
          PERCEPTUAL_HASH_DISTANCE_THRESHOLD,
        );
      }
    }
  });

  it("rejects corrupt bytes without writing them anywhere", async () => {
    await expect(
      createPerceptualImageHash(
        new Blob(["not image data"], { type: "image/jpeg" }),
      ),
    ).rejects.toBeInstanceOf(InvalidImageError);
  });
});
