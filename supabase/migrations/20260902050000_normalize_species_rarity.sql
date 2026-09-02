update public.species
set rarity = case lower(trim(rarity))
  when 'common' then 'Common'
  when 'uncommon' then 'Uncommon'
  when 'rare' then 'Rare'
  when 'epic' then 'Epic'
  when 'legendary' then 'Legendary'
  else rarity
end;

alter table public.species
  drop constraint if exists species_rarity_allowed,
  add constraint species_rarity_allowed
    check (rarity in ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'));
