update public.species
set
  image_url = case
    when species_id = 'chihuahua' then '/creatures/chihuahua.png'
    when species_id = 'golden_retriever' then '/creatures/golden_retriever.png'
    when species_id = 'german_shepherd' then '/creatures/german_shepherd.png'
    when species_id = 'staffordshire_bull_terrier' then '/creatures/staffordshire_bull_terrier.png'
    when species_id = 'toy_terrier' then '/creatures/toy_terrier.png'
    else image_url
  end
where species_id in (
  'chihuahua',
  'golden_retriever',
  'german_shepherd',
  'staffordshire_bull_terrier',
  'toy_terrier'
);
