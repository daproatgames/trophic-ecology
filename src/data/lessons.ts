import type { TopicId } from '../types';

export interface LessonSection {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  simpler: string;
  terms?: { term: string; def: string }[];
  visual?: string;
  misconception?: { myth: string; truth: string };
}

export interface Lesson {
  id: string;
  topic: TopicId;
  title: string;
  subtitle: string;
  minutes: number;
  sections: LessonSection[];
  keyFacts: string[];
  misconceptions: { myth: string; truth: string }[];
  quickCheck: string[];
  quiz: string[];
  challenge: string[];
  teachBack: { prompt: string; checklist: string[] };
}

export const LESSONS: Lesson[] = [
  {
    id: 'ecology-foundations',
    topic: 'foundations',
    title: 'Ecology Foundations',
    subtitle: 'Ecosystems, factors, organization, niches and keystone species',
    minutes: 18,
    sections: [
      {
        id: 'ecosystem',
        title: 'What is an ecosystem?',
        body: [
          'An ecosystem is a group of living things (biotic factors) interacting with each other and their non-living (abiotic) environment.',
          'The biotic and abiotic parts are not separate. A tree needs sunlight, water and soil minerals; a wolf needs prey, but also water and habitat. Ecology studies those interactions.',
        ],
        bullets: [
          'Biotic = living or once-living components: plants, animals, bacteria, fungi, dead leaves.',
          'Abiotic = non-living physical and chemical conditions: sunlight, temperature, water, soil minerals, rocks, wind.',
          'Ecosystem size is flexible: a forest, a pond, or even a rotting log can be an ecosystem.',
        ],
        simpler:
          'Think of an ecosystem as a team: the players are the living things, and the field, weather and water are the non-living conditions. You need both to play the game.',
        terms: [
          { term: 'Ecosystem', def: 'Living things interacting with each other and their non-living environment.' },
          { term: 'Biotic factor', def: 'A living component of an ecosystem.' },
          { term: 'Abiotic factor', def: 'A non-living physical or chemical component of an ecosystem.' },
        ],
        misconception: {
          myth: 'An ecosystem is just the animals in an area.',
          truth: 'An ecosystem includes all organisms plus the non-living environment. Remove the abiotic factors and it is no longer an ecosystem.',
        },
      },
      {
        id: 'spheres',
        title: 'Abiotic factors and Earth\'s spheres',
        body: [
          'Abiotic factors can be organized by the part of Earth they come from. The atmosphere is the layer of gases, the lithosphere is the solid rocky part (including soil and minerals), and the hydrosphere is Earth\'s water.',
          'The biosphere is where living things are found. It must have components from all the other spheres because life needs air, water and a solid surface or minerals.',
        ],
        bullets: [
          'Atmosphere: gases such as oxygen, carbon dioxide and nitrogen.',
          'Lithosphere: rocks, soil, minerals and landforms.',
          'Hydrosphere: oceans, lakes, rivers, groundwater and water vapour.',
          'Biosphere: the zone of life where all three spheres overlap.',
        ],
        simpler:
          'Earth has three "supply rooms": air, rock/soil, and water. The biosphere is the room where life happens, and it needs supplies from all three.',
        terms: [
          { term: 'Biosphere', def: 'The zone on Earth where living things exist; requires components from all spheres.' },
          { term: 'Lithosphere', def: 'Earth\'s solid rocky layer, including soil and minerals.' },
        ],
        visual: 'spheres',
      },
      {
        id: 'organization',
        title: 'Levels of organization',
        body: [
          'Ecologists zoom out from one organism to the entire planet. Each level adds a new component.',
        ],
        bullets: [
          'Individual: one organism.',
          'Population: a group of individuals of the same species in a given area.',
          'Community: all the organisms of different species living in an area.',
          'Ecosystem: the community plus the abiotic components.',
          'Biome: a large region with a characteristic climate and community (e.g., boreal forest).',
          'Biosphere: all the places on Earth where life exists.',
        ],
        simpler:
          'Individual → population → community → ecosystem → biome → biosphere is like zooming out on a map: one wolf, the wolf pack, all the animals, the whole forest with its soil and water, the region, then the planet.',
        terms: [
          { term: 'Population', def: 'Individuals of one species living in a given area.' },
          { term: 'Community', def: 'All the populations of different species living in an area.' },
        ],
        visual: 'organization',
        misconception: {
          myth: 'A community is a large population.',
          truth: 'A population is one species. A community is multiple species. They are different levels.',
        },
      },
      {
        id: 'habitat-niche',
        title: 'Habitat vs niche',
        body: [
          'A habitat is the physical area that a species inhabits within an ecosystem. It is where the species finds what it needs to survive.',
          'A niche is the way a species interacts with its community and the abiotic environment. It includes what it eats, when it is active, where it shelters, and how it affects other species.',
          'Every species occupies its own unique niche. No two species can share an identical niche in the same ecosystem — that is why competition is reduced when species divide resources.',
        ],
        bullets: [
          'Habitat = address.',
          'Niche = role or job.',
          'Two species can share a habitat without sharing a niche.',
        ],
        simpler:
          'Habitat is where you live; niche is what you do there. Two animals can live in the same forest but have different jobs, so they have different niches.',
        terms: [
          { term: 'Habitat', def: 'The physical area a species inhabits within an ecosystem.' },
          { term: 'Niche', def: 'The way a species interacts with its community and abiotic environment.' },
        ],
      },
      {
        id: 'sustainability',
        title: 'Sustainability',
        body: [
          'An ecosystem is sustainable if it can support life without outside help. It recycles nutrients, captures energy, and maintains the conditions its organisms need.',
          'Changes to abiotic factors such as water, air and soil quality can affect sustainability. Changes to biotic factors such as the loss of a species or the arrival of an invasive species can also change it.',
          'Human activities can push these changes: pollution, habitat loss, fertilizer runoff, and introduction of invasive species.',
        ],
        bullets: [
          'Abiotic changes: pollution, drought, temperature shifts, soil degradation.',
          'Biotic changes: species loss, invasive species, overharvesting.',
          'Sustainability is about the system continuing without constant human input.',
        ],
        simpler:
          'A sustainable ecosystem can keep running on its own. If it needs humans to constantly add water, food or chemicals, it is not self-sustaining.',
      },
      {
        id: 'keystone',
        title: 'Keystone species: the wolf story',
        body: [
          'A keystone species exerts strong control on community structure disproportionate to its population size. Removing it can cause the entire ecosystem to collapse.',
          'Wolves are a keystone species in Yellowstone National Park. They control the elk population and change elk grazing behaviour. Elk avoid open valleys where they are vulnerable, so trees regenerate along valleys without heavy overgrazing.',
          'Rooted vegetation reduces bank erosion, and beaver dams help restore aquatic life. The result is a cascade: wolves → elk behaviour/numbers → plants → riverbanks and habitat.',
        ],
        bullets: [
          'Keystone effect is disproportionate to abundance.',
          'The wolf is not keystone because it is numerous; it is keystone because of its ecological role.',
          'Removing a keystone species can trigger a trophic cascade.',
        ],
        simpler:
          'A keystone is like the key piece in a Jenga tower. It may be small, but pull it out and much more than one block falls.',
        terms: [
          { term: 'Keystone species', def: 'A species that exerts strong control on community structure disproportionate to its population size.' },
          { term: 'Trophic cascade', def: 'A chain of effects through a food web caused by adding or removing a species.' },
        ],
        visual: 'wolves',
        misconception: {
          myth: 'The biggest or most numerous predator is always the keystone species.',
          truth: 'Keystone status depends on the strength of the species\' ecological role, not its size or abundance.',
        },
      },
    ],
    keyFacts: [
      'Ecosystem = biotic factors + abiotic factors interacting.',
      'Atmosphere, lithosphere and hydrosphere supply the biosphere.',
      'Individual → population → community → ecosystem → biome → biosphere.',
      'Habitat is the physical area; niche is the role. No two species share an identical niche.',
      'Sustainability = support life without outside help.',
      'A keystone species has an effect disproportionate to its population size.',
    ],
    misconceptions: [
      { myth: 'Only animals are part of an ecosystem.', truth: 'Plants, bacteria, fungi, dead matter and abiotic factors are all part of it.' },
      { myth: 'A community and an ecosystem are the same.', truth: 'An ecosystem includes abiotic factors; a community does not.' },
      { myth: 'Keystone species must be top predators.', truth: 'Any species with a disproportionate ecological role can be keystone.' },
    ],
    quickCheck: ['fd-01', 'fd-06', 'fd-10'],
    quiz: ['fd-04', 'fd-08', 'fd-12', 'fd-13', 'fd-18'],
    challenge: ['fd-21', 'fd-24'],
    teachBack: {
      prompt: 'Explain the difference between a population, a community and an ecosystem, using a forest example.',
      checklist: ['Defines population as one species', 'Defines community as multiple species', 'Adds abiotic factors to get an ecosystem', 'Uses a specific forest example'],
    },
  },
  {
    id: 'food-chains-webs',
    topic: 'foodwebs',
    title: 'Food Chains & Food Webs',
    subtitle: 'Feeding relationships, trophic levels, energy transfer and webs',
    minutes: 16,
    sections: [
      {
        id: 'chains',
        title: 'Food chains and the direction of energy',
        body: [
          'The most common interaction between species is through feeding relationships. A food chain is a sequence of organisms, each feeding on the next, that shows how energy is transferred from one organism to another.',
          'Energy transfer starts with a producer taking in energy from the Sun. Arrows show the direction of energy transfer — from the organism being eaten to the eater.',
          'Classic example: a pine tree produces seeds → a red squirrel eats the seeds → a weasel eats the squirrel → a goshawk eats the weasel.',
        ],
        bullets: [
          'Producer: makes its own food by photosynthesis.',
          'Primary consumer: eats the producer.',
          'Secondary consumer: eats a primary consumer.',
          'Tertiary/top consumer: eats other consumers and has few or no predators.',
          'Arrow direction = direction of energy transfer, not "who is eaten".',
        ],
        simpler:
          'A food chain is a "who eats whom" line. The arrow points to the eater because that is where the energy goes.',
        terms: [
          { term: 'Food chain', def: 'A sequence of organisms, each feeding on the next, showing energy transfer.' },
          { term: 'Producer', def: 'An organism that makes its own food, usually by photosynthesis.' },
        ],
        visual: 'foodchain',
        misconception: {
          myth: 'The arrow points from the eater to the food.',
          truth: 'The arrow points toward the eater, showing the direction of energy transfer.',
        },
      },
      {
        id: 'trophic',
        title: 'Trophic levels',
        body: [
          'A trophic level is the position of an organism along a food chain. Trophic levels are numbered from the bottom up.',
        ],
        bullets: [
          '1st trophic level: producers.',
          '2nd trophic level: primary consumers (herbivores).',
          '3rd trophic level: secondary consumers.',
          '4th trophic level: tertiary consumers.',
          '5th trophic level: quaternary consumers (in long chains).',
        ],
        simpler:
          'Trophic levels are like floors in a building: producers are on floor 1, primary consumers on floor 2, secondary consumers on floor 3, and so on.',
        visual: 'trophic-levels',
        terms: [
          { term: 'Trophic level', def: 'The position of an organism along a food chain.' },
          { term: 'Primary consumer', def: 'An organism that eats a producer; second trophic level.' },
        ],
      },
      {
        id: 'loss',
        title: 'Why energy is lost: the 10% rule',
        body: [
          'Even though some energy is transferred to the next consumer, most of the energy an organism has is used in its daily routines and released to the environment. Energy is lost with each transfer.',
          'Only about 10% of the energy stored at one trophic level is transferred to the next. The other ~90% is used for life processes, stored temporarily, or lost as thermal energy.',
          'This is why food chains are usually short and why higher trophic levels support smaller populations.',
        ],
        bullets: [
          '10% transferred; about 90% lost at each step.',
          'Energy is lost mainly as heat from life processes.',
          'A top carnivore receives only a tiny fraction of the original solar energy.',
        ],
        simpler:
          'At every step, the animal uses most of its food energy just to stay alive. Only about one-tenth is left for the next animal — like a phone battery that loses 90% at every handoff.',
        terms: [
          { term: '10% rule', def: 'About 10% of energy at one trophic level is transferred to the next.' },
        ],
      },
      {
        id: 'webs',
        title: 'Food webs',
        body: [
          'Food chains do not exist in nature as simple straight lines. Feeding relationships are complex, and species interact in many ways. A food web is a representation of the feeding relationships within a community — a series of interconnected food chains.',
          'Because there are many interactions, species are not completely reliant on one other species. If one prey declines, a predator may have alternatives. This can buffer the community, though not every species has a backup.',
        ],
        bullets: [
          'Food web = interconnected food chains.',
          'More connections generally mean more resilience.',
          'Keystone species are exceptions: their removal can still collapse the web.',
        ],
        simpler:
          'A food chain is one path; a food web is the whole road map. If one road closes, the map may still have another route.',
        terms: [
          { term: 'Food web', def: 'A representation of the feeding relationships within a community; interconnected food chains.' },
        ],
        visual: 'foodweb',
        misconception: {
          myth: 'Food webs are just many separate food chains drawn together.',
          truth: 'The connections matter: the web shows alternative pathways and interdependence, not just a collection of lines.',
        },
      },
      {
        id: 'reading',
        title: 'How to read a food web for the test',
        body: [
          'Trace a path from a producer to the organism in question. Count the arrows to determine the trophic level. The first organism after the producer is a primary consumer; the next is secondary; and so on.',
          'For a question like "what are the tadpoles?" first locate the producer. Phytoplankton → plankton → tadpoles means phytoplankton are 1st, plankton 2nd, tadpoles 3rd = secondary consumers.',
        ],
        bullets: [
          'Start at a producer, not in the middle.',
          'Every arrow represents one trophic transfer.',
          'If an organism eats at multiple levels, it can occupy more than one trophic level.',
          'For "greatest biomass," choose the producer/lowest level among the options.',
        ],
        simpler:
          'Count the steps from the plant. One step = primary consumer; two steps = secondary consumer; three = tertiary.',
      },
    ],
    keyFacts: [
      'Arrows point in the direction of energy transfer.',
      '1st trophic level = producers; 2nd = primary consumers; 3rd = secondary consumers; 4th = tertiary consumers.',
      'Only about 10% of energy transfers between trophic levels; ~90% is lost.',
      'Food webs are interconnected food chains and are more realistic than simple chains.',
      'A food web gives species alternative food sources, but keystone species can still be critical.',
    ],
    misconceptions: [
      { myth: 'Energy is recycled through a food chain.', truth: 'Energy flows one way and is lost as heat; matter cycles.' },
      { myth: 'Every food chain has exactly four levels.', truth: 'Chains vary in length; most are short because of energy loss.' },
      { myth: 'A top carnivore has the most energy.', truth: 'It has the least available energy because of losses at each transfer.' },
    ],
    quickCheck: ['fw-01', 'fw-03', 'fw-09'],
    quiz: ['fw-05', 'fw-10', 'fw-13', 'fw-14', 'fw-19'],
    challenge: ['fw-15', 'fw-18'],
    teachBack: {
      prompt: 'Using the Fraser River chain, explain why tadpoles are secondary consumers and why the pickerel has less available energy than the phytoplankton.',
      checklist: ['Identifies phytoplankton as producer', 'Counts plankton as primary consumer', 'Places tadpoles at third trophic level', 'Explains 10% energy loss'],
    },
  },
  {
    id: 'ecological-pyramids',
    topic: 'pyramids',
    title: 'Ecological Pyramids',
    subtitle: 'Energy, biomass and numbers — and when a pyramid flips',
    minutes: 15,
    sections: [
      {
        id: 'why',
        title: 'Three ways to see a food chain',
        body: [
          'Ecological pyramids display relationships between trophic levels. They stack trophic levels and use the width of each layer to represent a quantity.',
          'There are three types: energy pyramids, biomass pyramids and numbers pyramids. They can look similar, but they measure different things.',
        ],
        bullets: [
          'Energy pyramid: available energy at each level.',
          'Biomass pyramid: total mass of all individuals at each level.',
          'Numbers pyramid: total number of individual organisms at each level.',
        ],
        simpler:
          'Same staircase, three different rulers: one measures energy, one measures mass, one counts individuals.',
        terms: [
          { term: 'Ecological pyramid', def: 'A diagram that displays relationships between trophic levels.' },
        ],
      },
      {
        id: 'energy',
        title: 'Energy pyramids',
        body: [
          'An energy pyramid shows energy loss and transfer between trophic levels. The size of each layer represents the amount of available energy.',
          'All living things require energy that initially comes from the Sun. As one organism consumes another, it gains both physical matter (nutrients) and chemical energy from its food. It uses that energy to survive, grow and reproduce, and some is lost as thermal energy.',
          'Only about 10% of energy gets transferred to the next trophic level. Therefore, the higher the trophic level, the smaller the population that can be sustained. An energy pyramid is always upright in this course.',
        ],
        bullets: [
          'Widest layer at the producer level.',
          'Each higher layer is narrower because energy is lost.',
          'Cannot be inverted — energy does not increase as it moves up.',
        ],
        simpler:
          'Energy is like money spent at every stall in a market. By the time you reach the top floor, only a little is left — so fewer organisms can live there.',
        visual: 'energy-pyramid',
        misconception: {
          myth: 'An energy pyramid can be inverted if there are many top predators.',
          truth: 'No. Energy decreases at every transfer, so the energy pyramid is always upright.',
        },
      },
      {
        id: 'biomass',
        title: 'Biomass pyramids',
        body: [
          'Biomass is the total mass of all individuals combined. A biomass pyramid compares that total mass at each trophic level.',
          'In a typical forest ecosystem, the biomass of all the trees is much greater than the biomass of herbivores, so the pyramid has a typical upright shape. Organisms that feed at lower trophic levels have more energy and biomass available to them.',
          'Changes in lower trophic levels can have huge impacts on the whole ecosystem because so much energy and biomass enters through that base.',
        ],
        bullets: [
          'Biomass = mass, not number and not energy.',
          'Usually upright: producers have the most biomass.',
          'Lower-level changes can cascade upward.',
        ],
        simpler:
          'Biomass is the total weight of living stuff. A forest has far more tree weight than deer weight, so the bottom layer is widest.',
        visual: 'biomass-pyramid',
        terms: [
          { term: 'Biomass', def: 'The total mass of all individuals combined.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Numbers pyramids and the inverted tree',
        body: [
          'A numbers pyramid shows the total number of individual organisms at each trophic level. The width of each block represents the relative population size supported at that stage.',
          'Due to energy loss, fewer organisms can be sustained as you move higher up the chain. In a forest, over a million producers may support thousands of herbivores, dozens of secondary consumers, and just one top carnivore.',
          'But a numbers pyramid does not have to be upright. The producer level can be smaller — for example, one large tree can support thousands of insects. In that case, the pyramid is inverted at the bottom.',
        ],
        bullets: [
          'Counts individuals, not mass or energy.',
          'Usually upright, but can be inverted.',
          'One tree → many insects is the classic exception.',
        ],
        simpler:
          'Imagine one huge tree and 5 000 beetles living on it. The "one tree" layer is narrower than the beetle layer, so the pyramid looks upside down at the bottom.',
        visual: 'numbers-pyramid',
        misconception: {
          myth: 'All ecological pyramids must be upright.',
          truth: 'Numbers pyramids can be inverted, such as one tree supporting many insects. Energy pyramids cannot.',
        },
      },
      {
        id: 'calc',
        title: 'Pyramid calculations',
        body: [
          'When a question gives energy at the producer level and a trophic efficiency of 10%, multiply by 0.10 for each level you move up.',
          'Example: 245 000 units in producers → 24 500 at the second level → 2 450 at the third → 245 at the fourth. This is the calculation from your practice test Q27.',
        ],
        bullets: [
          'Second level = producer × 0.10.',
          'Third level = second level × 0.10.',
          'Fourth level = third level × 0.10.',
          'Always show each step and include units.',
        ],
        simpler:
          'Every floor up, divide by 10. 245 000 → 24 500 → 2 450 → 245.',
        visual: 'energy-calc',
      },
    ],
    keyFacts: [
      'Three pyramid types: energy, biomass, numbers.',
      'Energy pyramids show available energy and are always upright.',
      'Biomass = total mass; usually upright in a forest.',
      'Numbers pyramids count individuals and can be inverted (one tree, many insects).',
      '10% efficiency: multiply by 0.10 at each trophic transfer.',
      'A pyramid of numbers does not show energy or biomass.',
    ],
    misconceptions: [
      { myth: 'Biomass and numbers are the same.', truth: 'Biomass measures mass; numbers counts individuals.' },
      { myth: 'The top layer of a numbers pyramid is always smallest.', truth: 'Numbers pyramids can be inverted at the producer level.' },
      { myth: '1% of energy transfers between trophic levels.', truth: 'About 10% transfers; 1% refers to the fraction of sunlight captured by producers in this unit.' },
    ],
    quickCheck: ['py-02', 'py-04', 'py-08'],
    quiz: ['py-03', 'py-05', 'py-10', 'py-12', 'py-15'],
    challenge: ['py-13', 'py-14'],
    teachBack: {
      prompt: 'Explain why a pyramid of numbers can be inverted but an energy pyramid cannot, using the tree example.',
      checklist: ['Numbers counts individuals', 'One tree can support many insects', 'Energy decreases at each transfer', 'Energy pyramid remains upright'],
    },
  },
  {
    id: 'energy-in-ecosystems',
    topic: 'energy',
    title: 'Energy in Ecosystems',
    subtitle: 'Sunlight, photosynthesis, respiration and feeding roles',
    minutes: 20,
    sections: [
      {
        id: 'sun',
        title: 'The Sun: the original energy source',
        body: [
          'The energy source for most ecosystems on Earth is the Sun. Solar energy that hits Earth is absorbed and reflected by the atmosphere, lithosphere and hydrosphere.',
          'Only a small percentage of incoming solar energy — roughly 1% — is actually used by ecosystems. Producers capture that energy and convert it into chemical energy.',
        ],
        bullets: [
          'Sunlight is radiant energy.',
          'Most solar energy is reflected or absorbed as heat, not captured by photosynthesis.',
          'About 1% is captured by producers in this unit.',
        ],
        simpler:
          'The Sun sends a huge bill of energy, but plants can only "cash" about 1% of it. The rest bounces off or becomes heat.',
        visual: 'solar-budget',
        terms: [
          { term: 'Radiant energy', def: 'Energy carried by light from the Sun.' },
        ],
      },
      {
        id: 'photosynthesis',
        title: 'Photosynthesis: storing the Sun\'s energy',
        body: [
          'In order for solar energy to be used by living things, it has to be converted to chemical energy. Producers are organisms that produce high-energy glucose molecules through photosynthesis.',
          'Photosynthesis is done by plants, algae and some bacteria. Specifically, chlorophyll in the chloroplast absorbs sunlight. The chemical equation is:',
          '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light energy; chlorophyll)',
          'In words: carbon dioxide + water → glucose + oxygen.',
        ],
        bullets: [
          'Reactants: carbon dioxide and water.',
          'Products: glucose and oxygen.',
          'Energy source: sunlight.',
          'Location: chloroplast; pigment: chlorophyll.',
        ],
        simpler:
          'A leaf is a solar-powered kitchen. It takes CO₂ from the air and water from the soil, uses sunlight as the stove, and cooks glucose while releasing oxygen.',
        terms: [
          { term: 'Photosynthesis', def: 'The process producers use to convert light energy into chemical energy stored in glucose.' },
          { term: 'Chlorophyll', def: 'The green pigment in chloroplasts that absorbs sunlight.' },
        ],
        visual: 'leaf-photosynthesis',
        misconception: {
          myth: 'Plants get their food from the soil.',
          truth: 'Plants make glucose through photosynthesis using CO₂ and water. Soil supplies water and minerals, not the main energy-containing food.',
        },
      },
      {
        id: 'respiration',
        title: 'Cellular respiration: releasing the energy',
        body: [
          'Stored energy in glucose is released by cells to do all their activities. This process is cellular respiration.',
          'Cellular respiration is often done in the mitochondria. All organisms do it — including plants.',
          'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy',
          'In words: glucose + oxygen → carbon dioxide + water + energy. It is the reverse of photosynthesis.',
        ],
        bullets: [
          'Uses glucose and oxygen.',
          'Releases energy for life processes.',
          'Produces carbon dioxide and water.',
          'Happens in all organisms, day and night.',
        ],
        simpler:
          'Respiration is the cell\'s campfire. It burns glucose with oxygen and releases energy, giving off CO₂ and water — just like a fire.',
        terms: [
          { term: 'Cellular respiration', def: 'The process cells use to release energy from glucose, producing CO₂ and water.' },
        ],
        misconception: {
          myth: 'Plants only respire at night.',
          truth: 'Plants respire all the time. At night photosynthesis stops, so their respiration is more noticeable in gas exchange.',
        },
      },
      {
        id: 'link',
        title: 'The photosynthesis–respiration loop',
        body: [
          'Photosynthesis and cellular respiration are interconnected. The products of one are the reactants of the other: CO₂ and water go into photosynthesis; glucose and oxygen come out. Respiration uses glucose and oxygen and returns CO₂ and water.',
          'This is why a sealed, planted aquarium can be self-sustaining in sunlight, but oxygen drops at night. During the day, photosynthesis produces oxygen; at night, only respiration continues, consuming oxygen.',
        ],
        visual: 'photosynthesis-cycle',
        bullets: [
          'Day: photosynthesis + respiration; oxygen may rise.',
          'Night: respiration only; oxygen falls, CO₂ rises.',
          'Oxygen is lowest just before sunrise.',
        ],
        simpler:
          'Photosynthesis charges the battery; respiration uses it. At night, the charger is off but the battery keeps draining.',
      },
      {
        id: 'roles',
        title: 'Producers, consumers and decomposers',
        body: [
          'Producers make their own food. Consumers must consume other organisms for energy. Decomposers get their energy by eating the remains of dead plants and animals and their wastes.',
          'Decomposers are important for cycling nutrients. They break down organic matter and release carbon dioxide through respiration and nitrogen compounds such as ammonia/ammonium through ammonification. They do not release oxygen as a product.',
          'There are primary, secondary and tertiary consumers. A decomposer is not a trophic level in the same way; it feeds on dead matter from multiple levels.',
        ],
        bullets: [
          'Producer: photosynthesis.',
          'Consumer: eats other organisms.',
          'Decomposer: breaks down dead remains and wastes, recycling nutrients.',
          'Decomposers release CO₂ and nutrients — not oxygen.',
        ],
        simpler:
          'Producers cook, consumers eat, and decomposers clean up and recycle. Without decomposers, dead stuff would pile up and nutrients would not return to the soil.',
        terms: [
          { term: 'Decomposer', def: 'An organism that breaks down dead remains and wastes, recycling nutrients.' },
        ],
        visual: 'foodweb',
      },
    ],
    keyFacts: [
      'The Sun is the primary energy source; only about 1% of solar energy is captured by producers.',
      'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light, chlorophyll).',
      'Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy.',
      'Photosynthesis occurs in chloroplasts; respiration mainly in mitochondria.',
      'All organisms respire, including plants, day and night.',
      'Decomposers release CO₂ and nutrients, not oxygen.',
    ],
    misconceptions: [
      { myth: 'Plants do not respire.', truth: 'They respire constantly; photosynthesis is an additional process in the light.' },
      { myth: 'Respiration and breathing are the same.', truth: 'Breathing is gas exchange; cellular respiration is the chemical release of energy in cells.' },
      { myth: 'Photosynthesis and respiration cannot happen at the same time.', truth: 'In daylight, plants do both; photosynthesis may be faster, but respiration continues.' },
    ],
    quickCheck: ['en-03', 'en-08', 'en-12'],
    quiz: ['en-06', 'en-09', 'en-14', 'en-19', 'en-26'],
    challenge: ['en-13', 'en-22', 'en-23'],
    teachBack: {
      prompt: 'Explain how a plant can be both a producer and a consumer of gases, using photosynthesis and cellular respiration.',
      checklist: ['Photosynthesis uses CO₂ and releases O₂', 'Respiration uses O₂ and releases CO₂', 'Both occur in plants', 'Day/night difference explained'],
    },
  },
  {
    id: 'water-carbon-cycles',
    topic: 'cycles',
    title: 'Water & Carbon Cycles',
    subtitle: 'Matter cycles while energy flows — and carbon has a long memory',
    minutes: 18,
    sections: [
      {
        id: 'matter',
        title: 'Energy flows, matter cycles',
        body: [
          'Energy in ecosystems is supplied in a continuous stream from the Sun. It is absorbed by living things and released again, eventually radiating back out into space.',
          'Matter, however, does not leave Earth. It is continuously cycled between biotic and abiotic reservoirs in an ecosystem. This is called a biogeochemical cycle.',
          'Nutrients such as water are continuously recycled, along with elements such as carbon, nitrogen, sulfur, oxygen and phosphorus.',
        ],
        bullets: [
          'Energy: one-way flow, lost as heat.',
          'Matter: recycled between living and non-living reservoirs.',
          'Biogeochemical cycle = bio (living) + geo (Earth) + chemical.',
          'All the matter that made up every living thing is still here on Earth.',
        ],
        simpler:
          'Energy is like a river flowing through; matter is like water in a fountain, going round and round. The same atoms are reused.',
        visual: 'energy-budget',
        terms: [
          { term: 'Biogeochemical cycle', def: 'The continuous cycling of matter between biotic and abiotic reservoirs.' },
        ],
        misconception: {
          myth: 'Energy and matter both cycle.',
          truth: 'Only matter cycles. Energy flows and is eventually lost as heat.',
        },
      },
      {
        id: 'water',
        title: 'The water cycle',
        body: [
          'The water cycle has biotic and abiotic parts. Biotically, all life needs water for processes such as photosynthesis in plants and as a major component of cell cytoplasm. Water is drawn through plants from the roots and evaporates from leaves in a process called transpiration. All creatures release water as a product of cellular respiration.',
          'Abiotically, water moves by evaporation, condensation, precipitation and runoff.',
        ],
        bullets: [
          'Evaporation: liquid water → water vapour.',
          'Transpiration: water vapour leaves plant leaves.',
          'Condensation: vapour → droplets, forming clouds.',
          'Precipitation: rain, snow, hail.',
          'Runoff: water flows over land into rivers and lakes.',
          'Cellular respiration releases water; photosynthesis uses it.',
        ],
        simpler:
          'Water takes a world tour: it evaporates from oceans, floats up, condenses into clouds, falls as rain, runs into rivers, and is sucked up by plants to be released again.',
        terms: [
          { term: 'Transpiration', def: 'The loss of water vapour from plant leaves.' },
        ],
        visual: 'water-cycle',
      },
      {
        id: 'carbon',
        title: 'The short carbon cycle',
        body: [
          'Carbon is an element that is part of all cells. You have seen it in carbohydrates such as glucose (C₆H₁₂O₆), and it is also in proteins, fats and DNA.',
          'Abiotically, carbon is found in the atmosphere as carbon dioxide (CO₂) and in coal, oil and other mineral deposits in Earth\'s crust. The most accessible source of carbon for living things is atmospheric CO₂.',
          'In the short cycle: CO₂ is converted into glucose by plants through photosynthesis. Carbon passes through the food chain until it is released for energy in cellular respiration. Plants also release CO₂ when they respire.',
        ],
        bullets: [
          'Photosynthesis: CO₂ → glucose (carbon sink).',
          'Feeding: carbon moves through the food chain.',
          'Respiration: glucose → CO₂ (carbon source).',
          'Decomposition and combustion also release CO₂.',
        ],
        simpler:
          'Carbon takes a short trip: air → plant → animal → air. Photosynthesis pulls it in; respiration lets it out.',
        visual: 'carbon-cycle',
        terms: [
          { term: 'Carbon sink', def: 'A process or reservoir that removes carbon from the atmosphere.' },
          { term: 'Carbon source', def: 'A process or reservoir that releases carbon into the atmosphere.' },
        ],
      },
      {
        id: 'long',
        title: 'The long carbon cycle',
        body: [
          'Carbon from ancient plants (like algae and plankton) can form deposits underground and be locked away for millions of years. That carbon can become fossil fuels such as coal, oil and natural gas. We extract and burn them, returning carbon to the atmosphere.',
          'Carbon can also be trapped by sea organisms that use it to make shells of calcium carbonate (CaCO₃). Over very long periods, these shells can become sedimentary rock formations like chalk, limestone and marble. Eventually, geological heat such as a volcano can release the carbon back into the atmosphere.',
          'Deforestation and burning wood or peat also move stored carbon back into the atmosphere.',
        ],
        bullets: [
          'Fossil fuels: ancient plants/algae/plankton → underground → combustion → CO₂.',
          'Shells: carbon → CaCO₃ → sedimentary rock → volcano/geological activity → CO₂.',
          'Deforestation: removes a sink and releases stored carbon.',
        ],
        simpler:
          'Carbon can be parked underground for millions of years as fossil fuel or rock. Burning fuel or a volcano sends it back to the air — a very slow parking garage with a fast exit.',
        visual: 'carbon-long',
        terms: [
          { term: 'Fossil fuel', def: 'Coal, oil or natural gas formed from ancient organisms over millions of years.' },
          { term: 'Calcium carbonate', def: 'CaCO₃, the compound in many shells and in limestone.' },
        ],
      },
      {
        id: 'human',
        title: 'Human impact on the carbon cycle',
        body: [
          'Humans have a huge impact on biogeochemical cycles. Burning fossil fuels in industry and transportation returns CO₂ to the atmosphere at a very high rate. Clearing forests removes trees that would otherwise remove CO₂ through photosynthesis.',
          'The result is a shift in the carbon cycle: more carbon entering the atmosphere and less being removed by living carbon sinks.',
        ],
        bullets: [
          'Combustion of fossil fuels adds CO₂.',
          'Deforestation reduces carbon uptake and releases stored carbon.',
          'The rate of return matters: fossil carbon was stored for millions of years.',
          'This is the human-impact example from your practice test Q28.',
        ],
        simpler:
          'We dug up carbon that was safely parked underground and burned it, while also cutting down the trees that help clean the air. Both push CO₂ up.',
      },
    ],
    keyFacts: [
      'Energy flows; matter cycles.',
      'Water cycle: evaporation, transpiration, condensation, precipitation, runoff.',
      'Photosynthesis removes CO₂; respiration, decomposition and combustion release CO₂.',
      'The most accessible carbon source is atmospheric CO₂.',
      'Fossil fuels and calcium carbonate rocks are long-term carbon reservoirs.',
      'Volcanic/geological activity can return stored carbon to the atmosphere.',
      'Burning fossil fuels and deforestation increase atmospheric CO₂.',
    ],
    misconceptions: [
      { myth: 'Carbon only cycles through living things.', truth: 'It also moves through the atmosphere, oceans, soil, fossil fuels and rocks.' },
      { myth: 'Plants only release oxygen.', truth: 'Plants also respire and release CO₂, especially at night.' },
      { myth: 'The water cycle is purely abiotic.', truth: 'Transpiration and respiration are biotic contributions.' },
    ],
    quickCheck: ['cy-01', 'cy-03', 'cy-06'],
    quiz: ['cy-07', 'cy-09', 'cy-12', 'cy-17', 'cy-23'],
    challenge: ['cy-20', 'cy-22'],
    teachBack: {
      prompt: 'Trace a carbon atom from the atmosphere into a fossil fuel and back to the atmosphere, naming each process.',
      checklist: ['Photosynthesis moves carbon into glucose/organisms', 'Organisms die and are buried over millions of years', 'Fossil fuel forms', 'Combustion releases CO₂'],
    },
  },
  {
    id: 'nitrogen-cycle',
    topic: 'nitrogen',
    title: 'The Nitrogen Cycle',
    subtitle: 'Fixation, nitrification, assimilation, ammonification and denitrification',
    minutes: 20,
    sections: [
      {
        id: 'why',
        title: 'Why nitrogen matters',
        body: [
          'Nitrogen is an element found in important biological molecules like proteins and DNA. It also makes up a large portion of our atmosphere: about 78% of the atmosphere is N₂ (nitrogen gas).',
          'Plants and animals cannot use the nitrogen in the atmosphere directly. The N₂ molecule is very stable and unreactive. It must be converted into usable compounds by bacteria or by abiotic processes.',
        ],
        bullets: [
          'Nitrogen is needed for proteins and DNA.',
          'Atmosphere is ~78% N₂.',
          'N₂ is unusable directly by plants and animals.',
          'The nitrogen cycle converts N₂ into usable compounds and back again.',
        ],
        simpler:
          'The air is full of nitrogen, but it is locked in a form plants cannot open. Bacteria are the locksmiths that unlock it.',
        visual: 'nitrogen-cycle',
        terms: [
          { term: 'Nitrogen fixation', def: 'Conversion of N₂ gas into compounds such as ammonia or ammonium.' },
        ],
      },
      {
        id: 'fixation',
        title: 'The fixers: biotic and abiotic fixation',
        body: [
          'Plants rely on bacteria and other processes to gain access to nitrogen. Some soil bacteria called nitrogen-fixing bacteria convert nitrogen gas (N₂) into compounds that plants can use.',
          'These bacteria are often found attached to legume roots in bulbs called nodules. They turn nitrogen into ammonia (NH₃) or ammonium (NH₄⁺).',
          'Nitrogen compounds for plants can also be made during lightning strikes and by ultraviolet light in the atmosphere. This abiotic fixation makes only small amounts.',
        ],
        bullets: [
          'Biotic fixation: nitrogen-fixing bacteria in legume root nodules → NH₃/NH₄⁺.',
          'Abiotic fixation: lightning and UV light → small amounts of nitrogen compounds.',
          'Legumes + bacteria = a mutualistic relationship.',
        ],
        simpler:
          'Bacteria living in root bumps act like a nitrogen kitchen: they take unusable N₂ from the air and cook it into ammonia the plant can use.',
        misconception: {
          myth: 'Lightning is the main source of usable nitrogen.',
          truth: 'Biological fixation by bacteria is the major route; lightning/UV fixation makes only small amounts.',
        },
      },
      {
        id: 'nitrification',
        title: 'Nitrification and assimilation',
        body: [
          'The nitrogen compounds that soil bacteria make include ammonia/ammonium, nitrites and nitrates.',
          'Nitrifying bacteria convert ammonia/ammonium into nitrites (NO₂⁻), which then get converted into nitrates (NO₃⁻) in a process called nitrification.',
          'Nitrates can be absorbed by plants in a process called assimilation and used to make proteins and DNA. Plants then pass the nitrogen on to animals when consumed.',
        ],
        bullets: [
          'Nitrification: NH₃/NH₄⁺ → NO₂⁻ → NO₃⁻.',
          'Assimilation: plants absorb nitrates and build proteins/DNA.',
          'Animals obtain nitrogen by eating plants or other animals.',
        ],
        simpler:
          'Nitrifying bacteria upgrade ammonia → nitrite → nitrate, like turning raw ingredients into a form the plant can actually eat. The plant then builds proteins.',
        visual: 'soil-bacteria',
        terms: [
          { term: 'Nitrification', def: 'The bacterial conversion of ammonia/ammonium to nitrites and then nitrates.' },
          { term: 'Assimilation', def: 'The uptake and incorporation of nitrates into plant molecules such as proteins and DNA.' },
        ],
      },
      {
        id: 'ammonification',
        title: 'Ammonification and compost',
        body: [
          'Nitrogen compounds can also be converted into nitrates by decomposing organic matter in animal wastes and dead plants. This process is called ammonification: decomposers release ammonia/ammonium, which nitrifying bacteria then convert to nitrates.',
          'That is why compost and manure are such good fertilizers: they contain organic nitrogen that decomposers and nitrifying bacteria convert into plant-usable nitrates.',
        ],
        bullets: [
          'Ammonification: organic nitrogen → ammonia/ammonium.',
          'Then nitrification: ammonia/ammonium → nitrite → nitrate.',
          'Compost/manure = organic nitrogen fertilizer.',
        ],
        simpler:
          'Decomposers break down dead stuff and release ammonia. Other bacteria turn that ammonia into nitrate, which plants can absorb. Compost is basically a slow-release nitrogen meal.',
        terms: [
          { term: 'Ammonification', def: 'The release of ammonia/ammonium from organic matter by decomposers.' },
        ],
      },
      {
        id: 'denitrification',
        title: 'Denitrification: closing the loop',
        body: [
          'Nitrogen gas is reformed by denitrifying soil bacteria doing a process called denitrification. They convert nitrates back into N₂ gas.',
          'These denitrifying bacteria complete the nitrogen cycle by returning nitrogen to the atmosphere.',
        ],
        bullets: [
          'Denitrification: NO₃⁻ → N₂ gas.',
          'Done by denitrifying bacteria.',
          'Returns nitrogen to the atmosphere, completing the cycle.',
        ],
        simpler:
          'Denitrifying bacteria are the exit door: they turn nitrate back into nitrogen gas and send it into the air, ready to start the cycle again.',
        visual: 'nitrogen-cycle',
        misconception: {
          myth: 'Nitrifying and denitrifying bacteria do the same job.',
          truth: 'Nitrifying bacteria make nitrates; denitrifying bacteria convert nitrates back to N₂ gas.',
        },
      },
      {
        id: 'fertilizers',
        title: 'Artificial fertilizers and eutrophication',
        body: [
          'Human-made fertilizers convert nitrogen gas directly into compounds like ammonia. This boosts the amount of nitrogen in the soil without relying on the natural cycle.',
          'But fertilizers can run off fields into waterways where they are not needed. This can cause growth explosions and algal blooms that harm aquatic ecosystems. The blooms block light from penetrating the water, and when the algae die, decomposers use up oxygen, creating dead zones. The dead zone in the Gulf of Mexico is attributed to artificial fertilizer runoff.',
        ],
        bullets: [
          'Artificial fertilizer: N₂ → ammonia (industrial).',
          'Runoff carries nutrients into waterways.',
          'Eutrophication: nutrients → algal bloom → light blocked → decomposition → oxygen depleted → dead zone.',
          'Human impact on the nitrogen cycle.',
        ],
        simpler:
          'Fertilizer on a field is like too much plant food in a fish tank. The algae explode, block the light, die, and get decomposed — using up the oxygen the fish need.',
        visual: 'dead-zone',
        terms: [
          { term: 'Eutrophication', def: 'Nutrient enrichment of water that causes algal blooms and oxygen depletion.' },
          { term: 'Dead zone', def: 'A low-oxygen area of water where most aquatic life cannot survive.' },
        ],
      },
    ],
    keyFacts: [
      'Nitrogen is needed for proteins and DNA; the atmosphere is ~78% N₂.',
      'Plants/animals cannot use N₂ directly.',
      'Fixation: N₂ → NH₃/NH₄⁺ (bacteria; lightning/UV in small amounts).',
      'Nitrification: NH₃/NH₄⁺ → NO₂⁻ → NO₃⁻.',
      'Assimilation: plants absorb nitrates → proteins/DNA.',
      'Ammonification: decomposers release ammonia/ammonium from dead matter and wastes.',
      'Denitrification: NO₃⁻ → N₂, completing the cycle.',
      'Fertilizer runoff → algal blooms → dead zones.',
      'Decomposers release CO₂ and nitrogen compounds, not oxygen.',
    ],
    misconceptions: [
      { myth: 'Plants absorb N₂ from the air.', truth: 'They absorb nitrates (and can use ammonium); N₂ must be fixed first.' },
      { myth: 'Denitrification is bad for plants in every way.', truth: 'It is a natural part of the cycle that returns nitrogen to the atmosphere; excess loss can reduce soil nitrogen, but the process itself is essential.' },
      { myth: 'Compost directly contains nitrates.', truth: 'Compost contains organic nitrogen; decomposers and nitrifying bacteria convert it into usable nitrates.' },
      { myth: 'Decomposers release oxygen.', truth: 'They use oxygen and release CO₂ plus nitrogen compounds.' },
    ],
    quickCheck: ['ni-02', 'ni-04', 'ni-11'],
    quiz: ['ni-08', 'ni-12', 'ni-13', 'ni-20', 'ni-26'],
    challenge: ['ni-22', 'ni-24'],
    teachBack: {
      prompt: 'Explain how a nitrogen atom in a dead leaf can end up in a new plant, and how it can return to the atmosphere.',
      checklist: ['Ammonification releases ammonia/ammonium', 'Nitrification makes nitrates', 'Assimilation by plants builds proteins/DNA', 'Denitrification returns N₂'],
    },
  },
  {
    id: 'connections-exam-skills',
    topic: 'integration',
    title: 'Connections & Exam Skills',
    subtitle: 'Link the cycles, calculate energy, and write answers that earn marks',
    minutes: 16,
    sections: [
      {
        id: 'links',
        title: 'How the cycles connect',
        body: [
          'The water, carbon and nitrogen cycles are not isolated. Photosynthesis uses CO₂ and water and releases oxygen. Cellular respiration uses glucose and oxygen and releases CO₂ and water. Decomposers release CO₂ and ammonia/ammonium, linking carbon and nitrogen recycling.',
          'Energy powers all of these cycles, but energy itself is not recycled. It flows from the Sun and is lost as heat.',
        ],
        bullets: [
          'Photosynthesis links carbon + water cycles.',
          'Respiration releases CO₂ + water.',
          'Decomposers link carbon + nitrogen cycles.',
          'Energy flows; matter cycles.',
        ],
        simpler:
          'The cycles are like gears in one machine: turn the carbon gear and the water and nitrogen gears move too. Energy is the motor, not the metal.',
        visual: 'cycle-links',
      },
      {
        id: 'calc',
        title: 'Energy calculations that show up on tests',
        body: [
          'If producers have 100% of the captured energy, a primary consumer gets about 10%, a secondary consumer gets about 1%, and a tertiary consumer gets about 0.1%. Each step is ×0.10.',
          'For larger numbers, do the same multiplication level by level. Write each step so the marker can see your reasoning. Include units (units, kJ, J, etc.).',
        ],
        bullets: [
          'One transfer: ×0.10.',
          'Two transfers: ×0.10 ×0.10 = ×0.01.',
          'Three transfers: ×0.001.',
          'Always show the step-by-step values, not just the final answer.',
        ],
        simpler:
          'Every level up, knock off a zero. 50 000 → 5 000 → 500 → 50.',
        visual: 'energy-calc',
      },
      {
        id: 'precision',
        title: 'Command words and precision',
        body: [
          'Grade 9 science marks often reward specificity. "It gets less" is weaker than "energy decreases by about 90% at each trophic transfer because it is used and lost as heat."',
          'Watch for these command words: define, explain, compare, describe, calculate, identify, and predict. Each asks for a different kind of answer.',
        ],
        bullets: [
          'Define: give the exact meaning, not an example only.',
          'Explain: give a cause-and-effect mechanism ("because…").',
          'Compare: give similarities and differences in parallel.',
          'Calculate: show the formula/substitution and units.',
          'Predict: state the outcome and justify it with a scientific principle.',
          'Identify: name it precisely; no long paragraph needed.',
        ],
        simpler:
          'If the question says "explain," the marker wants the word "because." If it says "calculate," show the numbers, not just the answer.',
      },
      {
        id: 'autopsy',
        title: 'What your practice test says to fix',
        body: [
          'Your marked practice-test PDF shows all multiple-choice selections matching the answer key. The recorded deductions are in Part B: Q16 and Q18 each lost 0.5 for a missing letter, and Q18 also had an incorrect letter. The exact intended letter is not visible on the marked copy, so the safe fix is to practise the complete process list for each organism.',
          'The written sections show strong causal reasoning. The precision watchlist is: decomposers release CO₂/nutrients rather than oxygen (Q25), and "more energy" must be corrected to "less energy" (Q22). The teacher accepted CO₂/C/N for Q25, but the clearest scientific answer is carbon dioxide and nitrogen compounds.',
          'Do not assume that recognizing a highlighted answer means you can reproduce it under test conditions. The mastery system here asks for varied, harder evidence before it awards high mastery.',
        ],
        bullets: [
          'Priority 1: organism ↔ process matching, especially bacteria.',
          'Priority 2: decomposer outputs — CO₂ + nitrogen compounds, not O₂.',
          'Priority 3: precise written answers — name the process, organism and direction.',
          'Priority 4: 10% energy calculations with steps and units.',
        ],
        simpler:
          'Your test says: you know the big ideas, but you lose marks on exact matching and exact wording. Practise the small precision details, not just the main concepts.',
      },
      {
        id: 'diagrams',
        title: 'Drawing food webs and pyramids',
        body: [
          'For a food web, start with the producers at the bottom or left. Draw arrows from the organism being eaten to the eater. Label every organism. If an organism eats more than one thing, draw multiple arrows.',
          'For an energy pyramid, draw a wide base labelled producers, then narrower layers for primary, secondary and tertiary consumers. Add the 10% values if asked. For a numbers pyramid, remember that the producer layer can be narrow if one large producer supports many consumers.',
        ],
        bullets: [
          'Arrows point toward the eater.',
          'Producers at the base/start.',
          'Label trophic levels and organisms.',
          'Use a ruler for pyramid layers; width represents the quantity.',
          'Don\'t mix energy, biomass and numbers in one pyramid.',
        ],
        simpler:
          'Food web: plants first, arrows to whoever eats them. Pyramid: wide bottom for energy, but numbers can be narrow at the bottom if one tree supports many insects.',
        visual: 'foodweb',
      },
    ],
    keyFacts: [
      'Photosynthesis links carbon and water cycles; respiration releases both CO₂ and water.',
      'Decomposers link carbon and nitrogen cycles.',
      'Energy flows one way; matter cycles.',
      '10% rule calculations: multiply by 0.10 per level; show your steps.',
      'Precision earns marks: name the process, organism, direction and consequence.',
      'Practice-test deductions were in Part B matching (Q16/Q18), not the main ideas.',
    ],
    misconceptions: [
      { myth: 'If two answers mean roughly the same thing, either will earn full marks.', truth: 'Science marking often requires the precise term and direction (e.g., "less energy," not "more").' },
      { myth: 'A food web is just a food chain with more arrows.', truth: 'A web shows interconnected pathways and alternatives; the connections are the point.' },
      { myth: 'High mastery means you can answer easy questions quickly.', truth: 'Mastery here requires varied question types and harder application, not just easy repetition.' },
    ],
    quickCheck: ['in-02', 'in-04', 'in-06'],
    quiz: ['in-07', 'in-11', 'in-12', 'in-13', 'in-17'],
    challenge: ['in-08', 'in-10', 'in-16'],
    teachBack: {
      prompt: 'A classmate says: "Energy cycles and matter flows." Correct them and explain the difference with one example from this unit.',
      checklist: ['Energy flows, matter cycles', 'Energy lost as heat/Sun replaces it', 'Matter example (carbon/water/nitrogen)', 'Uses precise terminology'],
    },
  },
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

export function lessonForConcept(_conceptId: string, lessonId: string): Lesson | undefined {
  return LESSON_MAP[lessonId];
}