update public.species as species
set
  base_xp = catalogue.base_xp,
  facts = catalogue.facts,
  quiz = catalogue.quiz,
  target_for_quest = catalogue.target_for_quest,
  source_url = catalogue.source_url
from (
  values
    (
      'dog',
      50,
      jsonb_build_array(
        'Domestic dogs are descendants of gray wolves.',
        'Dogs communicate through body posture, scent, and vocal sounds.',
        'Selective breeding has produced dogs with a very wide range of sizes and shapes.'
      ),
      jsonb_build_object(
        'question', 'Which wild animal is the closest ancestor of domestic dogs?',
        'options', jsonb_build_array('Gray wolf', 'Red fox', 'Spotted hyena'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Canis_lupus_familiaris/'
    ),
    (
      'cat',
      50,
      jsonb_build_array(
        'Domestic cats use scent marking to communicate territorial boundaries.',
        'Hook-like papillae on a cat''s tongue help it groom its fur.',
        'Cats have retractable claws and a flexible spine that supports climbing and jumping.'
      ),
      jsonb_build_object(
        'question', 'What helps a cat''s tongue comb and clean its fur?',
        'options', jsonb_build_array('Hook-like papillae', 'Flat teeth', 'Smooth scales'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Felis_catus/'
    ),
    (
      'bee',
      50,
      jsonb_build_array(
        'Honey bees collect nectar and pollen from flowers.',
        'Worker bees build wax comb with cells used for raising larvae and storing food.',
        'Honey bees can warm their hive by working their flight muscles.'
      ),
      jsonb_build_object(
        'question', 'What material do honey bees use to build their comb?',
        'options', jsonb_build_array('Wax', 'Mud', 'Leaves'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Apis_mellifera/'
    ),
    (
      'rat',
      50,
      jsonb_build_array(
        'Brown rats are mostly active at night or around dusk.',
        'They are excellent swimmers and often live close to water.',
        'Their strong sense of smell helps them find food and recognize other rats.'
      ),
      jsonb_build_object(
        'question', 'Which sense is especially important to a brown rat?',
        'options', jsonb_build_array('Smell', 'Color vision', 'Taste alone'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Rattus_norvegicus/'
    ),
    (
      'chicken',
      50,
      jsonb_build_array(
        'Domestic chickens descended mainly from red junglefowl.',
        'Chickens are ground-dwelling birds that scratch the soil while foraging.',
        'Their diet can include seeds, fruit, and small invertebrates.'
      ),
      jsonb_build_object(
        'question', 'Which wild bird is the main ancestor of domestic chickens?',
        'options', jsonb_build_array('Red junglefowl', 'Rock pigeon', 'House sparrow'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Gallus_gallus/'
    ),
    (
      'pigeon',
      50,
      jsonb_build_array(
        'Feral city pigeons descend from rock doves that nest on cliffs.',
        'Tall buildings provide ledges similar to the rock dove''s natural cliff habitat.',
        'Rock pigeons feed mainly on seeds and often forage on open ground.'
      ),
      jsonb_build_object(
        'question', 'What natural habitat do city buildings resemble for rock pigeons?',
        'options', jsonb_build_array('Rocky cliffs', 'Open ocean', 'Underground caves'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Columba_livia/'
    ),
    (
      'house_sparrow',
      50,
      jsonb_build_array(
        'House sparrows thrive in farms, residential areas, and cities.',
        'They usually forage on the ground and move by hopping.',
        'Both parents incubate the eggs and feed their young.'
      ),
      jsonb_build_object(
        'question', 'Where do house sparrows commonly thrive?',
        'options', jsonb_build_array('Human-modified areas', 'Deep uninhabited forests', 'Open ocean'),
        'correctOptionIndex', 0
      ),
      true,
      'https://animaldiversity.org/accounts/Passer_domesticus/'
    ),
    (
      'butterfly',
      50,
      jsonb_build_array(
        'Butterfly wings are covered with thousands of tiny scales.',
        'Butterflies undergo complete metamorphosis: egg, caterpillar, pupa, and adult.',
        'An adult butterfly uses a coiled proboscis to sip nectar and other liquids.'
      ),
      jsonb_build_object(
        'question', 'Which stage comes directly before an adult butterfly?',
        'options', jsonb_build_array('Pupa', 'Egg', 'Tadpole'),
        'correctOptionIndex', 0
      ),
      true,
      'https://naturalhistory.si.edu/education/teaching-resources/life-science/butterflies-and-beyond'
    ),
    (
      'dragonfly',
      50,
      jsonb_build_array(
        'Young dragonflies, called nymphs, live in water.',
        'Dragonfly nymphs and adults are predators that eat other animals.',
        'Dragonflies develop from nymphs into adults without a pupal stage.'
      ),
      jsonb_build_object(
        'question', 'Where does a young dragonfly nymph live?',
        'options', jsonb_build_array('In water', 'Inside dry wood', 'Only in flower petals'),
        'correctOptionIndex', 0
      ),
      true,
      'https://www.nhm.ac.uk/discover/dragonflies-the-ultimate-hunters.html'
    ),
    (
      'house_gecko',
      50,
      jsonb_build_array(
        'Common house geckos are nocturnal and often hunt near artificial lights.',
        'Adhesive toe pads help them climb walls and ceilings.',
        'They mainly eat insects, spiders, and other small animals.'
      ),
      jsonb_build_object(
        'question', 'Why are house geckos often seen near lights at night?',
        'options', jsonb_build_array('Lights attract insect prey', 'They need light to sleep', 'They eat the light bulbs'),
        'correctOptionIndex', 0
      ),
      false,
      'https://animaldiversity.org/accounts/Hemidactylus_frenatus/'
    ),
    (
      'frog',
      50,
      jsonb_build_array(
        'Frogs belong to the amphibian order Anura.',
        'Adult frogs do not have tails, which is reflected in the name Anura.',
        'Frogs occur worldwide except Antarctica, extreme northern regions, and many oceanic islands.'
      ),
      jsonb_build_object(
        'question', 'Which feature is typical of an adult frog?',
        'options', jsonb_build_array('No tail', 'Feathered wings', 'A hard shell'),
        'correctOptionIndex', 0
      ),
      true,
      'https://amphibiansoftheworld.amnh.org/Amphibia/Anura'
    ),
    (
      'ant',
      50,
      jsonb_build_array(
        'Ants are social insects that live and work together in colonies.',
        'Ant colonies can contain queens, workers, soldiers, and developing young.',
        'Chemical signals are a major part of how ants communicate.'
      ),
      jsonb_build_object(
        'question', 'How do ants commonly organize their lives?',
        'options', jsonb_build_array('In social colonies', 'As solitary fish', 'In bird flocks'),
        'correctOptionIndex', 0
      ),
      true,
      'https://australian.museum/learn/animals/insects/ants-family-formicidae/'
    )
) as catalogue(
  species_id,
  base_xp,
  facts,
  quiz,
  target_for_quest,
  source_url
)
where species.species_id = catalogue.species_id;
