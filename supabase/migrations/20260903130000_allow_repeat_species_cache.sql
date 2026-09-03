alter table public.discovery_cache
  drop constraint if exists discovery_cache_wallet_species_id_key;

drop index if exists public.discovery_cache_wallet_species_id_key;

create index if not exists discovery_cache_wallet_species_idx
  on public.discovery_cache (wallet, species_id, discovered_at desc);
