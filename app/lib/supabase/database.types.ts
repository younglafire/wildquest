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
      battle_replays: {
        Row: {
          balance_version: number;
          events: Json;
          match_address: string;
          outcome: string;
          result_hash: string;
          rules_version: number;
          settled_at: string;
          turn_count: number;
        };
        Insert: {
          balance_version: number;
          events: Json;
          match_address: string;
          outcome: string;
          result_hash: string;
          rules_version: number;
          settled_at?: string;
          turn_count: number;
        };
        Update: {
          balance_version?: number;
          events?: Json;
          match_address?: string;
          outcome?: string;
          result_hash?: string;
          rules_version?: number;
          settled_at?: string;
          turn_count?: number;
        };
        Relationships: [];
      };
      battle_room_states: {
        Row: {
          expires_at: string;
          match_address: string;
          sequence: number;
          state: Json;
          updated_at: string;
        };
        Insert: {
          expires_at: string;
          match_address: string;
          sequence: number;
          state: Json;
          updated_at?: string;
        };
        Update: {
          expires_at?: string;
          match_address?: string;
          sequence?: number;
          state?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
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
          battle_role: string | null;
          card_summary: string | null;
          capture_enabled: boolean;
          created_at: string | null;
          description: string | null;
          facts: Json;
          habitat: string | null;
          icon_url: string | null;
          icon_attribution_url: string | null;
          icon_license: string | null;
          id: number;
          image_url: string | null;
          is_active: boolean | null;
          model_class_id: number | null;
          name: string;
          origin_region: string | null;
          quiz: Json | null;
          rarity: string;
          scientific_name: string | null;
          source_url: string | null;
          species_id: string;
          target_for_quest: boolean;
        };
        Insert: {
          base_xp?: number;
          battle_role?: string | null;
          card_summary?: string | null;
          capture_enabled?: boolean;
          created_at?: string | null;
          description?: string | null;
          facts?: Json;
          habitat?: string | null;
          icon_url?: string | null;
          icon_attribution_url?: string | null;
          icon_license?: string | null;
          id?: number;
          image_url?: string | null;
          is_active?: boolean | null;
          model_class_id?: number | null;
          name: string;
          origin_region?: string | null;
          quiz?: Json | null;
          rarity: string;
          scientific_name?: string | null;
          source_url?: string | null;
          species_id: string;
          target_for_quest?: boolean;
        };
        Update: {
          base_xp?: number;
          battle_role?: string | null;
          card_summary?: string | null;
          capture_enabled?: boolean;
          created_at?: string | null;
          description?: string | null;
          facts?: Json;
          habitat?: string | null;
          icon_url?: string | null;
          icon_attribution_url?: string | null;
          icon_license?: string | null;
          id?: number;
          image_url?: string | null;
          is_active?: boolean | null;
          model_class_id?: number | null;
          name?: string;
          origin_region?: string | null;
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
      consume_api_rate_limit: {
        Args: {
          p_bucket_hash: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: Array<{
          allowed: boolean;
          retry_after_seconds: number;
        }>;
      };
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
      save_battle_room_state: {
        Args: {
          p_expires_at: string;
          p_match_address: string;
          p_sequence: number;
          p_state: Json;
        };
        Returns: undefined;
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
