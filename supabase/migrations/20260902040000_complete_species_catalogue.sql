alter table public.species
  add column if not exists base_xp integer not null default 50,
  add column if not exists facts jsonb not null default '[]'::jsonb,
  add column if not exists quiz jsonb,
  add column if not exists target_for_quest boolean not null default false,
  add column if not exists source_url text;

create unique index if not exists species_species_id_key
  on public.species (species_id);

alter table public.species
  drop constraint if exists species_base_xp_positive,
  add constraint species_base_xp_positive check (base_xp > 0),
  drop constraint if exists species_facts_is_array,
  add constraint species_facts_is_array
    check (jsonb_typeof(facts) = 'array'),
  drop constraint if exists species_quiz_is_object,
  add constraint species_quiz_is_object
    check (quiz is null or jsonb_typeof(quiz) = 'object');

alter table public.species enable row level security;

drop policy if exists "Public can read active species" on public.species;
create policy "Public can read active species"
  on public.species
  for select
  to anon, authenticated
  using (is_active = true);

revoke insert, update, delete on public.species from anon, authenticated;
grant select on public.species to anon, authenticated;

create unique index if not exists discovery_cache_proof_hash_key
  on public.discovery_cache (proof_hash);

create index if not exists discovery_cache_wallet_species_idx
  on public.discovery_cache (wallet, species_id, discovered_at desc);

alter table public.discovery_cache enable row level security;

revoke all on public.discovery_cache from anon, authenticated;
