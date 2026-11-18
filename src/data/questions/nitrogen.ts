import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill, open } = topicFactory('nitrogen');
const scenario = open('scenario');
const compare = open('compare');
const error = open('error');
const causeEffect = open('causeeffect');

export const nitrogenQuestions: Question[] = [
  mcq({
    id: 'ni-01',
    concepts: ['nitrogen-importance'],
    difficulty: 1,
    prompt: 'Nitrogen is an important element in which biological molecules?',
    options: ['Proteins and DNA', 'Glucose and water', 'Calcium carbonate and oxygen', 'Only fossil fuels'],
    answer: 0,
    explanation:
      'Nitrogen is found in proteins and DNA. It is also a major component of the atmosphere, where it exists as N₂ gas (78%).',
    whyWrong: {
      1: 'Glucose (C₆H₁₂O₆) and water (H₂O) contain no nitrogen.',
      2: 'Calcium carbonate contains calcium, carbon and oxygen; oxygen is an element, not a molecule containing nitrogen.',
      3: 'Fossil fuels are carbon-based; nitrogen is essential to living molecules.',
    },
  }),
  mcq({
    id: 'ni-02',
    concepts: ['nitrogen-importance'],
    difficulty: 1,
    prompt: 'What percentage of the atmosphere is nitrogen gas (N₂)?',
    options: ['About 78%', 'About 21%', 'About 1%', 'About 50%'],
    answer: 0,
    explanation:
      'About 78% of the atmosphere is N₂. However, most organisms cannot use N₂ directly, which is why nitrogen fixation is essential.',
    whyWrong: {
      1: 'About 21% is oxygen, not nitrogen.',
      2: 'About 1% is argon and other trace gases; it is not the nitrogen share.',
      3: '50% is far too low for atmospheric nitrogen.',
    },
  }),
  mcq({
    id: 'ni-03',
    concepts: ['nitrogen-importance'],
    difficulty: 2,
    prompt: 'Why can\'t plants and animals use atmospheric nitrogen gas (N₂) directly?',
    options: [
      'The strong bonds in N₂ make it unusable; it must first be converted into compounds such as ammonia or nitrates',
      'N₂ is too rare in the atmosphere',
      'N₂ is a solid at room temperature',
      'Animals breathe it in and use it immediately',
    ],
    answer: 0,
    explanation:
      'Atmospheric N₂ is very unreactive. Plants rely on bacteria and other processes to convert it into usable compounds such as ammonia/ammonium, nitrites and nitrates.',
    whyWrong: {
      1: 'N₂ is abundant (about 78%), not rare.',
      2: 'N₂ is a gas at room temperature.',
      3: 'Animals do not use N₂ directly; they get nitrogen from the food they eat.',
    },
  }),
  mcq({
    id: 'ni-04',
    concepts: ['nitrogen-fixation'],
    difficulty: 2,
    prompt: 'Nitrogen fixation is the process that converts…',
    options: [
      'N₂ gas into compounds such as ammonia (NH₃) or ammonium (NH₄⁺)',
      'Nitrates into N₂ gas',
      'Ammonia into nitrates only',
      'Nitrates into proteins in animals',
    ],
    answer: 0,
    explanation:
      'Nitrogen fixation converts atmospheric N₂ into ammonia (NH₃) or ammonium (NH₄⁺), which can then be used by plants. Nitrogen-fixing bacteria often live in legume root nodules.',
    whyWrong: {
      1: 'That is denitrification, the reverse direction.',
      2: 'Converting ammonia to nitrates is nitrification, not fixation.',
      3: 'Animals obtain nitrogen by eating; assimilation builds proteins in plants.',
    },
  }),
  mcq({
    id: 'ni-05',
    concepts: ['nitrogen-fixation'],
    difficulty: 2,
    prompt: 'Where are nitrogen-fixing bacteria often found?',
    options: [
      'In root nodules of legumes',
      'In the stomachs of top carnivores',
      'In atmospheric clouds',
      'Inside fossil fuel deposits',
    ],
    answer: 0,
    explanation:
      'Nitrogen-fixing bacteria are often found attached to legume roots in bulb-like structures called nodules. The plant provides the bacteria with a habitat and energy; the bacteria provide usable nitrogen compounds.',
    whyWrong: {
      1: 'Top carnivores get nitrogen from food, not from symbiotic root bacteria.',
      2: 'Clouds are part of the water cycle; bacteria live in soil/roots.',
      3: 'Fossil fuel deposits are not a habitat for nitrogen-fixing bacteria.',
    },
  }),
  mcq({
    id: 'ni-06',
    concepts: ['nitrogen-fixation'],
    difficulty: 3,
    prompt: 'Which compounds are produced directly by biological nitrogen fixation?',
    options: ['Ammonia (NH₃) or ammonium (NH₄⁺)', 'Nitrates only (NO₃⁻)', 'Nitrogen gas (N₂)', 'Carbon dioxide (CO₂)'],
    answer: 0,
    explanation:
      'Biological fixation converts N₂ into ammonia (NH₃) or ammonium (NH₄⁺). Nitrifying bacteria later convert these into nitrites and nitrates.',
    whyWrong: {
      1: 'Nitrates are produced by nitrification, a separate step.',
      2: 'N₂ is the starting material, not the product of fixation.',
      3: 'CO₂ is part of the carbon cycle, not nitrogen fixation.',
    },
  }),
  mcq({
    id: 'ni-07',
    concepts: ['nitrogen-fixation'],
    difficulty: 2,
    prompt: 'Which process is an example of abiotic nitrogen fixation?',
    options: [
      'Lightning converting atmospheric N₂ into nitrogen compounds',
      'Bacteria in legume root nodules converting N₂ into ammonia',
      'Plants absorbing nitrates through their roots',
      'Denitrifying bacteria converting nitrates into N₂',
    ],
    answer: 0,
    explanation:
      'Lightning strikes and UV light can convert small amounts of atmospheric N₂ into nitrogen compounds. This is abiotic fixation because it does not involve living organisms.',
    whyWrong: {
      1: 'That is biotic fixation by bacteria.',
      2: 'That is assimilation, not fixation.',
      3: 'That is denitrification, which returns N₂ to the atmosphere.',
    },
  }),
  mcq({
    id: 'ni-08',
    concepts: ['nitrification-assimilation'],
    difficulty: 3,
    prompt: 'What is the correct order of nitrification?',
    options: [
      'Ammonia/ammonium → nitrites (NO₂⁻) → nitrates (NO₃⁻)',
      'Nitrates → nitrites → ammonia',
      'N₂ → nitrates → ammonia',
      'Nitrates → N₂ gas → ammonia',
    ],
    answer: 0,
    explanation:
      'Nitrifying bacteria convert ammonia/ammonium first into nitrites (NO₂⁻), then into nitrates (NO₃⁻). This process is called nitrification.',
    whyWrong: {
      1: 'This reverses nitrification; that direction is closer to denitrification/ammonification.',
      2: 'Fixation starts with N₂ and produces ammonia, not nitrates directly.',
      3: 'That combines denitrification and fixation, not nitrification.',
    },
  }),
  mcq({
    id: 'ni-09',
    concepts: ['nitrification-assimilation'],
    difficulty: 3,
    prompt: 'A plant absorbs nitrates through its roots and uses them to make proteins and DNA. This step is called…',
    options: ['Assimilation', 'Nitrification', 'Denitrification', 'Ammonification'],
    answer: 0,
    explanation:
      'Assimilation is the uptake and incorporation of nitrates (and other nutrients) into the plant\'s own molecules, such as proteins and DNA. Animals then obtain nitrogen by eating plants.',
    whyWrong: {
      1: 'Nitrification is the bacterial conversion of ammonia to nitrates.',
      2: 'Denitrification returns nitrogen to the atmosphere as N₂.',
      3: 'Ammonification releases ammonia from dead organic matter.',
    },
  }),
  mcq({
    id: 'ni-10',
    concepts: ['ammonification'],
    difficulty: 3,
    prompt: 'Decomposers break down dead plants and animal wastes, releasing ammonia/ammonium. This process is called…',
    options: ['Ammonification', 'Nitrification', 'Denitrification', 'Nitrogen fixation'],
    answer: 0,
    explanation:
      'Ammonification converts organic nitrogen in dead matter and wastes into ammonia/ammonium. Those compounds can then be nitrified into nitrates. This is why compost and manure are good fertilizers.',
    whyWrong: {
      1: 'Nitrification converts ammonia into nitrites and nitrates.',
      2: 'Denitrification converts nitrates into N₂ gas.',
      3: 'Fixation converts N₂ gas into ammonia, starting from the atmosphere rather than dead matter.',
    },
  }),
  mcq({
    id: 'ni-11',
    concepts: ['denitrification'],
    difficulty: 3,
    prompt: 'What do denitrifying bacteria do?',
    options: [
      'Convert nitrates into nitrogen gas (N₂), returning nitrogen to the atmosphere',
      'Convert N₂ into ammonia',
      'Convert ammonia into nitrates',
      'Absorb nitrates into plant roots',
    ],
    answer: 0,
    explanation:
      'Denitrifying soil bacteria convert nitrates back into N₂ gas in a process called denitrification. This completes the nitrogen cycle by returning nitrogen to the atmosphere.',
    whyWrong: {
      1: 'That is nitrogen fixation.',
      2: 'That is nitrification.',
      3: 'That is assimilation by plants.',
    },
  }),
  mcq({
    id: 'ni-12',
    concepts: ['ammonification', 'fertilizers-eutrophication'],
    difficulty: 4,
    prompt: 'Why are compost and manure good fertilizers?',
    options: [
      'Decomposers release nitrogen compounds that can be converted into nitrates for plants',
      'They contain N₂ gas that plants absorb directly',
      'They kill all soil bacteria',
      'They add oxygen to the soil for photosynthesis',
    ],
    answer: 0,
    explanation:
      'Decomposers break down organic matter in compost and manure through ammonification, releasing ammonia/ammonium that nitrifying bacteria convert into nitrates. Plants can then absorb the nitrates. This was question 32 on your practice test.',
    whyWrong: {
      1: 'Plants cannot use N₂ directly; they absorb nitrogen compounds such as nitrates.',
      2: 'Fertilizers support soil bacteria; they do not kill all of them.',
      3: 'Photosynthesis uses CO₂ and water, not soil oxygen directly.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'ni-13',
    concepts: ['fertilizers-eutrophication'],
    difficulty: 4,
    prompt: 'Which sequence best describes eutrophication after fertilizer runoff?',
    options: [
      'Nutrients enter water → algae grow rapidly → light is blocked → dead algae decompose → oxygen drops → dead zone',
      'Fertilizer kills algae → water clears → oxygen rises → fish thrive',
      'Nitrogen gas escapes → ozone forms → plants die',
      'Salt enters water → algae shrink → oxygen rises',
    ],
    answer: 0,
    explanation:
      'Fertilizer adds nutrients, causing an algal bloom. The bloom blocks light from deeper water. When the algae die, decomposers use oxygen to break them down, creating low-oxygen dead zones that harm aquatic life.',
    whyWrong: {
      1: 'Fertilizer stimulates algae; it does not kill them or clear the water.',
      2: 'Nitrogen gas escaping is not the runoff problem described in the slides.',
      3: 'Salt runoff is a different issue; the fertilizer problem is nutrient-driven.',
    },
  }),
  mcq({
    id: 'ni-14',
    concepts: ['fertilizers-eutrophication'],
    difficulty: 3,
    prompt: 'What is a major drawback of artificial fertilizers?',
    options: [
      'They can run off fields into waterways, causing algal blooms and dead zones',
      'They cannot add nitrogen to soil',
      'They are made only by lightning',
      'They prevent all plant growth',
    ],
    answer: 0,
    explanation:
      'Artificial fertilizers add usable nitrogen, but runoff carries nutrients into waterways where they are not needed. This can cause growth explosions, algal blooms and oxygen-poor dead zones. The Gulf of Mexico dead zone is an example from the slides.',
    whyWrong: {
      1: 'They are designed to add nitrogen compounds to soil.',
      2: 'Lightning is a natural fixation process; artificial fertilizers are human-made.',
      3: 'They promote growth; the problem is excess nutrients in the wrong place.',
    },
  }),
  multi({
    id: 'ni-15',
    concepts: ['nitrogen-fixation', 'nitrification-assimilation', 'denitrification'],
    difficulty: 3,
    prompt: 'Which processes are carried out by bacteria in the nitrogen cycle? Select ALL that apply.',
    options: ['Nitrogen fixation', 'Nitrification', 'Denitrification', 'Combustion of fossil fuels'],
    answer: [0, 1, 2],
    explanation:
      'Bacteria carry out nitrogen fixation (N₂ → ammonia), nitrification (ammonia → nitrites → nitrates) and denitrification (nitrates → N₂). Combustion is a human/industrial process in the carbon cycle, not a bacterial nitrogen process.',
    whyWrong: {
      3: 'Combustion is burning fuel, not a bacterial process.',
    },
    source: 'Slides 5 + marked practice test Part B Q18',
  }),
  multi({
    id: 'ni-16',
    concepts: ['nitrification-assimilation'],
    difficulty: 3,
    prompt: 'According to the slides, which nitrogen compounds can be made by soil bacteria? Select ALL that apply.',
    options: ['Ammonia/ammonium', 'Nitrites', 'Nitrates', 'Nitrogen gas only'],
    answer: [0, 1, 2],
    explanation:
      'Soil bacteria make ammonia/ammonium, nitrites and nitrates. Plants absorb nitrates (and can use ammonium) to build proteins and DNA. N₂ is the atmospheric starting material, not the useful product plants absorb.',
    whyWrong: {
      3: 'N₂ is the unusable atmospheric form, not the useful compound made for plants.',
    },
  }),
  tf({
    id: 'ni-17',
    concepts: ['nitrogen-importance'],
    difficulty: 2,
    prompt: 'Plants can absorb and use atmospheric N₂ directly.',
    answer: 1,
    explanation:
      'False. Plants and animals cannot use atmospheric N₂ directly. Bacteria and abiotic processes must first convert it into usable compounds such as ammonia/ammonium or nitrates.',
  }),
  tf({
    id: 'ni-18',
    concepts: ['denitrification'],
    difficulty: 2,
    prompt: 'Denitrification returns nitrogen gas (N₂) to the atmosphere.',
    answer: 0,
    explanation:
      'True. Denitrifying bacteria convert nitrates into N₂ gas, completing the nitrogen cycle by returning nitrogen to the atmosphere.',
  }),
  tf({
    id: 'ni-19',
    concepts: ['nitrification-assimilation', 'denitrification'],
    difficulty: 3,
    prompt: 'Nitrifying bacteria convert nitrates into nitrogen gas.',
    answer: 1,
    explanation:
      'False. Nitrifying bacteria convert ammonia/ammonium into nitrites and nitrates. Denitrifying bacteria convert nitrates into N₂ gas.',
  }),
  fill({
    id: 'ni-20',
    concepts: ['nitrogen-fixation', 'nitrification-assimilation', 'denitrification'],
    difficulty: 3,
    prompt:
      'Converting N₂ into ammonia is ___. Converting ammonia into nitrates is ___. Converting nitrates back into N₂ is ___.',
    blanks: [
      { accepted: [['nitrogen fixation', 'fixation', 'nitrogen-fixation']], hint: 'N₂ → NH₃' },
      { accepted: [['nitrification']], hint: 'Ammonia → nitrite → nitrate' },
      { accepted: [['denitrification']], hint: 'Nitrate → N₂' },
    ],
    explanation:
      'Fixation brings nitrogen into the biotic community; nitrification makes nitrates available to plants; denitrification returns N₂ to the atmosphere. Together they complete the cycle.',
  }),
  open('short')({
    id: 'ni-21',
    concepts: ['ammonification'],
    difficulty: 3,
    prompt: 'Explain the role of decomposers in the nitrogen cycle.',
    rubric: [
      { label: 'Break down dead matter and wastes', synonyms: ['decompos', 'dead', 'wastes', 'organic matter'] },
      { label: 'Release ammonia/ammonium (ammonification)', synonyms: ['ammonia', 'ammonium', 'nh3', 'nh4', 'ammonification'] },
      { label: 'Compounds can be nitrified into nitrates for plants', synonyms: ['nitrate', 'nitrification', 'plants', 'nutrients'] },
    ],
    modelAnswer:
      'Decomposers break down nitrogen-containing organic matter in dead plants, animals and wastes. Through ammonification they release ammonia/ammonium, which nitrifying bacteria convert into nitrates that plants can absorb. This recycles nitrogen back into the ecosystem.',
    explanation:
      'Decomposers are the recycling link: organic nitrogen → ammonia/ammonium → nitrates → plants. They release CO₂ through respiration too, but not oxygen.',
  }),
  scenario({
    id: 'ni-22',
    concepts: ['fertilizers-eutrophication', 'sustainability'],
    difficulty: 4,
    prompt:
      'A farm upstream spreads fertilizer before heavy rain. Weeks later, a downstream lake has a huge algal bloom and fish dying near the bottom. Explain the chain of events.',
    rubric: [
      { label: 'Runoff carries nutrients into lake', synonyms: ['runoff', 'fertilizer', 'nutrients', 'rain'] },
      { label: 'Algal bloom blocks light', synonyms: ['algal bloom', 'algae', 'light', 'growth'] },
      { label: 'Decomposers use oxygen; dead zone forms', synonyms: ['decompos', 'oxygen', 'dead zone', 'low oxygen'] },
      { label: 'Fish die from low oxygen', synonyms: ['fish', 'die', 'oxygen', 'suffocate'] },
    ],
    modelAnswer:
      'Rain washes fertilizer nutrients into the lake, causing rapid algal growth (a bloom). The dense algae block light from deeper water. When the algae die, decomposers break them down and use up oxygen, creating a low-oxygen dead zone. Fish and other aquatic organisms can suffocate.',
    explanation:
      'This is eutrophication. The key is that nutrients are not toxic themselves; the problem is the chain reaction they trigger. The Gulf of Mexico dead zone is the slide example.',
  }),
  error({
    id: 'ni-23',
    concepts: ['nitrogen-fixation'],
    difficulty: 3,
    prompt:
      'A student writes: "Lightning directly makes nitrates that plants absorb." Identify the imprecision and correct it.',
    rubric: [
      { label: 'Lightning fixes N₂ into nitrogen compounds/ammonia', synonyms: ['fixation', 'nitrogen compounds', 'ammonia', 'nitrogen oxides'] },
      { label: 'Further conversion/nitrification may be needed', synonyms: ['nitrification', 'nitrates', 'convert'] },
      { label: 'Only small amounts are made', synonyms: ['small', 'little', 'minor'] },
    ],
    modelAnswer:
      'Lightning performs abiotic nitrogen fixation, converting small amounts of atmospheric N₂ into nitrogen compounds. Those compounds may then be converted to nitrates in the soil before plants absorb them. It is not a large direct supply of nitrates.',
    explanation:
      'The slides emphasize that lightning and UV light fix only small amounts. Biological fixation by bacteria is the major route.',
  }),
  compare({
    id: 'ni-24',
    concepts: ['nitrification-assimilation', 'denitrification'],
    difficulty: 4,
    prompt: 'Compare nitrification and denitrification. Include the bacteria, the starting material and the product.',
    rubric: [
      { label: 'Nitrification: ammonia/ammonium → nitrite → nitrate', synonyms: ['ammonia', 'ammonium', 'nitrite', 'nitrate', 'nitrifying'] },
      { label: 'Denitrification: nitrate → N₂ gas', synonyms: ['nitrate', 'n2', 'nitrogen gas', 'denitrifying'] },
      { label: 'Different bacteria / opposite roles in cycle', synonyms: ['bacteria', 'opposite', 'return', 'atmosphere'] },
    ],
    modelAnswer:
      'Nitrification is carried out by nitrifying bacteria, which convert ammonia/ammonium into nitrites and then nitrates, making nitrogen available to plants. Denitrification is carried out by denitrifying bacteria, which convert nitrates back into N₂ gas, returning nitrogen to the atmosphere.',
    explanation:
      'Nitrification keeps nitrogen in the soil in usable form; denitrification sends it back to the atmosphere. They are opposite directions of the nitrogen cycle.',
  }),
  causeEffect({
    id: 'ni-25',
    concepts: ['fertilizers-eutrophication'],
    difficulty: 4,
    prompt: 'Trace the cause-and-effect relationship between artificial fertilizer use and a dead zone.',
    rubric: [
      { label: 'Excess nutrients enter water by runoff', synonyms: ['runoff', 'nutrients', 'fertilizer'] },
      { label: 'Algal bloom blocks light', synonyms: ['algal bloom', 'algae', 'light'] },
      { label: 'Decomposition consumes oxygen', synonyms: ['decompos', 'oxygen', 'bacteria'] },
      { label: 'Aquatic organisms die/suffocate', synonyms: ['fish', 'die', 'dead zone', 'hypoxia'] },
    ],
    modelAnswer:
      'Artificial fertilizer adds usable nitrogen to soil, but rain can wash excess nutrients into waterways. The nutrients fuel a rapid algal bloom, which blocks light. When the algae die, decomposers consume oxygen to break them down, lowering dissolved oxygen and creating a dead zone where fish and other organisms cannot survive.',
    explanation:
      'This is a human impact on the nitrogen cycle. The slide example is the Gulf of Mexico dead zone attributed to fertilizer runoff.',
  }),
  mcq({
    id: 'ni-26',
    concepts: ['nitrogen-fixation', 'denitrification', 'nitrification-assimilation'],
    difficulty: 4,
    prompt: 'A test asks: "Identify all the processes bacteria can perform." Which set is most complete and accurate for this unit?',
    options: [
      'Cellular respiration, nitrogen fixation, nitrification and denitrification',
      'Photosynthesis and combustion only',
      'Nitrogen fixation and combustion only',
      'Cellular respiration and photosynthesis only',
    ],
    answer: 0,
    explanation:
      'Bacteria carry out cellular respiration, nitrogen fixation, nitrification and denitrification. Some bacteria also photosynthesize, but the core course key for this matching question focuses on the nitrogen processes plus respiration. Combustion is an industrial process, not a bacterial one.',
    whyWrong: {
      1: 'Combustion is not a bacterial process, and bacteria are not limited to photosynthesis.',
      2: 'Combustion is not bacterial; this set is incomplete.',
      3: 'This omits the nitrogen-cycle processes that make bacteria central to the nitrogen cycle.',
    },
    source: 'Marked practice test Part B Q18 — teacher flagged missing/incorrect letters',
    teacherStyle: true,
  }),
  mcq({
    id: 'ni-27',
    concepts: ['ammonification', 'feeding-roles'],
    difficulty: 4,
    prompt: 'Decomposers help release which substance(s) into the environment?',
    options: [
      'Carbon dioxide and nitrogen compounds such as ammonia/ammonium',
      'Oxygen only',
      'Nitrogen gas only',
      'Glucose and oxygen',
    ],
    answer: 0,
    explanation:
      'Decomposers respire, releasing carbon dioxide, and they break down organic nitrogen to release ammonia/ammonium (ammonification). The practice test changed "oxygen" to CO₂/C/N — decomposers do not release oxygen as their key product.',
    whyWrong: {
      1: 'Decomposers use oxygen and release CO₂; they are not a source of oxygen.',
      2: 'Denitrifying bacteria release N₂; decomposers mainly release ammonia/ammonium and CO₂.',
      3: 'Producers make glucose and release oxygen.',
    },
    source: 'Marked practice test Q25',
    teacherStyle: true,
  }),
  mcq({
    id: 'ni-28',
    concepts: ['fertilizers-eutrophication'],
    difficulty: 3,
    prompt: 'Why do humans make artificial fertilizers?',
    options: [
      'To convert atmospheric N₂ into ammonia and boost soil nitrogen without relying only on natural fixation',
      'To remove all nitrogen from soil',
      'To make plants photosynthesize without sunlight',
      'To turn nitrates into N₂ gas',
    ],
    answer: 0,
    explanation:
      'Human-made fertilizers convert nitrogen gas directly into compounds such as ammonia, increasing the nitrogen available to crops. This supplements natural fixation but can cause runoff problems.',
    whyWrong: {
      1: 'Fertilizers add nitrogen; they do not remove it.',
      2: 'Photosynthesis still requires light.',
      3: 'That is denitrification, which would reduce soil nitrogen.',
    },
  }),
];