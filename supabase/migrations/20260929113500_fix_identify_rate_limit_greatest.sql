create or replace function public.consume_api_rate_limit(
  p_bucket_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_timestamp timestamptz := pg_catalog.clock_timestamp();
  window_start timestamptz;
  updated_count integer;
begin
  if p_bucket_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Bucket hash must be lowercase SHA-256 hex' using errcode = '22023';
  end if;
  if p_limit not between 1 and 10000 then
    raise exception 'Limit is outside the supported range' using errcode = '22023';
  end if;
  if p_window_seconds not between 1 and 86400 then
    raise exception 'Window is outside the supported range' using errcode = '22023';
  end if;

  window_start := pg_catalog.to_timestamp(
    pg_catalog.floor(extract(epoch from request_timestamp) / p_window_seconds)
      * p_window_seconds
  );

  insert into public.api_rate_limits (bucket_hash, window_started_at, request_count)
  values (p_bucket_hash, window_start, 1)
  on conflict (bucket_hash, window_started_at)
  do update set request_count = public.api_rate_limits.request_count + 1
  returning request_count into updated_count;

  delete from public.api_rate_limits
  where window_started_at < request_timestamp - pg_catalog.make_interval(secs => p_window_seconds * 2);

  return query select
    updated_count <= p_limit,
    case
      when updated_count <= p_limit then 0
      else greatest(
        1,
        pg_catalog.ceil(
          extract(epoch from window_start + pg_catalog.make_interval(secs => p_window_seconds) - request_timestamp)
        )::integer
      )
    end;
end;
$$;

revoke execute on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;
