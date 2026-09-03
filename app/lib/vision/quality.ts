import sharp from "sharp";
import { InvalidImageError } from "./errors";

const ANALYSIS_IMAGE_SIZE = 256;
const CENTER_CROP_MARGIN_RATIO = 0.2;
const LUMINANCE_VALUE_COUNT = 256;

export type CaptureQualityMeasurements = {
  sharpnessVariance: number;
  centerLuminance: number;
  centerEntropy: number;
};

function calculateEntropy(histogram: Uint32Array, sampleCount: number) {
  let entropy = 0;
  for (const count of histogram) {
    if (count === 0) continue;
    const probability = count / sampleCount;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

export function measureCaptureQualityFromLuminance(
  pixels: Uint8Array,
  width: number,
  height: number,
): CaptureQualityMeasurements {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 3 ||
    height < 3 ||
    pixels.length !== width * height
  ) {
    throw new Error("Luminance dimensions are invalid.");
  }

  let laplacianSum = 0;
  let laplacianSquaredSum = 0;
  let laplacianCount = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const laplacian =
        pixels[index - width] +
        pixels[index - 1] -
        4 * pixels[index] +
        pixels[index + 1] +
        pixels[index + width];
      laplacianSum += laplacian;
      laplacianSquaredSum += laplacian * laplacian;
      laplacianCount += 1;
    }
  }

  const laplacianMean = laplacianSum / laplacianCount;
  const sharpnessVariance =
    laplacianSquaredSum / laplacianCount - laplacianMean * laplacianMean;

  const left = Math.floor(width * CENTER_CROP_MARGIN_RATIO);
  const right = Math.ceil(width * (1 - CENTER_CROP_MARGIN_RATIO));
  const top = Math.floor(height * CENTER_CROP_MARGIN_RATIO);
  const bottom = Math.ceil(height * (1 - CENTER_CROP_MARGIN_RATIO));
  const histogram = new Uint32Array(LUMINANCE_VALUE_COUNT);
  let centerLuminanceSum = 0;
  let centerPixelCount = 0;

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const luminance = pixels[y * width + x];
      histogram[luminance] += 1;
      centerLuminanceSum += luminance;
      centerPixelCount += 1;
    }
  }

  return {
    sharpnessVariance,
    centerLuminance: centerLuminanceSum / centerPixelCount,
    centerEntropy: calculateEntropy(histogram, centerPixelCount),
  };
}

export async function analyzeCaptureQuality(
  image: Blob,
): Promise<CaptureQualityMeasurements> {
  try {
    const input = Buffer.from(await image.arrayBuffer());
    const { data, info } = await sharp(input, { failOn: "error" })
      .autoOrient()
      .resize({
        width: ANALYSIS_IMAGE_SIZE,
        height: ANALYSIS_IMAGE_SIZE,
        fit: "inside",
        withoutEnlargement: false,
        kernel: "lanczos3",
      })
      .removeAlpha()
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels !== 1) throw new InvalidImageError();

    return measureCaptureQualityFromLuminance(
      new Uint8Array(data),
      info.width,
      info.height,
    );
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError();
  }
}
