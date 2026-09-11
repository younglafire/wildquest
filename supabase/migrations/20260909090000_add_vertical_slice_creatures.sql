alter table public.species
  add column if not exists model_class_id integer,
  add column if not exists capture_enabled boolean not null default false;

alter table public.species
  drop constraint if exists species_model_class_id_range,
  add constraint species_model_class_id_range
    check (model_class_id is null or model_class_id between 0 and 999);

create unique index if not exists species_model_class_id_key
  on public.species (model_class_id)
  where model_class_id is not null;

insert into public.species (
  id,
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
  source_url,
  model_class_id,
  capture_enabled
)
values
  (
    1001,
    'chihuahua',
    'Chihuahua',
    'Canis lupus familiaris',
    'Common',
    'Homes and urban environments',
    'A small companion dog represented by one exact ImageNet class in the battle slice.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chihuahua1_bvdb.jpg',
    null,
    true,
    50,
    jsonb_build_array('Chihuahuas are one of the smallest recognized dog breeds.'),
    null,
    false,
    'https://www.akc.org/dog-breeds/chihuahua/',
    151,
    true
  ),
  (
    1002,
    'golden_retriever',
    'Golden Retriever',
    'Canis lupus familiaris',
    'Common',
    'Homes, parks, and working environments',
    'A retriever breed represented by one exact ImageNet class in the battle slice.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Golden_Retriever_close_up.jpg',
    null,
    true,
    50,
    jsonb_build_array('Golden Retrievers were developed to retrieve game for hunters.'),
    null,
    false,
    'https://www.akc.org/dog-breeds/golden-retriever/',
    207,
    true
  ),
  (
    1003,
    'german_shepherd',
    'German Shepherd',
    'Canis lupus familiaris',
    'Common',
    'Homes and working environments',
    'A working dog breed represented by one exact ImageNet class in the battle slice.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/German_Shepherd_-_DSC_0346_(10096362833).jpg',
    null,
    true,
    50,
    jsonb_build_array('German Shepherds were developed as versatile herding and working dogs.'),
    null,
    false,
    'https://www.akc.org/dog-breeds/german-shepherd-dog/',
    235,
    true
  ),
  (
    1004,
    'tabby_cat',
    'Tabby Cat',
    'Felis catus',
    'Common',
    'Homes and urban environments',
    'A domestic cat with a tabby coat pattern represented by one exact ImageNet class.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Felis_catus.jpg',
    null,
    true,
    50,
    jsonb_build_array('Tabby describes a coat pattern rather than a single cat breed.'),
    null,
    false,
    'https://animaldiversity.org/accounts/Felis_catus/',
    281,
    true
  ),
  (
    1005,
    'persian_cat',
    'Persian Cat',
    'Felis catus',
    'Common',
    'Homes and indoor environments',
    'A long-haired domestic cat breed represented by one exact ImageNet class.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Persian_Cat.jpg',
    null,
    true,
    50,
    jsonb_build_array('Persian cats are known for their long coat and short muzzle.'),
    null,
    false,
    'https://cfa.org/breed/persian/',
    283,
    true
  ),
  (
    1006,
    'monarch_butterfly',
    'Monarch Butterfly',
    'Danaus plexippus',
    'Common',
    'Fields, gardens, and other milkweed habitats',
    'A milkweed butterfly represented by one exact ImageNet class in the battle slice.',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/A_monarch_butterfly.jpg',
    null,
    true,
    50,
    jsonb_build_array('Monarch caterpillars feed on milkweed plants.'),
    null,
    false,
    'https://animaldiversity.org/accounts/Danaus_plexippus/',
    323,
    true
  )
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
  capture_enabled = excluded.capture_enabled;

do $$
declare
  species_sequence text := pg_get_serial_sequence('public.species', 'id');
begin
  if species_sequence is not null then
    perform setval(
      species_sequence,
      greatest((select max(id) from public.species), 1006),
      true
    );
  end if;
end
$$;
