import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('energy');
const scenario = open('scenario');
const compare = open('compare');
const error = open('error');

export const energyQuestions: Question[] = [
  mcq({
    id: 'en-01',
    concepts: ['solar-energy'],
    difficulty: 1,
    prompt: 'What is the primary energy source for most ecosystems on Earth?',
    options: ['The Sun', 'The soil', 'Cellular respiration', 'The Moon'],
    answer: 0,
    explanation:
      'The Sun is the energy source for most ecosystems. Producers capture solar energy and convert it into chemical energy during photosynthesis.',
    whyWrong: {
      1: 'Soil supplies water and minerals but is not the original energy source.',
      2: 'Cellular respiration releases stored energy; it does not create the initial input.',
      3: 'The Moon does not supply energy to ecosystems.',
    },
  }),
  mcq({
    id: 'en-02',
    concepts: ['solar-energy', 'photosynthesis'],
    difficulty: 2,
    prompt: 'Of the solar energy that reaches Earth, roughly what percentage is used by ecosystems through photosynthesis?',
    options: ['About 1%', 'About 10%', 'About 50%', 'About 90%'],
    answer: 0,
    explanation:
      'Only a small fraction — roughly 1% — of incoming solar energy is captured by producers and used by ecosystems. Most is absorbed or reflected by the atmosphere, lithosphere and hydrosphere or lost as heat.',
    whyWrong: {
      1: '10% is the trophic transfer efficiency between consumers, not the share of sunlight captured.',
      2: 'Half of incoming sunlight is far too high; most is not captured by photosynthesis.',
      3: '90% would mean almost all sunlight is captured, which is not the case.',
    },
    source: 'Slides 3 — p.2 (fill-in-the-blank note)',
  }),
  mcq({
    id: 'en-03',
    concepts: ['photosynthesis', 'solar-energy'],
    difficulty: 2,
    prompt: 'Photosynthesis converts solar energy into which form of energy?',
    options: ['Chemical energy stored in glucose', 'Thermal energy in the soil', 'Nuclear energy in the Sun', 'Sound energy in the environment'],
    answer: 0,
    explanation:
      'Producers use light energy to build glucose, a high-energy sugar. The energy is stored as chemical energy in the bonds of glucose.',
    whyWrong: {
      1: 'Some heat is released, but the useful stored product is chemical energy in glucose.',
      2: 'Nuclear reactions occur in the Sun, not inside a leaf.',
      3: 'Photosynthesis does not store sound energy.',
    },
  }),
  mcq({
    id: 'en-04',
    concepts: ['photosynthesis'],
    difficulty: 2,
    prompt: 'In which organelle does photosynthesis take place?',
    options: ['Chloroplast', 'Mitochondrion', 'Nucleus', 'Ribosome'],
    answer: 0,
    explanation:
      'Photosynthesis occurs in chloroplasts. Chlorophyll inside the chloroplast absorbs sunlight.',
    whyWrong: {
      1: 'Mitochondria are the main site of cellular respiration, not photosynthesis.',
      2: 'The nucleus stores genetic information; it is not the photosynthetic organelle.',
      3: 'Ribosomes build proteins; they do not capture light energy.',
    },
  }),
  mcq({
    id: 'en-05',
    concepts: ['photosynthesis'],
    difficulty: 3,
    prompt: 'What is the role of chlorophyll?',
    options: [
      'It absorbs sunlight inside the chloroplast',
      'It releases energy from glucose in mitochondria',
      'It converts nitrates into proteins',
      'It stores water in the plant',
    ],
    answer: 0,
    explanation:
      'Chlorophyll is the green pigment in chloroplasts that absorbs sunlight. That captured light energy powers photosynthesis.',
    whyWrong: {
      1: 'Cellular respiration in mitochondria releases glucose energy.',
      2: 'Nitrate assimilation builds proteins; chlorophyll is not involved.',
      3: 'Water storage is not chlorophyll\'s function.',
    },
  }),
  mcq({
    id: 'en-06',
    concepts: ['photosynthesis'],
    difficulty: 3,
    prompt: 'Which are the products of photosynthesis?',
    options: ['Glucose and oxygen', 'Carbon dioxide and water', 'Glucose and carbon dioxide', 'Oxygen and nitrogen'],
    answer: 0,
    explanation:
      'Photosynthesis uses carbon dioxide and water, powered by sunlight, to produce glucose and oxygen: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.',
    whyWrong: {
      1: 'Carbon dioxide and water are the reactants (inputs), not the products.',
      2: 'Carbon dioxide is used, not produced, during photosynthesis.',
      3: 'Nitrogen is not a product of photosynthesis.',
    },
  }),
  mcq({
    id: 'en-07',
    concepts: ['cellular-respiration'],
    difficulty: 2,
    prompt: 'What is the main purpose of cellular respiration?',
    options: [
      'To release energy from glucose for the cell to use',
      'To capture sunlight and make glucose',
      'To convert nitrogen gas into ammonia',
      'To absorb water through the roots',
    ],
    answer: 0,
    explanation:
      'Cellular respiration releases the stored energy in glucose so cells can do their activities. It uses oxygen and produces carbon dioxide and water.',
    whyWrong: {
      1: 'Capturing sunlight to make glucose is photosynthesis.',
      2: 'Nitrogen fixation is done by certain bacteria, not cellular respiration.',
      3: 'Water absorption is a plant transport process, not respiration.',
    },
  }),
  mcq({
    id: 'en-08',
    concepts: ['cellular-respiration'],
    difficulty: 2,
    prompt: 'Where does cellular respiration mainly occur?',
    options: ['Mitochondria', 'Chloroplasts', 'The cell wall', 'The nucleus'],
    answer: 0,
    explanation:
      'Cellular respiration is often described as occurring in the mitochondria. All organisms — including plants — carry out respiration to release energy.',
    whyWrong: {
      1: 'Chloroplasts carry out photosynthesis.',
      2: 'The cell wall provides structure; it is not the main site of respiration.',
      3: 'The nucleus is not the main site of respiration.',
    },
  }),
  mcq({
    id: 'en-09',
    concepts: ['cellular-respiration'],
    difficulty: 3,
    prompt: 'Which equation represents cellular respiration?',
    options: [
      'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy',
      '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      '6CO₂ + 6H₂O + energy → C₆H₁₂O₆',
      'N₂ + 3H₂ → 2NH₃',
    ],
    answer: 0,
    explanation:
      'Cellular respiration is the reverse of photosynthesis: glucose and oxygen are used to release energy, producing carbon dioxide and water.',
    whyWrong: {
      1: 'This is photosynthesis, which uses energy rather than releasing it.',
      2: 'This is an incorrect and unbalanced version of photosynthesis.',
      3: 'This is the industrial formation of ammonia, not cellular respiration.',
    },
  }),
  mcq({
    id: 'en-10',
    concepts: ['cellular-respiration'],
    difficulty: 3,
    prompt: 'Which organisms perform cellular respiration?',
    options: [
      'All organisms, including plants and animals',
      'Only animals',
      'Only plants',
      'Only decomposers',
    ],
    answer: 0,
    explanation:
      'All organisms do cellular respiration in order to use the Sun\'s energy — even plants. Plants respire both day and night.',
    whyWrong: {
      1: 'Plants also respire; they are not exempt.',
      2: 'Animals and decomposers also respire.',
      3: 'Decomposers respire, but so does every other living organism.',
    },
  }),
  mcq({
    id: 'en-11',
    concepts: ['photo-respiration-link'],
    difficulty: 3,
    prompt: 'At night, a plant continues to release carbon dioxide. Why?',
    options: [
      'Cellular respiration continues without sunlight, while photosynthesis stops',
      'Photosynthesis runs faster in the dark',
      'The plant stops all life processes at night',
      'The plant switches to nitrogen fixation',
    ],
    answer: 0,
    explanation:
      'Photosynthesis requires light, so it stops at night. Cellular respiration does not require light and continues, using oxygen and releasing carbon dioxide.',
    whyWrong: {
      1: 'Photosynthesis requires light and cannot run faster in darkness.',
      2: 'Plants remain alive and respire around the clock.',
      3: 'Plants do not fix nitrogen themselves; bacteria do.',
    },
  }),
  mcq({
    id: 'en-12',
    concepts: ['feeding-roles'],
    difficulty: 2,
    prompt: 'What is the main ecological role of decomposers?',
    options: [
      'Breaking down dead remains and wastes, releasing nutrients and carbon dioxide',
      'Producing glucose from sunlight',
      'Eating only living producers',
      'Converting nitrate back into nitrogen gas',
    ],
    answer: 0,
    explanation:
      'Decomposers get energy by breaking down the remains of dead plants and animals and animal wastes. They recycle nutrients back into the ecosystem and release carbon dioxide through respiration.',
    whyWrong: {
      1: 'Producers photosynthesize; decomposers do not produce glucose from sunlight.',
      2: 'Primary consumers eat living producers; decomposers break down dead material.',
      3: 'Denitrifying bacteria do that specific step; decomposers more broadly break down organic matter and release nutrients.',
    },
    source: 'Slides 3 — p.5; marked practice test Q25',
  }),
  mcq({
    id: 'en-13',
    concepts: ['photo-respiration-link', 'cellular-respiration'],
    difficulty: 4,
    prompt: 'In a sealed, planted aquarium, oxygen is lowest just before sunrise. Which explanation is best?',
    options: [
      'All organisms respired overnight, using oxygen, while photosynthesis had stopped in the dark',
      'Photosynthesis used up all the oxygen overnight',
      'Plants only respire during the day',
      'Oxygen is destroyed by moonlight',
    ],
    answer: 0,
    explanation:
      'At night, plants and animals respire and consume oxygen. Photosynthesis stops in the dark, so oxygen is not replenished until sunlight returns. Oxygen therefore reaches its lowest level just before sunrise.',
    whyWrong: {
      1: 'Photosynthesis produces oxygen and uses carbon dioxide; it stops at night.',
      2: 'Plants respire day and night; their respiration does not stop during the day.',
      3: 'Moonlight does not destroy oxygen.',
    },
    source: 'Marked practice test Q33',
    teacherStyle: true,
  }),
  multi({
    id: 'en-14',
    concepts: ['photosynthesis'],
    difficulty: 3,
    prompt: 'Select ALL statements that are true of photosynthesis.',
    options: [
      'It uses carbon dioxide and water',
      'It produces glucose and oxygen',
      'It requires light energy',
      'It releases energy from glucose for the cell',
    ],
    answer: [0, 1, 2],
    explanation:
      'Photosynthesis uses CO₂ and water, captures light, and produces glucose and oxygen. Releasing energy from glucose is cellular respiration, the opposite process.',
    whyWrong: {
      3: 'That is cellular respiration, not photosynthesis.',
    },
  }),
  multi({
    id: 'en-15',
    concepts: ['cellular-respiration'],
    difficulty: 3,
    prompt: 'Select ALL statements that are true of cellular respiration.',
    options: [
      'It uses glucose and oxygen',
      'It produces carbon dioxide and water',
      'It releases usable energy for life processes',
      'It only happens in animals',
    ],
    answer: [0, 1, 2],
    explanation:
      'Respiration uses glucose and oxygen, releases energy, and produces CO₂ and water. It happens in all organisms, including plants.',
    whyWrong: {
      3: 'Plants, fungi, bacteria and other organisms also respire.',
    },
  }),
  tf({
    id: 'en-16',
    concepts: ['cellular-respiration', 'photo-respiration-link'],
    difficulty: 2,
    prompt: 'Plants only perform cellular respiration at night.',
    answer: 1,
    explanation:
      'False. Plants respire all the time, day and night. During the day, photosynthesis may produce more oxygen than respiration uses, but respiration does not stop.',
  }),
  tf({
    id: 'en-17',
    concepts: ['cellular-respiration', 'photosynthesis'],
    difficulty: 2,
    prompt: 'Cellular respiration produces glucose.',
    answer: 1,
    explanation:
      'False. Cellular respiration uses glucose and releases its energy; photosynthesis produces glucose. The two processes are roughly reverse reactions.',
  }),
  tf({
    id: 'en-18',
    concepts: ['photo-respiration-link'],
    difficulty: 3,
    prompt: 'The chemical equation for cellular respiration is the reverse of the equation for photosynthesis.',
    answer: 0,
    explanation:
      'True. Photosynthesis stores energy in glucose; respiration releases it by reversing the overall reaction. The products of one are the reactants of the other.',
  }),
  fill({
    id: 'en-19',
    concepts: ['photosynthesis', 'cellular-respiration'],
    difficulty: 3,
    prompt:
      'Photosynthesis: 6CO₂ + 6___ → C₆H₁₂O₆ + 6___. Cellular respiration: C₆H₁₂O₆ + 6O₂ → 6___ + 6___ + energy.',
    blanks: [
      { accepted: [['h2o', 'water']], hint: 'The reactant plants absorb through roots' },
      { accepted: [['o2', 'oxygen']], hint: 'The gas released by photosynthesis' },
      { accepted: [['co2', 'carbon dioxide', 'carbon dioxide (co2)']], hint: 'The gas released by respiration' },
      { accepted: [['h2o', 'water']], hint: 'Also produced by respiration' },
    ],
    explanation:
      'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy. The equations are reverses of each other.',
  }),
  fill({
    id: 'en-20',
    concepts: ['feeding-roles'],
    difficulty: 2,
    prompt:
      'Organisms that make their own food are ___. Organisms that must consume other organisms are ___. Organisms that break down dead remains and wastes are ___.',
    blanks: [
      { accepted: [['producer', 'producers', 'autotroph', 'autotrophs']], hint: 'Photosynthesis' },
      { accepted: [['consumer', 'consumers', 'heterotroph', 'heterotrophs']], hint: 'Eat other organisms' },
      { accepted: [['decomposer', 'decomposers']], hint: 'Recycle dead matter' },
    ],
    explanation:
      'Producers make their own food; consumers must consume for energy; decomposers break down dead material and wastes, recycling nutrients.',
  }),
  open('short')({
    id: 'en-21',
    concepts: ['photo-respiration-link'],
    difficulty: 3,
    prompt: 'Explain how photosynthesis and cellular respiration are interconnected.',
    rubric: [
      { label: 'Products of one are reactants of the other', synonyms: ['reverse', 'opposite', 'products', 'reactants'] },
      { label: 'Photosynthesis uses CO₂ + water and makes glucose + O₂', synonyms: ['carbon dioxide', 'water', 'glucose', 'oxygen'] },
      { label: 'Respiration uses glucose + O₂ and makes CO₂ + water + energy', synonyms: ['glucose', 'oxygen', 'carbon dioxide', 'water', 'energy'] },
    ],
    modelAnswer:
      'Photosynthesis uses carbon dioxide and water, plus light energy, to produce glucose and oxygen. Cellular respiration uses glucose and oxygen to release energy and produces carbon dioxide and water. The products of one process are the inputs of the other, so they form a connected cycle in ecosystems.',
    explanation:
      'A complete answer shows both equations and the idea that the outputs of one feed the other. In an ecosystem, this links producers, consumers and the atmosphere.',
  }),
  scenario({
    id: 'en-22',
    concepts: ['photo-respiration-link', 'cellular-respiration', 'sustainability'],
    difficulty: 4,
    prompt:
      'You seal a water plant and a small fish in a clear tank and place it in sunlight. Explain why oxygen might rise during the day but fall at night.',
    rubric: [
      { label: 'Day: photosynthesis produces O₂ faster than respiration uses it', synonyms: ['photosynthesis', 'oxygen', 'day', 'sunlight'] },
      { label: 'Night: photosynthesis stops; respiration continues', synonyms: ['night', 'dark', 'respiration', 'stops'] },
      { label: 'Fish and plant both respire', synonyms: ['fish', 'plant', 'all organisms', 'use oxygen'] },
    ],
    modelAnswer:
      'During the day, the plant photosynthesizes and releases oxygen, often faster than the plant and fish use it, so oxygen rises. At night, photosynthesis stops but the plant and fish continue cellular respiration, using oxygen and releasing carbon dioxide, so oxygen falls.',
    explanation:
      'This is the same principle as the practice test\'s self-sustaining aquarium question. The balance between photosynthesis and respiration changes with light.',
  }),
  error({
    id: 'en-23',
    concepts: ['cellular-respiration', 'photo-respiration-link'],
    difficulty: 3,
    prompt:
      'A student says: "Plants do not need to respire because they get energy from photosynthesis." Identify and correct the error.',
    rubric: [
      { label: 'Plants do respire', synonyms: ['plants respire', 'all organisms', 'yes'] },
      { label: 'Respiration releases energy from glucose for life processes', synonyms: ['release energy', 'glucose', 'life processes', 'cellular work'] },
      { label: 'Photosynthesis stores energy; respiration uses it', synonyms: ['store', 'use', 'release', 'different processes'] },
    ],
    modelAnswer:
      'Plants do respire. Photosynthesis captures and stores energy in glucose, but cellular respiration releases that energy for the plant\'s life processes. Respiration happens in plants day and night, just as it does in animals.',
    explanation:
      'Photosynthesis makes the fuel; respiration uses it. A plant that did not respire could not access the energy stored in its own glucose.',
  }),
  compare({
    id: 'en-24',
    concepts: ['photosynthesis', 'cellular-respiration'],
    difficulty: 3,
    prompt: 'Compare photosynthesis and cellular respiration: input, output, energy and location.',
    rubric: [
      { label: 'Photosynthesis uses CO₂ + water + light, makes glucose + O₂', synonyms: ['carbon dioxide', 'water', 'light', 'glucose', 'oxygen'] },
      { label: 'Respiration uses glucose + O₂, makes CO₂ + water + energy', synonyms: ['glucose', 'oxygen', 'carbon dioxide', 'water', 'energy'] },
      { label: 'Locations: chloroplast vs mitochondrion', synonyms: ['chloroplast', 'mitochondria', 'mitochondrion'] },
      { label: 'Energy stored vs released', synonyms: ['stored', 'released', 'chemical energy'] },
    ],
    modelAnswer:
      'Photosynthesis occurs in chloroplasts, uses carbon dioxide, water and light energy, and stores energy in glucose while releasing oxygen. Cellular respiration occurs mainly in mitochondria, uses glucose and oxygen, releases energy for life processes, and produces carbon dioxide and water. They are reverse processes.',
    explanation:
      'Organize compare answers into clear categories: inputs, outputs, energy change and location. This is exactly the precision that earns communication marks.',
  }),
  mcq({
    id: 'en-25',
    concepts: ['photosynthesis', 'matter-energy'],
    difficulty: 2,
    prompt: 'Sugar (glucose) is made of which elements?',
    options: [
      'Carbon, hydrogen and oxygen',
      'Carbon and hydrogen only',
      'Carbon, hydrogen and nitrogen',
      'Carbon, hydrogen, nitrogen and oxygen',
    ],
    answer: 0,
    explanation:
      'The formula for glucose is C₆H₁₂O₆, so it contains carbon, hydrogen and oxygen. This was question 15 on your practice test.',
    whyWrong: {
      1: 'Hydrogen alone with carbon is missing the six oxygen atoms in glucose.',
      2: 'Nitrogen is not part of the glucose formula (though it is needed to make proteins and DNA).',
      3: 'Adding nitrogen would make this a different molecule; glucose has no nitrogen.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'en-26',
    concepts: ['cellular-respiration'],
    difficulty: 3,
    prompt: 'Cellular respiration is best described as a…',
    options: ['Carbon source', 'Carbon sink', 'Way to make methane', 'Way to make food energy from sunlight'],
    answer: 0,
    explanation:
      'Cellular respiration releases carbon dioxide into the atmosphere, so it acts as a carbon source. Photosynthesis removes carbon dioxide and is a carbon sink. This was question 4 on your practice test.',
    whyWrong: {
      1: 'A carbon sink stores carbon; respiration releases it.',
      2: 'Respiration produces CO₂ and water, not methane.',
      3: 'Making food energy from sunlight describes photosynthesis.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'en-27',
    concepts: ['energy-loss', 'matter-energy'],
    difficulty: 3,
    prompt: 'What happens to most of the energy an organism obtains from its food?',
    options: [
      'It is used for life processes and released as thermal energy',
      'It is passed unchanged to the next trophic level',
      'It is converted entirely into biomass',
      'It is destroyed when the organism respires',
    ],
    answer: 0,
    explanation:
      'Most energy is used in daily routines such as growth, movement and reproduction, and much is released to the environment as thermal energy. Only about 10% is available to the next trophic level.',
    whyWrong: {
      1: 'Only about 10% is transferred; most is not passed unchanged.',
      2: 'Some becomes biomass, but most is used and lost as heat.',
      3: 'Energy is not destroyed; it changes form and spreads into the environment.',
    },
  }),
  mcq({
    id: 'en-28',
    concepts: ['feeding-roles', 'ammonification'],
    difficulty: 3,
    prompt: 'Why are decomposers essential to an ecosystem?',
    options: [
      'They break down dead matter and recycle nutrients back to producers',
      'They produce all the oxygen in the atmosphere',
      'They eat only top carnivores',
      'They stop energy from being lost as heat',
    ],
    answer: 0,
    explanation:
      'Decomposers break down dead plants, animals and wastes, releasing nutrients such as nitrogen compounds back into the soil so producers can use them. They also release carbon dioxide through respiration.',
    whyWrong: {
      1: 'Producers such as plants and algae produce oxygen through photosynthesis.',
      2: 'Decomposers feed on dead remains and wastes, not only top carnivores.',
      3: 'Energy loss as heat is unavoidable; decomposers do not prevent it.',
    },
  }),
];