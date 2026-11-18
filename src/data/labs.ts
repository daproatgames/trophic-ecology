import type { TopicId } from '../types';

export interface MemoryDeck {
  id: string;
  name: string;
  topic: TopicId;
  description: string;
  pairs: { id: string; term: string; match: string }[];
}

export const MEMORY_DECKS: MemoryDeck[] = [
  {
    id: 'memory-foundations',
    name: 'Ecosystem Basics',
    topic: 'foundations',
    description: 'Match each term with its definition.',
    pairs: [
      { id: 'm1', term: 'Ecosystem', match: 'Biotic + abiotic factors interacting' },
      { id: 'm2', term: 'Population', match: 'One species in an area' },
      { id: 'm3', term: 'Community', match: 'All species in an area' },
      { id: 'm4', term: 'Habitat', match: 'The physical area a species lives in' },
      { id: 'm5', term: 'Niche', match: 'A species\' role and interactions' },
      { id: 'm6', term: 'Keystone species', match: 'Disproportionate control on the ecosystem' },
      { id: 'm7', term: 'Biosphere', match: 'Zone of life across all spheres' },
      { id: 'm8', term: 'Abiotic', match: 'Non-living factor such as sunlight' },
    ],
  },
  {
    id: 'memory-foodwebs',
    name: 'Feeding Relationships',
    topic: 'foodwebs',
    description: 'Match the ecology term to its meaning.',
    pairs: [
      { id: 'm9', term: 'Producer', match: 'Makes food by photosynthesis' },
      { id: 'm10', term: 'Primary consumer', match: 'Eats a producer' },
      { id: 'm11', term: 'Secondary consumer', match: 'Eats a primary consumer' },
      { id: 'm12', term: 'Decomposer', match: 'Breaks down dead remains and wastes' },
      { id: 'm13', term: 'Food web', match: 'Interconnected food chains' },
      { id: 'm14', term: '10% rule', match: 'Energy transfer efficiency between levels' },
      { id: 'm15', term: 'Trophic level', match: 'Position along a food chain' },
      { id: 'm16', term: 'Food chain', match: 'One sequence of feeding and energy transfer' },
    ],
  },
  {
    id: 'memory-cycles',
    name: 'Cycles & Reservoirs',
    topic: 'cycles',
    description: 'Match each process or reservoir with its role.',
    pairs: [
      { id: 'm17', term: 'Transpiration', match: 'Water vapour leaves plant leaves' },
      { id: 'm18', term: 'Condensation', match: 'Vapour becomes droplets in clouds' },
      { id: 'm19', term: 'Carbon sink', match: 'Removes CO₂ from the atmosphere' },
      { id: 'm20', term: 'Carbon source', match: 'Adds CO₂ to the atmosphere' },
      { id: 'm21', term: 'Fossil fuel', match: 'Ancient carbon stored underground' },
      { id: 'm22', term: 'Calcium carbonate', match: 'CaCO₃ in shells and limestone' },
      { id: 'm23', term: 'Combustion', match: 'Burning fuel releases stored carbon' },
      { id: 'm24', term: 'Biogeochemical cycle', match: 'Matter moving between living and non-living reservoirs' },
    ],
  },
  {
    id: 'memory-nitrogen',
    name: 'Nitrogen Cycle',
    topic: 'nitrogen',
    description: 'Match each process with what it does.',
    pairs: [
      { id: 'm25', term: 'Nitrogen fixation', match: 'N₂ → NH₃ / NH₄⁺' },
      { id: 'm26', term: 'Nitrification', match: 'NH₃ → NO₂⁻ → NO₃⁻' },
      { id: 'm27', term: 'Assimilation', match: 'Plants absorb nitrates and build proteins' },
      { id: 'm28', term: 'Ammonification', match: 'Decomposers release ammonia from dead matter' },
      { id: 'm29', term: 'Denitrification', match: 'NO₃⁻ → N₂ gas' },
      { id: 'm30', term: 'Root nodule', match: 'Legume home for nitrogen-fixing bacteria' },
      { id: 'm31', term: 'Eutrophication', match: 'Nutrients cause algal blooms and oxygen loss' },
      { id: 'm32', term: 'Dead zone', match: 'Low-oxygen water where life cannot survive' },
    ],
  },
];

export interface ClozeSet {
  id: string;
  title: string;
  topic: TopicId;
  text: string; // split on ___ in order
  blanks: { accepted: string[][]; hint?: string }[];
  bank: string[];
  explanation: string;
}

export const CLOZE_SETS: ClozeSet[] = [
  {
    id: 'cloze-ecosystem', title: 'Ecosystem Foundations', topic: 'foundations',
    text: 'An ecosystem includes ___ factors, which are living, and ___ factors, which are non-living. A group of individuals of the same species is a ___, while all the different species together form a ___.',
    blanks: [
      { accepted: [['biotic', 'living']], hint: 'Living factors' },
      { accepted: [['abiotic', 'non-living', 'nonliving']], hint: 'Non-living factors' },
      { accepted: [['population']], hint: 'One species' },
      { accepted: [['community']], hint: 'Multiple species' },
    ],
    bank: ['biotic', 'abiotic', 'population', 'community', 'ecosystem', 'niche'],
    explanation: 'Biotic + abiotic = ecosystem. Population (one species) → community (all species) → ecosystem (plus abiotic).',
  },
  {
    id: 'cloze-foodchain', title: 'Food Chains & Energy', topic: 'foodwebs',
    text: 'A food chain begins with a ___, which captures energy from the ___. The next organism is a ___ consumer. Only about ___% of energy is transferred to the next trophic level.',
    blanks: [
      { accepted: [['producer']], hint: 'Photosynthetic organism' },
      { accepted: [['sun', 'sunlight', 'the sun']], hint: 'Original energy source' },
      { accepted: [['primary', 'first']], hint: 'Eats the producer' },
      { accepted: [['10', 'ten']], hint: 'The 10% rule' },
    ],
    bank: ['producer', 'sun', 'primary', '10', 'consumer', '90'],
    explanation: 'Producer → primary consumer → secondary consumer. About 10% of energy transfers; 90% is used/lost as heat.',
  },
  {
    id: 'cloze-photosynthesis', title: 'Photosynthesis', topic: 'energy',
    text: 'Photosynthesis occurs in the ___, where the pigment ___ absorbs sunlight. The reactants are carbon dioxide and ___, and the products are glucose and ___.',
    blanks: [
      { accepted: [['chloroplast', 'chloroplasts']], hint: 'Organelle' },
      { accepted: [['chlorophyll']], hint: 'Green pigment' },
      { accepted: [['water', 'h2o']], hint: 'Absorbed by roots' },
      { accepted: [['oxygen', 'o2']], hint: 'Gas released' },
    ],
    bank: ['chloroplast', 'chlorophyll', 'water', 'oxygen', 'mitochondria', 'glucose'],
    explanation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Chlorophyll in chloroplasts captures light energy.',
  },
  {
    id: 'cloze-respiration', title: 'Cellular Respiration', topic: 'energy',
    text: 'Cellular respiration releases energy from ___ and occurs mainly in the ___. It produces carbon dioxide and ___, and it happens in ___ organisms, including plants.',
    blanks: [
      { accepted: [['glucose', 'sugar', 'c6h12o6']], hint: 'High-energy sugar' },
      { accepted: [['mitochondria', 'mitochondrion']], hint: 'Organelle' },
      { accepted: [['water', 'h2o']], hint: 'A product' },
      { accepted: [['all', 'every', 'all living']], hint: 'Not just animals' },
    ],
    bank: ['glucose', 'mitochondria', 'water', 'all', 'chloroplast', 'oxygen'],
    explanation: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy. All organisms respire, including plants.',
  },
  {
    id: 'cloze-water', title: 'The Water Cycle', topic: 'cycles',
    text: 'Water enters the atmosphere by ___ from lakes and by ___ from plants. It cools and forms clouds by ___, then falls as ___.',
    blanks: [
      { accepted: [['evaporation']], hint: 'Liquid → vapour' },
      { accepted: [['transpiration']], hint: 'Leaves release vapour' },
      { accepted: [['condensation']], hint: 'Vapour → droplets' },
      { accepted: [['precipitation', 'rain', 'rain/snow']], hint: 'Falls from clouds' },
    ],
    bank: ['evaporation', 'transpiration', 'condensation', 'precipitation', 'runoff', 'respiration'],
    explanation: 'Evaporation and transpiration add vapour; condensation forms clouds; precipitation returns water to the surface; runoff moves it across land.',
  },
  {
    id: 'cloze-carbon', title: 'The Carbon Cycle', topic: 'cycles',
    text: 'Plants remove carbon dioxide from the atmosphere through ___. Carbon moves through the food chain and returns to the atmosphere through cellular ___. Burning fossil fuels releases carbon as ___.',
    blanks: [
      { accepted: [['photosynthesis']], hint: 'Carbon sink' },
      { accepted: [['respiration', 'cellular respiration']], hint: 'Carbon source' },
      { accepted: [['carbon dioxide', 'co2']], hint: 'Greenhouse gas' },
    ],
    bank: ['photosynthesis', 'respiration', 'carbon dioxide', 'nitrogen', 'combustion', 'oxygen'],
    explanation: 'Photosynthesis removes CO₂; respiration, decomposition and combustion return it. Fossil fuels store ancient carbon.',
  },
  {
    id: 'cloze-nitrogen1', title: 'Fixation & Nitrification', topic: 'nitrogen',
    text: 'About ___% of the atmosphere is N₂, but plants cannot use it directly. ___ bacteria convert N₂ into ammonia in a process called ___. Nitrifying bacteria then convert ammonia into ___ that plants can absorb.',
    blanks: [
      { accepted: [['78']], hint: 'Atmospheric N₂ percentage' },
      { accepted: [['nitrogen-fixing', 'nitrogen fixing', 'fixing']], hint: 'Bacteria in root nodules' },
      { accepted: [['nitrogen fixation', 'fixation']], hint: 'N₂ → NH₃' },
      { accepted: [['nitrates', 'nitrate', 'no3']], hint: 'Plants absorb this' },
    ],
    bank: ['78', 'nitrogen-fixing', 'fixation', 'nitrates', '21', 'denitrification'],
    explanation: 'N₂ (78%) → fixation → ammonia/ammonium → nitrification → nitrites → nitrates → plant assimilation.',
  },
  {
    id: 'cloze-nitrogen2', title: 'Recycling & Fertilizers', topic: 'nitrogen',
    text: 'Decomposers release ammonia from dead matter in a process called ___. Denitrifying bacteria convert nitrates back into ___ gas. Fertilizer runoff can cause ___ blooms that block light and create low-oxygen ___ zones.',
    blanks: [
      { accepted: [['ammonification']], hint: 'Organic N → ammonia' },
      { accepted: [['nitrogen', 'n2']], hint: 'Returns to atmosphere' },
      { accepted: [['algal', 'algae']], hint: 'Rapid growth in water' },
      { accepted: [['dead']], hint: 'Low-oxygen area' },
    ],
    bank: ['ammonification', 'nitrogen', 'algal', 'dead', 'nitrification', 'oxygen'],
    explanation: 'Ammonification recycles nitrogen; denitrification returns N₂; fertilizer runoff causes eutrophication and dead zones.',
  },
];

export interface MatchingSet {
  id: string;
  title: string;
  topic: TopicId;
  description: string;
  pairs: { left: string; right: string; explanation: string }[];
}

export const MATCHING_SETS: MatchingSet[] = [
  {
    id: 'match-foundations', title: 'Ecosystem Vocabulary', topic: 'foundations',
    description: 'Match each term to its correct definition.',
    pairs: [
      { left: 'Ecosystem', right: 'Living things plus their non-living environment', explanation: 'Biotic + abiotic.' },
      { left: 'Population', right: 'Individuals of one species in an area', explanation: 'One species only.' },
      { left: 'Community', right: 'All the different species in an area', explanation: 'Multiple populations.' },
      { left: 'Habitat', right: 'The physical area where a species lives', explanation: 'The "address."' },
      { left: 'Niche', right: 'A species\' role and interactions', explanation: 'The "job."' },
      { left: 'Keystone species', right: 'A species with disproportionate ecosystem control', explanation: 'Wolves in Yellowstone.' },
    ],
  },
  {
    id: 'match-pond', title: 'Pond Food Web Roles', topic: 'foodwebs',
    description: 'Use the practice-test pond food web to match each organism to its role.',
    pairs: [
      { left: 'Duckweed', right: 'Photosynthetic producer at the base', explanation: 'Producer, 1st trophic level.' },
      { left: 'Moss ball', right: 'Another producer in the pond', explanation: 'Producer, 1st trophic level.' },
      { left: 'Guppies', right: 'Primary consumer that eats producers', explanation: '2nd trophic level.' },
      { left: 'Catfish', right: 'Secondary consumer that eats guppies', explanation: '3rd trophic level.' },
      { left: 'Snail', right: 'Decomposer feeding on dead matter', explanation: 'Recycles nutrients.' },
      { left: 'Ghost shrimp', right: 'Decomposer/detritivore on the pond floor', explanation: 'Breaks down dead material.' },
    ],
  },
  {
    id: 'match-cycles', title: 'Processes & Cycles', topic: 'cycles',
    description: 'Match each process to the cycle it belongs to.',
    pairs: [
      { left: 'Photosynthesis', right: 'Carbon cycle — removes CO₂', explanation: 'Also produces oxygen; links water and carbon.' },
      { left: 'Transpiration', right: 'Water cycle — vapour leaves leaves', explanation: 'Biotic part of the water cycle.' },
      { left: 'Combustion', right: 'Carbon cycle — releases stored CO₂', explanation: 'Burning fossil fuels or wood.' },
      { left: 'Nitrification', right: 'Nitrogen cycle — ammonia to nitrate', explanation: 'Done by nitrifying bacteria.' },
      { left: 'Denitrification', right: 'Nitrogen cycle — nitrate back to N₂', explanation: 'Completes the nitrogen cycle.' },
      { left: 'Condensation', right: 'Water cycle — vapour forms droplets', explanation: 'Cloud formation.' },
    ],
  },
  {
    id: 'match-nitrogen', title: 'Nitrogen Steps', topic: 'nitrogen',
    description: 'Match each process to the conversion it performs.',
    pairs: [
      { left: 'Nitrogen fixation', right: 'N₂ → ammonia/ammonium', explanation: 'Bacteria or lightning.' },
      { left: 'Nitrification', right: 'Ammonia → nitrite → nitrate', explanation: 'Nitrifying bacteria.' },
      { left: 'Assimilation', right: 'Nitrate → plant proteins/DNA', explanation: 'Plants absorb and build molecules.' },
      { left: 'Ammonification', right: 'Dead organic matter → ammonia', explanation: 'Decomposers.' },
      { left: 'Denitrification', right: 'Nitrate → N₂ gas', explanation: 'Denitrifying bacteria.' },
      { left: 'Root nodule', right: 'Legume home for nitrogen-fixing bacteria', explanation: 'A symbiotic relationship.' },
    ],
  },
  {
    id: 'match-measure', title: 'What Does It Measure?', topic: 'pyramids',
    description: 'Match each concept or pyramid to what it measures.',
    pairs: [
      { left: 'Energy pyramid', right: 'Available energy at each trophic level', explanation: 'Always upright.' },
      { left: 'Biomass pyramid', right: 'Total mass of organisms at each level', explanation: 'Usually upright.' },
      { left: 'Numbers pyramid', right: 'Count of individuals at each level', explanation: 'Can be inverted.' },
      { left: '10% rule', right: 'Proportion of energy transferred upward', explanation: 'About 90% is lost.' },
      { left: 'Keystone species', right: 'Disproportionate influence on community structure', explanation: 'Not about abundance.' },
      { left: 'Habitat', right: 'The physical area a species occupies', explanation: 'Not its role.' },
    ],
  },
  {
    id: 'match-misconceptions', title: 'Myth vs Correction', topic: 'integration',
    description: 'Match each common misconception to the correct scientific statement.',
    pairs: [
      { left: '"Energy cycles through ecosystems."', right: 'Energy flows one way and is lost as heat', explanation: 'Matter cycles; energy does not.' },
      { left: '"Plants do not respire."', right: 'Plants respire day and night', explanation: 'Photosynthesis is additional, not a replacement.' },
      { left: '"Plants absorb N₂ directly."', right: 'Nitrogen must be fixed into usable compounds first', explanation: 'Bacteria or lightning fix it.' },
      { left: '"Top predators have the most energy."', right: 'Top predators have the least available energy', explanation: '10% transfers, 90% lost.' },
      { left: '"All pyramids must be upright."', right: 'Numbers pyramids can be inverted', explanation: 'One tree, many insects.' },
      { left: '"Decomposers release oxygen."', right: 'Decomposers release CO₂ and nutrients', explanation: 'They consume oxygen and recycle matter.' },
    ],
  },
];

export interface SortingSet {
  id: string;
  title: string;
  topic: TopicId;
  instruction: string;
  categories: { id: string; label: string; color: string }[];
  items: { text: string; category: string; explanation: string }[];
}

export const SORTING_SETS: SortingSet[] = [
  {
    id: 'sort-biotic', title: 'Biotic or Abiotic?', topic: 'foundations',
    instruction: 'Sort each factor into the correct column.',
    categories: [
      { id: 'biotic', label: 'Biotic', color: '#B7F34A' },
      { id: 'abiotic', label: 'Abiotic', color: '#7DD3FC' },
    ],
    items: [
      { text: 'Nitrogen-fixing bacteria', category: 'biotic', explanation: 'Living organism.' },
      { text: 'Shale rock', category: 'abiotic', explanation: 'Non-living; the practice test used this example.' },
      { text: 'Dissolved oxygen', category: 'abiotic', explanation: 'Non-living chemical condition.' },
      { text: 'Ghost shrimp', category: 'biotic', explanation: 'Living organism.' },
      { text: 'Water temperature', category: 'abiotic', explanation: 'Physical condition.' },
      { text: 'Duckweed', category: 'biotic', explanation: 'Producer; living.' },
      { text: 'Sunlight', category: 'abiotic', explanation: 'Radiant energy; non-living.' },
      { text: 'Snail', category: 'biotic', explanation: 'Living consumer/decomposer.' },
      { text: 'Soil minerals', category: 'abiotic', explanation: 'Non-living nutrients.' },
      { text: 'Algae', category: 'biotic', explanation: 'Photosynthetic organisms.' },
      { text: 'Wind', category: 'abiotic', explanation: 'Physical movement of air.' },
      { text: 'Fungi decomposing a log', category: 'biotic', explanation: 'Living decomposers.' },
    ],
  },
  {
    id: 'sort-roles', title: 'Producer, Consumer or Decomposer?', topic: 'energy',
    instruction: 'Sort each organism by its main feeding role.',
    categories: [
      { id: 'producer', label: 'Producer', color: '#B7F34A' },
      { id: 'consumer', label: 'Consumer', color: '#FFC24B' },
      { id: 'decomposer', label: 'Decomposer', color: '#A78BFA' },
    ],
    items: [
      { text: 'Duckweed', category: 'producer', explanation: 'Photosynthesizes.' },
      { text: 'Guppy', category: 'consumer', explanation: 'Eats producers/other organisms.' },
      { text: 'Snail', category: 'decomposer', explanation: 'Feeds on dead matter in the practice-test web.' },
      { text: 'Moss ball', category: 'producer', explanation: 'Photosynthetic.' },
      { text: 'Catfish', category: 'consumer', explanation: 'Eats guppies.' },
      { text: 'Bacteria breaking down a leaf', category: 'decomposer', explanation: 'Recycles dead organic matter.' },
      { text: 'Phytoplankton', category: 'producer', explanation: 'Photosynthetic base of the Fraser River chain.' },
      { text: 'Tadpole', category: 'consumer', explanation: 'Eats plankton.' },
      { text: 'Ghost shrimp', category: 'decomposer', explanation: 'Detritivore/decomposer.' },
      { text: 'Grass', category: 'producer', explanation: 'Photosynthetic.' },
      { text: 'Fox', category: 'consumer', explanation: 'Eats rabbits.' },
      { text: 'Mushroom on a dead log', category: 'decomposer', explanation: 'Breaks down dead matter.' },
    ],
  },
  {
    id: 'sort-pyramids', title: 'Which Pyramid?', topic: 'pyramids',
    instruction: 'Sort each statement into the pyramid type it describes.',
    categories: [
      { id: 'energy', label: 'Energy', color: '#FFC24B' },
      { id: 'biomass', label: 'Biomass', color: '#4DE1C1' },
      { id: 'numbers', label: 'Numbers', color: '#A78BFA' },
    ],
    items: [
      { text: 'Always upright', category: 'energy', explanation: 'Energy decreases at every transfer.' },
      { text: 'Total mass of all individuals combined', category: 'biomass', explanation: 'Definition of biomass.' },
      { text: 'Can be inverted by one tree supporting many insects', category: 'numbers', explanation: 'Counts individuals.' },
      { text: 'Shows available energy per trophic level', category: 'energy', explanation: 'Width represents energy.' },
      { text: 'Usually upright in a forest (trees > herbivores)', category: 'biomass', explanation: 'Mass decreases upward.' },
      { text: 'Counts individual organisms', category: 'numbers', explanation: 'Not mass or energy.' },
      { text: 'Narrower at each higher level because of heat loss', category: 'energy', explanation: '10% rule.' },
      { text: 'Measured in grams or kilograms', category: 'biomass', explanation: 'Mass units.' },
      { text: 'Example: 1 000 000 producers → 10 000 herbivores → 100 predators', category: 'numbers', explanation: 'Counts of individuals.' },
    ],
  },
  {
    id: 'sort-carbon', title: 'Carbon Source or Sink?', topic: 'cycles',
    instruction: 'Sort each process into whether it adds or removes atmospheric carbon dioxide.',
    categories: [
      { id: 'source', label: 'Carbon source', color: '#FF8A65' },
      { id: 'sink', label: 'Carbon sink', color: '#4DE1C1' },
    ],
    items: [
      { text: 'Cellular respiration', category: 'source', explanation: 'Releases CO₂.' },
      { text: 'Photosynthesis', category: 'sink', explanation: 'Removes CO₂ into glucose.' },
      { text: 'Burning coal', category: 'source', explanation: 'Combustion releases CO₂.' },
      { text: 'Formation of calcium carbonate shells', category: 'sink', explanation: 'Stores carbon in shells.' },
      { text: 'Decomposition', category: 'source', explanation: 'Decomposers respire and release CO₂.' },
      { text: 'Growing forest', category: 'sink', explanation: 'Trees photosynthesize and store carbon.' },
      { text: 'Deforestation and burning wood', category: 'source', explanation: 'Releases stored carbon and removes a sink.' },
      { text: 'Fossil fuel formation', category: 'sink', explanation: 'Locks carbon underground.' },
      { text: 'Volcanic eruption', category: 'source', explanation: 'Releases geological carbon.' },
      { text: 'Algal bloom photosynthesis', category: 'sink', explanation: 'Algae remove CO₂.' },
    ],
  },
  {
    id: 'sort-nitrogen', title: 'Name That Nitrogen Process', topic: 'nitrogen',
    instruction: 'Sort each conversion or description into the correct nitrogen-cycle process.',
    categories: [
      { id: 'fixation', label: 'Fixation', color: '#4DE1C1' },
      { id: 'nitrification', label: 'Nitrification', color: '#FFC24B' },
      { id: 'ammonification', label: 'Ammonification', color: '#A78BFA' },
      { id: 'denitrification', label: 'Denitrification', color: '#FF8A65' },
    ],
    items: [
      { text: 'N₂ → NH₃/NH₄⁺', category: 'fixation', explanation: 'Biological or abiotic fixation.' },
      { text: 'NH₃ → NO₂⁻ → NO₃⁻', category: 'nitrification', explanation: 'Nitrifying bacteria.' },
      { text: 'Dead matter → ammonia/ammonium', category: 'ammonification', explanation: 'Decomposers.' },
      { text: 'NO₃⁻ → N₂ gas', category: 'denitrification', explanation: 'Denitrifying bacteria.' },
      { text: 'Lightning converts atmospheric N₂', category: 'fixation', explanation: 'Abiotic fixation.' },
      { text: 'Legume root nodules', category: 'fixation', explanation: 'Nitrogen-fixing bacteria.' },
      { text: 'Compost releases ammonia', category: 'ammonification', explanation: 'Organic nitrogen breakdown.' },
      { text: 'Returns nitrogen to the atmosphere', category: 'denitrification', explanation: 'Completes the cycle.' },
      { text: 'Makes nitrates available to plants', category: 'nitrification', explanation: 'Final product is nitrate.' },
      { text: 'Denitrifying bacteria', category: 'denitrification', explanation: 'They perform this step.' },
    ],
  },
];

export interface DiagramLab {
  id: string;
  title: string;
  topic: TopicId;
  diagram: 'foodweb' | 'carbon' | 'nitrogen' | 'water';
  instruction: string;
  zones: { id: string; label: string; x: number; y: number }[];
  bank: string[];
  explanation: string;
}

export const DIAGRAM_LABS: DiagramLab[] = [
  {
    id: 'diagram-foodweb', title: 'Label the Pond Food Web', topic: 'foodwebs', diagram: 'foodweb',
    instruction: 'Place each organism label on its node in the practice-test pond food web.',
    zones: [
      { id: 'duckweed', label: 'Duckweed', x: 16, y: 72 },
      { id: 'moss', label: 'Moss ball', x: 42, y: 82 },
      { id: 'guppies', label: 'Guppies', x: 51, y: 48 },
      { id: 'ghost', label: 'Ghost shrimp', x: 20, y: 38 },
      { id: 'catfish', label: 'Catfish', x: 72, y: 22 },
      { id: 'snail', label: 'Snail', x: 86, y: 58 },
    ],
    bank: ['Duckweed', 'Moss ball', 'Guppies', 'Ghost shrimp', 'Catfish', 'Snail', 'Pickerel'],
    explanation: 'Duckweed and moss ball are producers; guppies are primary consumers; catfish are secondary consumers; snail and ghost shrimp are decomposers/detritivores. This is the Q26 pond web.',
  },
  {
    id: 'diagram-carbon', title: 'Label the Carbon Cycle', topic: 'cycles', diagram: 'carbon',
    instruction: 'Place each process or reservoir label on the carbon-cycle diagram.',
    zones: [
      { id: 'atmosphere', label: 'CO₂ in atmosphere', x: 50, y: 12 },
      { id: 'producers', label: 'Producers', x: 20, y: 42 },
      { id: 'consumers', label: 'Consumers', x: 46, y: 58 },
      { id: 'decomposers', label: 'Decomposers', x: 16, y: 80 },
      { id: 'fossil', label: 'Fossil fuels', x: 74, y: 80 },
      { id: 'industry', label: 'Combustion / industry', x: 84, y: 44 },
    ],
    bank: ['CO₂ in atmosphere', 'Producers', 'Consumers', 'Decomposers', 'Fossil fuels', 'Combustion / industry', 'Nitrogen gas'],
    explanation: 'Photosynthesis moves CO₂ into producers; feeding moves it to consumers; respiration and decomposition return CO₂; combustion of fossil fuels releases stored carbon.',
  },
  {
    id: 'diagram-nitrogen', title: 'Label the Nitrogen Cycle', topic: 'nitrogen', diagram: 'nitrogen',
    instruction: 'Place each nitrogen-cycle process label on the correct arrow.',
    zones: [
      { id: 'n2', label: 'N₂ in atmosphere', x: 50, y: 10 },
      { id: 'fixation', label: 'Nitrogen fixation', x: 18, y: 30 },
      { id: 'nitrification', label: 'Nitrification', x: 46, y: 46 },
      { id: 'assimilation', label: 'Assimilation', x: 78, y: 30 },
      { id: 'ammonification', label: 'Ammonification', x: 18, y: 76 },
      { id: 'denitrification', label: 'Denitrification', x: 80, y: 76 },
    ],
    bank: ['N₂ in atmosphere', 'Nitrogen fixation', 'Nitrification', 'Assimilation', 'Ammonification', 'Denitrification', 'Photosynthesis'],
    explanation: 'N₂ → fixation → ammonia → nitrification → nitrate → assimilation by plants. Decomposers ammonify dead matter; denitrification returns N₂.',
  },
  {
    id: 'diagram-water', title: 'Label the Water Cycle', topic: 'cycles', diagram: 'water',
    instruction: 'Place each water-cycle process label in the correct position.',
    zones: [
      { id: 'evaporation', label: 'Evaporation', x: 18, y: 72 },
      { id: 'transpiration', label: 'Transpiration', x: 40, y: 46 },
      { id: 'condensation', label: 'Condensation', x: 56, y: 16 },
      { id: 'precipitation', label: 'Precipitation', x: 78, y: 30 },
      { id: 'runoff', label: 'Runoff', x: 86, y: 76 },
    ],
    bank: ['Evaporation', 'Transpiration', 'Condensation', 'Precipitation', 'Runoff', 'Combustion'],
    explanation: 'Evaporation and transpiration add water vapour; condensation forms clouds; precipitation returns water; runoff moves it over land. Combustion belongs to the carbon cycle.',
  },
];
export interface OrderSet {
  id: string;
  title: string;
  topic: TopicId;
  instruction: string;
  steps: { text: string; explanation: string }[];
  explanation: string;
}

export const ORDER_SETS: OrderSet[] = [
  {
    id: 'order-nitrogen-plant', title: 'From Air to Plant Protein', topic: 'nitrogen',
    instruction: 'Order the nitrogen journey from atmospheric N₂ to a plant protein.',
    steps: [
      { text: 'N₂ in the atmosphere', explanation: 'Unusable directly by plants.' },
      { text: 'Nitrogen fixation', explanation: 'Bacteria (or lightning) convert N₂ to ammonia/ammonium.' },
      { text: 'Ammonia / ammonium', explanation: 'The first usable compound.' },
      { text: 'Nitrification', explanation: 'Nitrifying bacteria make nitrites, then nitrates.' },
      { text: 'Nitrate absorbed by plant', explanation: 'Assimilation begins.' },
      { text: 'Plant proteins and DNA', explanation: 'Nitrogen is incorporated into biological molecules.' },
    ],
    explanation: 'N₂ → fixation → NH₃/NH₄⁺ → nitrification → NO₃⁻ → assimilation → proteins/DNA.',
  },
  {
    id: 'order-water', title: 'The Water Cycle', topic: 'cycles',
    instruction: 'Order the main abiotic water-cycle steps.',
    steps: [
      { text: 'Evaporation', explanation: 'Liquid water becomes vapour.' },
      { text: 'Condensation', explanation: 'Vapour cools into droplets and clouds.' },
      { text: 'Precipitation', explanation: 'Water falls as rain or snow.' },
      { text: 'Runoff', explanation: 'Water flows over land into rivers and lakes.' },
    ],
    explanation: 'Evaporation → condensation → precipitation → runoff. Transpiration adds vapour from plants.',
  },
  {
    id: 'order-energy', title: 'Energy Through a Food Chain', topic: 'foodwebs',
    instruction: 'Order the path of energy from its source to a tertiary consumer.',
    steps: [
      { text: 'Sun', explanation: 'Radiant energy enters the ecosystem.' },
      { text: 'Producer', explanation: 'Photosynthesis stores energy in glucose.' },
      { text: 'Primary consumer', explanation: 'Eats the producer; 2nd trophic level.' },
      { text: 'Secondary consumer', explanation: 'Eats the primary consumer; 3rd trophic level.' },
      { text: 'Tertiary consumer', explanation: 'Eats the secondary consumer; 4th trophic level.' },
    ],
    explanation: 'Sun → producer → primary → secondary → tertiary consumer. About 90% of energy is lost at each transfer.',
  },
  {
    id: 'order-carbon', title: 'The Short Carbon Cycle', topic: 'cycles',
    instruction: 'Order the short carbon cycle from atmospheric CO₂ back to atmospheric CO₂.',
    steps: [
      { text: 'Atmospheric CO₂', explanation: 'The most accessible carbon source.' },
      { text: 'Photosynthesis', explanation: 'Producers convert CO₂ into glucose.' },
      { text: 'Glucose / plant biomass', explanation: 'Carbon is stored in organic molecules.' },
      { text: 'Consumer eats producer', explanation: 'Carbon moves through the food chain.' },
      { text: 'Cellular respiration', explanation: 'Glucose is broken down; CO₂ is released.' },
      { text: 'Atmospheric CO₂', explanation: 'The cycle is complete.' },
    ],
    explanation: 'CO₂ → photosynthesis → glucose → food chain → respiration → CO₂. Plants also respire.',
  },
  {
    id: 'order-trophic', title: 'Trophic Levels', topic: 'pyramids',
    instruction: 'Order the trophic levels from lowest to highest.',
    steps: [
      { text: 'Producers (1st)', explanation: 'Photosynthetic base.' },
      { text: 'Primary consumers (2nd)', explanation: 'Eat producers.' },
      { text: 'Secondary consumers (3rd)', explanation: 'Eat primary consumers.' },
      { text: 'Tertiary consumers (4th)', explanation: 'Eat secondary consumers.' },
    ],
    explanation: 'Producers → primary → secondary → tertiary consumers. Energy decreases at each step.',
  },
  {
    id: 'order-ammonification', title: 'Dead Matter to Nitrate', topic: 'nitrogen',
    instruction: 'Order the decomposition-to-nitrate pathway.',
    steps: [
      { text: 'Dead plant or animal waste', explanation: 'Organic nitrogen source.' },
      { text: 'Decomposers break it down', explanation: 'Ammonification begins.' },
      { text: 'Ammonia / ammonium released', explanation: 'A usable nitrogen compound.' },
      { text: 'Nitrifying bacteria', explanation: 'Convert ammonia to nitrite.' },
      { text: 'Nitrate (NO₃⁻)', explanation: 'The form plants absorb.' },
      { text: 'Plant uptake / assimilation', explanation: 'Nitrogen enters the plant.' },
    ],
    explanation: 'Dead matter → ammonification → ammonia/ammonium → nitrification → nitrate → assimilation.',
  },
];
