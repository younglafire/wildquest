alter table public.discovery_cache
  add column if not exists perceptual_hash bit(64);

create index if not exists discovery_cache_perceptual_hash_idx
  on public.discovery_cache (perceptual_hash)
  where perceptual_hash is not null;

create or replace function public.reserve_discovery_image(
  p_wallet text,
  p_species_id bigint,
  p_grade integer,
  p_rarity text,
  p_proof_hash text,
  p_perceptual_hash bit(64),
  p_max_distance integer
)
returns table (accepted boolean, distance integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  matched_distance integer;
begin
  if btrim(p_wallet) = '' then
    raise exception 'Wallet is required' using errcode = '22023';
  end if;
  if p_species_id <= 0 then
    raise exception 'Species ID must be positive' using errcode = '22023';
  end if;
  if p_grade not between 1 and 3 then
    raise exception 'Grade must be between 1 and 3' using errcode = '22023';
  end if;
  if p_rarity not in ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary') then
    raise exception 'Rarity is invalid' using errcode = '22023';
  end if;
  if p_proof_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Proof hash must be lowercase SHA-256 hex' using errcode = '22023';
  end if;
  if p_max_distance not between 0 and 64 then
    raise exception 'Maximum distance must be between 0 and 64' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('wildquest.discovery_cache.perceptual_hash', 0)
  );

  select
    case
      when cache.proof_hash = p_proof_hash then 0
      else pg_catalog.bit_count(cache.perceptual_hash # p_perceptual_hash)::integer
    end
  into matched_distance
  from public.discovery_cache as cache
  where cache.proof_hash = p_proof_hash
     or (
       cache.perceptual_hash is not null
       and pg_catalog.bit_count(cache.perceptual_hash # p_perceptual_hash)
         <= p_max_distance
     )
  order by 1, cache.id
  limit 1;

  if found then
    return query select false, matched_distance;
    return;
  end if;

  insert into public.discovery_cache (
    wallet,
    species_id,
    grade,
    rarity,
    proof_hash,
    perceptual_hash,
    discovered_at
  ) values (
    p_wallet,
    p_species_id,
    p_grade,
    p_rarity,
    p_proof_hash,
    p_perceptual_hash,
    timezone('utc', statement_timestamp())
  );

  return query select true, null::integer;
end;
$$;

revoke execute on function public.reserve_discovery_image(
  text, bigint, integer, text, text, bit, integer
) from public, anon, authenticated;

grant execute on function public.reserve_discovery_image(
  text, bigint, integer, text, text, bit, integer
) to service_role;

grant select, insert on public.discovery_cache to service_role;
