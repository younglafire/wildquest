import { classifyImage } from "@/app/lib/vision/classifier";
import { createIdentifyHandler } from "@/app/lib/vision/handler";
import { getIdentificationSpecies } from "@/app/lib/vision/species";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = createIdentifyHandler({
  classify: classifyImage,
  getSpecies: getIdentificationSpecies,
});
