import sharp from "sharp";
import { InvalidImageError } from "./errors";

const HASH_SIZE = 8;
const HIGH_FREQUENCY_FACTOR = 4;
const IMAGE_SIZE = HASH_SIZE * HIGH_FREQUENCY_FACTOR;
const HASH_PATTERN = /^[01]{64}$/;

export const PERCEPTUAL_HASH_DISTANCE_THRESHOLD = 5;

const cosineTable = Array.from({ length: IMAGE_SIZE }, (_, frequency) =>
  Array.from({ length: IMAGE_SIZE }, (_, position) =>
    Math.cos((Math.PI * frequency * (2 * position + 1)) / (2 * IMAGE_SIZE)),
  ),
);

function median(values: Array<number>): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = sorted.length / 2;
  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

export function createPerceptualHashFromLuminance(pixels: Uint8Array): string {
  if (pixels.length !== IMAGE_SIZE * IMAGE_SIZE) {
    throw new Error(`Expected ${IMAGE_SIZE * IMAGE_SIZE} luminance values.`);
  }

  const verticalTransform = new Float64Array(pixels.length);
  for (let frequencyY = 0; frequencyY < IMAGE_SIZE; frequencyY += 1) {
    for (let x = 0; x < IMAGE_SIZE; x += 1) {
      let coefficient = 0;
      for (let y = 0; y < IMAGE_SIZE; y += 1) {
        coefficient += pixels[y * IMAGE_SIZE + x] * cosineTable[frequencyY][y];
      }
      verticalTransform[frequencyY * IMAGE_SIZE + x] = 2 * coefficient;
    }
  }

  const lowFrequencyCoefficients: Array<number> = [];
  for (let frequencyY = 0; frequencyY < HASH_SIZE; frequencyY += 1) {
    for (let frequencyX = 0; frequencyX < HASH_SIZE; frequencyX += 1) {
      let coefficient = 0;
      for (let x = 0; x < IMAGE_SIZE; x += 1) {
        coefficient +=
          verticalTransform[frequencyY * IMAGE_SIZE + x] *
          cosineTable[frequencyX][x];
      }
      lowFrequencyCoefficients.push(2 * coefficient);
    }
  }

  const middle = median(lowFrequencyCoefficients);
  return lowFrequencyCoefficients
    .map((coefficient) => (coefficient > middle ? "1" : "0"))
    .join("");
}

export async function createPerceptualImageHash(image: Blob): Promise<string> {
  try {
    const input = Buffer.from(await image.arrayBuffer());
    const { data, info } = await sharp(input, { failOn: "error" })
      .autoOrient()
      .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "fill", kernel: "lanczos3" })
      .removeAlpha()
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (
      info.width !== IMAGE_SIZE ||
      info.height !== IMAGE_SIZE ||
      info.channels !== 1
    ) {
      throw new InvalidImageError();
    }

    return createPerceptualHashFromLuminance(new Uint8Array(data));
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError();
  }
}

export function getPerceptualHashDistance(left: string, right: string): number {
  if (!HASH_PATTERN.test(left) || !HASH_PATTERN.test(right)) {
    throw new Error("Perceptual hashes must contain exactly 64 binary digits.");
  }

  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }
  return distance;
}
