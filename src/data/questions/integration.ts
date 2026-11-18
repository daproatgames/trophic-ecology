import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('integration');
const scenario = open('scenario');
const compare = open('compare');
const error = open('error');
const causeEffect = open('causeeffect');

export const integrationQuestions: Question[] = [
  mcq({
    id: 'in-01',
    concepts: ['cycle-integration', 'nitrogen-importance'],
    difficulty: 3,
    prompt: 'How many "stops" does a nitrogen atom make on its journey through the nitrogen cycle?',
    options: [
      'There is no fixed number — atoms cycle repeatedly through living and non-living reservoirs',
      'Exactly one',
      'Exactly five',
      'Exactly nine',
    ],
    answer: 0,
    explanation:
      'Matter is recycled, so a nitrogen atom can pass through many organisms, soils, water and the atmosphere repeatedly. There is no fixed number of stops. This was question 1 on your practice test.',
    whyWrong: {
      1: 'A single stop would mean matter is not recycled.',
      2: 'Five is not a meaningful limit; atoms can cycle indefinitely.',
      3: 'Nine is not a meaningful limit; the cycle has no fixed number of trips.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'in-02',
    concepts: ['data-calculation', 'energy-loss'],
    difficulty: 3,
    prompt: 'Grass starts with 100% of the Sun\'s captured energy. A rabbit eats the grass, and a fox eats the rabbit. What percentage of the original energy does the fox receive?',
    options: ['1%', '10%', '100%', '0.1%'],
    answer: 0,
    explanation:
      'Grass → rabbit is one transfer: 100% × 10% = 10%. Rabbit → fox is a second transfer: 10% × 10% = 1%. This was question 2 on your practice test.',
    whyWrong: {
      1: '10% is the rabbit\'s share after one transfer, not the fox\'s after two.',
      2: '100% would mean no energy is lost — impossible.',
      3: '0.1% would require a third 10% transfer.',
    },
    teacherStyle: true,
    source: 'Marked practice test Q2',
  }),
  mcq({
    id: 'in-03',
    concepts: ['data-calculation'],
    difficulty: 4,
    prompt: 'A producer level contains 50 000 units of energy. If trophic efficiency is 10%, how much energy is at the third trophic level?',
    options: ['500 units', '5 000 units', '50 units', '50 000 units'],
    answer: 0,
    explanation:
      'Second level: 50 000 × 0.10 = 5 000. Third level: 5 000 × 0.10 = 500. Two transfers, so multiply by 0.10 twice.',
    whyWrong: {
      1: '5 000 is the second trophic level.',
      2: '50 would require a third transfer.',
      3: 'Energy decreases; it does not remain at the producer value.',
    },
  }),
  mcq({
    id: 'in-04',
    concepts: ['cycle-integration', 'photosynthesis', 'cellular-respiration'],
    difficulty: 3,
    prompt: 'Which pair of processes is mainly responsible for cycling carbon and oxygen through an ecosystem?',
    options: [
      'Photosynthesis and cellular respiration',
      'Nitrification and denitrification',
      'Evaporation and condensation',
      'Fixation and ammonification',
    ],
    answer: 0,
    explanation:
      'Photosynthesis removes CO₂ and releases O₂; respiration uses O₂ and releases CO₂. The other pairs belong to the nitrogen or water cycles. This mirrors question 9 on your practice test.',
    whyWrong: {
      1: 'Those cycle nitrogen.',
      2: 'Those drive the water cycle.',
      3: 'Those are nitrogen-cycle processes.',
    },
    teacherStyle: true,
  }),
  multi({
    id: 'in-05',
    concepts: ['cycle-integration', 'human-carbon-impact', 'fertilizers-eutrophication'],
    difficulty: 3,
    prompt: 'Which human activities directly affect biogeochemical cycles? Select ALL that apply.',
    options: [
      'Burning fossil fuels',
      'Applying artificial fertilizer',
      'Clearing forest for agriculture',
      'Building a dam that changes water flow',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'All four alter matter cycles: combustion adds CO₂; fertilizer adds nitrogen; deforestation reduces carbon uptake; dams change water movement and sediment/nutrient transport.',
  }),
  tf({
    id: 'in-06',
    concepts: ['cycle-integration'],
    difficulty: 3,
    prompt: 'The carbon, water and nitrogen cycles are completely independent and never interact.',
    answer: 1,
    explanation:
      'False. The cycles are connected. For example, photosynthesis links the carbon and water cycles, cellular respiration releases both CO₂ and water, and decomposers release CO₂ while cycling nitrogen. Ecosystems function as connected systems.',
  }),
  fill({
    id: 'in-07',
    concepts: ['cycle-integration'],
    difficulty: 2,
    prompt:
      'The cycle driven by evaporation, condensation and precipitation is the ___ cycle. The cycle driven by photosynthesis and respiration is the ___ cycle. The cycle driven by bacteria converting N₂ into usable compounds is the ___ cycle.',
    blanks: [
      { accepted: [['water', 'hydrologic']], hint: 'Evaporation and rain' },
      { accepted: [['carbon']], hint: 'CO₂ ↔ glucose' },
      { accepted: [['nitrogen']], hint: 'N₂ → NH₃ → NO₃⁻' },
    ],
    explanation:
      'Water cycle: evaporation/condensation/precipitation. Carbon cycle: photosynthesis/respiration/combustion. Nitrogen cycle: fixation/nitrification/denitrification.',
  }),
  open('short')({
    id: 'in-08',
    concepts: ['matter-energy', 'cycle-integration'],
    difficulty: 4,
    prompt: 'Explain why scientists say energy flows through an ecosystem while matter cycles within it.',
    rubric: [
      { label: 'Energy arrives from the Sun', synonyms: ['sun', 'sunlight', 'solar'] },
      { label: 'Energy is lost as heat / not recycled', synonyms: ['heat', 'thermal', 'lost', 'one-way'] },
      { label: 'Matter is recycled between biotic and abiotic reservoirs', synonyms: ['matter', 'recycled', 'biotic', 'abiotic', 'reservoirs'] },
      { label: 'Matter is conserved / atoms reused', synonyms: ['conserved', 'atoms', 'reused', 'same matter'] },
    ],
    modelAnswer:
      'Energy enters ecosystems as sunlight and moves through organisms, but at each transfer much is lost as heat and eventually radiates back out, so it must be continually replaced. Matter is different: atoms of carbon, nitrogen, water and other elements are conserved and continually recycled between living organisms and abiotic reservoirs.',
    explanation:
      'This is a high-value synthesis answer. Use the words "flow" for energy and "cycle" for matter, and give the reason: energy is lost as heat, while matter is conserved.',
  }),
  scenario({
    id: 'in-09',
    concepts: ['human-carbon-impact', 'carbon-cycle'],
    difficulty: 4,
    prompt:
      'A city replaces a forest with pavement and also burns more fossil fuel. Explain two ways this could increase atmospheric carbon dioxide.',
    rubric: [
      { label: 'Fewer trees = less photosynthesis / carbon sink', synonyms: ['fewer trees', 'deforestation', 'photosynthesis', 'sink', 'less carbon'] },
      { label: 'Burning fossil fuels releases CO₂', synonyms: ['combustion', 'burning', 'fossil fuel', 'carbon dioxide'] },
      { label: 'Both add to atmosphere / imbalance', synonyms: ['atmosphere', 'increase', 'imbalance', 'net'] },
    ],
    modelAnswer:
      'Removing the forest reduces photosynthesis, so less CO₂ is removed from the atmosphere. Burning fossil fuels releases stored carbon as CO₂. Together, the reduced carbon sink and increased carbon source raise atmospheric CO₂.',
    explanation:
      'Look for both sides of the carbon budget: sources increase, sinks decrease. This is the kind of applied reasoning the test may ask for.',
  }),
  compare({
    id: 'in-10',
    concepts: ['cycle-integration'],
    difficulty: 4,
    prompt: 'Compare the carbon cycle and the nitrogen cycle. Include the key organisms/processes and one human impact on each.',
    rubric: [
      { label: 'Carbon: photosynthesis/respiration/combustion', synonyms: ['photosynthesis', 'respiration', 'combustion', 'carbon dioxide'] },
      { label: 'Nitrogen: fixation/nitrification/denitrification', synonyms: ['fixation', 'nitrification', 'denitrification', 'bacteria'] },
      { label: 'Human carbon impact: fossil fuel burning/deforestation', synonyms: ['fossil fuel', 'deforestation', 'burning', 'combustion'] },
      { label: 'Human nitrogen impact: fertilizer runoff/eutrophication', synonyms: ['fertilizer', 'runoff', 'eutrophication', 'algal bloom'] },
    ],
    modelAnswer:
      'The carbon cycle moves carbon between the atmosphere, organisms, fossil fuels and rocks through photosynthesis, respiration, decomposition, combustion and geological processes. The nitrogen cycle depends heavily on bacteria for fixation, nitrification and denitrification. Humans affect carbon mainly by burning fossil fuels and clearing forests, and affect nitrogen mainly by adding artificial fertilizers that can run off and cause eutrophication.',
    explanation:
      'A strong comparison uses parallel categories: key processes, key organisms, reservoirs and human impact. Precision matters more than length.',
  }),
  mcq({
    id: 'in-11',
    concepts: ['exam-precision', 'energy-pyramid'],
    difficulty: 3,
    prompt: 'Which answer is the most precise correction? "Species in the highest trophic level have more energy available than species near the bottom."',
    options: [
      'Change "more" to "less": energy decreases at each transfer, so top-level species have less available energy',
      'Change "energy" to "biomass" only',
      'The statement is correct',
      'Change "trophic level" to "population"',
    ],
    answer: 0,
    explanation:
      'Energy decreases at each trophic transfer because most is used and lost as heat. The precise correction is "less" energy, not more. This was question 22 on your practice test.',
    whyWrong: {
      1: 'The error is the direction (more vs less), not just the quantity being measured.',
      2: 'The statement is false; top consumers do not have more energy available.',
      3: 'Changing "trophic level" to "population" does not fix the reversed energy relationship.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'in-12',
    concepts: ['exam-precision', 'energy-loss'],
    difficulty: 3,
    prompt: 'Which correction makes this true? "Only 1% of the energy stored in a trophic level gets passed onto the next trophic level."',
    options: [
      'Change 1% to about 10%',
      'Change 1% to 100%',
      'Change "next trophic level" to "Sun"',
      'No change is needed',
    ],
    answer: 0,
    explanation:
      'The approximate ecological rule is 10% transfer between trophic levels; about 90% is lost. This was question 21 on your practice test.',
    whyWrong: {
      1: '100% transfer would mean no energy loss, which is impossible.',
      2: 'Energy moves from the Sun to producers, not from a trophic level back to the Sun in this statement.',
      3: 'The 1% figure is the error; the rule is about 10%.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'in-13',
    concepts: ['exam-precision', 'cellular-respiration', 'photosynthesis'],
    difficulty: 3,
    prompt: 'Which correction makes this true? "Plants use cellular respiration to capture energy for other trophic levels."',
    options: [
      'Change "cellular respiration" to "photosynthesis"',
      'Change "plants" to "animals"',
      'Change "capture" to "release" only',
      'No change is needed',
    ],
    answer: 0,
    explanation:
      'Plants capture light energy through photosynthesis, storing it in glucose that can be passed to other trophic levels. Cellular respiration releases energy for the plant\'s own use. This was question 24 on your practice test.',
    whyWrong: {
      1: 'Animals do not photosynthesize, so this does not fix the statement.',
      2: 'The process named is wrong, not just the verb.',
      3: 'Cellular respiration releases energy rather than capturing it for the food chain.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'in-14',
    concepts: ['exam-precision', 'biomass-pyramid'],
    difficulty: 4,
    prompt: 'A student says a pyramid of biomass "counts the number of organisms." What is the best correction?',
    options: [
      'A biomass pyramid measures total mass; a numbers pyramid counts individuals',
      'A biomass pyramid measures energy; a numbers pyramid measures mass',
      'A biomass pyramid measures sunlight; a numbers pyramid measures species',
      'There is no difference between biomass and numbers pyramids',
    ],
    answer: 0,
    explanation:
      'Biomass = total mass of all individuals combined. Numbers = count of individuals. Energy = available energy. Mixing these up is a common exam error.',
    whyWrong: {
      1: 'This reverses biomass and energy.',
      2: 'Neither pyramid measures sunlight or species richness.',
      3: 'They measure different variables and can have different shapes.',
    },
  }),
  mcq({
    id: 'in-15',
    concepts: ['data-calculation', 'numbers-pyramid'],
    difficulty: 4,
    prompt: 'A forest has 1 000 000 producers, 10 000 herbivores, 100 secondary consumers and 1 top carnivore. Which pyramid does this describe, and what is its shape?',
    options: [
      'A numbers pyramid; it is upright because counts decrease at higher levels',
      'An energy pyramid; it is inverted',
      'A biomass pyramid; it is always inverted',
      'A water pyramid; it has no shape',
    ],
    answer: 0,
    explanation:
      'These are counts of individuals, so this is a numbers pyramid. It is upright because each higher level has fewer individuals. The slides use a similar forest example (millions of producers → thousands of herbivores → dozens of secondary consumers → one top carnivore).',
    whyWrong: {
      1: 'The data are counts, not energy; energy pyramids are not inverted anyway.',
      2: 'The data are counts, not mass; biomass pyramids are usually upright, not always inverted.',
      3: 'There is no "water pyramid" in this unit.',
    },
    teacherStyle: true,
  }),
  causeEffect({
    id: 'in-16',
    concepts: ['human-carbon-impact', 'carbon-cycle', 'sustainability'],
    difficulty: 4,
    prompt:
      'Explain one human impact on a biogeochemical cycle in detail, naming the cycle, the process and the consequence.',
    rubric: [
      { label: 'Names a specific cycle', synonyms: ['carbon', 'nitrogen', 'water'] },
      { label: 'Names a human process', synonyms: ['combustion', 'burning', 'fertilizer', 'deforestation', 'runoff'] },
      { label: 'Explains the mechanism', synonyms: ['releases', 'adds', 'removes', 'nutrients', 'carbon dioxide'] },
      { label: 'States a consequence for ecosystems', synonyms: ['dead zone', 'algal bloom', 'climate', 'atmosphere', 'oxygen'] },
    ],
    modelAnswer:
      'In the carbon cycle, humans burn fossil fuels, which releases carbon that was stored underground for millions of years as CO₂. This adds carbon to the atmosphere faster than photosynthesis can remove it, increasing atmospheric CO₂ and affecting ecosystems and climate. In the nitrogen cycle, fertilizer runoff adds excess nutrients to water, causing algal blooms and dead zones.',
    explanation:
      'This mirrors practice test Q28. The marks come from specifics: cycle + process + mechanism + consequence. Avoid a vague "pollution is bad" answer.',
    source: 'Marked practice test Q28',
    teacherStyle: true,
  }),
  mcq({
    id: 'in-17',
    concepts: ['exam-precision', 'photosynthesis'],
    difficulty: 3,
    prompt: 'Which is the complete, balanced chemical equation for photosynthesis?',
    options: [
      '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (with light energy)',
      'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy',
      'CO₂ + H₂O → C₆H₁₂O₆ + O₂',
      '6CO₂ + 6O₂ → C₆H₁₂O₆ + 6H₂O',
    ],
    answer: 0,
    explanation:
      'Photosynthesis uses six carbon dioxide and six water molecules to produce one glucose and six oxygen molecules, powered by light. The equation must be balanced.',
    whyWrong: {
      1: 'That is cellular respiration, the reverse process.',
      2: 'This equation is unbalanced and missing coefficients.',
      3: 'Oxygen is a product, not a reactant; this equation is incorrect.',
    },
    source: 'Marked practice test Q31',
    teacherStyle: true,
  }),
  mcq({
    id: 'in-18',
    concepts: ['exam-precision', 'matter-energy'],
    difficulty: 4,
    prompt: 'Which statement about the highest trophic level is correct?',
    options: [
      'It has the least energy available and usually supports fewer organisms',
      'It has the most energy because it is at the top',
      'It has the same energy as the producer level',
      'It contains the most biomass in every ecosystem',
    ],
    answer: 0,
    explanation:
      'Energy decreases at each transfer, so the highest trophic level has the least available energy and generally supports fewer individuals. This is the correction for practice test Q22.',
    whyWrong: {
      1: 'This is the misconception the practice test targeted; energy is lost, not gained, as you move up.',
      2: 'Energy decreases at each transfer, so it cannot be equal to the producer level.',
      3: 'Biomass usually decreases at higher levels too, and it is not always greatest at the top.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'in-19',
    concepts: ['cycle-integration'],
    difficulty: 4,
    prompt: 'A nitrogen atom in a dead leaf is released as ammonia, converted to nitrate, absorbed by a plant, eaten by a rabbit, and excreted. What happens next in the nitrogen cycle?',
    options: [
      'Decomposers can ammonify the waste, and bacteria can nitrify or denitrify it',
      'The nitrogen becomes energy and is lost as heat',
      'The nitrogen immediately becomes glucose',
      'The nitrogen can no longer be used by any organism',
    ],
    answer: 0,
    explanation:
      'Nitrogen in waste can be broken down by decomposers (ammonification), then nitrified into nitrates or denitrified back to N₂. Matter is recycled repeatedly; it does not become energy.',
    whyWrong: {
      1: 'Matter does not convert into energy; energy and matter are different.',
      2: 'Glucose contains no nitrogen.',
      3: 'Nitrogen remains available in various compounds and cycles onward.',
    },
  }),
  multi({
    id: 'in-20',
    concepts: ['cycle-integration'],
    difficulty: 4,
    prompt: 'Which statements correctly connect the cycles? Select ALL that apply.',
    options: [
      'Photosynthesis links the carbon and water cycles by using CO₂ and H₂O',
      'Cellular respiration releases both CO₂ and water',
      'Decomposers release CO₂ and ammonia/ammonium, linking carbon and nitrogen cycles',
      'Denitrification produces glucose',
    ],
    answer: [0, 1, 2],
    explanation:
      'Photosynthesis uses CO₂ and water; respiration produces both; decomposers release carbon and nitrogen compounds. Denitrification produces N₂ gas, not glucose.',
    whyWrong: {
      3: 'Denitrification produces nitrogen gas (N₂); glucose is made by photosynthesis.',
    },
  }),
  error({
    id: 'in-21',
    concepts: ['exam-precision', 'energy-loss'],
    difficulty: 3,
    prompt:
      'A student answers: "Top predators have less energy because they are bigger." Identify the reasoning error and write a better explanation.',
    rubric: [
      { label: 'The cause is energy loss at each trophic transfer', synonyms: ['energy loss', '10%', 'heat', 'transfer'] },
      { label: 'Size is not the reason', synonyms: ['not size', 'not because bigger', 'irrelevant'] },
      { label: 'Less energy supports fewer top predators', synonyms: ['less energy', 'fewer', 'support'] },
    ],
    modelAnswer:
      'Top predators have less available energy because only about 10% of energy is transferred from one trophic level to the next; the rest is used and lost as heat. Their size is not the cause. With less energy available, the ecosystem can support fewer top predators.',
    explanation:
      'Correlation is not causation. The pyramid pattern comes from energy loss, not body size.',
  }),
];