insert into public.species (
  species_id,
  name,
  scientific_name,
  rarity,
  habitat,
  description,
  image_url,
  icon_url,
  is_active,
  base_xp,
  facts,
  quiz,
  target_for_quest,
  source_url
)
values (
  'common_house_gecko',
  'Asian House Gecko',
  'Hemidactylus frenatus',
  'Common',
  'Urban buildings and gardens in Ho Chi Minh City',
  'A small nocturnal gecko commonly seen on walls near lights, where it hunts insects.',
  null,
  null,
  true,
  50,
  jsonb_build_array(
    'Asian house geckos are most active at night.',
    'Their adhesive toe pads help them climb walls and ceilings.',
    'They are insectivores and often forage near artificial lights.'
  ),
  jsonb_build_object(
    'question', 'When is the Asian house gecko most active?',
    'options', jsonb_build_array('During the night', 'At midday', 'Only at sunrise'),
    'correctOptionIndex', 0
  ),
  true,
  'https://animaldiversity.org/accounts/Hemidactylus_frenatus/'
)
on conflict (species_id) do update set
  name = excluded.name,
  scientific_name = excluded.scientific_name,
  rarity = excluded.rarity,
  habitat = excluded.habitat,
  description = excluded.description,
  image_url = excluded.image_url,
  icon_url = excluded.icon_url,
  is_active = excluded.is_active,
  base_xp = excluded.base_xp,
  facts = excluded.facts,
  quiz = excluded.quiz,
  target_for_quest = excluded.target_for_quest,
  source_url = excluded.source_url;
