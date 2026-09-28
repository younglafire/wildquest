create table if not exists public.battle_room_states (
  match_address text primary key,
  sequence bigint not null check (sequence >= 0),
  state jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.battle_room_states enable row level security;
revoke all on public.battle_room_states from anon, authenticated;
grant all on public.battle_room_states to service_role;

create table if not exists public.battle_replays (
  match_address text primary key,
  rules_version integer not null,
  balance_version integer not null,
  outcome text not null check (outcome in ('creator', 'opponent', 'tie')),
  turn_count integer not null check (turn_count between 1 and 30),
  result_hash text not null check (result_hash ~ '^[0-9a-f]{64}$'),
  events jsonb not null,
  settled_at timestamptz not null default now()
);

alter table public.battle_replays enable row level security;
revoke all on public.battle_replays from anon, authenticated;
grant select on public.battle_replays to anon, authenticated;
grant select, insert on public.battle_replays to service_role;

drop policy if exists "Battle replays are publicly readable" on public.battle_replays;
create policy "Battle replays are publicly readable"
on public.battle_replays for select
to anon, authenticated
using (true);

create or replace function public.save_battle_room_state(
  p_match_address text,
  p_sequence bigint,
  p_state jsonb,
  p_expires_at timestamptz
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.battle_room_states (
    match_address,
    sequence,
    state,
    expires_at,
    updated_at
  ) values (
    p_match_address,
    p_sequence,
    p_state,
    p_expires_at,
    pg_catalog.now()
  )
  on conflict (match_address) do update
  set sequence = excluded.sequence,
      state = excluded.state,
      expires_at = excluded.expires_at,
      updated_at = pg_catalog.now()
  where public.battle_room_states.sequence <= excluded.sequence;
$$;

revoke all on function public.save_battle_room_state(text, bigint, jsonb, timestamptz)
from public, anon, authenticated;
grant execute on function public.save_battle_room_state(text, bigint, jsonb, timestamptz)
to service_role;

create index if not exists battle_room_states_expires_at_idx
on public.battle_room_states (expires_at);
