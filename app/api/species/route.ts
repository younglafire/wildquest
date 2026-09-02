import { NextResponse } from "next/server";
import { mapSpeciesRow } from "@/app/lib/species";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const includeInactive =
      new URL(request.url).searchParams.get("includeInactive") === "true";

    let query = supabase.from("species").select("*").order("name");
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to query species:", error);
      return NextResponse.json(
        { error: "Unable to load the species catalogue." },
        { status: 502 },
      );
    }

    return NextResponse.json({ species: data.map(mapSpeciesRow) });
  } catch (error) {
    console.error("Species API configuration error:", error);
    return NextResponse.json(
      { error: "Species API is not configured." },
      { status: 500 },
    );
  }
}
