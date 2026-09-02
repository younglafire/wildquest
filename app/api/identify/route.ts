import { classifyImage } from "@/app/lib/vision/classifier";
import { reserveDiscoveryImage } from "@/app/lib/vision/duplicate.server";
import { createIdentifyHandler } from "@/app/lib/vision/handler";
import { createPerceptualImageHash } from "@/app/lib/vision/perceptual-hash";
import { createImageProofHash } from "@/app/lib/vision/proof";
import { getIdentificationSpecies } from "@/app/lib/vision/species";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = createIdentifyHandler({
  classify: classifyImage,
  getSpecies: getIdentificationSpecies,
  createProofHash: createImageProofHash,
  createPerceptualHash: createPerceptualImageHash,
  reserveDiscovery: reserveDiscoveryImage,
});
