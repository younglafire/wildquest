import {
  generationEnabled,
  issueGenerateChallenge,
} from "@/app/lib/admin/generate-auth";
import { generateRequestSchema } from "@/app/lib/admin/generate-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!generationEnabled())
    return Response.json(
      { error: { message: "Creature generation is disabled." } },
      { status: 404 },
    );
  const input = generateRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success)
    return Response.json(
      { error: { message: "Invalid Devnet generation request." } },
      { status: 400 },
    );
  return Response.json(
    issueGenerateChallenge(input.data, new URL(request.url).origin),
    { headers: { "Cache-Control": "no-store" } },
  );
}
