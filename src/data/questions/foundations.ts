import { topicFactory } from './helpers';
import type { Question } from '../../types';

const { mcq, multi, tf, fill } = topicFactory('foundations');

export const foundationsQuestions: Question[] = [
  mcq({
    id: 'fd-01',
    concepts: ['ecosystem-definition'],
    difficulty: 1,
    prompt: 'Which statement best defines an ecosystem?',
    options: [
      'All the living things in an area interacting with each other and with the non-living environment',
      'All the individuals of one species living in an area',
      'Only the non-living parts of an environment, such as soil and water',
      'Every ecosystem on Earth combined into one biosphere',
    ],
    answer: 0,
    explanation:
      'An ecosystem is a group of living things (biotic factors) interacting with each other and their non-living (abiotic) environment. It always includes both parts.',
    whyWrong: {
      1: 'That describes a population — one species only. An ecosystem needs multiple species plus the abiotic environment.',
      2: 'That describes only abiotic factors. An ecosystem must include living things too.',
      3: 'The biosphere is the global zone of life, not a single ecosystem definition.',
    },
  }),
  mcq({
    id: 'fd-02',
    concepts: ['biotic-abiotic'],
    difficulty: 1,
    prompt: 'Which of the following is a biotic factor in a forest?',
    options: ['Mosquitoes', 'A cold running stream', 'Wind through the trees', 'Shale rock'],
    answer: 0,
    explanation:
      'Biotic factors are the living components of an ecosystem. Mosquitoes are organisms; the stream, wind and rock are non-living (abiotic).',
    whyWrong: {
      1: 'A stream is a non-living physical feature — abiotic.',
      2: 'Wind is a non-living physical condition — abiotic.',
      3: 'Rock is non-living; the practice test used shale as an example of an abiotic factor.',
    },
  }),
  tf({
    id: 'fd-03',
    concepts: ['biotic-abiotic'],
    difficulty: 2,
    prompt: 'Shale, a type of rock, is an abiotic factor.',
    answer: 0,
    explanation:
      'True. Rock is non-living, so it is abiotic. The practice test marked this statement true.',
    whyWrong: {
      1: 'Rock is not alive and never was part of a living organism in this context, so it cannot be biotic.',
    },
  }),
  mcq({
    id: 'fd-04',
    concepts: ['ecological-organization'],
    difficulty: 1,
    prompt: 'A group of individuals of the same species living in a given area is called a…',
    options: ['Population', 'Community', 'Ecosystem', 'Biome'],
    answer: 0,
    explanation:
      'A population is one species in one area. A community contains multiple populations of different species; an ecosystem adds the abiotic factors.',
    whyWrong: {
      1: 'A community includes all the different species in an area, not just one.',
      2: 'An ecosystem includes the community plus abiotic factors.',
      3: 'A biome is a large region with a characteristic climate and community.',
    },
  }),
  mcq({
    id: 'fd-05',
    concepts: ['ecological-organization'],
    difficulty: 2,
    prompt: 'Which list is organized from smallest to largest?',
    options: [
      'Individual → population → community → ecosystem → biome → biosphere',
      'Population → individual → ecosystem → community → biosphere → biome',
      'Community → population → individual → biome → ecosystem → biosphere',
      'Individual → community → population → ecosystem → biosphere → biome',
    ],
    answer: 0,
    explanation:
      'One organism is an individual; individuals of one species form a population; different populations form a community; adding abiotic factors gives an ecosystem; similar ecosystems form a biome; all biomes together make the biosphere.',
    whyWrong: {
      1: 'An individual is smaller than a population, and biome is smaller than the biosphere.',
      2: 'This reverses the order: individuals make populations, not the other way around.',
      3: 'A population must come before a community, and biome before biosphere.',
    },
    teacherStyle: true,
  }),
  mcq({
    id: 'fd-06',
    concepts: ['habitat-niche'],
    difficulty: 2,
    prompt: 'Which pair correctly distinguishes habitat from niche?',
    options: [
      'Habitat = the physical area where a species lives; niche = the way it interacts with its community and abiotic environment',
      'Habitat = an organism\'s role; niche = the physical area where it lives',
      'Habitat = all species in an area; niche = one species only',
      'Habitat = only abiotic factors; niche = only biotic factors',
    ],
    answer: 0,
    explanation:
      'A habitat is the physical area a species inhabits — its "address." A niche is the way the species interacts with its community and environment — its "role."',
    whyWrong: {
      1: 'This swaps the two definitions.',
      2: 'Those definitions describe a community and a population, not habitat and niche.',
      3: 'Both habitat and niche involve a mix of biotic and abiotic features; they are not split that way.',
    },
  }),
  tf({
    id: 'fd-07',
    concepts: ['habitat-niche'],
    difficulty: 3,
    prompt: 'No two species can occupy an identical niche in the same ecosystem.',
    answer: 0,
    explanation:
      'True. Every species occupies its own unique niche. If two species tried to use exactly the same resources in the same way, competition would be intense.',
    whyWrong: {
      1: 'The slides state that every species occupies its own unique niche; identical niches would mean direct competition for every resource.',
    },
  }),
  mcq({
    id: 'fd-08',
    concepts: ['spheres-biosphere'],
    difficulty: 2,
    prompt: 'Why must the biosphere include components of the atmosphere, lithosphere and hydrosphere?',
    options: [
      'Living things need gases, solid surfaces/minerals and water, so life is found where all three spheres overlap',
      'The biosphere is another name for the atmosphere only',
      'Living things can survive with only one sphere present',
      'The biosphere is made only of the lithosphere',
    ],
    answer: 0,
    explanation:
      'The biosphere is where life exists on Earth. It must have components from all the other spheres — air, solid Earth and water — because organisms depend on all of them.',
    whyWrong: {
      1: 'The biosphere is not just the atmosphere; it overlaps all three spheres.',
      2: 'Life requires inputs from multiple spheres, not just one.',
      3: 'The lithosphere alone lacks the air and water most life needs.',
    },
  }),
  mcq({
    id: 'fd-09',
    concepts: ['spheres-biosphere'],
    difficulty: 2,
    prompt: 'Rocks, soil and minerals belong to which sphere?',
    options: ['Lithosphere', 'Hydrosphere', 'Atmosphere', 'Biosphere'],
    answer: 0,
    explanation:
      'The lithosphere is the solid, rocky part of Earth, including soil and minerals. The hydrosphere is water, and the atmosphere is the gases around Earth.',
    whyWrong: {
      1: 'The hydrosphere is Earth\'s water, not its rock and soil.',
      2: 'The atmosphere is the layer of gases surrounding Earth.',
      3: 'The biosphere is the zone where living things exist; it includes parts of the other spheres, but rocks themselves are lithosphere.',
    },
  }),
  mcq({
    id: 'fd-10',
    concepts: ['sustainability'],
    difficulty: 3,
    prompt: 'An ecosystem is sustainable when it can…',
    options: [
      'Support life without outside help',
      'Grow larger every year without limit',
      'Contain only producers and no consumers',
      'Survive only if humans constantly add resources',
    ],
    answer: 0,
    explanation:
      'Sustainability means the ecosystem can support life without outside help. Changes to abiotic factors (water, air, soil quality) or biotic factors (loss of species, invasive species) can reduce sustainability.',
    whyWrong: {
      1: 'Endless growth is not sustainability; ecosystems depend on balanced inputs and recycling.',
      2: 'A community without consumers lacks essential feeding relationships and nutrient cycling.',
      3: 'Constant outside help is the opposite of a self-sustaining system.',
    },
  }),
  mcq({
    id: 'fd-11',
    concepts: ['keystone-species'],
    difficulty: 3,
    prompt: 'A keystone species is best described as a species that…',
    options: [
      'Exerts strong control on community structure that is disproportionate to its population size',
      'Is the most numerous species in the ecosystem',
      'Is always the largest predator in a food web',
      'Has no effect on other species unless it disappears',
    ],
    answer: 0,
    explanation:
      'A keystone species has an influence much larger than its abundance suggests. Removing it can cause the whole ecosystem to change or collapse.',
    whyWrong: {
      1: 'Keystone species are not necessarily abundant — their effect is disproportionate to their numbers.',
      2: 'Size and top-predator status are not requirements; the key is the strength of its ecological role.',
      3: 'Keystone species strongly affect other species while present, not only after disappearing.',
    },
  }),
  mcq({
    id: 'fd-12',
    concepts: ['keystone-species'],
    difficulty: 4,
    prompt: 'Which sequence best shows the Yellowstone wolf cascade described in the slides?',
    options: [
      'Wolves reduce and change elk grazing → trees regenerate → roots reduce erosion and beaver dams restore habitat',
      'Wolves eat all the trees → elk increase → river banks erode',
      'Elk eat wolves → trees grow → beavers disappear',
      'Beavers eat wolves → elk decrease → grasses disappear',
    ],
    answer: 0,
    explanation:
      'Wolves control elk numbers and grazing behaviour. With less overgrazing, trees regenerate along valleys. Rooted vegetation reduces bank erosion, and beaver dams help restore aquatic life.',
    whyWrong: {
      1: 'Wolves do not eat trees, and removing wolf pressure would increase elk grazing, not reduce it.',
      2: 'Elk do not eat wolves; this reverses the predator–prey relationship.',
      3: 'Beavers do not eat wolves; the cascade starts with wolf control of elk.',
    },
  }),
  multi({
    id: 'fd-13',
    concepts: ['biotic-abiotic'],
    difficulty: 2,
    prompt: 'Select ALL the abiotic factors in this list.',
    options: ['Sunlight', 'Soil minerals', 'Rainfall', 'Temperature', 'Nitrogen-fixing bacteria'],
    answer: [0, 1, 2, 3],
    explanation:
      'Sunlight, soil minerals, rainfall and temperature are non-living physical or chemical conditions. Nitrogen-fixing bacteria are living organisms, so they are biotic.',
    whyWrong: {
      4: 'Bacteria are living, so they are biotic, not abiotic.',
    },
  }),
  multi({
    id: 'fd-14',
    concepts: ['biotic-abiotic', 'ecosystem-definition'],
    difficulty: 3,
    prompt: 'A healthy pond ecosystem includes both biotic and abiotic factors. Select ALL the biotic factors.',
    options: ['Algae', 'Dragonfly larvae', 'Dissolved oxygen', 'Water temperature', 'Bacteria decomposing dead leaves'],
    answer: [0, 1, 4],
    explanation:
      'Algae, dragonfly larvae and decomposing bacteria are living. Dissolved oxygen and temperature are non-living conditions.',
    whyWrong: {
      2: 'Dissolved oxygen is a non-living chemical condition — abiotic.',
      3: 'Temperature is a physical condition — abiotic.',
    },
  }),
  tf({
    id: 'fd-15',
    concepts: ['ecosystem-definition'],
    difficulty: 1,
    prompt: 'An ecosystem must include both living and non-living components.',
    answer: 0,
    explanation:
      'True. The definition of an ecosystem is the living community interacting with the non-living environment. Remove either half and it is no longer an ecosystem.',
  }),
  tf({
    id: 'fd-16',
    concepts: ['ecological-organization'],
    difficulty: 2,
    prompt: 'A population includes all the different species living in an area.',
    answer: 1,
    explanation:
      'False. A population is one species in an area. All the different species together form a community.',
  }),
  tf({
    id: 'fd-17',
    concepts: ['keystone-species'],
    difficulty: 3,
    prompt: 'Removing a keystone species usually has little effect because other species can simply replace it.',
    answer: 1,
    explanation:
      'False. By definition, a keystone species exerts strong control on community structure. Removing it can cause the entire ecosystem to collapse, even if its population was small.',
  }),
  fill({
    id: 'fd-18',
    concepts: ['ecological-organization', 'ecosystem-definition'],
    difficulty: 2,
    prompt:
      'A group of individuals of the same species is a ___. All the different species in an area form a ___. Adding the non-living environment to a community creates an ___.',
    blanks: [
      { accepted: [['population']], hint: 'One species, one area' },
      { accepted: [['community']], hint: 'Multiple populations' },
      { accepted: [['ecosystem']], hint: 'Biotic + abiotic' },
    ],
    explanation:
      'Population → community → ecosystem. Each level adds a new component: same species, then different species, then the abiotic environment.',
  }),
  fill({
    id: 'fd-19',
    concepts: ['habitat-niche'],
    difficulty: 3,
    prompt:
      'The physical area where a species lives is its ___. The way that species interacts with its community and abiotic environment is its ___.',
    blanks: [
      { accepted: [['habitat']], hint: 'Think "address"' },
      { accepted: [['niche']], hint: 'Think "role"' },
    ],
    explanation:
      'Habitat is the address; niche is the role. A wolf\'s habitat is the forest/range it occupies; its niche includes hunting elk, affecting grazing and shaping the ecosystem.',
  }),
  multi({
    id: 'fd-20',
    concepts: ['sustainability'],
    difficulty: 3,
    prompt: 'Which changes could reduce the sustainability of an ecosystem? Select ALL that apply.',
    options: [
      'An invasive species outcompetes native plants',
      'A pollutant lowers water quality',
      'A keystone predator is removed',
      'A native species is lost from the food web',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'All four can disrupt the balance of biotic and abiotic factors. Sustainability depends on healthy water, air and soil as well as intact species interactions.',
  }),
  {
    ...mcq({
      id: 'fd-21',
      concepts: ['habitat-niche', 'sustainability'],
      difficulty: 4,
      prompt: 'Two bird species live in the same forest but feed at different heights and on different insects. What does this best illustrate?',
      options: [
        'They occupy different niches, reducing direct competition',
        'They are the same population because they share a habitat',
        'They occupy identical niches because they live in the same forest',
        'They are abiotic factors because they do not interact',
      ],
      answer: 0,
      explanation:
        'Sharing a habitat does not mean sharing a niche. Feeding at different heights and on different prey separates their roles, which reduces competition.',
      whyWrong: {
        1: 'A population is one species; these are two species. Sharing a habitat does not make them one population.',
        2: 'Identical niches would mean using the same resources in the same way — the opposite of what is described.',
        3: 'Birds are living, so they are biotic factors.',
      },
    }),
    type: 'scenario',
  },
  {
    ...mcq({
      id: 'fd-22',
      concepts: ['ecological-organization'],
      difficulty: 3,
      prompt: 'A student says: "A community is just a big population." Identify the error and the best correction.',
      options: [
        'Error: community and population are not the same. Correction: a population is one species; a community includes all species in an area',
        'Error: a community is smaller than an individual. Correction: a community is one organism',
        'Error: a population includes abiotic factors. Correction: add rocks and water',
        'There is no error — the terms are interchangeable',
      ],
      answer: 0,
      explanation:
        'Population = one species. Community = all the different species in an area. The terms are not interchangeable, and neither includes abiotic factors until you reach the ecosystem level.',
      whyWrong: {
        1: 'A community is larger than an individual, not smaller.',
        2: 'Populations do not include abiotic factors; that is the ecosystem level.',
        3: 'The terms describe different levels of organization and cannot be swapped.',
      },
    }),
    type: 'error',
  },
  {
    ...mcq({
      id: 'fd-23',
      concepts: ['spheres-biosphere', 'ecosystem-definition'],
      difficulty: 3,
      prompt: 'A student writes: "The biosphere includes only the atmosphere." What is wrong with this statement?',
      options: [
        'The biosphere is the zone of life and must include components of the atmosphere, lithosphere and hydrosphere',
        'The biosphere includes only the lithosphere',
        'The biosphere is the same thing as a population',
        'Nothing is wrong; life exists only in the atmosphere',
      ],
      answer: 0,
      explanation:
        'The biosphere is where living things are found on Earth. It requires components from all three abiotic spheres: air, solid Earth and water.',
      whyWrong: {
        1: 'That omits air and water, which life also needs.',
        2: 'A population is one species in one area, far smaller than the biosphere.',
        3: 'Most life depends on water and solid surfaces as well as air.',
      },
    }),
    type: 'error',
  },
  {
    ...mcq({
      id: 'fd-24',
      concepts: ['keystone-species', 'sustainability'],
      difficulty: 4,
      prompt: 'A disease removes most elk from the Yellowstone food web, but wolves remain. Which outcome is most consistent with the wolf cascade in the slides?',
      options: [
        'Grazing pressure drops, vegetation can recover, and bank erosion may decrease',
        'Wolves immediately become producers',
        'Vegetation disappears because elk no longer eat it',
        'The abiotic factors are unaffected by any biotic change',
      ],
      answer: 0,
      explanation:
        'Elk are the grazers controlled by wolves. Fewer elk means less grazing pressure, so willow and aspen can regenerate; roots then help stabilize banks. The cascade links biotic and abiotic parts of the ecosystem.',
      whyWrong: {
        1: 'Wolves are consumers and cannot photosynthesize.',
        2: 'Plants do not disappear when grazing decreases; they are released from pressure and can grow back.',
        3: 'Biotic changes such as grazing affect soil, banks and water — abiotic factors.',
      },
    }),
    type: 'causeeffect',
  },
  {
    ...mcq({
      id: 'fd-25',
      concepts: ['habitat-niche', 'ecological-organization'],
      difficulty: 3,
      prompt: 'Compare a population and a community. Which statement is accurate?',
      options: [
        'A population is one species; a community is all the populations of different species in an area',
        'A community is one species; a population is all species',
        'Both terms include the abiotic environment',
        'A population contains many communities',
      ],
      answer: 0,
      explanation:
        'A population is a single species in an area. A community is the collection of all populations of different species living there. Neither includes abiotic factors — that is the ecosystem level.',
      whyWrong: {
        1: 'This reverses the definitions.',
        2: 'Only an ecosystem includes abiotic factors.',
        3: 'A population is one species; communities are made of multiple populations.',
      },
    }),
    type: 'compare',
  },
  {
    ...mcq({
      id: 'fd-26',
      concepts: ['biotic-abiotic', 'sustainability'],
      difficulty: 3,
      prompt: 'Highway salt washes into a lake. Which statement best explains why this is an ecosystem concern?',
      options: [
        'Salt is an abiotic change that can affect water quality and the organisms adapted to the lake',
        'Salt is a biotic factor because it comes from humans',
        'Salt only affects the atmosphere, not the lake',
        'Salt is a keystone species',
      ],
      answer: 0,
      explanation:
        'A substance like road salt is non-living, so it is abiotic. Changes in water chemistry can stress organisms and reduce ecosystem sustainability. The practice test included highway salt as a factor affecting aquatic ecosystems.',
      whyWrong: {
        1: 'Human origin does not make something living; salt is abiotic.',
        2: 'Runoff enters waterways directly and changes water chemistry there.',
        3: 'A keystone species is a living organism with a disproportionate role, not a chemical.',
      },
    }),
    type: 'scenario',
  },
];