import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase
      .from("species")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase health check failed:", error);
      return NextResponse.json(
        { status: "unhealthy", database: "unreachable" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      speciesCount: count ?? 0,
    });
  } catch (error) {
    console.error("Supabase health check configuration error:", error);
    return NextResponse.json(
      { status: "unhealthy", database: "not_configured" },
      { status: 500 },
    );
  }
}
