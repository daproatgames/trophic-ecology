import type { Concept, Topic, TopicId } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 'foundations',
    name: 'Ecology Foundations',
    shortName: 'Foundations',
    color: '#B7F34A',
    soft: 'rgba(183,243,74,0.14)',
    icon: 'Sprout',
    description: 'Ecosystems, biotic & abiotic factors, organization, niches, sustainability and keystone species.',
  },
  {
    id: 'foodwebs',
    name: 'Food Chains & Webs',
    shortName: 'Food Webs',
    color: '#4DE1C1',
    soft: 'rgba(77,225,193,0.14)',
    icon: 'Share2',
    description: 'Feeding relationships, trophic levels, energy transfer and the interconnectedness of communities.',
  },
  {
    id: 'pyramids',
    name: 'Ecological Pyramids',
    shortName: 'Pyramids',
    color: '#FFC24B',
    soft: 'rgba(255,194,75,0.14)',
    icon: 'Triangle',
    description: 'Energy, biomass and numbers pyramids — what they show, why they shrink, and when they flip.',
  },
  {
    id: 'energy',
    name: 'Energy & Matter',
    shortName: 'Energy',
    color: '#FF8A65',
    soft: 'rgba(255,138,101,0.14)',
    icon: 'Zap',
    description: 'Solar energy, photosynthesis, cellular respiration, and the roles of producers, consumers and decomposers.',
  },
  {
    id: 'cycles',
    name: 'Water & Carbon Cycles',
    shortName: 'Cycles',
    color: '#7DD3FC',
    soft: 'rgba(125,211,252,0.14)',
    icon: 'RefreshCw',
    description: 'Matter cycling, the water cycle, and the short and long carbon cycles including fossil fuels.',
  },
  {
    id: 'nitrogen',
    name: 'Nitrogen Cycle',
    shortName: 'Nitrogen',
    color: '#A78BFA',
    soft: 'rgba(167,139,250,0.14)',
    icon: 'Atom',
    description: 'Fixation, nitrification, assimilation, ammonification, denitrification and fertilizer impacts.',
  },
  {
    id: 'integration',
    name: 'Connections & Exam Skills',
    shortName: 'Connections',
    color: '#F472B6',
    soft: 'rgba(244,114,182,0.14)',
    icon: 'Workflow',
    description: 'Link the cycles, calculate energy transfer, and write precise answers that earn every mark.',
  },
];

export const TOPIC_MAP: Record<TopicId, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
) as Record<TopicId, Topic>;

export const CONCEPTS: Concept[] = [
  // Foundations
  { id: 'ecosystem-definition', topic: 'foundations', name: 'Ecosystem definition', short: 'Biotic + abiotic interacting', weight: 1.4, lessonId: 'ecology-foundations', practiceTest: [1, 3] },
  { id: 'biotic-abiotic', topic: 'foundations', name: 'Biotic vs abiotic', short: 'Living vs non-living factors', weight: 1.5, lessonId: 'ecology-foundations', practiceTest: [13, 14, 23] },
  { id: 'spheres-biosphere', topic: 'foundations', name: 'Spheres & biosphere', short: 'Atmosphere, lithosphere, hydrosphere', weight: 1.0, lessonId: 'ecology-foundations' },
  { id: 'ecological-organization', topic: 'foundations', name: 'Levels of organization', short: 'Individual → population → community…', weight: 1.4, lessonId: 'ecology-foundations', practiceTest: [3, 7] },
  { id: 'habitat-niche', topic: 'foundations', name: 'Habitat vs niche', short: 'Address vs role', weight: 1.2, lessonId: 'ecology-foundations' },
  { id: 'sustainability', topic: 'foundations', name: 'Sustainability', short: 'Life without outside help', weight: 1.2, lessonId: 'ecology-foundations', practiceTest: [14] },
  { id: 'keystone-species', topic: 'foundations', name: 'Keystone species', short: 'Disproportionate ecosystem control', weight: 1.4, lessonId: 'ecology-foundations' },

  // Food webs
  { id: 'food-chain', topic: 'foodwebs', name: 'Food chains & arrows', short: 'Energy flow from producer', weight: 1.4, lessonId: 'food-chains-webs', practiceTest: [5] },
  { id: 'trophic-levels', topic: 'foodwebs', name: 'Trophic levels', short: 'Producer, 1° 2° 3° consumer', weight: 1.5, lessonId: 'food-chains-webs', practiceTest: [5] },
  { id: 'energy-loss', topic: 'foodwebs', name: 'Energy loss (10% rule)', short: '90% lost, ~10% transferred', weight: 1.5, lessonId: 'food-chains-webs', practiceTest: [2, 21] },
  { id: 'food-web', topic: 'foodwebs', name: 'Food webs', short: 'Interconnected feeding relationships', weight: 1.3, lessonId: 'food-chains-webs' },

  // Pyramids
  { id: 'energy-pyramid', topic: 'pyramids', name: 'Energy pyramids', short: 'Energy available per trophic level', weight: 1.4, lessonId: 'ecological-pyramids', practiceTest: [21] },
  { id: 'biomass-pyramid', topic: 'pyramids', name: 'Biomass pyramids', short: 'Total mass of organisms', weight: 1.3, lessonId: 'ecological-pyramids', practiceTest: [6] },
  { id: 'numbers-pyramid', topic: 'pyramids', name: 'Numbers pyramids', short: 'Population size per level', weight: 1.3, lessonId: 'ecological-pyramids', practiceTest: [30] },

  // Energy
  { id: 'solar-energy', topic: 'energy', name: 'Solar energy', short: 'The Sun powers ecosystems', weight: 1.2, lessonId: 'energy-in-ecosystems' },
  { id: 'photosynthesis', topic: 'energy', name: 'Photosynthesis', short: 'Light → chemical energy in glucose', weight: 1.6, lessonId: 'energy-in-ecosystems', practiceTest: [15, 31] },
  { id: 'cellular-respiration', topic: 'energy', name: 'Cellular respiration', short: 'Glucose + O₂ → energy + CO₂ + H₂O', weight: 1.6, lessonId: 'energy-in-ecosystems', practiceTest: [4, 24] },
  { id: 'photo-respiration-link', topic: 'energy', name: 'Photosynthesis ↔ respiration', short: 'Reverse reactions, linked gases', weight: 1.4, lessonId: 'energy-in-ecosystems', practiceTest: [9, 33] },
  { id: 'feeding-roles', topic: 'energy', name: 'Producers, consumers, decomposers', short: 'Who eats what, who recycles', weight: 1.5, lessonId: 'energy-in-ecosystems', practiceTest: [10, 25] },
  { id: 'matter-energy', topic: 'energy', name: 'Matter cycles, energy flows', short: 'Matter recycled; energy lost as heat', weight: 1.4, lessonId: 'water-carbon-cycles', practiceTest: [11] },

  // Cycles
  { id: 'water-cycle', topic: 'cycles', name: 'Water cycle', short: 'Evaporation, transpiration, precipitation', weight: 1.2, lessonId: 'water-carbon-cycles', practiceTest: [8] },
  { id: 'carbon-cycle', topic: 'cycles', name: 'Carbon cycle', short: 'Photosynthesis, respiration, combustion', weight: 1.5, lessonId: 'water-carbon-cycles', practiceTest: [12, 28] },
  { id: 'carbon-reservoirs', topic: 'cycles', name: 'Carbon reservoirs', short: 'Fossil fuels, shells, rock, volcanoes', weight: 1.3, lessonId: 'water-carbon-cycles', practiceTest: [29] },
  { id: 'human-carbon-impact', topic: 'cycles', name: 'Human carbon impact', short: 'Combustion and deforestation', weight: 1.3, lessonId: 'water-carbon-cycles' },

  // Nitrogen
  { id: 'nitrogen-importance', topic: 'nitrogen', name: 'Why nitrogen matters', short: 'Proteins, DNA, 78% of air', weight: 1.2, lessonId: 'nitrogen-cycle', practiceTest: [1] },
  { id: 'nitrogen-fixation', topic: 'nitrogen', name: 'Nitrogen fixation', short: 'N₂ → NH₃ / NH₄⁺', weight: 1.5, lessonId: 'nitrogen-cycle', practiceTest: [18, 19] },
  { id: 'nitrification-assimilation', topic: 'nitrogen', name: 'Nitrification & assimilation', short: 'NH₃ → NO₂⁻ → NO₃⁻ → plants', weight: 1.5, lessonId: 'nitrogen-cycle' },
  { id: 'ammonification', topic: 'nitrogen', name: 'Ammonification', short: 'Decomposers release ammonia', weight: 1.3, lessonId: 'nitrogen-cycle', practiceTest: [25, 32] },
  { id: 'denitrification', topic: 'nitrogen', name: 'Denitrification', short: 'NO₃⁻ → N₂, completes the cycle', weight: 1.4, lessonId: 'nitrogen-cycle', practiceTest: [18] },
  { id: 'fertilizers-eutrophication', topic: 'nitrogen', name: 'Fertilizers & eutrophication', short: 'Runoff → algal blooms → dead zones', weight: 1.5, lessonId: 'nitrogen-cycle' },

  // Integration
  { id: 'cycle-integration', topic: 'integration', name: 'Cycle connections', short: 'Carbon, water, nitrogen and energy', weight: 1.3, lessonId: 'connections-exam-skills', practiceTest: [9, 12] },
  { id: 'data-calculation', topic: 'integration', name: 'Energy calculations', short: '10% rule and pyramid data', weight: 1.3, lessonId: 'connections-exam-skills', practiceTest: [2, 26, 27] },
  { id: 'exam-precision', topic: 'integration', name: 'Exam precision', short: 'Command words, units, specificity', weight: 1.2, lessonId: 'connections-exam-skills', practiceTest: [16, 18, 21, 25] },
];

export const CONCEPT_MAP: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

export const CONCEPTS_BY_TOPIC = TOPICS.reduce((acc, t) => {
  acc[t.id] = CONCEPTS.filter((c) => c.topic === t.id);
  return acc;
}, {} as Record<TopicId, Concept[]>);

export function conceptName(id: string): string {
  return CONCEPT_MAP[id]?.name ?? id;
}

export function conceptIdsForTopic(topic: TopicId): string[] {
  return CONCEPTS_BY_TOPIC[topic].map((c) => c.id);
}