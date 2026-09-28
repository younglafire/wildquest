import { address } from "@solana/kit";
import { battleReplaySchema } from "@/app/lib/battle-replay";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ matchAddress: string }> },
) {
  const { matchAddress: rawMatchAddress } = await context.params;
  let matchAddress: string;
  try {
    matchAddress = address(rawMatchAddress);
  } catch {
    return Response.json({ error: "Invalid Match address." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("battle_replays")
    .select(
      "match_address, rules_version, balance_version, outcome, turn_count, result_hash, events",
    )
    .eq("match_address", matchAddress)
    .maybeSingle();
  if (error) {
    return Response.json(
      { error: "Battle replay is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const replay = battleReplaySchema.safeParse(data);
  if (!replay.success) {
    return Response.json(
      { error: "Battle replay was not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(replay.data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
