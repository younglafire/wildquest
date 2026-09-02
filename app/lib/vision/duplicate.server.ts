import "server-only";

import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import {
  DuplicateCheckUnavailableError,
  parseDiscoveryReservationResult,
  type DiscoveryReservation,
  type DiscoveryReservationResult,
} from "./duplicate";
import { PERCEPTUAL_HASH_DISTANCE_THRESHOLD } from "./perceptual-hash";

export async function reserveDiscoveryImage(
  reservation: DiscoveryReservation,
): Promise<DiscoveryReservationResult> {
  try {
    const catalogueId = Number(reservation.catalogueId);
    if (!Number.isSafeInteger(catalogueId) || catalogueId <= 0) {
      throw new Error("Catalogue ID must be a positive safe integer.");
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("reserve_discovery_image", {
      p_wallet: reservation.wallet,
      p_species_id: catalogueId,
      p_grade: reservation.gradeCode,
      p_rarity: reservation.rarity,
      p_proof_hash: reservation.proofHash,
      p_perceptual_hash: reservation.perceptualHash,
      p_max_distance: PERCEPTUAL_HASH_DISTANCE_THRESHOLD,
    });

    if (error) throw error;
    return parseDiscoveryReservationResult(data);
  } catch (error) {
    throw new DuplicateCheckUnavailableError({ cause: error });
  }
}
