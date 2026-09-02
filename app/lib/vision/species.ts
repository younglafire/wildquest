import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseRarity, type Rarity } from "@/app/lib/species";

export type IdentificationSpecies = {
  speciesId: string;
  commonName: string;
  rarity: Rarity;
};

export async function getIdentificationSpecies(
  speciesId: string,
): Promise<IdentificationSpecies | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("species")
    .select("species_id, name, rarity")
    .eq("species_id", speciesId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load identification species metadata.", {
      cause: error,
    });
  }

  if (!data) return null;

  return {
    speciesId: data.species_id,
    commonName: data.name,
    rarity: parseRarity(data.rarity),
  };
}
