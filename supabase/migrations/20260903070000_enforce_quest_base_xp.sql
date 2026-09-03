update public.species
set base_xp = 50
where target_for_quest
  and base_xp <> 50;

alter table public.species
  drop constraint if exists species_quest_base_xp,
  add constraint species_quest_base_xp
    check (not target_for_quest or base_xp = 50);
