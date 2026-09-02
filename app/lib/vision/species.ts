import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import {
  mapIdentificationSpecies,
  type IdentificationSpecies,
} from "./catalogue";

export async function getIdentificationSpecies(
  speciesId: string,
): Promise<IdentificationSpecies | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("species")
    .select("id, species_id, name, rarity, base_xp, facts, target_for_quest")
    .eq("species_id", speciesId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load identification species metadata.", {
      cause: error,
    });
  }

  if (!data) return null;
  return mapIdentificationSpecies(data);
}
