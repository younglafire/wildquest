import { classifyImage } from "@/app/lib/vision/classifier";
import { reserveDiscoveryImage } from "@/app/lib/vision/duplicate.server";
import { createIdentifyHandler } from "@/app/lib/vision/handler";
import { createPerceptualImageHash } from "@/app/lib/vision/perceptual-hash";
import { createImageProofHash } from "@/app/lib/vision/proof";
import { analyzeCaptureQuality } from "@/app/lib/vision/quality";
import { createCaptureAuthorization } from "@/app/lib/vision/capture-authorization.server";
import { getIdentificationSpecies } from "@/app/lib/vision/species";
import { checkIdentifyRateLimit } from "@/app/lib/vision/rate-limit.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const identify = createIdentifyHandler({
  classify: classifyImage,
  getSpecies: getIdentificationSpecies,
  analyzeQuality: analyzeCaptureQuality,
  createProofHash: createImageProofHash,
  createPerceptualHash: createPerceptualImageHash,
  reserveDiscovery: reserveDiscoveryImage,
  createCaptureAuthorization,
  checkRateLimit: checkIdentifyRateLimit,
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const response = await identify(request);
  response.headers.set("X-Request-ID", requestId);
  console.info(
    JSON.stringify({
      event: "identify.completed",
      requestId,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
    }),
  );
  return response;
}
