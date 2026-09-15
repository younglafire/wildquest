alter table public.species
  drop constraint if exists species_battle_role_value;

alter table public.species
  add constraint species_battle_role_value
    check (
      battle_role is null
      or battle_role in (
        'Balanced', 'Brawler', 'Controller', 'Energizer',
        'Guardian', 'Skirmisher', 'Striker', 'Support'
      )
    );

update public.species
set battle_role = case id
  when 1001 then 'Skirmisher' when 1002 then 'Support'
  when 1003 then 'Balanced' when 1004 then 'Skirmisher'
  when 1005 then 'Guardian' when 1006 then 'Striker'
  when 1007 then 'Balanced' when 1008 then 'Guardian'
  when 1009 then 'Brawler' when 1010 then 'Skirmisher'
  when 1011 then 'Striker' when 1012 then 'Controller'
  when 1013 then 'Striker' when 1014 then 'Skirmisher'
  when 1015 then 'Brawler' when 1016 then 'Balanced'
  when 1017 then 'Support' when 1018 then 'Controller'
  when 1019 then 'Skirmisher' when 1020 then 'Guardian'
  when 1021 then 'Brawler' when 1022 then 'Guardian'
  when 1023 then 'Support' when 1024 then 'Controller'
  when 1025 then 'Striker' when 1026 then 'Balanced'
  when 1027 then 'Striker' when 1028 then 'Energizer'
  when 1029 then 'Striker' when 1030 then 'Skirmisher'
  when 1031 then 'Controller' when 1032 then 'Support'
  when 1033 then 'Guardian' when 1034 then 'Energizer'
  when 1035 then 'Brawler' when 1036 then 'Guardian'
  when 1037 then 'Skirmisher' when 1038 then 'Support'
  when 1039 then 'Striker' when 1040 then 'Balanced'
  else battle_role
end,
card_summary = case id
  when 1028 then 'A fragile colony fighter with cheap actions and the roster strongest Recharge.'
  when 1036 then 'The roster toughest guardian, trading slow mana recovery for exceptional durability.'
  else regexp_replace(
    regexp_replace(coalesce(card_summary, ''), '\mspeed\M', 'mana timing', 'gi'),
    '\mshield\M', 'Guard', 'gi'
  )
end
where id between 1001 and 1040;
