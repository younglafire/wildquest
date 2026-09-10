update public.species
set
  icon_url = case
    when species_id in ('chihuahua', 'golden_retriever', 'german_shepherd') then '/creatures/dog.svg'
    when species_id in ('tabby_cat', 'persian_cat') then '/creatures/cat.svg'
    when species_id = 'monarch_butterfly' then '/creatures/butterfly.svg'
    else icon_url
  end,
  icon_attribution_url = null,
  icon_license = 'Original WildQuest SVG'
where species_id in (
  'chihuahua',
  'golden_retriever',
  'german_shepherd',
  'tabby_cat',
  'persian_cat',
  'monarch_butterfly'
);
