import { createHash } from "node:crypto";

export async function createImageProofHash(image: Blob): Promise<string> {
  const bytes = new Uint8Array(await image.arrayBuffer());
  return createHash("sha256").update(bytes).digest("hex");
}
