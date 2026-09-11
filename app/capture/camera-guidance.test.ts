import { describe, expect, it } from "vitest";
import { getCameraGuidance } from "./camera-guidance";

function pixels(value: number) {
  const output = new Uint8ClampedArray(4 * 4 * 4);
  for (let index = 0; index < output.length; index += 4) {
    output[index] = value;
    output[index + 1] = value;
    output[index + 2] = value;
    output[index + 3] = 255;
  }
  return output;
}

describe("getCameraGuidance", () => {
  it("asks for brighter light from a dark frame", () => {
    expect(getCameraGuidance(pixels(20), null).guidance).toBe("add_light");
  });

  it("asks the player to hold still when the frame changed", () => {
    const first = getCameraGuidance(pixels(100), null);
    expect(getCameraGuidance(pixels(180), first.luma).guidance).toBe(
      "hold_still",
    );
  });

  it("allows scanning when two bright frames are stable", () => {
    const first = getCameraGuidance(pixels(180), null);
    expect(getCameraGuidance(pixels(180), first.luma).guidance).toBe("ready");
  });
});
