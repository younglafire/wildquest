import { NextResponse } from "next/server";
import { mapSpeciesRow } from "@/app/lib/species";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ speciesId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { speciesId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("species")
      .select("*")
      .eq("species_id", speciesId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error(`Failed to query species ${speciesId}:`, error);
      return NextResponse.json(
        { error: "Unable to load the species." },
        { status: 502 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Species not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ species: mapSpeciesRow(data) });
  } catch (error) {
    console.error("Species API configuration error:", error);
    return NextResponse.json(
      { error: "Species API is not configured." },
      { status: 500 },
    );
  }
}
