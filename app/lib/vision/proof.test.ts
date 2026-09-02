import { describe, expect, it } from "vitest";
import { createImageProofHash } from "./proof";

describe("image proof hash", () => {
  it("returns the SHA-256 digest of the original upload bytes", async () => {
    const image = new Blob([new Uint8Array([1, 2, 3])], {
      type: "image/jpeg",
    });

    await expect(createImageProofHash(image)).resolves.toBe(
      "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81",
    );
  });

  it("is deterministic and changes when the uploaded bytes change", async () => {
    const first = new Blob([new Uint8Array([11, 22, 33])]);
    const same = new Blob([new Uint8Array([11, 22, 33])]);
    const different = new Blob([new Uint8Array([11, 22, 34])]);

    const [firstHash, sameHash, differentHash] = await Promise.all([
      createImageProofHash(first),
      createImageProofHash(same),
      createImageProofHash(different),
    ]);

    expect(firstHash).toMatch(/^[0-9a-f]{64}$/);
    expect(sameHash).toBe(firstHash);
    expect(differentHash).not.toBe(firstHash);
  });
});
