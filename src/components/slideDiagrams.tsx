import spheres from '../assets/diagrams/spheres.webp';
import organization from '../assets/diagrams/organization.webp';
import wolves from '../assets/diagrams/wolves.webp';
import foodchain from '../assets/diagrams/foodchain.webp';
import foodweb from '../assets/diagrams/foodweb.webp';
import trophicLevels from '../assets/diagrams/trophic-levels.webp';
import energyPyramid from '../assets/diagrams/energy-pyramid.webp';
import biomassPyramid from '../assets/diagrams/biomass-pyramid.webp';
import numbersPyramid from '../assets/diagrams/numbers-pyramid.webp';
import solarBudget from '../assets/diagrams/solar-budget.webp';
import leafPhotosynthesis from '../assets/diagrams/leaf-photosynthesis.webp';
import photosynthesisCycle from '../assets/diagrams/photosynthesis-cycle.webp';
import waterCycle from '../assets/diagrams/water-cycle.webp';
import carbonShort from '../assets/diagrams/carbon-short.webp';
import carbonLong from '../assets/diagrams/carbon-long.webp';
import energyBudget from '../assets/diagrams/energy-budget.webp';
import nitrogenCycle from '../assets/diagrams/nitrogen-cycle.webp';
import soilBacteria from '../assets/diagrams/soil-bacteria.webp';
import deadZone from '../assets/diagrams/dead-zone.webp';
import fertilizer from '../assets/diagrams/fertilizer.webp';
import { Icon, cn } from './ui';

interface SlideMeta { src: string; title: string; caption: string; source: string; tall?: boolean }

const SLIDES: Record<string, SlideMeta> = {
  spheres: { src: spheres, title: 'The three abiotic spheres', caption: 'The biosphere is the overlap where life exists; it needs components of the atmosphere, lithosphere and hydrosphere.', source: 'Introducing Ecology — Abiotic Factors' },
  organization: { src: organization, title: 'From atom to biosphere', caption: 'The same slide also defines individual, population, community and ecosystem as levels of ecological organization.', source: 'Introducing Ecology — Biotic Factors' },
  wolves: { src: wolves, title: 'Wolves keep Yellowstone in balance', caption: 'The poster traces the keystone cascade: wolves → elk behaviour and numbers → willows → beavers and river habitat.', source: 'Introducing Ecology — Sustainability / Keystone Species' },
  foodchain: { src: foodchain, title: 'Pine forest food chain', caption: 'Pine cone → red squirrel → weasel → goshawk. The arrows show the direction of energy transfer.', source: 'Food Chains and Food Webs — Food Chain Example' },
  foodweb: { src: foodweb, title: 'A real forest food web', caption: 'Interconnected chains give species alternative food sources. The bottom chain is the pine → squirrel → weasel → goshawk example.', source: 'Food Chains and Food Webs — Food Webs' },
  'trophic-levels': { src: trophicLevels, title: 'Trophic levels', caption: 'Producers form the first level; primary, secondary and tertiary consumers form the levels above.', source: 'Food Chains and Food Webs — Trophic Levels' },
  'energy-pyramid': { src: energyPyramid, title: 'Energy pyramid', caption: 'The layer width represents available energy. Only about 10% transfers between levels, so higher levels support fewer organisms.', source: 'Food Chains and Food Webs — Energy Pyramid' },
  'biomass-pyramid': { src: biomassPyramid, title: 'Biomass pyramid', caption: 'The total mass of all individuals decreases at higher trophic levels in this typical forest example.', source: 'Food Chains and Food Webs — Biomass Pyramids' },
  'numbers-pyramid': { src: numbersPyramid, title: 'Numbers pyramid', caption: 'A numbers pyramid counts individuals. It can be inverted — one tree can support many insects — so it is not always upright.', source: 'Food Chains and Food Webs — Numbers Pyramids' },
  'solar-budget': { src: solarBudget, title: "Earth's solar energy budget", caption: 'Most incoming solar energy is reflected or absorbed as heat. Only a small fraction — roughly 1% — is captured by producers.', source: 'Energy in Ecosystems — Solar Energy' },
  'leaf-photosynthesis': { src: leafPhotosynthesis, title: 'Photosynthesis inputs and outputs', caption: 'Carbon dioxide + water + sunlight → glucose + oxygen, with chlorophyll in the chloroplast capturing the light.', source: 'Energy in Ecosystems — Photosynthesis' },
  'photosynthesis-cycle': { src: photosynthesisCycle, title: 'Photosynthesis ↔ cellular respiration', caption: 'The products of photosynthesis are the inputs of respiration, and vice versa. Plants do both.', source: 'Energy in Ecosystems — Interconnection of Photosynthesis and Cellular Respiration' },
  'water-cycle': { src: waterCycle, title: 'The water cycle', caption: 'Evaporation, transpiration, condensation, precipitation and runoff move water between the hydrosphere and living things.', source: 'Water and Carbon Cycles — The Water Cycle' },
  'carbon-short': { src: carbonShort, title: 'A short carbon cycle', caption: 'Photosynthesis removes CO₂; feeding moves carbon through the chain; respiration and decomposition return it.', source: 'Water and Carbon Cycles — A Short Carbon Cycle' },
  'carbon-long': { src: carbonLong, title: 'A longer carbon cycle', caption: 'Carbon can be stored for millions of years in fossil fuels and limestone, then returned by combustion or geological activity.', source: 'Water and Carbon Cycles — Longer Carbon Cycles' },
  'energy-budget': { src: energyBudget, title: "Earth's energy budget", caption: 'Energy arrives from the Sun in a continuous stream and eventually radiates back out as heat. Matter, by contrast, cycles.', source: 'Water and Carbon Cycles — Energy vs. Matter' },
  'nitrogen-cycle': { src: nitrogenCycle, title: 'The complete nitrogen cycle', caption: 'Fixation → ammonium → nitrification → nitrate → assimilation; decomposers ammonify; denitrification returns N₂ to the atmosphere.', source: 'Nitrogen Cycle — Returning Nitrogen to the Atmosphere' },
  'soil-bacteria': { src: soilBacteria, title: 'Soil bacteria conversions', caption: 'N₂ → ammonia → nitrites → nitrates → plants → animals. Different soil bacteria carry out fixation, nitrification and denitrification.', source: 'Nitrogen Cycle — Nitrogen Compounds for Plants' },
  'dead-zone': { src: deadZone, title: 'The Gulf of Mexico dead zone', caption: 'Artificial fertilizer runoff adds excess nutrients, causing algal blooms and low-oxygen dead zones.', source: 'Nitrogen Cycle — Drawbacks of Artificial Fertilizers' },
  fertilizer: { src: fertilizer, title: 'Artificial fertilizers', caption: 'Human-made fertilizer converts atmospheric nitrogen into ammonia compounds to boost soil nitrogen.', source: 'Nitrogen Cycle — Artificial Fertilizers' },
};

export function SlideDiagram({ id, className }: { id: string; className?: string }) {
  const meta = SLIDES[id];
  if (!meta) return null;
  return (
    <figure className={cn('overflow-hidden rounded-2xl border border-line bg-[#f4f1e7] shadow-[0_18px_50px_rgba(0,0,0,0.16)]', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-[#ded8c6] bg-[#ebe6d7] px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#6e7b60]"><Icon name="Presentation" size={10} />From your unit slides</span>
        <span className="hidden truncate text-[8px] text-[#8a947f] sm:block">{meta.source}</span>
      </div>
      <div className="bg-white p-2 sm:p-2.5">
        <img src={meta.src} alt={meta.title} loading="lazy" decoding="async" className="mx-auto max-h-[430px] w-full rounded-md object-contain" />
      </div>
      <figcaption className="border-t border-[#ded8c6] bg-[#f4f1e7] px-3 py-2.5">
        <div className="font-display text-[12px] font-semibold text-[#263024]">{meta.title}</div>
        <div className="mt-0.5 text-[10px] leading-relaxed text-[#65715e]">{meta.caption}</div>
      </figcaption>
    </figure>
  );
}

export function BiomassNumbersSlides() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SlideDiagram id="biomass-pyramid" />
      <SlideDiagram id="numbers-pyramid" />
    </div>
  );
}

export function CycleLinksSlides() {
  return (
    <div className="rounded-2xl border border-line bg-[#f4f1e7] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#6e7b60]"><Icon name="Presentation" size={10} />Three matter cycles from your slides</span>
        <span className="text-[8px] text-[#8a947f]">Matter cycles; energy flows</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { src: waterCycle, label: 'Water' },
          { src: carbonShort, label: 'Carbon' },
          { src: nitrogenCycle, label: 'Nitrogen' },
        ].map((c) => (
          <figure key={c.label} className="overflow-hidden rounded-lg border border-[#ded8c6] bg-white">
            <div className="flex h-[110px] items-center justify-center p-1 sm:h-[135px]"><img src={c.src} alt={`${c.label} cycle`} loading="lazy" className="max-h-full w-full object-contain" /></div>
            <figcaption className="border-t border-[#ded8c6] bg-[#ebe6d7] px-2 py-1.5 text-center text-[8.5px] font-bold uppercase tracking-wider text-[#5f6c54]">{c.label} cycle</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-[9.5px] leading-relaxed text-[#65715e]">Atoms of water, carbon and nitrogen are reused between living things and abiotic reservoirs. Energy is not recycled — it enters as sunlight and leaves as heat.</p>
    </div>
  );
}