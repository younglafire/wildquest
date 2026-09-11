import { randomBytes } from "node:crypto";
import { address } from "@solana/kit";
import { createCaptureAuthorization } from "@/app/lib/vision/capture-authorization.server";
import { captureTransactionSchema } from "@/app/lib/vision/schema";
import { canGenerateFor, generationEnabled, verifyGenerateChallenge } from "@/app/lib/admin/generate-auth";
import { generateSignedRequestSchema } from "@/app/lib/admin/generate-schema";
import { createSolanaClient } from "@/app/lib/solana-client";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { fetchMaybeCreature, fetchMaybeSpeciesConfig, findCreaturePda, findSpeciesConfigPda } from "@/app/generated/wildquest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  return Response.json({ enabled: query.get("cluster") === "devnet" && canGenerateFor(query.get("wallet") ?? "") }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!generationEnabled()) {
    return Response.json(
      {
        error: {
          code: "UNAVAILABLE",
          message: "Creature generation is disabled.",
        },
      },
      { status: 404 },
    );
  }

  const parsed = generateSignedRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success || !verifyGenerateChallenge(parsed.data, new URL(request.url).origin)) {
    return Response.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "This wallet is not allowed to generate Devnet Creatures.",
        },
      },
      { status: 403 },
    );
  }

  try {
    const client = createSolanaClient("devnet");
    if (await client.rpc.getGenesisHash().send() !== "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG") {
      throw new Error("Generation requires Devnet.");
    }
    const catalogueId = BigInt(parsed.data.catalogue_id);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("species")
      .select("id").eq("id", Number(catalogueId))
      .eq("is_active", true).eq("capture_enabled", true).maybeSingle();
    if (error) throw error;
    const [speciesAddress] = await findSpeciesConfigPda({ catalogueId });
    const config = await fetchMaybeSpeciesConfig(client.rpc, speciesAddress, { commitment: "confirmed" });
    if (!data || !config.exists || !config.data.active || config.data.catalogueId !== catalogueId) {
      return Response.json({ error: { message: "This Creature is not available for generation." } }, { status: 422 });
    }
    const [creatureAddress] = await findCreaturePda({ owner: address(parsed.data.wallet), catalogueId });
    if ((await fetchMaybeCreature(client.rpc, creatureAddress, { commitment: "confirmed" })).exists) {
      return Response.json({ error: { message: "You already own this Creature. Refresh your collection." } }, { status: 409 });
    }
    const proofHash = randomBytes(32).toString("hex");
    const captureTransaction = captureTransactionSchema.parse(
      await createCaptureAuthorization({
        owner: parsed.data.wallet,
        catalogueId: parsed.data.catalogue_id,
        proofHash,
      }),
    );
    return Response.json({
      catalogue_id: parsed.data.catalogue_id,
      capture_transaction: captureTransaction,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      {
        error: {
          code: "UNAVAILABLE",
          message: "Creature generation is temporarily unavailable.",
        },
      },
      { status: 503 },
    );
  }
}
