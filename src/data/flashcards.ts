import type { TopicId } from '../types';

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  conceptId: string;
  topic: TopicId;
  example?: string;
}

export const FLASHCARDS: Flashcard[] = [
  { id: 'fc-ecosystem', term: 'Ecosystem', definition: 'All living things (biotic) interacting with each other and their non-living (abiotic) environment.', conceptId: 'ecosystem-definition', topic: 'foundations', example: 'A pond, a forest, or a rotting log.' },
  { id: 'fc-biotic', term: 'Biotic factor', definition: 'A living component of an ecosystem.', conceptId: 'biotic-abiotic', topic: 'foundations', example: 'Bacteria, mosquitoes, algae.' },
  { id: 'fc-abiotic', term: 'Abiotic factor', definition: 'A non-living physical or chemical component of an ecosystem.', conceptId: 'biotic-abiotic', topic: 'foundations', example: 'Sunlight, temperature, soil minerals, shale.' },
  { id: 'fc-population', term: 'Population', definition: 'A group of individuals of the same species living in a given area.', conceptId: 'ecological-organization', topic: 'foundations' },
  { id: 'fc-community', term: 'Community', definition: 'All the organisms of different species living in an area.', conceptId: 'ecological-organization', topic: 'foundations' },
  { id: 'fc-habitat', term: 'Habitat', definition: 'The physical area a species inhabits within an ecosystem — its "address."', conceptId: 'habitat-niche', topic: 'foundations' },
  { id: 'fc-niche', term: 'Niche', definition: 'The way a species interacts with its community and abiotic environment — its "role." No two species share an identical niche.', conceptId: 'habitat-niche', topic: 'foundations' },
  { id: 'fc-keystone', term: 'Keystone species', definition: 'A species that exerts strong control on community structure disproportionate to its population size. Removing it can collapse the ecosystem.', conceptId: 'keystone-species', topic: 'foundations', example: 'Wolves in Yellowstone.' },
  { id: 'fc-sustainability', term: 'Sustainability', definition: 'The ability of an ecosystem to support life without outside help.', conceptId: 'sustainability', topic: 'foundations' },
  { id: 'fc-biosphere', term: 'Biosphere', definition: 'The zone on Earth where living things exist; it requires components from the atmosphere, lithosphere and hydrosphere.', conceptId: 'spheres-biosphere', topic: 'foundations' },
  { id: 'fc-biogeochem', term: 'Biogeochemical cycle', definition: 'The continuous cycling of matter between biotic and abiotic reservoirs.', conceptId: 'matter-energy', topic: 'cycles' },
  { id: 'fc-food-chain', term: 'Food chain', definition: 'A sequence of organisms, each feeding on the next, showing how energy is transferred.', conceptId: 'food-chain', topic: 'foodwebs' },
  { id: 'fc-trophic', term: 'Trophic level', definition: 'The position of an organism along a food chain (1st = producer, 2nd = primary consumer, etc.).', conceptId: 'trophic-levels', topic: 'foodwebs' },
  { id: 'fc-primary', term: 'Primary consumer', definition: 'An organism that eats a producer; it occupies the second trophic level.', conceptId: 'trophic-levels', topic: 'foodwebs' },
  { id: 'fc-secondary', term: 'Secondary consumer', definition: 'An organism that eats a primary consumer; it occupies the third trophic level.', conceptId: 'trophic-levels', topic: 'foodwebs' },
  { id: 'fc-ten-percent', term: '10% rule', definition: 'Only about 10% of the energy at one trophic level is transferred to the next; about 90% is used and lost as heat.', conceptId: 'energy-loss', topic: 'foodwebs' },
  { id: 'fc-food-web', term: 'Food web', definition: 'A representation of the feeding relationships within a community; a series of interconnected food chains.', conceptId: 'food-web', topic: 'foodwebs' },
  { id: 'fc-energy-pyramid', term: 'Energy pyramid', definition: 'A diagram showing available energy at each trophic level. It is always upright because energy is lost at each transfer.', conceptId: 'energy-pyramid', topic: 'pyramids' },
  { id: 'fc-biomass', term: 'Biomass', definition: 'The total mass of all individuals combined.', conceptId: 'biomass-pyramid', topic: 'pyramids' },
  { id: 'fc-numbers-pyramid', term: 'Numbers pyramid', definition: 'A diagram showing the total number of individual organisms at each trophic level. It can be inverted.', conceptId: 'numbers-pyramid', topic: 'pyramids' },
  { id: 'fc-producer', term: 'Producer', definition: 'An organism that makes its own food, usually by photosynthesis.', conceptId: 'feeding-roles', topic: 'energy' },
  { id: 'fc-consumer', term: 'Consumer', definition: 'An organism that must consume other organisms for energy.', conceptId: 'feeding-roles', topic: 'energy' },
  { id: 'fc-decomposer', term: 'Decomposer', definition: 'An organism that breaks down dead remains and wastes, recycling nutrients. It releases CO₂ and nitrogen compounds, not oxygen.', conceptId: 'feeding-roles', topic: 'energy' },
  { id: 'fc-photosynthesis', term: 'Photosynthesis', definition: 'The process producers use to convert light energy into chemical energy in glucose: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', conceptId: 'photosynthesis', topic: 'energy' },
  { id: 'fc-chlorophyll', term: 'Chlorophyll', definition: 'The green pigment in chloroplasts that absorbs sunlight.', conceptId: 'photosynthesis', topic: 'energy' },
  { id: 'fc-chloroplast', term: 'Chloroplast', definition: 'The organelle where photosynthesis takes place.', conceptId: 'photosynthesis', topic: 'energy' },
  { id: 'fc-respiration', term: 'Cellular respiration', definition: 'The process cells use to release energy from glucose: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy.', conceptId: 'cellular-respiration', topic: 'energy' },
  { id: 'fc-mitochondria', term: 'Mitochondria', definition: 'The organelles where cellular respiration mainly occurs.', conceptId: 'cellular-respiration', topic: 'energy' },
  { id: 'fc-glucose', term: 'Glucose', definition: 'A high-energy sugar made by photosynthesis, with the formula C₆H₁₂O₆.', conceptId: 'photosynthesis', topic: 'energy' },
  { id: 'fc-transpiration', term: 'Transpiration', definition: 'The loss of water vapour from plant leaves; part of the water cycle.', conceptId: 'water-cycle', topic: 'cycles' },
  { id: 'fc-condensation', term: 'Condensation', definition: 'Water vapour cooling and changing into liquid droplets, forming clouds.', conceptId: 'water-cycle', topic: 'cycles' },
  { id: 'fc-carbon-source', term: 'Carbon source', definition: 'A process or reservoir that releases carbon into the atmosphere, such as cellular respiration or combustion.', conceptId: 'carbon-cycle', topic: 'cycles' },
  { id: 'fc-carbon-sink', term: 'Carbon sink', definition: 'A process or reservoir that removes carbon from the atmosphere, such as photosynthesis.', conceptId: 'carbon-cycle', topic: 'cycles' },
  { id: 'fc-fossil-fuel', term: 'Fossil fuel', definition: 'Coal, oil or natural gas formed from ancient organisms over millions of years. Burning it releases CO₂.', conceptId: 'carbon-reservoirs', topic: 'cycles' },
  { id: 'fc-caco3', term: 'Calcium carbonate', definition: 'CaCO₃, the compound in many shells and in limestone. It stores carbon for very long periods.', conceptId: 'carbon-reservoirs', topic: 'cycles' },
  { id: 'fc-fixation', term: 'Nitrogen fixation', definition: 'The conversion of N₂ gas into compounds such as ammonia (NH₃) or ammonium (NH₄⁺).', conceptId: 'nitrogen-fixation', topic: 'nitrogen' },
  { id: 'fc-nitrification', term: 'Nitrification', definition: 'The bacterial conversion of ammonia/ammonium into nitrites and then nitrates.', conceptId: 'nitrification-assimilation', topic: 'nitrogen' },
  { id: 'fc-assimilation', term: 'Assimilation', definition: 'The uptake and incorporation of nitrates into plant molecules such as proteins and DNA.', conceptId: 'nitrification-assimilation', topic: 'nitrogen' },
  { id: 'fc-ammonification', term: 'Ammonification', definition: 'The release of ammonia/ammonium from dead organic matter and wastes by decomposers.', conceptId: 'ammonification', topic: 'nitrogen' },
  { id: 'fc-denitrification', term: 'Denitrification', definition: 'The bacterial conversion of nitrates back into N₂ gas, completing the nitrogen cycle.', conceptId: 'denitrification', topic: 'nitrogen' },
  { id: 'fc-eutrophication', term: 'Eutrophication', definition: 'Nutrient enrichment of water that causes algal blooms, light blocking and oxygen depletion (dead zones).', conceptId: 'fertilizers-eutrophication', topic: 'nitrogen' },
  { id: 'fc-nodule', term: 'Root nodule', definition: 'A bulb-like structure on legume roots where nitrogen-fixing bacteria live.', conceptId: 'nitrogen-fixation', topic: 'nitrogen' },
  { id: 'fc-dead-zone', term: 'Dead zone', definition: 'A low-oxygen area of water where most aquatic life cannot survive.', conceptId: 'fertilizers-eutrophication', topic: 'nitrogen' },
];

export const FLASHCARD_MAP = Object.fromEntries(FLASHCARDS.map((f) => [f.id, f]));

export const FLASHCARD_DECKS = [
  { id: 'all', name: 'Full Unit', description: 'Every term in the unit', topic: 'all' as const },
  { id: 'foundations', name: 'Foundations', description: 'Ecosystems, niches and keystone species', topic: 'foundations' as TopicId },
  { id: 'foodwebs', name: 'Food Webs', description: 'Chains, trophic levels and energy transfer', topic: 'foodwebs' as TopicId },
  { id: 'pyramids', name: 'Pyramids', description: 'Energy, biomass and numbers', topic: 'pyramids' as TopicId },
  { id: 'energy', name: 'Energy & Matter', description: 'Photosynthesis, respiration and roles', topic: 'energy' as TopicId },
  { id: 'cycles', name: 'Water & Carbon', description: 'Cycles, sources, sinks and reservoirs', topic: 'cycles' as TopicId },
  { id: 'nitrogen', name: 'Nitrogen', description: 'Fixation through eutrophication', topic: 'nitrogen' as TopicId },
];

export function cardsForDeck(deckId: string): Flashcard[] {
  if (deckId === 'all') return FLASHCARDS;
  return FLASHCARDS.filter((f) => f.topic === deckId);
}