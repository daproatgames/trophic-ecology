import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('cycles');
const scenario = open('scenario');
const compare = open('compare');
const error = open('error');

export const cycleQuestions: Question[] = [
  mcq({
    id: 'cy-01',
    concepts: ['matter-energy'],
    difficulty: 2,
    prompt: 'Which statement correctly contrasts energy and matter in ecosystems?',
    options: [
      'Energy flows through and is eventually lost as heat; matter is recycled between biotic and abiotic reservoirs',
      'Energy is recycled; matter is lost as heat',
      'Both energy and matter leave Earth permanently',
      'Both energy and matter are created by decomposers',
    ],
    answer: 0,
    explanation:
      'Energy arrives continuously from the Sun and is eventually radiated back out as heat. Matter does not leave Earth; it cycles between living and non-living reservoirs in biogeochemical cycles.',
    whyWrong: {
      1: 'This reverses the two. Matter cycles; energy flows and is lost as heat.',
      2: 'Matter stays on Earth and cycles; energy can leave as heat.',
      3: 'Decomposers recycle matter but do not create energy or matter.',
    },
  }),
  mcq({
    id: 'cy-02',
    concepts: ['matter-energy'],
    difficulty: 2,
    prompt: 'A biogeochemical cycle is best defined as…',
    options: [
      'The continuous cycling of matter between biotic and abiotic reservoirs',
      'The one-way flow of energy from the Sun to consumers',
      'The movement of animals during migration',
      'The formation of new energy in producers',
    ],
    answer: 0,
    explanation:
      'Biogeochemical cycles move matter — such as water, carbon, nitrogen, oxygen, sulfur and phosphorus — between living things and the non-living environment. All the matter that made up living things is still on Earth.',
    whyWrong: {
      1: 'That describes energy flow, which is one-way rather than a cycle.',
      2: 'Migration is movement of organisms, not a global matter cycle.',
      3: 'Producers capture energy; they do not create new energy.',
    },
  }),
  mcq({
    id: 'cy-03',
    concepts: ['water-cycle'],
    difficulty: 2,
    prompt: 'Water is drawn up through a plant\'s roots and evaporates from its leaves. This process is called…',
    options: ['Transpiration', 'Condensation', 'Precipitation', 'Combustion'],
    answer: 0,
    explanation:
      'Transpiration is the loss of water vapour from plant leaves. It is part of the biotic side of the water cycle. This was question 8 on your practice test.',
    whyWrong: {
      1: 'Condensation is water vapour turning into liquid droplets, forming clouds.',
      2: 'Precipitation is water falling as rain, snow, etc.',
      3: 'Combustion is burning, part of the carbon cycle.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'cy-04',
    concepts: ['water-cycle', 'cellular-respiration'],
    difficulty: 3,
    prompt: 'Which process releases water as a product in living organisms?',
    options: ['Cellular respiration', 'Photosynthesis', 'Condensation', 'Nitrogen fixation'],
    answer: 0,
    explanation:
      'Cellular respiration produces water (and carbon dioxide) as it releases energy from glucose. The slides note that all creatures release water as a product of cellular respiration.',
    whyWrong: {
      1: 'Photosynthesis uses water as a reactant, not a product.',
      2: 'Condensation is a physical change in the water cycle, not a living process that releases water.',
      3: 'Nitrogen fixation converts N₂ into ammonia; it does not produce water.',
    },
  }),
  mcq({
    id: 'cy-05',
    concepts: ['water-cycle'],
    difficulty: 2,
    prompt: 'Clouds form when water vapour cools and changes into tiny liquid droplets. This is…',
    options: ['Condensation', 'Evaporation', 'Runoff', 'Transpiration'],
    answer: 0,
    explanation:
      'Condensation is the change from water vapour to liquid water. It leads to cloud formation and eventually precipitation.',
    whyWrong: {
      1: 'Evaporation is liquid water changing into vapour.',
      2: 'Runoff is water flowing over land into streams and rivers.',
      3: 'Transpiration is water vapour leaving plant leaves.',
    },
  }),
  mcq({
    id: 'cy-06',
    concepts: ['carbon-cycle'],
    difficulty: 2,
    prompt: 'What is the most accessible source of carbon for living things?',
    options: ['Atmospheric carbon dioxide', 'Diamond', 'Deep ocean sediment', 'Nitrogen gas'],
    answer: 0,
    explanation:
      'Atmospheric carbon dioxide is the most accessible carbon source. It is a small part of the atmosphere but essential for photosynthesis. This was question 12\'s underlying concept on your practice test.',
    whyWrong: {
      1: 'Diamond is carbon but is not biologically accessible.',
      2: 'Deep sediment stores carbon but is not readily available to living things.',
      3: 'Nitrogen gas contains nitrogen, not carbon.',
    },
  }),
  mcq({
    id: 'cy-07',
    concepts: ['carbon-reservoirs'],
    difficulty: 3,
    prompt: 'Some sea organisms use carbon to make shells of calcium carbonate (CaCO₃). Over long periods, these shells can become…',
    options: ['Sedimentary rock such as limestone', 'Nitrogen gas in the atmosphere', 'Glucose in plants', 'Fossil fuels made of nitrogen'],
    answer: 0,
    explanation:
      'Calcium carbonate shells can become sedimentary rock formations such as chalk, limestone and marble. This is one way carbon is stored for very long periods.',
    whyWrong: {
      1: 'Nitrogen gas is part of the nitrogen cycle, not a product of shells.',
      2: 'Glucose is made by photosynthesis, not from shells.',
      3: 'Fossil fuels come from ancient plants and plankton, and are carbon-based, not nitrogen-based.',
    },
  }),
  mcq({
    id: 'cy-08',
    concepts: ['carbon-reservoirs'],
    difficulty: 3,
    prompt: 'Fossil fuels such as coal, oil and natural gas form from…',
    options: [
      'Ancient plants, algae and plankton buried and transformed over millions of years',
      'Modern animal bones buried in soil',
      'Nitrogen gas compressed in the atmosphere',
      'Calcium carbonate shells only',
    ],
    answer: 0,
    explanation:
      'Carbon from ancient plants (including algae and plankton) can be locked underground for millions of years and become fossil fuels. Burning them returns the carbon to the atmosphere.',
    whyWrong: {
      1: 'Fossil fuels mainly come from ancient photosynthetic organisms, not modern bones.',
      2: 'Nitrogen gas does not form coal, oil or natural gas.',
      3: 'Shells can form limestone, but fossil fuels come from buried organic matter.',
    },
  }),
  mcq({
    id: 'cy-09',
    concepts: ['carbon-cycle', 'human-carbon-impact'],
    difficulty: 2,
    prompt: 'Burning fossil fuels returns carbon to the atmosphere mainly as…',
    options: ['Carbon dioxide', 'Nitrogen gas', 'Oxygen', 'Calcium carbonate'],
    answer: 0,
    explanation:
      'Combustion of fossil fuels releases carbon dioxide (CO₂), a greenhouse gas, into the atmosphere. This is a key human impact on the carbon cycle.',
    whyWrong: {
      1: 'Nitrogen gas is not the main carbon product of burning fuels.',
      2: 'Combustion uses oxygen; it does not release it as the carbon product.',
      3: 'Calcium carbonate is a solid stored form, not the gas released by burning.',
    },
  }),
  mcq({
    id: 'cy-10',
    concepts: ['carbon-reservoirs'],
    difficulty: 4,
    prompt: 'Which geological process can return carbon stored in rock to the atmosphere?',
    options: ['Volcanic activity', 'Photosynthesis', 'Nitrogen fixation', 'Transpiration'],
    answer: 0,
    explanation:
      'Geological heat, such as volcanic activity, can release carbon that was stored in rocks back into the atmosphere. This is part of a very long carbon cycle.',
    whyWrong: {
      1: 'Photosynthesis removes CO₂ from the atmosphere; it does not return rock carbon.',
      2: 'Nitrogen fixation concerns nitrogen gas, not rock carbon.',
      3: 'Transpiration releases water vapour from plants.',
    },
  }),
  mcq({
    id: 'cy-11',
    concepts: ['human-carbon-impact', 'carbon-cycle'],
    difficulty: 3,
    prompt: 'Deforestation and burning wood or peat affect the carbon cycle by…',
    options: [
      'Adding carbon dioxide to the atmosphere and removing a carbon sink',
      'Removing carbon dioxide from the atmosphere and adding oxygen',
      'Converting nitrogen gas into nitrates',
      'Stopping cellular respiration in all organisms',
    ],
    answer: 0,
    explanation:
      'Trees store carbon and remove CO₂ through photosynthesis. Cutting and burning them releases stored carbon and reduces future carbon uptake, increasing atmospheric CO₂.',
    whyWrong: {
      1: 'This describes photosynthesis, the opposite of burning.',
      2: 'That is nitrogen fixation, not a carbon-cycle effect.',
      3: 'Deforestation does not stop respiration in all organisms.',
    },
  }),
  multi({
    id: 'cy-12',
    concepts: ['carbon-cycle'],
    difficulty: 3,
    prompt: 'Which processes ADD carbon dioxide to the atmosphere? Select ALL that apply.',
    options: ['Cellular respiration', 'Combustion of fossil fuels', 'Decomposition of dead matter', 'Photosynthesis'],
    answer: [0, 1, 2],
    explanation:
      'Respiration, combustion and decomposition all release CO₂. Photosynthesis removes CO₂ from the atmosphere and stores carbon in glucose.',
    whyWrong: {
      3: 'Photosynthesis is a carbon sink: it removes CO₂, not adds it.',
    },
  }),
  multi({
    id: 'cy-13',
    concepts: ['carbon-cycle', 'photosynthesis'],
    difficulty: 3,
    prompt: 'Which processes REMOVE carbon dioxide from the atmosphere? Select ALL that apply.',
    options: ['Photosynthesis by producers', 'Formation of calcium carbonate shells', 'Cellular respiration', 'Burning coal'],
    answer: [0, 1],
    explanation:
      'Photosynthesis converts atmospheric CO₂ into glucose, and some sea organisms use carbon to build calcium carbonate shells, which can become rock. Respiration and combustion release CO₂.',
    whyWrong: {
      2: 'Respiration releases CO₂.',
      3: 'Burning coal releases stored carbon as CO₂.',
    },
  }),
  tf({
    id: 'cy-14',
    concepts: ['matter-energy'],
    difficulty: 2,
    prompt: 'Matter does not leave Earth; it is continuously cycled between biotic and abiotic reservoirs.',
    answer: 0,
    explanation:
      'True. Matter is conserved and recycled on Earth. Energy, by contrast, flows through and is eventually lost as heat.',
  }),
  tf({
    id: 'cy-15',
    concepts: ['carbon-cycle'],
    difficulty: 2,
    prompt: 'Carbon cycles only through living organisms and never enters the abiotic environment.',
    answer: 1,
    explanation:
      'False. Carbon moves between living things and abiotic reservoirs such as the atmosphere, oceans, soil, fossil fuels and rocks.',
  }),
  tf({
    id: 'cy-16',
    concepts: ['water-cycle'],
    difficulty: 3,
    prompt: 'The water cycle has only abiotic parts; living things play no role.',
    answer: 1,
    explanation:
      'False. Plants contribute through transpiration and photosynthesis, and all organisms release water through cellular respiration. The water cycle has both biotic and abiotic components.',
  }),
  fill({
    id: 'cy-17',
    concepts: ['water-cycle'],
    difficulty: 2,
    prompt:
      'Liquid water changing to vapour is ___. Water vapour cooling into droplets is ___. Water falling from clouds is ___. Water flowing over the land into rivers is ___.',
    blanks: [
      { accepted: [['evaporation']], hint: 'Liquid → gas' },
      { accepted: [['condensation']], hint: 'Gas → liquid droplets' },
      { accepted: [['precipitation']], hint: 'Rain, snow, hail' },
      { accepted: [['runoff', 'surface runoff']], hint: 'Water moving downhill over land' },
    ],
    explanation:
      'Evaporation → condensation → precipitation → runoff. Transpiration and cellular respiration also add water vapour from living things.',
  }),
  fill({
    id: 'cy-18',
    concepts: ['carbon-reservoirs', 'carbon-cycle'],
    difficulty: 3,
    prompt:
      'Carbon is stored underground in ___ fuels such as coal, oil and natural gas. Burning them releases ___. Sea organisms store carbon in shells made of ___ carbonate.',
    blanks: [
      { accepted: [['fossil']], hint: 'Ancient plants and plankton' },
      { accepted: [['carbon dioxide', 'co2', 'co₂']], hint: 'The main greenhouse gas released' },
      { accepted: [['calcium']], hint: 'CaCO₃' },
    ],
    explanation:
      'Fossil fuels store ancient carbon; combustion returns it as CO₂. Calcium carbonate (CaCO₃) shells can become limestone and other sedimentary rocks.',
  }),
  open('short')({
    id: 'cy-19',
    concepts: ['carbon-cycle'],
    difficulty: 3,
    prompt: 'Describe the short carbon cycle in four steps.',
    rubric: [
      { label: 'Photosynthesis converts CO₂ into glucose', synonyms: ['photosynthesis', 'carbon dioxide', 'glucose'] },
      { label: 'Carbon moves through the food chain', synonyms: ['food chain', 'consumers', 'eating', 'producers'] },
      { label: 'Cellular respiration releases CO₂', synonyms: ['respiration', 'release', 'carbon dioxide'] },
      { label: 'Decomposition/combustion can also return carbon (optional)', synonyms: ['decompos', 'combustion', 'burning'] },
    ],
    modelAnswer:
      'Atmospheric carbon dioxide is converted into glucose by plants during photosynthesis. Carbon passes through the food chain as organisms eat one another. Cellular respiration in plants, animals and decomposers releases carbon dioxide back to the atmosphere, completing a short cycle. Decomposition and combustion can also return carbon.',
    explanation:
      'The short cycle is: CO₂ → photosynthesis → glucose → food chain → respiration → CO₂. Plants also respire, so they release CO₂ as well as taking it in.',
  }),
  scenario({
    id: 'cy-20',
    concepts: ['carbon-reservoirs'],
    difficulty: 4,
    prompt:
      'A limestone cliff contains fossils of shelled sea organisms. Explain how carbon from the atmosphere could have become part of that rock, and how it could return to the atmosphere.',
    rubric: [
      { label: 'CO₂ → photosynthesis → carbon in organisms', synonyms: ['photosynthesis', 'carbon dioxide', 'glucose', 'food chain'] },
      { label: 'Shell organisms use carbon to make CaCO₃', synonyms: ['calcium carbonate', 'shells', 'caco3'] },
      { label: 'Shells become sedimentary rock over long time', synonyms: ['sedimentary', 'limestone', 'rock', 'millions'] },
      { label: 'Volcanic/geological activity can release CO₂', synonyms: ['volcano', 'geologic', 'heat', 'erosion', 'release'] },
    ],
    modelAnswer:
      'Atmospheric CO₂ is taken up by producers during photosynthesis and moves through the food chain. Sea organisms use the carbon to build calcium carbonate shells. Over millions of years, the shells can become sedimentary rock such as limestone. Geological heat or volcanic activity can eventually release the stored carbon back to the atmosphere.',
    explanation:
      'This traces the long carbon cycle. The key is that carbon is stored in shells and rock for a very long time, then returned by geological processes.',
  }),
  error({
    id: 'cy-21',
    concepts: ['matter-energy'],
    difficulty: 3,
    prompt:
      'A student writes: "Energy is recycled in an ecosystem, just like carbon and water." Identify and correct the error.',
    rubric: [
      { label: 'Energy is not recycled', synonyms: ['not recycled', 'does not cycle', 'one-way', 'flows'] },
      { label: 'Energy is lost as heat / replaced by the Sun', synonyms: ['heat', 'thermal', 'sun', 'sunlight'] },
      { label: 'Matter is what cycles', synonyms: ['matter', 'carbon', 'water', 'nutrients', 'biogeochemical'] },
    ],
    modelAnswer:
      'Energy is not recycled. It flows through an ecosystem in one direction and is mostly lost as thermal energy at each transfer, so it must be continually supplied by the Sun. Matter such as carbon and water is what cycles between biotic and abiotic reservoirs.',
    explanation:
      'Energy flow and matter cycling are different. This distinction explains why food chains are short and why nutrients can be reused indefinitely.',
  }),
  compare({
    id: 'cy-22',
    concepts: ['carbon-cycle', 'carbon-reservoirs'],
    difficulty: 4,
    prompt: 'Compare the short carbon cycle with a long carbon cycle. Give one example of storage in each.',
    rubric: [
      { label: 'Short cycle is rapid: photosynthesis/respiration/food chain', synonyms: ['rapid', 'short', 'photosynthesis', 'respiration', 'food chain'] },
      { label: 'Long cycle stores carbon for millions of years', synonyms: ['millions', 'long', 'fossil fuels', 'rock', 'sedimentary'] },
      { label: 'Examples: glucose/living biomass vs fossil fuels/CaCO₃ rock', synonyms: ['glucose', 'biomass', 'fossil', 'limestone', 'calcium carbonate'] },
    ],
    modelAnswer:
      'The short carbon cycle moves carbon quickly between the atmosphere, producers and consumers through photosynthesis, feeding and respiration. A long carbon cycle stores carbon for millions of years in fossil fuels or sedimentary rocks such as limestone formed from calcium carbonate shells; combustion or geological activity can eventually return it.',
    explanation:
      'Both are carbon cycles; they differ in timescale and reservoirs. The short cycle is biological and fast, while the long cycle is geological and slow.',
  }),
  mcq({
    id: 'cy-23',
    concepts: ['carbon-cycle', 'photosynthesis'],
    difficulty: 3,
    prompt: 'Which cycle relies mostly on photosynthesis for completion?',
    options: ['Carbon cycle', 'Water cycle', 'Nitrogen cycle', 'Rock cycle'],
    answer: 0,
    explanation:
      'Photosynthesis removes CO₂ from the atmosphere and converts it into glucose, which is the entry point for carbon into the biotic part of the carbon cycle. This was question 12 on your practice test.',
    whyWrong: {
      1: 'The water cycle is driven mainly by evaporation, condensation and precipitation.',
      2: 'The nitrogen cycle depends on nitrogen-fixing and nitrifying bacteria, not photosynthesis.',
      3: 'The rock cycle is geological and not driven by photosynthesis.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'cy-24',
    concepts: ['cycle-integration', 'photo-respiration-link'],
    difficulty: 3,
    prompt: 'What are the main processes that cycle oxygen and carbon through an ecosystem?',
    options: [
      'Photosynthesis and cellular respiration',
      'Nitrification and denitrification',
      'Evaporation and condensation',
      'Fixation and assimilation',
    ],
    answer: 0,
    explanation:
      'Photosynthesis removes CO₂ and releases O₂; cellular respiration uses O₂ and releases CO₂. Together they cycle carbon and oxygen. This was question 9 on your practice test.',
    whyWrong: {
      1: 'Those processes cycle nitrogen, not carbon and oxygen.',
      2: 'Those are parts of the water cycle.',
      3: 'Those are nitrogen-cycle processes.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'cy-25',
    concepts: ['matter-energy'],
    difficulty: 3,
    prompt: 'What is the series of cycles called in which chemicals are continuously consumed, rearranged, stored and used?',
    options: ['Biogeochemical cycles', 'Food chains', 'Trophic levels', 'Ecological pyramids'],
    answer: 0,
    explanation:
      'Biogeochemical cycles continuously move elements between living (bio), geological (geo) and chemical reservoirs. This was question 11 on your practice test.',
    whyWrong: {
      1: 'Food chains show energy transfer through feeding, not the full chemical cycling.',
      2: 'Trophic levels are positions in a food chain.',
      3: 'Ecological pyramids are diagrams of trophic relationships.',
    },
    teacherStyle: true,
  }),
];