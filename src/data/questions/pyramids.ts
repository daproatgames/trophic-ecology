import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('pyramids');
const scenario = open('scenario');
const compare = open('compare');

export const pyramidQuestions: Question[] = [
  mcq({
    id: 'py-01',
    concepts: ['energy-pyramid', 'biomass-pyramid', 'numbers-pyramid'],
    difficulty: 1,
    prompt: 'What are the three types of ecological pyramids?',
    options: [
      'Energy, biomass and numbers',
      'Carbon, nitrogen and water',
      'Producer, consumer and decomposer',
      'Biotic, abiotic and biosphere',
    ],
    answer: 0,
    explanation:
      'The three ecological pyramids are energy pyramids, biomass pyramids and numbers pyramids. Each displays a different relationship between trophic levels.',
    whyWrong: {
      1: 'Those are cycles or substances, not types of ecological pyramids.',
      2: 'Those are feeding roles, not pyramid types.',
      3: 'Those are categories of factors/spheres, not pyramid types.',
    },
  }),
  mcq({
    id: 'py-02',
    concepts: ['energy-pyramid'],
    difficulty: 2,
    prompt: 'In an energy pyramid, what does the width of each layer represent?',
    options: [
      'The amount of available energy at that trophic level',
      'The number of species in the ecosystem',
      'The physical size of each organism',
      'The amount of water in the habitat',
    ],
    answer: 0,
    explanation:
      'An energy pyramid shows energy loss and transfer between trophic levels. Wider layers contain more available energy; each higher layer is narrower because energy is lost.',
    whyWrong: {
      1: 'Numbers are shown by a pyramid of numbers, not width in an energy pyramid.',
      2: 'Organism size is not what the layers measure.',
      3: 'Water is part of the water cycle, not the energy pyramid.',
    },
  }),
  mcq({
    id: 'py-03',
    concepts: ['energy-pyramid', 'energy-loss'],
    difficulty: 2,
    prompt: 'Which trophic level has the greatest amount of available energy?',
    options: ['Producers', 'Primary consumers', 'Secondary consumers', 'Tertiary consumers'],
    answer: 0,
    explanation:
      'Energy enters through producers, and about 90% is lost at each transfer. Producers therefore have the most available energy and usually form the widest layer of an energy pyramid.',
    whyWrong: {
      1: 'Primary consumers receive only about 10% of the producers\' energy.',
      2: 'Secondary consumers receive even less after another transfer.',
      3: 'Tertiary consumers have the least energy available of these levels.',
    },
  }),
  mcq({
    id: 'py-04',
    concepts: ['biomass-pyramid'],
    difficulty: 2,
    prompt: 'What does biomass mean?',
    options: [
      'The total mass of all individuals combined',
      'The total number of species in a community',
      'The amount of energy in sunlight',
      'The volume of water in an ecosystem',
    ],
    answer: 0,
    explanation:
      'Biomass is the total mass of all individuals combined. A biomass pyramid compares the mass of organisms at each trophic level.',
    whyWrong: {
      1: 'That is closer to species richness or a numbers pyramid, not biomass.',
      2: 'Biomass is stored chemical matter, not incoming solar energy.',
      3: 'Water volume is an abiotic measurement, not biomass.',
    },
  }),
  mcq({
    id: 'py-05',
    concepts: ['numbers-pyramid'],
    difficulty: 4,
    prompt: 'A single large oak tree supports thousands of insects. Which pyramid could be inverted (narrow at the producer level) because of this?',
    options: ['Pyramid of numbers', 'Pyramid of energy', 'Pyramid of biomass always', 'None — all pyramids must be upright'],
    answer: 0,
    explanation:
      'A numbers pyramid counts individuals. One tree can support many insects, so the producer layer can be small while higher layers are larger, creating an inverted shape. The slides note that a numbers pyramid does not have to be upright.',
    whyWrong: {
      1: 'An energy pyramid is always upright in this course because energy decreases at each transfer.',
      2: 'A biomass pyramid is usually upright, but the question specifically asks about one tree supporting many insects — that is a count of individuals.',
      3: 'Numbers pyramids can be inverted; they are the exception described in the slides.',
    },
  }),
  mcq({
    id: 'py-06',
    concepts: ['energy-pyramid', 'numbers-pyramid'],
    difficulty: 3,
    prompt: 'Why can an ecosystem support fewer top carnivores than producers?',
    options: [
      'Energy is lost at each trophic level, so less energy is available at the top',
      'Top carnivores are always physically larger than producers',
      'Producers have no predators',
      'Top carnivores do not need energy',
    ],
    answer: 0,
    explanation:
      'Because only about 10% of energy transfers between levels, less energy reaches top carnivores. Fewer organisms can be supported at higher trophic levels.',
    whyWrong: {
      1: 'Body size does not explain the pattern; energy availability does.',
      2: 'Producers are eaten by primary consumers.',
      3: 'All organisms need energy for life processes.',
    },
  }),
  mcq({
    id: 'py-07',
    concepts: ['biomass-pyramid', 'energy-pyramid'],
    difficulty: 3,
    prompt: 'In a typical forest, the biomass of all trees is much greater than the biomass of herbivores. What shape does this biomass pyramid have?',
    options: ['A typical upright pyramid', 'An inverted pyramid', 'A perfect circle', 'A random shape with no pattern'],
    answer: 0,
    explanation:
      'The producer level has the greatest biomass, and biomass decreases at higher levels, producing the typical upright pyramid shape. The slides use the forest tree/herbivore example.',
    whyWrong: {
      1: 'An inverted biomass pyramid would mean more biomass at higher levels, which is not the forest example.',
      2: 'Ecological pyramids are drawn as stacked layers, not circles.',
      3: 'The pattern is predictable: lower trophic levels generally have more biomass.',
    },
  }),
  multi({
    id: 'py-08',
    concepts: ['energy-pyramid', 'biomass-pyramid', 'numbers-pyramid'],
    difficulty: 3,
    prompt: 'Select ALL statements that are true about ecological pyramids.',
    options: [
      'An energy pyramid shows energy loss between trophic levels',
      'A biomass pyramid compares the total mass of organisms at each level',
      'A numbers pyramid can be inverted if one producer supports many consumers',
      'Every pyramid must always have a wide producer layer',
    ],
    answer: [0, 1, 2],
    explanation:
      'Energy, biomass and numbers pyramids show different things. Energy pyramids are always widest at the producer level, but numbers pyramids can be inverted by a single large producer such as a tree.',
    whyWrong: {
      3: 'Numbers pyramids can be inverted; the producer layer is not always widest.',
    },
  }),
  tf({
    id: 'py-09',
    concepts: ['numbers-pyramid'],
    difficulty: 2,
    prompt: 'A pyramid of numbers must always be upright.',
    answer: 1,
    explanation:
      'False. A single tree (one producer) can support thousands of insects, making the producer layer smaller than the consumer layer. Numbers pyramids can be inverted.',
  }),
  tf({
    id: 'py-10',
    concepts: ['biomass-pyramid'],
    difficulty: 2,
    prompt: 'In a typical forest ecosystem, the biomass pyramid is upright because trees have more biomass than herbivores.',
    answer: 0,
    explanation:
      'True. The total mass of the trees is much greater than the total mass of the herbivores that eat them, so the producer layer is widest.',
  }),
  tf({
    id: 'py-11',
    concepts: ['energy-pyramid'],
    difficulty: 3,
    prompt: 'An energy pyramid can be inverted if there are many consumers.',
    answer: 1,
    explanation:
      'False. Energy decreases at every transfer because much is lost as heat. An energy pyramid is upright; numbers pyramids are the ones that can invert.',
  }),
  fill({
    id: 'py-12',
    concepts: ['energy-pyramid', 'biomass-pyramid', 'numbers-pyramid'],
    difficulty: 2,
    prompt:
      'An ___ pyramid shows available energy at each trophic level. A ___ pyramid shows the total mass of organisms. A ___ pyramid counts individual organisms.',
    blanks: [
      { accepted: [['energy']], hint: 'Measured in joules/kilojoules' },
      { accepted: [['biomass']], hint: 'Mass of living material' },
      { accepted: [['numbers', 'number']], hint: 'A count' },
    ],
    explanation:
      'Energy pyramid = energy; biomass pyramid = mass; numbers pyramid = individuals. All three show relationships between trophic levels but measure different things.',
  }),
  open('short')({
    id: 'py-13',
    concepts: ['numbers-pyramid', 'energy-pyramid'],
    difficulty: 4,
    prompt:
      'Explain why a pyramid of numbers can be inverted, using the tree example. Why does this not contradict the energy pyramid?',
    rubric: [
      { label: 'One tree can support many insects', synonyms: ['single tree', 'one tree', 'many insects', 'many consumers'] },
      { label: 'Numbers count individuals, not energy/mass', synonyms: ['count', 'individuals', 'not energy', 'not biomass'] },
      { label: 'Energy pyramid still decreases because of 10% loss', synonyms: ['energy', '10%', 'heat', 'lost', 'always upright'] },
    ],
    modelAnswer:
      'A numbers pyramid counts individual organisms. One large tree can support thousands of insects, so the producer layer has a smaller count than the consumer layer and the pyramid appears inverted. This does not contradict the energy pyramid: the tree still contains more total energy than the insects, and energy decreases at each transfer, so the energy pyramid remains upright.',
    explanation:
      'The two pyramids measure different variables. A count can be inverted by one huge producer; energy cannot increase as it moves up the chain.',
    source: 'Slides 2 — p.7; marked practice test Q30',
  }),
  scenario({
    id: 'py-14',
    concepts: ['data-calculation', 'energy-pyramid'],
    difficulty: 4,
    prompt:
      'A food chain starts with 245 000 units of energy in the producers. Assuming 10% trophic efficiency, calculate the energy at the 2nd, 3rd and 4th trophic levels. Show each step.',
    rubric: [
      { label: '2nd level = 24 500', synonyms: ['24500', '24 500'] },
      { label: '3rd level = 2 450', synonyms: ['2450', '2 450'] },
      { label: '4th level = 245', synonyms: ['245'] },
      { label: 'Each level is multiplied by 0.10 / divided by 10', synonyms: ['10%', '0.1', 'divide by 10', 'times 0.1'] },
    ],
    modelAnswer:
      '2nd trophic level: 245 000 × 0.10 = 24 500. 3rd: 24 500 × 0.10 = 2 450. 4th: 2 450 × 0.10 = 245. Each transfer retains 10% and loses 90% as heat/used energy.',
    explanation:
      'The practice test asked exactly this with the pond food web: duckweed 245 000 → guppies 24 500 → catfish 2 450 → snail/ghost shrimp 245 (depending on the path). Always show the multiplication, not just the final numbers.',
    source: 'Marked practice test Q27',
  }),
  mcq({
    id: 'py-15',
    concepts: ['data-calculation', 'energy-loss'],
    difficulty: 3,
    prompt: 'Producers in a chain contain 10 000 kJ of energy. About how much energy reaches the secondary consumers?',
    options: ['100 kJ', '1 000 kJ', '10 kJ', '10 000 kJ'],
    answer: 0,
    explanation:
      'Primary consumers receive 10% of 10 000 = 1 000 kJ. Secondary consumers receive 10% of that = 100 kJ. Two transfers means multiplying by 0.10 twice.',
    whyWrong: {
      1: '1 000 kJ is the energy at the primary consumer level, not the secondary level.',
      2: '10 kJ would require a third 10% transfer.',
      3: 'Energy cannot stay at 10 000 kJ; it decreases at each transfer.',
    },
  }),
  compare({
    id: 'py-16',
    concepts: ['biomass-pyramid', 'energy-pyramid'],
    difficulty: 3,
    prompt: 'Compare an energy pyramid and a biomass pyramid. What does each measure, and what shape is typical?',
    rubric: [
      { label: 'Energy pyramid measures available energy', synonyms: ['energy', 'joules', 'available'] },
      { label: 'Biomass pyramid measures total mass', synonyms: ['mass', 'biomass', 'grams', 'kilograms'] },
      { label: 'Both usually upright / energy always upright', synonyms: ['upright', 'decrease', 'producer widest', 'energy always'] },
    ],
    modelAnswer:
      'An energy pyramid measures the energy available at each trophic level and is always upright because energy is lost at each transfer. A biomass pyramid measures the total mass of organisms at each level; it is usually upright in a typical forest because producers have more mass than herbivores.',
    explanation:
      'Both often look similar, but they measure different quantities. Energy always decreases; biomass usually decreases but can have exceptions in some ecosystems not covered by these slides.',
  }),
];