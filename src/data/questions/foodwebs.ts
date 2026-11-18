import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('foodwebs');
const causeEffect = open('causeeffect');
const scenario = open('scenario');
const compare = open('compare');
const error = open('error');

export const foodWebQuestions: Question[] = [
  mcq({
    id: 'fw-01',
    concepts: ['food-chain'],
    difficulty: 1,
    prompt: 'What do the arrows in a food chain represent?',
    options: [
      'The direction of energy transfer from one organism to the next',
      'The direction an animal runs when hunting',
      'The amount of biomass in each organism',
      'The direction of water flow in the ecosystem',
    ],
    answer: 0,
    explanation:
      'Arrows point from the organism being eaten toward the eater. They show the direction of energy transfer, not "who eats whom" in reverse.',
    whyWrong: {
      1: 'Arrows show feeding/energy transfer, not movement.',
      2: 'Biomass is shown by a pyramid, not by food-chain arrows.',
      3: 'Water movement is part of the water cycle, not the feeding arrows.',
    },
  }),
  mcq({
    id: 'fw-02',
    concepts: ['food-chain', 'solar-energy'],
    difficulty: 1,
    prompt: 'Where does the energy in most food chains originally come from?',
    options: ['The Sun', 'The soil', 'Decomposers', 'The Moon'],
    answer: 0,
    explanation:
      'Producers capture radiant energy from the Sun and convert it into chemical energy during photosynthesis. That energy then passes through the food chain.',
    whyWrong: {
      1: 'Soil supplies nutrients and water, but not the original energy for photosynthesis.',
      2: 'Decomposers recycle matter; they do not create the original energy input.',
      3: 'The Moon has no role in powering photosynthesis.',
    },
  }),
  mcq({
    id: 'fw-03',
    concepts: ['trophic-levels', 'food-chain'],
    difficulty: 2,
    prompt: 'Pine tree → red squirrel → weasel → goshawk. What is the red squirrel\'s role?',
    options: ['Primary consumer', 'Producer', 'Secondary consumer', 'Decomposer'],
    answer: 0,
    explanation:
      'The pine tree is the producer (first trophic level). The squirrel eats the producer, so it is a primary consumer at the second trophic level.',
    whyWrong: {
      1: 'The pine tree is the producer; the squirrel cannot photosynthesize.',
      2: 'A secondary consumer eats a primary consumer. The squirrel eats the producer directly.',
      3: 'Decomposers break down dead remains; the squirrel eats live seeds.',
    },
  }),
  mcq({
    id: 'fw-04',
    concepts: ['trophic-levels'],
    difficulty: 3,
    prompt: 'In the chain pine tree → squirrel → weasel → goshawk, which trophic level is the weasel?',
    options: ['Third trophic level (secondary consumer)', 'Second trophic level (primary consumer)', 'First trophic level (producer)', 'Fourth trophic level (tertiary consumer)'],
    answer: 0,
    explanation:
      'Producer = 1st, squirrel (primary consumer) = 2nd, weasel (secondary consumer) = 3rd, goshawk (tertiary consumer) = 4th.',
    whyWrong: {
      1: 'The squirrel is the second-level primary consumer.',
      2: 'The pine tree is the producer at the first level.',
      3: 'The goshawk is the fourth-level tertiary consumer.',
    },
  }),
  mcq({
    id: 'fw-05',
    concepts: ['trophic-levels', 'food-chain'],
    difficulty: 3,
    prompt: 'Fraser River chain: phytoplankton → plankton → tadpoles → pickerel → human. What are the tadpoles?',
    options: ['Secondary consumers', 'Primary producers', 'Primary consumers', 'Tertiary consumers'],
    answer: 0,
    explanation:
      'Phytoplankton are producers (1st). Plankton eating them are primary consumers (2nd). Tadpoles eat plankton, so they are secondary consumers (3rd). This is the same chain used on your practice test.',
    whyWrong: {
      1: 'Phytoplankton are the producers in this chain.',
      2: 'Primary consumers are the plankton that eat phytoplankton.',
      3: 'Tertiary consumers are the pickerel that eat tadpoles.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'fw-06',
    concepts: ['biomass-pyramid', 'food-chain'],
    difficulty: 3,
    prompt: 'Using the Fraser River chain, which organism would likely have the greatest biomass?',
    options: ['Phytoplankton/plankton', 'Small minnows', 'Pickerel', 'Human'],
    answer: 0,
    explanation:
      'Biomass is greatest at the producer level because energy and matter are lost at each transfer. Among the choices, the plankton producers have the greatest biomass — the same reasoning as question 6 on your practice test.',
    whyWrong: {
      1: 'Small minnows are consumers, so they have less biomass than the producer level.',
      2: 'Pickerel are higher-level consumers with less energy and biomass available.',
      3: 'A top consumer like a human has the least biomass available at its level.',
    },
    teacherStyle: true,
    source: 'Marked practice test Q6 + Slides 2',
  }),
  mcq({
    id: 'fw-07',
    concepts: ['food-chain'],
    difficulty: 2,
    prompt: 'Which is the best definition of a food chain?',
    options: [
      'A sequence of organisms in which each feeds on the one before it, showing energy transfer',
      'A list of every species in an ecosystem',
      'A diagram showing only the abiotic factors in an area',
      'A map of where animals sleep',
    ],
    answer: 0,
    explanation:
      'A food chain is a sequence of organisms, each feeding on the next, that shows how energy is transferred from one organism to another. It starts with a producer using the Sun\'s energy.',
    whyWrong: {
      1: 'A list of every species is closer to a community inventory, not a feeding sequence.',
      2: 'Food chains show feeding relationships among organisms, not abiotic factors.',
      3: 'Habitat describes where organisms live; it is not a food chain.',
    },
  }),
  multi({
    id: 'fw-08',
    concepts: ['food-web'],
    difficulty: 3,
    prompt: 'Which statements about food webs are correct? Select ALL that apply.',
    options: [
      'A food web represents the feeding relationships within a community',
      'Food webs are made of interconnected food chains',
      'A food web can give a species alternative food sources if one prey declines',
      'Food chains in nature are usually as simple as a single straight line',
    ],
    answer: [0, 1, 2],
    explanation:
      'A food web shows the complex feeding relationships among species and connects many food chains. The extra pathways can buffer the community when one species declines. Real food chains are rarely as simple as textbook straight lines.',
    whyWrong: {
      3: 'The slides emphasize that food chains do not exist in nature in such a simple form; feeding relationships are complex.',
    },
  }),
  tf({
    id: 'fw-09',
    concepts: ['food-web'],
    difficulty: 2,
    prompt: 'Food chains in nature are usually exactly as simple as a single straight line.',
    answer: 1,
    explanation:
      'False. The slides state that food chains do not exist in nature in this simple form. Feeding relationships are complex and better represented by food webs.',
  }),
  tf({
    id: 'fw-10',
    concepts: ['food-chain'],
    difficulty: 2,
    prompt: 'In a food chain, the arrow points toward the organism that receives the energy.',
    answer: 0,
    explanation:
      'True. The arrow shows the direction of energy transfer: from the organism being eaten to the eater. For example, grass → rabbit means energy flows from grass to rabbit.',
  }),
  tf({
    id: 'fw-11',
    concepts: ['food-web', 'sustainability'],
    difficulty: 3,
    prompt: 'Removing any single species from a food web will always make the entire ecosystem collapse immediately.',
    answer: 1,
    explanation:
      'False. A food web has many interactions, so species are not completely reliant on one another. Some removals can be buffered by alternative food sources; keystone species are an exception because their role is disproportionate.',
  }),
  fill({
    id: 'fw-12',
    concepts: ['trophic-levels'],
    difficulty: 2,
    prompt:
      'The first trophic level contains the ___. The second trophic level contains the ___ consumers. The third trophic level contains the ___ consumers.',
    blanks: [
      { accepted: [['producer', 'producers'], ['primary producer', 'primary producers']], hint: 'Makes its own food' },
      { accepted: [['primary', 'first']], hint: 'Eats the producer' },
      { accepted: [['secondary', 'second']], hint: 'Eats the primary consumer' },
    ],
    explanation:
      '1st = producers; 2nd = primary consumers (herbivores); 3rd = secondary consumers (carnivores that eat herbivores); 4th = tertiary consumers.',
  }),
  fill({
    id: 'fw-13',
    concepts: ['energy-loss'],
    difficulty: 2,
    prompt:
      'On average, only about ___% of the energy stored at one trophic level is transferred to the next. The rest is mostly lost as ___ energy.',
    blanks: [
      { accepted: [['10', 'ten', '10%']], hint: 'The "10% rule"' },
      { accepted: [['thermal', 'heat']], hint: 'Energy used for life processes escapes this way' },
    ],
    explanation:
      'About 10% of energy is transferred to the next trophic level. Most is used in daily routines and released as thermal energy, so higher trophic levels support smaller populations.',
  }),
  open('short')({
    id: 'fw-14',
    concepts: ['energy-loss'],
    difficulty: 3,
    prompt: 'Explain why the amount of available energy decreases at each trophic level.',
    rubric: [
      { label: 'Energy is used for life processes', synonyms: ['used', 'daily routines', 'survive', 'grow', 'reproduce', 'metabolism'] },
      { label: 'Energy is lost as heat/thermal energy', synonyms: ['heat', 'thermal', 'released to environment'] },
      { label: 'Only about 10% transfers to the next level', synonyms: ['10', 'ten percent', '10%'] },
    ],
    modelAnswer:
      'Organisms use most of the energy they obtain for survival, growth and reproduction. Much of it is released to the environment as thermal energy. Only about 10% of the stored energy is passed to the next trophic level, so less energy is available higher up the chain.',
    explanation:
      'A strong answer names all three ideas: energy is used by the organism, some is lost as heat, and only about 10% is transferred. This explains why food chains are short and why top consumers are fewer.',
    source: 'Slides 2 — p.3; marked practice test Q21',
  }),
  scenario({
    id: 'fw-15',
    concepts: ['food-web', 'sustainability'],
    difficulty: 4,
    prompt:
      'A drought kills most of the producers in a meadow food web. Predict two effects and explain your reasoning.',
    rubric: [
      { label: 'Consumers decrease or starve', synonyms: ['primary consumers', 'herbivores', 'decrease', 'decline', 'less food', 'starve'] },
      { label: 'Higher trophic levels also decrease / cascade', synonyms: ['secondary', 'tertiary', 'predators', 'cascade', 'higher trophic'] },
      { label: 'Because energy enters through producers', synonyms: ['sun', 'photosynthesis', 'energy source', 'base of food web'] },
    ],
    modelAnswer:
      'Primary consumers would decline because they have less plant food. Predators at higher trophic levels would also decline because their prey become scarce. Energy enters the food web through producers, so losing them reduces energy available to every level above.',
    explanation:
      'This is a bottom-up cascade. The key is that producers form the energy base; a loss at the base propagates upward, though the timing and severity depend on the web\'s alternative pathways.',
  }),
  error({
    id: 'fw-16',
    concepts: ['matter-energy', 'energy-loss'],
    difficulty: 3,
    prompt:
      'A student writes: "Energy cycles through an ecosystem, and the same energy is reused forever." Identify the error and correct it.',
    rubric: [
      { label: 'Energy does not cycle/recycle', synonyms: ['does not cycle', 'not recycled', 'flows', 'one-way', 'lost'] },
      { label: 'Energy is lost as heat / must be replaced by the Sun', synonyms: ['heat', 'thermal', 'sun', 'sunlight'] },
      { label: 'Matter, not energy, cycles', synonyms: ['matter cycles', 'nutrients', 'atoms', 'biogeochemical'] },
    ],
    modelAnswer:
      'Energy flows through ecosystems in one direction and is not recycled. Most is lost as thermal energy at each transfer, so new energy must continually arrive from the Sun. It is matter/nutrients that cycle repeatedly.',
    explanation:
      'This is a classic confusion. Energy flows and is lost; matter cycles between biotic and abiotic reservoirs.',
  }),
  compare({
    id: 'fw-17',
    concepts: ['food-chain', 'food-web'],
    difficulty: 3,
    prompt: 'Compare a food chain with a food web. Include one strength of each representation.',
    rubric: [
      { label: 'Food chain is a single sequence/path', synonyms: ['single', 'sequence', 'one path', 'linear'] },
      { label: 'Food web shows many interconnected chains', synonyms: ['interconnected', 'multiple', 'complex', 'network', 'all relationships'] },
      { label: 'Web is more realistic / shows alternatives', synonyms: ['realistic', 'alternative', 'not reliant', 'stability', 'community'] },
    ],
    modelAnswer:
      'A food chain shows one linear sequence of feeding and energy transfer, which makes it easy to see who eats whom. A food web combines many interconnected food chains and better represents real communities because it shows alternative food sources and complex interactions.',
    explanation:
      'The chain is simpler and clearer; the web is more realistic and complete. The slides emphasize that food chains are parts of more complex webs.',
  }),
  causeEffect({
    id: 'fw-18',
    concepts: ['food-web', 'sustainability'],
    difficulty: 4,
    prompt:
      'An invasive fish that eats plankton is introduced into a lake. Trace a possible cause-and-effect chain through the food web.',
    rubric: [
      { label: 'Plankton population decreases', synonyms: ['plankton', 'prey', 'decline', 'decrease'] },
      { label: 'Competitors or predators of plankton are affected', synonyms: ['competition', 'less food', 'tadpoles', 'native fish', 'decline'] },
      { label: 'Higher trophic levels / whole web affected', synonyms: ['predator', 'higher', 'cascade', 'ecosystem', 'web'] },
    ],
    modelAnswer:
      'The invasive fish eats plankton, so plankton numbers fall. Native plankton-eaters such as tadpoles or small fish then have less food and may decline. Predators that depend on those native species are also affected, so the change can cascade through the web. The web may buffer some of this if alternative prey exist.',
    explanation:
      'Invasive species can change competition and predation pathways. The exact outcome depends on the web, but the mechanism always starts with a change in feeding relationships.',
  }),
  mcq({
    id: 'fw-19',
    concepts: ['trophic-levels', 'food-chain'],
    difficulty: 4,
    prompt: 'In the Fraser River chain (phytoplankton → plankton → tadpoles → pickerel → human), what trophic level is the pickerel?',
    options: ['Fourth trophic level / tertiary consumer', 'Third trophic level / secondary consumer', 'Second trophic level / primary consumer', 'Fifth trophic level / quaternary consumer'],
    answer: 0,
    explanation:
      'Phytoplankton = 1st producer; plankton = 2nd primary consumer; tadpoles = 3rd secondary consumer; pickerel = 4th tertiary consumer; human = 5th quaternary consumer.',
    whyWrong: {
      1: 'The tadpoles are the third-level secondary consumers.',
      2: 'The plankton are the second-level primary consumers.',
      3: 'The human is the fifth-level quaternary consumer.',
    },
    teacherStyle: true,
  }),
  multi({
    id: 'fw-20',
    concepts: ['energy-loss', 'energy-pyramid'],
    difficulty: 3,
    prompt: 'Which statements follow from the 10% rule? Select ALL that apply.',
    options: [
      'A trophic level generally supports less biomass than the level below it',
      'Top carnivores are usually less abundant than producers',
      'Energy is lost as heat at each transfer',
      'An ecosystem can support unlimited top predators if producers are present',
    ],
    answer: [0, 1, 2],
    explanation:
      'Because only about 10% of energy moves up, less biomass and fewer individuals can be supported at higher levels. Energy is lost mainly as heat. Top predator numbers are therefore limited by the energy available, not unlimited.',
    whyWrong: {
      3: 'Energy losses mean top predator numbers are limited; producers cannot support an unlimited number of them.',
    },
  }),
];