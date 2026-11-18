import type { TopicId } from '../types';

export interface WordleWord {
  word: string;
  hint: string;
  definition: string;
  topic: TopicId;
  concept: string;
}

export const WORDLE_WORDS: WordleWord[] = [
  { word: 'NICHE', hint: 'A species\' role in its ecosystem.', definition: 'The way a species interacts with its community and abiotic environment.', topic: 'foundations', concept: 'habitat-niche' },
  { word: 'BIOME', hint: 'A large region with a characteristic climate and community.', definition: 'A large ecological region such as boreal forest or grassland.', topic: 'foundations', concept: 'ecological-organization' },
  { word: 'ALGAE', hint: 'Photosynthetic organisms that can bloom in nutrient-rich water.', definition: 'Simple photosynthetic organisms; excess nutrients can cause algal blooms.', topic: 'nitrogen', concept: 'fertilizers-eutrophication' },
  { word: 'SHALE', hint: 'A rock that is an abiotic factor.', definition: 'A sedimentary rock; non-living, so it is abiotic.', topic: 'foundations', concept: 'biotic-abiotic' },
  { word: 'SNAIL', hint: 'A decomposer in the pond food web.', definition: 'In the practice-test pond web, the snail feeds on dead matter as a decomposer.', topic: 'foodwebs', concept: 'food-web' },
  { word: 'GUPPY', hint: 'A primary consumer in the pond food web.', definition: 'The guppies eat duckweed and moss ball, making them primary consumers.', topic: 'foodwebs', concept: 'trophic-levels' },
  { word: 'MOSS', hint: 'A producer in the pond food web.', definition: 'The moss ball is a photosynthetic producer in the pond web.', topic: 'foodwebs', concept: 'feeding-roles' },
  { word: 'SOLAR', hint: 'The original energy source for ecosystems.', definition: 'Solar (radiant) energy from the Sun powers photosynthesis.', topic: 'energy', concept: 'solar-energy' },
  { word: 'LIGHT', hint: 'Photosynthesis requires this form of energy.', definition: 'Light energy is captured by chlorophyll and converted to chemical energy.', topic: 'energy', concept: 'photosynthesis' },
  { word: 'WATER', hint: 'A reactant of photosynthesis and a product of respiration.', definition: 'H₂O; used in photosynthesis and released by cellular respiration.', topic: 'cycles', concept: 'water-cycle' },
  { word: 'PLANT', hint: 'A producer that performs photosynthesis.', definition: 'Plants are producers; they also perform cellular respiration.', topic: 'energy', concept: 'feeding-roles' },
  { word: 'CARBON', hint: 'The element in glucose, proteins, fats and DNA.', definition: 'Carbon cycles through organisms, the atmosphere, fossil fuels and rocks.', topic: 'cycles', concept: 'carbon-cycle' },
  { word: 'OXYGEN', hint: 'The gas released by photosynthesis.', definition: 'O₂ is a product of photosynthesis and a reactant of cellular respiration.', topic: 'energy', concept: 'photo-respiration-link' },
  { word: 'ENERGY', hint: 'What flows through ecosystems and is lost as heat.', definition: 'Energy flows one way; about 10% transfers between trophic levels.', topic: 'energy', concept: 'matter-energy' },
  { word: 'GLUCOSE', hint: 'The high-energy sugar made by photosynthesis.', definition: 'C₆H₁₂O₆, the sugar produced by photosynthesis and used in respiration.', topic: 'energy', concept: 'photosynthesis' },
  { word: 'HABITAT', hint: 'The physical area where a species lives.', definition: 'A species\' "address" within an ecosystem.', topic: 'foundations', concept: 'habitat-niche' },
  { word: 'NITRATE', hint: 'The nitrogen compound plants absorb through their roots.', definition: 'NO₃⁻, produced by nitrification and absorbed by plants.', topic: 'nitrogen', concept: 'nitrification-assimilation' },
  { word: 'PROTEIN', hint: 'A biological molecule that contains nitrogen.', definition: 'Nitrogen is needed to build proteins (and DNA).', topic: 'nitrogen', concept: 'nitrogen-importance' },
  { word: 'SPECIES', hint: 'A group of organisms that can interbreed.', definition: 'A population is one species in an area.', topic: 'foundations', concept: 'ecological-organization' },
  { word: 'TROPHIC', hint: 'Relating to a feeding level in a food chain.', definition: 'Trophic levels are positions along a food chain.', topic: 'foodwebs', concept: 'trophic-levels' },
  { word: 'NITROGEN', hint: 'The element that makes up 78% of the atmosphere.', definition: 'N₂ gas is abundant but unusable directly; it must be fixed.', topic: 'nitrogen', concept: 'nitrogen-importance' },
  { word: 'BIOMASS', hint: 'The total mass of all individuals combined.', definition: 'Biomass pyramids compare total mass at each trophic level.', topic: 'pyramids', concept: 'biomass-pyramid' },
  { word: 'ECOLOGY', hint: 'The study of organisms and their environment.', definition: 'Ecology studies biotic and abiotic interactions.', topic: 'foundations', concept: 'ecosystem-definition' },
  { word: 'KEYSTONE', hint: 'A species with disproportionate ecosystem control.', definition: 'Removing a keystone species can collapse an ecosystem.', topic: 'foundations', concept: 'keystone-species' },
  { word: 'PREDATOR', hint: 'An animal that hunts and eats other animals.', definition: 'Wolves are predators that control elk populations.', topic: 'foodwebs', concept: 'food-web' },
  { word: 'DECOMPOSER', hint: 'An organism that breaks down dead remains.', definition: 'Decomposers recycle nutrients and release CO₂, not oxygen.', topic: 'energy', concept: 'feeding-roles' },
  { word: 'POPULATION', hint: 'Individuals of one species in an area.', definition: 'A group of individuals of the same species living in a given area.', topic: 'foundations', concept: 'ecological-organization' },
  { word: 'RESPIRATION', hint: 'The process that releases energy from glucose.', definition: 'Cellular respiration uses glucose and oxygen to release energy.', topic: 'energy', concept: 'cellular-respiration' },
];

export interface JeopardyClue {
  id: string;
  category: string;
  value: number;
  clue: string;
  answer: string;
  acceptable: string[];
  explanation: string;
  topic: TopicId;
}

export const JEOPARDY_CATEGORIES = ['FOUNDATIONS', 'FOOD WEBS', 'PYRAMIDS', 'CYCLES', 'NITROGEN'];

export const JEOPARDY_CLUES: JeopardyClue[] = [
  { id: 'j1', category: 'FOUNDATIONS', value: 100, clue: 'A group of individuals of the same species living in one area.', answer: 'population', acceptable: ['population'], explanation: 'Population is one species; community is all species.', topic: 'foundations' },
  { id: 'j2', category: 'FOUNDATIONS', value: 200, clue: 'The physical area where a species lives; its "address."', answer: 'habitat', acceptable: ['habitat'], explanation: 'Habitat is the physical area; niche is the role.', topic: 'foundations' },
  { id: 'j3', category: 'FOUNDATIONS', value: 300, clue: 'The way a species interacts with its community and abiotic environment; its "role."', answer: 'niche', acceptable: ['niche'], explanation: 'No two species share an identical niche.', topic: 'foundations' },
  { id: 'j4', category: 'FOUNDATIONS', value: 400, clue: 'The species whose removal can collapse an ecosystem despite a small population.', answer: 'keystone species', acceptable: ['keystone', 'keystone species'], explanation: 'Wolves in Yellowstone are the slide example.', topic: 'foundations' },
  { id: 'j5', category: 'FOUNDATIONS', value: 500, clue: 'The zone of life on Earth that requires components from the atmosphere, lithosphere and hydrosphere.', answer: 'biosphere', acceptable: ['biosphere'], explanation: 'The biosphere is where life exists; it needs all three spheres.', topic: 'foundations' },
  { id: 'j6', category: 'FOOD WEBS', value: 100, clue: 'The direction the arrows point in a food chain.', answer: 'direction of energy transfer', acceptable: ['energy transfer', 'toward the eater', 'to the eater', 'direction of energy'], explanation: 'Arrows point toward the organism receiving the energy.', topic: 'foodwebs' },
  { id: 'j7', category: 'FOOD WEBS', value: 200, clue: 'The first trophic level in every food chain.', answer: 'producers', acceptable: ['producer', 'producers'], explanation: 'Producers capture energy from the Sun.', topic: 'foodwebs' },
  { id: 'j8', category: 'FOOD WEBS', value: 300, clue: 'The role of an organism that eats a producer.', answer: 'primary consumer', acceptable: ['primary consumer', 'primary consumers', 'first consumer'], explanation: 'Primary consumers occupy the second trophic level.', topic: 'foodwebs' },
  { id: 'j9', category: 'FOOD WEBS', value: 400, clue: 'The approximate percentage of energy transferred from one trophic level to the next.', answer: '10%', acceptable: ['10', '10%', 'ten percent'], explanation: 'About 90% is used or lost as heat.', topic: 'foodwebs' },
  { id: 'j10', category: 'FOOD WEBS', value: 500, clue: 'A representation of feeding relationships made of interconnected food chains.', answer: 'food web', acceptable: ['food web', 'foodweb'], explanation: 'Food webs show complex interactions and alternative pathways.', topic: 'foodwebs' },
  { id: 'j11', category: 'PYRAMIDS', value: 100, clue: 'The two quantities measured by biomass and numbers pyramids (name both).', answer: 'mass and number of individuals', acceptable: ['mass and number', 'mass and numbers', 'biomass and numbers', 'mass, numbers'], explanation: 'Biomass = mass; numbers = count of individuals.', topic: 'pyramids' },
  { id: 'j12', category: 'PYRAMIDS', value: 200, clue: 'The pyramid that shows the total mass of all individuals combined.', answer: 'biomass pyramid', acceptable: ['biomass pyramid', 'biomass'], explanation: 'Biomass is total mass of all individuals.', topic: 'pyramids' },
  { id: 'j13', category: 'PYRAMIDS', value: 300, clue: 'The pyramid that can be inverted when one tree supports many insects.', answer: 'numbers pyramid', acceptable: ['numbers pyramid', 'number pyramid', 'pyramid of numbers'], explanation: 'A numbers pyramid counts individuals, so it can be inverted.', topic: 'pyramids' },
  { id: 'j14', category: 'PYRAMIDS', value: 400, clue: 'The pyramid that is always upright because energy is lost at each transfer.', answer: 'energy pyramid', acceptable: ['energy pyramid', 'pyramid of energy'], explanation: 'Energy decreases at every trophic transfer.', topic: 'pyramids' },
  { id: 'j15', category: 'PYRAMIDS', value: 500, clue: 'If producers have 50 000 units of energy, how many units reach the third trophic level at 10% efficiency?', answer: '500', acceptable: ['500'], explanation: '50 000 × 0.10 = 5 000; × 0.10 = 500.', topic: 'pyramids' },
  { id: 'j16', category: 'CYCLES', value: 100, clue: 'The process by which water vapour leaves plant leaves.', answer: 'transpiration', acceptable: ['transpiration'], explanation: 'Transpiration is part of the biotic water cycle.', topic: 'cycles' },
  { id: 'j17', category: 'CYCLES', value: 200, clue: 'The process by which water vapour cools and forms cloud droplets.', answer: 'condensation', acceptable: ['condensation'], explanation: 'Condensation leads to cloud formation and precipitation.', topic: 'cycles' },
  { id: 'j18', category: 'CYCLES', value: 300, clue: 'A process that removes CO₂ from the atmosphere and acts as a carbon sink.', answer: 'photosynthesis', acceptable: ['photosynthesis'], explanation: 'Photosynthesis converts CO₂ into glucose.', topic: 'cycles' },
  { id: 'j19', category: 'CYCLES', value: 400, clue: 'The compound CaCO₃ that stores carbon in shells and limestone.', answer: 'calcium carbonate', acceptable: ['calcium carbonate', 'caco3'], explanation: 'Shells of calcium carbonate can become sedimentary rock.', topic: 'cycles' },
  { id: 'j20', category: 'CYCLES', value: 500, clue: 'The process that returns carbon stored in ancient organisms underground to the atmosphere when humans burn it.', answer: 'combustion', acceptable: ['combustion', 'burning fossil fuels', 'burning'], explanation: 'Combustion of fossil fuels releases ancient carbon as CO₂.', topic: 'cycles' },
  { id: 'j21', category: 'NITROGEN', value: 100, clue: 'The percentage of the atmosphere that is nitrogen gas.', answer: '78%', acceptable: ['78', '78%', 'seventy eight'], explanation: 'About 78% of the atmosphere is N₂.', topic: 'nitrogen' },
  { id: 'j22', category: 'NITROGEN', value: 200, clue: 'The process that converts N₂ gas into ammonia or ammonium.', answer: 'nitrogen fixation', acceptable: ['nitrogen fixation', 'fixation'], explanation: 'Bacteria or lightning fix nitrogen.', topic: 'nitrogen' },
  { id: 'j23', category: 'NITROGEN', value: 300, clue: 'The process that converts ammonia into nitrites and then nitrates.', answer: 'nitrification', acceptable: ['nitrification'], explanation: 'Nitrifying bacteria perform nitrification.', topic: 'nitrogen' },
  { id: 'j24', category: 'NITROGEN', value: 400, clue: 'The process in which decomposers release ammonia from dead matter and wastes.', answer: 'ammonification', acceptable: ['ammonification'], explanation: 'Ammonification recycles organic nitrogen.', topic: 'nitrogen' },
  { id: 'j25', category: 'NITROGEN', value: 500, clue: 'The process that converts nitrates back into N₂ gas, completing the nitrogen cycle.', answer: 'denitrification', acceptable: ['denitrification'], explanation: 'Denitrifying bacteria return nitrogen to the atmosphere.', topic: 'nitrogen' },
];

export const FINAL_JEOPARDY = {
  category: 'UNIT SYNTHESIS',
  clue: 'Explain why energy is lost as it moves up a food chain, and name the approximate percentage transferred.',
  answer: 'About 90% is used/lost as heat; about 10% transfers',
  acceptable: ['10', '10%', 'heat', 'used', 'thermal', 'respiration', 'lost'],
  explanation: 'Organisms use energy for life processes and release heat. Only about 10% moves to the next trophic level, so higher levels support fewer organisms.',
};

export interface WordleRoundResult {
  word: string;
  solved: boolean;
  guesses: number;
  hintsUsed: number;
}

export interface EscapePuzzle {
  id: string;
  type: 'text' | 'number' | 'sequence' | 'choice';
  prompt: string;
  hint: string;
  accepted?: string[];
  numberAnswer?: number;
  sequence?: string[];
  choices?: string[];
  choiceAnswer?: number;
  explanation: string;
}

export interface EscapeRoom {
  id: string;
  name: string;
  subtitle: string;
  topic: TopicId;
  color: string;
  puzzles: EscapePuzzle[];
  exitPrompt: string;
  exitAccepted: string[];
  exitExplanation: string;
}

export const ESCAPE_ROOMS: EscapeRoom[] = [
  {
    id: 'room-sun', name: 'The Sunlit Gate', subtitle: 'Energy enters here. Prove you know how.', topic: 'energy', color: '#FFC24B',
    puzzles: [
      { id: 'e1', type: 'text', prompt: 'Which organelle captures sunlight for photosynthesis?', hint: 'It contains chlorophyll.', accepted: ['chloroplast', 'chloroplasts'], explanation: 'Chloroplasts contain chlorophyll, which absorbs sunlight.' },
      { id: 'e2', type: 'text', prompt: 'Which gas is released as a product of photosynthesis?', hint: 'It is the gas animals need to breathe.', accepted: ['oxygen', 'o2'], explanation: 'Photosynthesis releases oxygen: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.' },
      { id: 'e3', type: 'sequence', prompt: 'Order the pond food chain from producer to top consumer.', sequence: ['Duckweed', 'Guppies', 'Catfish'], hint: 'Start with the photosynthetic organism.', explanation: 'Duckweed (producer) → guppies (primary consumer) → catfish (secondary consumer).' },
    ],
    exitPrompt: 'The gate asks: which process releases energy from glucose in all organisms?',
    exitAccepted: ['cellular respiration', 'respiration'],
    exitExplanation: 'Cellular respiration releases energy from glucose in all organisms, including plants.',
  },
  {
    id: 'room-trophic', name: 'The Trophic Vault', subtitle: 'Energy is lost at every door. Do the math.', topic: 'pyramids', color: '#4DE1C1',
    puzzles: [
      { id: 'e4', type: 'number', prompt: 'A producer level has 50 000 units of energy. At 10% efficiency, how much reaches the second trophic level?', numberAnswer: 5000, hint: 'Multiply by 0.10.', explanation: '50 000 × 0.10 = 5 000 units.' },
      { id: 'e5', type: 'number', prompt: 'What trophic level is a secondary consumer?', numberAnswer: 3, hint: 'Producer is 1, primary consumer is 2.', explanation: 'Producers 1st; primary consumers 2nd; secondary consumers 3rd.' },
      { id: 'e6', type: 'choice', prompt: 'Which pyramid can be inverted by one tree supporting thousands of insects?', choices: ['Energy pyramid', 'Biomass pyramid', 'Numbers pyramid'], choiceAnswer: 2, hint: 'Think about what is being counted.', explanation: 'A numbers pyramid counts individuals, so one tree → many insects can invert it.' },
    ],
    exitPrompt: 'The vault asks: what percentage of energy is transferred between trophic levels?',
    exitAccepted: ['10', '10%', 'ten', 'ten percent'],
    exitExplanation: 'About 10% transfers; about 90% is used and lost as heat.',
  },
  {
    id: 'room-cycle', name: 'The Cycle Chamber', subtitle: 'Water and carbon never leave. Follow the atoms.', topic: 'cycles', color: '#7DD3FC',
    puzzles: [
      { id: 'e7', type: 'text', prompt: 'What is the process called when water vapour leaves plant leaves?', hint: 'It rhymes with "inspiration" but starts with trans-.', accepted: ['transpiration'], explanation: 'Transpiration is the loss of water vapour from leaves.' },
      { id: 'e8', type: 'sequence', prompt: 'Order the water cycle: evaporation, condensation, precipitation, runoff.', sequence: ['Evaporation', 'Condensation', 'Precipitation', 'Runoff'], hint: 'Liquid → vapour → droplets → falling → flowing.', explanation: 'Evaporation → condensation → precipitation → runoff.' },
      { id: 'e9', type: 'text', prompt: 'Which process releases CO₂ from glucose and acts as a carbon source?', hint: 'It happens in mitochondria.', accepted: ['cellular respiration', 'respiration'], explanation: 'Cellular respiration releases CO₂, making it a carbon source.' },
    ],
    exitPrompt: 'The chamber asks: what kind of cycle moves matter between living and non-living reservoirs?',
    exitAccepted: ['biogeochemical', 'biogeochemical cycle'],
    exitExplanation: 'A biogeochemical cycle moves matter between biotic and abiotic reservoirs.',
  },
  {
    id: 'room-nitro', name: 'The Nitrogen Core', subtitle: 'The air is 78% nitrogen — and none of it is usable yet.', topic: 'nitrogen', color: '#A78BFA',
    puzzles: [
      { id: 'e10', type: 'text', prompt: 'What is the process that converts N₂ into ammonia or ammonium?', hint: 'Bacteria in root nodules do it.', accepted: ['nitrogen fixation', 'fixation'], explanation: 'Nitrogen fixation converts N₂ to NH₃/NH₄⁺.' },
      { id: 'e11', type: 'text', prompt: 'What is the process that converts nitrates back into N₂ gas?', hint: 'It completes the cycle.', accepted: ['denitrification'], explanation: 'Denitrifying bacteria convert nitrate to N₂.' },
      { id: 'e12', type: 'number', prompt: 'What percentage of the atmosphere is N₂?', numberAnswer: 78, hint: 'A little more than three quarters.', explanation: 'About 78% of the atmosphere is nitrogen gas.' },
    ],
    exitPrompt: 'The final lock asks: what human-made input can run off fields and cause algal blooms?',
    exitAccepted: ['fertilizer', 'fertilizers', 'artificial fertilizer', 'fertilizer runoff'],
    exitExplanation: 'Fertilizer runoff adds excess nutrients, causing eutrophication and dead zones.',
  },
];

export interface DetectiveEvidence {
  id: string;
  title: string;
  text: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  pointsTo: string;
}

export interface DetectiveCase {
  id: string;
  title: string;
  location: string;
  brief: string;
  suspects: { id: string; name: string; icon: string }[];
  correctSuspect: string;
  evidence: DetectiveEvidence[];
  solution: string;
  wrongSolution: string;
}

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'case-river', title: 'The Dying River', location: 'Marsh Creek, downstream of a farm',
    brief: 'A river is choking with green algae. Fish are dying near the bottom while the surface looks lush. Five possible causes are on the board. Unlock the evidence, then make an accusation.',
    suspects: [
      { id: 'fertilizer', name: 'Fertilizer runoff', icon: 'Droplets' },
      { id: 'heat', name: 'Factory heat', icon: 'Flame' },
      { id: 'invasive', name: 'Invasive algae-eating fish', icon: 'Fish' },
      { id: 'acid', name: 'Acid rain', icon: 'CloudRain' },
      { id: 'fishing', name: 'Overfishing', icon: 'Anchor' },
    ],
    correctSuspect: 'fertilizer',
    evidence: [
      { id: 'ev1', title: 'Nutrient spike', text: 'Nitrate levels are 12× normal just below the farm and drop steadily downstream.', question: 'What is the main way excess nitrogen reaches a waterway?', options: ['Fertilizer runoff', 'Nitrogen fixation in the river', 'Denitrification', 'Lightning'], answer: 0, explanation: 'Rain washes soluble nitrates from fertilized fields into streams.', pointsTo: 'fertilizer' },
      { id: 'ev2', title: 'Green surface', text: 'Dense algae cover the surface. Light penetration drops to 0.4 m in the bloom zone.', question: 'Why are algal blooms harmful even though algae produce oxygen?', options: ['They block light and later decomposition uses oxygen', 'They immediately freeze the water', 'They convert nitrates into N₂', 'They increase water salinity'], answer: 0, explanation: 'The bloom blocks light; when algae die, decomposers consume oxygen, creating a dead zone.', pointsTo: 'fertilizer' },
      { id: 'ev3', title: 'Oxygen profile', text: 'Surface oxygen is high in the afternoon, but bottom oxygen is 2 mg/L at dawn. Dead fish are concentrated near the bottom.', question: 'Why is oxygen lowest just before sunrise?', options: ['Respiration continues while photosynthesis has stopped', 'Photosynthesis runs faster at night', 'Fish stop respiring at night', 'Nitrogen gas displaces oxygen'], answer: 0, explanation: 'At night, photosynthesis stops but respiration continues, consuming oxygen. This mirrors the aquarium question.', pointsTo: 'fertilizer' },
      { id: 'ev4', title: 'No other match', text: 'Water temperature, pH and invasive-fish surveys are all normal upstream. Fertilizer bags and bare soil are visible along the bank.', question: 'Which finding best supports fertilizer runoff as the cause?', options: ['Normal temperature/pH and fertilizer bags upstream', 'High fish diversity', 'A nearby lightning strike', 'Low nitrate levels everywhere'], answer: 0, explanation: 'The other suspects lack evidence; nutrients, algae, low oxygen and fertilizer upstream form the causal chain.', pointsTo: 'fertilizer' },
    ],
    solution: 'Fertilizer runoff carried excess nitrates into the river. The nutrients fuelled an algal bloom that blocked light; decomposing algae consumed oxygen, creating a dead zone. The other suspects are not supported by the evidence.',
    wrongSolution: 'That suspect is not supported by the evidence. The nitrate spike below the farm, fertilizer bags upstream, algal bloom, light loss and low bottom oxygen all point in one direction.',
  },
  {
    id: 'case-willow', title: 'The Vanishing Willows', location: 'A fictional valley in the northern Rockies',
    brief: 'Willow stands along a river are disappearing, beaver dams are failing, and banks are eroding. The valley once had wolves; they were removed a decade ago. Examine the evidence before naming the cause.',
    suspects: [
      { id: 'wolves', name: 'Wolf removal', icon: 'PawPrint' },
      { id: 'beetles', name: 'Invasive beetles', icon: 'Bug' },
      { id: 'drought', name: 'Severe drought', icon: 'Sun' },
      { id: 'fertilizer', name: 'Fertilizer runoff', icon: 'Droplets' },
      { id: 'beaver', name: 'Beaver overpopulation', icon: 'Trees' },
    ],
    correctSuspect: 'wolves',
    evidence: [
      { id: 'wv1', title: 'Missing predator', text: 'No wolves have been recorded in the valley for ten years. Elk counts have tripled near the river.', question: 'Why can removing a top predator change a plant community?', options: ['It can release herbivores from predation and change their grazing behaviour', 'Predators photosynthesize', 'Herbivores stop eating without predators', 'It has no effect on plants'], answer: 0, explanation: 'Wolves control elk numbers and grazing behaviour; removing them can intensify grazing.', pointsTo: 'wolves' },
      { id: 'wv2', title: 'Bark stripping', text: 'Willow stems show heavy browsing scars below 2 m, exactly the height elk can reach. Regrowth is vigorous inside elk exclosures.', question: 'What does the exclosure result suggest?', options: ['Grazing pressure is limiting willow growth', 'Willows cannot grow in the valley', 'Beetles are the main cause', 'The soil is permanently damaged'], answer: 0, explanation: 'When elk are excluded, willows recover, implicating grazing rather than soil or climate alone.', pointsTo: 'wolves' },
      { id: 'wv3', title: 'No beetle outbreak', text: 'Insect surveys find no significant willow beetle outbreak. Drought records show only a mild dry year, not a severe multi-year drought.', question: 'What do these findings do?', options: ['Weaken the beetle and drought hypotheses', 'Prove fertilizer caused the damage', 'Show wolves eat willows', 'Prove beavers caused erosion'], answer: 0, explanation: 'The evidence points away from beetles and drought, narrowing the cause to grazing.', pointsTo: 'wolves' },
      { id: 'wv4', title: 'The cascade', text: 'With fewer willows, banks erode and beaver dams fail. Beaver ponds once stored water and supported aquatic life.', question: 'Which chain best explains the valley?', options: ['Wolf removal → more elk/grazing → fewer willows → erosion and dam failure', 'Wolf removal → fewer elk → more willows', 'Beavers eat elk → willows grow', 'Drought → wolves disappear → beetles'], answer: 0, explanation: 'This is the Yellowstone-style trophic cascade from the slides: wolves → elk → plants → banks and aquatic habitat.', pointsTo: 'wolves' },
    ],
    solution: 'The valley fits a trophic cascade. Removing wolves allowed elk to increase and graze willows heavily, especially along the river. Willow loss led to bank erosion, beaver dam failure and habitat decline. Exclosures and the absence of beetle/drought evidence support this chain.',
    wrongSolution: 'The evidence does not fit that suspect. The key pattern is wolf removal, increased elk browsing, willow loss, erosion and beaver habitat decline.',
  },
];

export interface TFBlitzStatement {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  topic: TopicId;
}

export const TF_BLITZ_STATEMENTS: TFBlitzStatement[] = [
  { id: 'tf1', statement: 'An ecosystem includes both living and non-living parts.', answer: true, explanation: 'Biotic + abiotic factors interacting.', topic: 'foundations' },
  { id: 'tf2', statement: 'A population contains several different species.', answer: false, explanation: 'A population is one species; a community contains multiple species.', topic: 'foundations' },
  { id: 'tf3', statement: 'A habitat is the physical area where a species lives.', answer: true, explanation: 'Habitat is the "address"; niche is the role.', topic: 'foundations' },
  { id: 'tf4', statement: 'No two species can occupy an identical niche.', answer: true, explanation: 'Each species has its own unique niche.', topic: 'foundations' },
  { id: 'tf5', statement: 'Shale is a biotic factor.', answer: false, explanation: 'Shale is non-living, so it is abiotic.', topic: 'foundations' },
  { id: 'tf6', statement: 'Removing a keystone species usually has little effect on the ecosystem.', answer: false, explanation: 'Keystone species have disproportionate effects; removal can collapse the ecosystem.', topic: 'foundations' },
  { id: 'tf7', statement: 'Food-chain arrows point toward the organism that receives the energy.', answer: true, explanation: 'Arrows show the direction of energy transfer.', topic: 'foodwebs' },
  { id: 'tf8', statement: 'Only about 10% of energy is transferred between trophic levels.', answer: true, explanation: 'About 90% is used and lost as heat.', topic: 'foodwebs' },
  { id: 'tf9', statement: 'A top carnivore has more available energy than a producer.', answer: false, explanation: 'Energy decreases at each transfer; top carnivores have the least.', topic: 'foodwebs' },
  { id: 'tf10', statement: 'Food webs are made of interconnected food chains.', answer: true, explanation: 'Food webs show complex feeding relationships.', topic: 'foodwebs' },
  { id: 'tf11', statement: 'A numbers pyramid can be inverted.', answer: true, explanation: 'One tree can support many insects, making the producer layer narrow.', topic: 'pyramids' },
  { id: 'tf12', statement: 'An energy pyramid can be inverted.', answer: false, explanation: 'Energy decreases at every transfer, so the energy pyramid is always upright.', topic: 'pyramids' },
  { id: 'tf13', statement: 'Biomass is the total number of individuals in a trophic level.', answer: false, explanation: 'Biomass is total mass; numbers is the count of individuals.', topic: 'pyramids' },
  { id: 'tf14', statement: 'In a typical forest, the biomass pyramid is upright.', answer: true, explanation: 'Trees have much more biomass than the herbivores that eat them.', topic: 'pyramids' },
  { id: 'tf15', statement: 'Photosynthesis converts light energy into chemical energy in glucose.', answer: true, explanation: 'Chlorophyll captures light; glucose stores chemical energy.', topic: 'energy' },
  { id: 'tf16', statement: 'Cellular respiration produces glucose.', answer: false, explanation: 'Respiration uses glucose and releases energy; photosynthesis produces glucose.', topic: 'energy' },
  { id: 'tf17', statement: 'Plants perform cellular respiration day and night.', answer: true, explanation: 'All organisms respire continuously, including plants.', topic: 'energy' },
  { id: 'tf18', statement: 'Decomposers release oxygen into the atmosphere.', answer: false, explanation: 'Decomposers use oxygen and release CO₂ plus nitrogen compounds.', topic: 'energy' },
  { id: 'tf19', statement: 'Only about 1% of incoming solar energy is captured by producers.', answer: true, explanation: 'Most solar energy is reflected or absorbed; about 1% is used by ecosystems.', topic: 'energy' },
  { id: 'tf20', statement: 'Energy is recycled in ecosystems just like carbon.', answer: false, explanation: 'Energy flows and is lost as heat; matter cycles.', topic: 'cycles' },
  { id: 'tf21', statement: 'Transpiration is the loss of water vapour from plant leaves.', answer: true, explanation: 'It is part of the water cycle.', topic: 'cycles' },
  { id: 'tf22', statement: 'Cellular respiration releases water as a product.', answer: true, explanation: 'Respiration produces CO₂ and water.', topic: 'cycles' },
  { id: 'tf23', statement: 'Photosynthesis removes CO₂ from the atmosphere.', answer: true, explanation: 'Photosynthesis is a carbon sink.', topic: 'cycles' },
  { id: 'tf24', statement: 'Burning fossil fuels removes carbon from the atmosphere.', answer: false, explanation: 'Combustion adds CO₂ to the atmosphere.', topic: 'cycles' },
  { id: 'tf25', statement: 'Calcium carbonate shells can eventually become limestone.', answer: true, explanation: 'Shells can form sedimentary rock over long periods.', topic: 'cycles' },
  { id: 'tf26', statement: 'Plants can absorb N₂ gas directly from the atmosphere.', answer: false, explanation: 'N₂ must be fixed into ammonia/ammonium or nitrates first.', topic: 'nitrogen' },
  { id: 'tf27', statement: 'Nitrogen-fixing bacteria often live in root nodules of legumes.', answer: true, explanation: 'They convert N₂ into usable nitrogen compounds.', topic: 'nitrogen' },
  { id: 'tf28', statement: 'Nitrification converts nitrates into N₂ gas.', answer: false, explanation: 'Nitrification converts ammonia to nitrite and nitrate; denitrification returns N₂.', topic: 'nitrogen' },
  { id: 'tf29', statement: 'Denitrification returns nitrogen to the atmosphere.', answer: true, explanation: 'It completes the nitrogen cycle by converting nitrate to N₂.', topic: 'nitrogen' },
  { id: 'tf30', statement: 'Fertilizer runoff can cause algal blooms and dead zones.', answer: true, explanation: 'Excess nutrients cause eutrophication and oxygen depletion.', topic: 'nitrogen' },
  { id: 'tf31', statement: 'Ammonification is carried out by decomposers.', answer: true, explanation: 'They release ammonia/ammonium from dead organic matter.', topic: 'nitrogen' },
  { id: 'tf32', statement: 'Lightning is the main source of usable nitrogen for ecosystems.', answer: false, explanation: 'Biological fixation by bacteria is the major route; lightning fixes only small amounts.', topic: 'nitrogen' },
  { id: 'tf33', statement: 'The carbon, water and nitrogen cycles are completely independent.', answer: false, explanation: 'They interact; for example, photosynthesis uses CO₂ and water, and decomposers release both CO₂ and nitrogen compounds.', topic: 'integration' },
  { id: 'tf34', statement: 'A pyramid of biomass counts the number of organisms.', answer: false, explanation: 'Biomass measures mass; numbers counts individuals.', topic: 'integration' },
  { id: 'tf35', statement: 'Cellular respiration is a carbon source, while photosynthesis is a carbon sink.', answer: true, explanation: 'Respiration releases CO₂; photosynthesis removes it.', topic: 'integration' },
];

export interface BossConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  topic: TopicId;
  hp: number;
  color: string;
  icon: string;
  phases: string[];
  questionCount: number;
  minDifficulty: number;
  maxDifficulty: number;
}

export const BOSSES: BossConfig[] = [
  { id: 'boss-blight', name: 'The Blight', title: 'Rot of the Foundation', description: 'A creeping decay that turns living connections into dead ends. It feeds on weak definitions and mixed-up levels of organization.', topic: 'foundations', hp: 100, color: '#B7F34A', icon: 'Skull', phases: ['Spore', 'Root Rot', 'Collapse'], questionCount: 8, minDifficulty: 2, maxDifficulty: 4 },
  { id: 'boss-combustion', name: 'Combustion Colossus', title: 'The Carbon Furnace', description: 'A furnace of stored carbon, burning through the carbon cycle. It tests energy transfer, photosynthesis, respiration and the long carbon cycle.', topic: 'cycles', hp: 120, color: '#FF8A65', icon: 'Flame', phases: ['Ignition', 'Overdrive', 'Meltdown'], questionCount: 9, minDifficulty: 3, maxDifficulty: 5 },
  { id: 'boss-nitro', name: 'Nitro Tyrant', title: 'Warden of the Nitrogen Core', description: 'A tyrant that locks nitrogen away in unusable forms. Break its locks with fixation, nitrification, assimilation and denitrification.', topic: 'nitrogen', hp: 110, color: '#A78BFA', icon: 'Atom', phases: ['Lockdown', 'Fixation', 'Denitrification'], questionCount: 9, minDifficulty: 3, maxDifficulty: 5 },
];

export interface GameMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  category: 'quiz' | 'boss' | 'puzzle' | 'recall' | 'lab' | 'capstone' | 'race';
  multiplayer?: boolean;
  minutes: number;
  skills: string[];
  unlockLevel: number;
  featured?: boolean;
}

export const GAMES: GameMeta[] = [
  { id: 'karting', name: 'Fuel Kart 3D', tagline: 'Answers are fuel. First to the flag wins.', description: 'A real 3D split-screen kart race for one or two local players. Correct answers add fuel and a speed boost; wrong answers burn it. Race two laps against a friend or Nova AI.', icon: 'Flag', color: '#FF8A65', category: 'race', minutes: 6, skills: ['Retrieval', '2-player', '3D'], unlockLevel: 1, featured: true, multiplayer: true },
  { id: 'showdown', name: 'Science Showdown', tagline: 'Fast trivia. Four rivals. One podium.', description: 'Ten timed questions against three AI rivals. Speed, combos and accuracy decide the winner.', icon: 'Swords', color: '#B7F34A', category: 'quiz', minutes: 6, skills: ['Retrieval', 'Speed'], unlockLevel: 1, featured: true },
  { id: 'tower', name: 'Science Tower', tagline: 'Build upward. Don\'t crack.', description: 'Each correct answer adds a floor. Wrong answers create obstacles and cost supports. Reach the summit before the tower collapses.', icon: 'Building2', color: '#FFC24B', category: 'quiz', minutes: 7, skills: ['Mastery', 'Risk'], unlockLevel: 1 },
  { id: 'boss', name: 'Boss Battles', tagline: 'Turn knowledge into damage.', description: 'Fight three science-themed bosses with HP, attack patterns, focus abilities and escalating questions.', icon: 'Skull', color: '#FF6B6B', category: 'boss', minutes: 8, skills: ['Application', 'Boss'], unlockLevel: 1, featured: true },
  { id: 'speed', name: 'Speed Run', tagline: '60 seconds. How many can you clear?', description: 'A rapid-fire sprint. Correct answers add time; wrong answers cost it. Review every miss at the end.', icon: 'Gauge', color: '#4DE1C1', category: 'quiz', minutes: 2, skills: ['Fluency', 'Recall'], unlockLevel: 1 },
  { id: 'memory', name: 'Memory Match', tagline: 'Flip. Match. Remember.', description: 'Match terms to definitions, examples or roles. Fewer moves and faster times earn higher scores.', icon: 'Copy', color: '#7DD3FC', category: 'recall', minutes: 4, skills: ['Vocabulary', 'Working memory'], unlockLevel: 1 },
  { id: 'jeopardy', name: 'Science Jeopardy', tagline: 'Five categories. One board. Type your answer.', description: 'A full Jeopardy board with Daily Doubles, a rival, and Final Jeopardy. Answers are typed, not multiple choice.', icon: 'Grid3X3', color: '#FFC24B', category: 'quiz', minutes: 12, skills: ['Retrieval', 'Precision'], unlockLevel: 1, featured: true },
  { id: 'escape', name: 'Escape the Ecology Vault', tagline: 'Four rooms. Twelve locks. One exit.', description: 'Solve puzzles across energy, pyramids, cycles and nitrogen to escape. Hints cost points; the clock is running.', icon: 'DoorOpen', color: '#A78BFA', category: 'puzzle', minutes: 10, skills: ['Problem solving', 'Synthesis'], unlockLevel: 1 },
  { id: 'detective', name: 'Science Detective', tagline: 'Follow the evidence. Name the cause.', description: 'Investigate two ecosystem mysteries. Unlock evidence with science questions, eliminate suspects and make an evidence-based accusation.', icon: 'Search', color: '#F472B6', category: 'puzzle', minutes: 10, skills: ['Reasoning', 'Evidence'], unlockLevel: 1 },
  { id: 'flashcards', name: 'Flashcard Frenzy', tagline: 'Rate your recall. Schedule the next review.', description: 'Spaced-repetition flashcards with confidence ratings. Due cards return at scientifically sensible intervals.', icon: 'Layers', color: '#B7F34A', category: 'recall', minutes: 6, skills: ['Spaced repetition', 'Self-testing'], unlockLevel: 1, featured: true },
  { id: 'fill', name: 'Fill the Gaps', tagline: 'Complete the science, one blank at a time.', description: 'Cloze passages from every unit topic. Use the word bank or type from memory. Per-blank feedback shows exactly what to fix.', icon: 'TextCursorInput', color: '#4DE1C1', category: 'recall', minutes: 6, skills: ['Precision', 'Definitions'], unlockLevel: 1 },
  { id: 'drag', name: 'Drag-and-Drop Lab', tagline: 'Label, sort, sequence. Get hands-on.', description: 'Three lab modes: label diagrams, sort concepts, and order processes. Click-to-place works on touch and keyboard.', icon: 'MousePointer2', color: '#FF8A65', category: 'lab', minutes: 8, skills: ['Diagrams', 'Classification'], unlockLevel: 1 },
  { id: 'survival', name: 'Survival Mode', tagline: 'Three lives. Endless escalation.', description: 'Questions get harder every four correct answers. Earn shields every five-streak and spend a 50:50 lifeline when cornered.', icon: 'HeartPulse', color: '#FF6B6B', category: 'quiz', minutes: 8, skills: ['Stamina', 'Adaptation'], unlockLevel: 1 },
  { id: 'truefalse', name: 'True or False Blitz', tagline: 'Trust your gut. Then verify.', description: 'A 60-second binary sprint through the unit\'s traps and truths. Wrong answers cost time, not lives.', icon: 'ToggleLeft', color: '#7DD3FC', category: 'quiz', minutes: 2, skills: ['Misconceptions', 'Speed'], unlockLevel: 1 },
  { id: 'wordle', name: 'Science Wordle', tagline: 'Six guesses. One scientific term.', description: 'Guess unit vocabulary with green/yellow/grey feedback. Hints reveal definitions at a score cost.', icon: 'Grid2X2', color: '#F472B6', category: 'puzzle', minutes: 5, skills: ['Vocabulary', 'Deduction'], unlockLevel: 1 },
  { id: 'gauntlet', name: 'Final Exam Gauntlet', tagline: 'Five stages. Three lives. One final boss.', description: 'A capstone run: rapid recall, true/false traps, fill-ins, multi-select and a final boss. Unlocks at Level 3.', icon: 'Sword', color: '#FFC24B', category: 'capstone', minutes: 15, skills: ['Everything'], unlockLevel: 3, featured: true },
];

export const GAME_MAP: Record<string, GameMeta> = Object.fromEntries(GAMES.map((g) => [g.id, g]));