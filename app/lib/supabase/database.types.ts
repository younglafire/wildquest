// Generated from the linked Supabase project with:
// npx supabase gen types typescript --linked --schema public
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      discovery_cache: {
        Row: {
          discovered_at: string | null;
          grade: number;
          id: number;
          perceptual_hash: unknown;
          proof_hash: string | null;
          rarity: string;
          species_id: number;
          wallet: string;
        };
        Insert: {
          discovered_at?: string | null;
          grade: number;
          id?: number;
          perceptual_hash?: unknown;
          proof_hash?: string | null;
          rarity: string;
          species_id: number;
          wallet: string;
        };
        Update: {
          discovered_at?: string | null;
          grade?: number;
          id?: number;
          perceptual_hash?: unknown;
          proof_hash?: string | null;
          rarity?: string;
          species_id?: number;
          wallet?: string;
        };
        Relationships: [];
      };
      species: {
        Row: {
          base_xp: number;
          created_at: string | null;
          description: string | null;
          facts: Json;
          habitat: string | null;
          icon_url: string | null;
          id: number;
          image_url: string | null;
          is_active: boolean | null;
          name: string;
          quiz: Json | null;
          rarity: string;
          scientific_name: string | null;
          source_url: string | null;
          species_id: string;
          target_for_quest: boolean;
        };
        Insert: {
          base_xp?: number;
          created_at?: string | null;
          description?: string | null;
          facts?: Json;
          habitat?: string | null;
          icon_url?: string | null;
          id?: number;
          image_url?: string | null;
          is_active?: boolean | null;
          name: string;
          quiz?: Json | null;
          rarity: string;
          scientific_name?: string | null;
          source_url?: string | null;
          species_id: string;
          target_for_quest?: boolean;
        };
        Update: {
          base_xp?: number;
          created_at?: string | null;
          description?: string | null;
          facts?: Json;
          habitat?: string | null;
          icon_url?: string | null;
          id?: number;
          image_url?: string | null;
          is_active?: boolean | null;
          name?: string;
          quiz?: Json | null;
          rarity?: string;
          scientific_name?: string | null;
          source_url?: string | null;
          species_id?: string;
          target_for_quest?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      reserve_discovery_image: {
        Args: {
          p_grade: number;
          p_max_distance: number;
          p_perceptual_hash: unknown;
          p_proof_hash: string;
          p_rarity: string;
          p_species_id: number;
          p_wallet: string;
        };
        Returns: Array<{
          accepted: boolean;
          distance: number | null;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type SpeciesRow = Database["public"]["Tables"]["species"]["Row"];
export type DiscoveryCacheRow =
  Database["public"]["Tables"]["discovery_cache"]["Row"];
