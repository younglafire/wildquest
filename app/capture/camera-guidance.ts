export type CameraGuidance = "searching" | "add_light" | "hold_still" | "ready";

const MINIMUM_BRIGHTNESS = 50;
const MAXIMUM_FRAME_CHANGE = 18;

export function getCameraGuidance(
  pixels: Uint8ClampedArray,
  previousLuma: Uint8Array | null,
): { guidance: CameraGuidance; luma: Uint8Array } {
  if (!pixels.length || pixels.length % 4 !== 0) {
    return { guidance: "searching", luma: new Uint8Array() };
  }
  if (previousLuma?.length !== pixels.length / 4) previousLuma = null;
  const luma = new Uint8Array(pixels.length / 4);
  let brightnessTotal = 0;
  let frameChangeTotal = 0;

  for (
    let pixelIndex = 0, lumaIndex = 0;
    pixelIndex < pixels.length;
    pixelIndex += 4, lumaIndex += 1
  ) {
    const value = Math.round(
      pixels[pixelIndex] * 0.2126 +
        pixels[pixelIndex + 1] * 0.7152 +
        pixels[pixelIndex + 2] * 0.0722,
    );
    luma[lumaIndex] = value;
    brightnessTotal += value;
    if (previousLuma)
      frameChangeTotal += Math.abs(value - previousLuma[lumaIndex]);
  }

  const averageBrightness = brightnessTotal / luma.length;
  if (averageBrightness < MINIMUM_BRIGHTNESS) {
    return { guidance: "add_light", luma };
  }
  if (!previousLuma) return { guidance: "searching", luma };

  const averageFrameChange = frameChangeTotal / luma.length;
  return {
    guidance:
      averageFrameChange > MAXIMUM_FRAME_CHANGE ? "hold_still" : "ready",
    luma,
  };
}
