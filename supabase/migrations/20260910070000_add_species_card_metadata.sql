alter table public.species
  add column if not exists card_summary text,
  add column if not exists origin_region text,
  add column if not exists battle_role text,
  add column if not exists icon_attribution_url text,
  add column if not exists icon_license text;

alter table public.species
  drop constraint if exists species_card_summary_length,
  add constraint species_card_summary_length
    check (card_summary is null or char_length(btrim(card_summary)) between 1 and 220),
  drop constraint if exists species_origin_region_not_blank,
  add constraint species_origin_region_not_blank
    check (origin_region is null or char_length(btrim(origin_region)) > 0),
  drop constraint if exists species_battle_role_value,
  add constraint species_battle_role_value
    check (
      battle_role is null
      or battle_role in ('Balanced', 'Guardian', 'Scout', 'Skirmisher', 'Striker')
    ),
  drop constraint if exists species_icon_attribution_url_not_blank,
  add constraint species_icon_attribution_url_not_blank
    check (
      icon_attribution_url is null
      or char_length(btrim(icon_attribution_url)) > 0
    ),
  drop constraint if exists species_icon_license_not_blank,
  add constraint species_icon_license_not_blank
    check (icon_license is null or char_length(btrim(icon_license)) > 0);

comment on column public.species.card_summary is
  'Short player-facing creature-card copy. Battle outcomes must not depend on this field.';
comment on column public.species.origin_region is
  'Player-facing origin or range text for the creature card.';
comment on column public.species.battle_role is
  'Player-facing role label. Authoritative battle stats remain in the SpeciesConfig account.';
comment on column public.species.icon_attribution_url is
  'Attribution or source page for icon_url when the asset license requires it.';
comment on column public.species.icon_license is
  'Human-readable license label for icon_url.';

update public.species
set
  card_summary = case species_id
    when 'chihuahua' then 'Small, alert, and fearless. This Mexico-linked companion moves before heavier rivals can react.'
    when 'golden_retriever' then 'A friendly working dog developed in Scotland to retrieve game. It brings steady health to a team.'
    when 'german_shepherd' then 'A versatile working dog developed in Germany and often trained for police and service work.'
    when 'tabby_cat' then 'Tabby describes a coat pattern rather than one breed. This familiar cat fights as a quick skirmisher.'
    when 'persian_cat' then 'Known for a long coat and short muzzle, this calm guardian relies on defense and shield.'
    when 'monarch_butterfly' then 'A milkweed butterfly known for long seasonal migrations. It wins initiative with exceptional speed.'
    else card_summary
  end,
  origin_region = case species_id
    when 'chihuahua' then 'Mexico'
    when 'golden_retriever' then 'Scotland'
    when 'german_shepherd' then 'Germany'
    when 'tabby_cat' then 'Worldwide domestic populations'
    when 'persian_cat' then 'Persia (modern-day Iran)'
    when 'monarch_butterfly' then 'North America'
    else origin_region
  end,
  battle_role = case species_id
    when 'chihuahua' then 'Scout'
    when 'golden_retriever' then 'Balanced'
    when 'german_shepherd' then 'Striker'
    when 'tabby_cat' then 'Skirmisher'
    when 'persian_cat' then 'Guardian'
    when 'monarch_butterfly' then 'Scout'
    else battle_role
  end
where species_id in (
  'chihuahua',
  'golden_retriever',
  'german_shepherd',
  'tabby_cat',
  'persian_cat',
  'monarch_butterfly'
);

-- The supplied Flaticon example requires attribution. Record the source and
-- license now, but do not hotlink or claim an icon asset until it is downloaded
-- and served by WildQuest in the follow-up icon task.
update public.species
set
  icon_attribution_url = 'https://www.flaticon.com/free-icon/german-shepherd_3013786',
  icon_license = 'Flaticon Free License (attribution required)'
where species_id = 'german_shepherd';
