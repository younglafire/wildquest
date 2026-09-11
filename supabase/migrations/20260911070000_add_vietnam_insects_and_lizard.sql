insert into public.species (
  id, species_id, name, scientific_name, rarity, habitat, description,
  image_url, icon_url, is_active, base_xp, facts, quiz, target_for_quest,
  source_url, model_class_id, capture_enabled, card_summary, origin_region,
  battle_role, icon_attribution_url, icon_license
)
values
  (1037, 'grasshopper', 'Grasshopper', 'Caelifera spp.', 'Common', 'Rice fields, gardens, grasslands, and farms', 'A jumping plant-eating insect common in grassy habitats.', null, '/creatures/insect.svg', true, 50, '["Grasshoppers launch powerful jumps with enlarged hind legs."]'::jsonb, null, false, 'https://en.wikipedia.org/wiki/Grasshopper', 311, true, 'A lightning-fast field scout that acts before almost every rival.', 'Worldwide grasslands, including Vietnam', 'Scout', null, 'WildQuest original'),
  (1038, 'cricket', 'Cricket', 'Gryllidae spp.', 'Common', 'Gardens, fields, farms, and buildings', 'A nocturnal jumping insect whose chirp is familiar across Vietnam.', null, '/creatures/insect.svg', true, 50, '["Male crickets chirp by rubbing specialized parts of their wings together."]'::jsonb, null, false, 'https://en.wikipedia.org/wiki/Cricket_(insect)', 312, true, 'A nimble night skirmisher protected by a light shell.', 'Worldwide, including Vietnam', 'Skirmisher', null, 'WildQuest original'),
  (1039, 'praying_mantis', 'Praying Mantis', 'Mantodea spp.', 'Common', 'Gardens, shrubs, farms, and forest edges', 'An ambush predator with folded grasping forelegs.', null, '/creatures/insect.svg', true, 50, '["A mantis can rotate its head widely while watching moving prey."]'::jsonb, null, false, 'https://en.wikipedia.org/wiki/Mantis', 315, true, 'A patient ambush striker with the hardest insect attack.', 'Tropical and temperate regions, including Vietnam', 'Striker', null, 'WildQuest original'),
  (1040, 'garden_lizard', 'Garden Lizard', 'Calotes versicolor', 'Common', 'Gardens, parks, farms, walls, and forest edges', 'A sun-loving agamid lizard often seen climbing trunks and fences.', null, '/creatures/lizard.svg', true, 50, '["Garden lizards can change body coloration during displays and temperature changes."]'::jsonb, null, false, 'https://en.wikipedia.org/wiki/Oriental_garden_lizard', 42, true, 'A balanced climber with sharp reactions and a scaled defense.', 'South and Southeast Asia, including Vietnam', 'Balanced', null, 'WildQuest original')
on conflict (species_id) do update set
  id = excluded.id,
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
  source_url = excluded.source_url,
  model_class_id = excluded.model_class_id,
  capture_enabled = excluded.capture_enabled,
  card_summary = excluded.card_summary,
  origin_region = excluded.origin_region,
  battle_role = excluded.battle_role,
  icon_attribution_url = excluded.icon_attribution_url,
  icon_license = excluded.icon_license;

select setval(
  pg_get_serial_sequence('public.species', 'id'),
  greatest((select max(id) from public.species), 1040),
  true
);
