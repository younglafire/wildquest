update public.species
set target_for_quest = species_id in (
  'dog',
  'cat',
  'bee',
  'chicken',
  'butterfly',
  'dragonfly',
  'frog',
  'ant'
);
