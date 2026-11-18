import React from 'react';
import { Icon } from './ui';
import { BiomassNumbersSlides, CycleLinksSlides, SlideDiagram } from './slideDiagrams';

function Frame({ children, title, caption, ratio = '640 / 380', bare }: { children: React.ReactNode; title?: string; caption?: string; ratio?: string; bare?: boolean }) {
  if (bare) {
    return (
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <svg viewBox="0 0 640 380" className="absolute inset-0 h-full w-full" role="img" aria-label={title ?? 'Science diagram'}>
          <defs>
            <linearGradient id="dg-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0b1822" /><stop offset="100%" stopColor="#071018" /></linearGradient>
            <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#79958c" /></marker>
          </defs>
          <rect width="640" height="380" fill="url(#dg-bg)" />
          <g opacity="0.18">{Array.from({ length: 9 }).map((_, i) => <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="380" stroke="#6e8d82" strokeWidth="0.5" />)}{Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 76} x2="640" y2={i * 76} stroke="#6e8d82" strokeWidth="0.5" />)}</g>
          {children}
        </svg>
      </div>
    );
  }
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-[#071018]">
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <svg viewBox="0 0 640 380" className="absolute inset-0 h-full w-full" role="img" aria-label={title ?? 'Science diagram'}>
          <defs>
            <linearGradient id="dg-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0b1822" />
              <stop offset="100%" stopColor="#071018" />
            </linearGradient>
            <linearGradient id="dg-acid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b7f34a" />
              <stop offset="100%" stopColor="#4de1c1" />
            </linearGradient>
            <linearGradient id="dg-amber" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffc24b" />
              <stop offset="100%" stopColor="#ff8a65" />
            </linearGradient>
            <linearGradient id="dg-violet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#79958c" />
            </marker>
            <marker id="dg-arrow-acid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#b7f34a" />
            </marker>
          </defs>
          <rect width="640" height="380" fill="url(#dg-bg)" />
          <g opacity="0.18">
            {Array.from({ length: 9 }).map((_, i) => <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="380" stroke="#6e8d82" strokeWidth="0.5" />)}
            {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 76} x2="640" y2={i * 76} stroke="#6e8d82" strokeWidth="0.5" />)}
          </g>
          {children}
        </svg>
      </div>
      {(title || caption) && (
        <figcaption className="border-t border-line px-4 py-3">
          {title && <div className="text-xs font-bold uppercase tracking-wider text-ink">{title}</div>}
          {caption && <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{caption}</div>}
        </figcaption>
      )}
    </figure>
  );
}

function Node({ x, y, label, sub, color = '#b7f34a', icon, hideText, r = 30 }: { x: number; y: number; label: string; sub?: string; color?: string; icon?: string; hideText?: boolean; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill={color} opacity="0.07" />
      <circle cx={x} cy={y} r={r} fill="#0d1b24" stroke={color} strokeWidth="1.6" />
      {icon ? (
        <foreignObject x={x - 11} y={y - 12} width="22" height="22">
          <div style={{ color, display: 'flex', justifyContent: 'center' }}><Icon name={icon} size={18} /></div>
        </foreignObject>
      ) : (
        <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="12" fontWeight="800">{label.slice(0, 2).toUpperCase()}</text>
      )}
      {!hideText && (
        <>
          <text x={x} y={y + r + 18} textAnchor="middle" fill="#e7f0ea" fontSize="11.5" fontWeight="700">{label}</text>
          {sub && <text x={x} y={y + r + 31} textAnchor="middle" fill="#7f978f" fontSize="9">{sub}</text>}
        </>
      )}
    </g>
  );
}

function Arrow({ from, to, color = '#79958c', dashed, label, labelOffset = 0 }: { from: [number, number]; to: [number, number]; color?: string; dashed?: boolean; label?: string; labelOffset?: number }) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 + labelOffset;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const start = [from[0] + ux * 30, from[1] + uy * 30];
  const end = [to[0] - ux * 34, to[1] - uy * 34];
  return (
    <g>
      <line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} stroke={color} strokeWidth="1.6" strokeDasharray={dashed ? '5 4' : undefined} markerEnd="url(#dg-arrow)" opacity="0.85" />
      {label && (
        <g>
          <rect x={mx - label.length * 3.1 - 5} y={my - 8} width={label.length * 6.2 + 10} height="16" rx="5" fill="#0b1822" stroke={color} strokeOpacity="0.3" />
          <text x={mx} y={my + 3} textAnchor="middle" fill={color} fontSize="8.5" fontWeight="700">{label}</text>
        </g>
      )}
    </g>
  );
}

export function SpheresDiagram() {
  return (
    <Frame title="The biosphere needs all three abiotic spheres" caption="Life is found where air, rock/soil and water overlap. The biosphere is the zone of life, not a separate sphere.">
      <circle cx="320" cy="185" r="135" fill="url(#dg-acid)" opacity="0.06" stroke="#b7f34a" strokeWidth="1" strokeDasharray="4 5" />
      <circle cx="255" cy="160" r="78" fill="#7dd3fc" opacity="0.09" stroke="#7dd3fc" strokeWidth="1.1" />
      <circle cx="370" cy="175" r="88" fill="#ffc24b" opacity="0.07" stroke="#ffc24b" strokeWidth="1.1" />
      <circle cx="330" cy="245" r="70" fill="#a78bfa" opacity="0.08" stroke="#a78bfa" strokeWidth="1.1" />
      <text x="220" y="110" fill="#7dd3fc" fontSize="12" fontWeight="800">HYDROSPHERE</text>
      <text x="405" y="110" fill="#ffc24b" fontSize="12" fontWeight="800">ATMOSPHERE</text>
      <text x="330" y="315" fill="#a78bfa" fontSize="12" fontWeight="800">LITHOSPHERE</text>
      <text x="320" y="60" textAnchor="middle" fill="#e7f0ea" fontSize="13" fontWeight="800">BIOSPHERE — zone of life</text>
      <text x="320" y="190" textAnchor="middle" fill="#e7f0ea" fontSize="12" fontWeight="800">WHERE ALL</text>
      <text x="320" y="207" textAnchor="middle" fill="#e7f0ea" fontSize="12" fontWeight="800">THREE OVERLAP</text>
      <text x="320" y="345" textAnchor="middle" fill="#7f978f" fontSize="9.5">Atmosphere = gases · Hydrosphere = water · Lithosphere = rock, soil and minerals</text>
    </Frame>
  );
}

export function OrganizationDiagram() {
  const levels = [
    { label: 'Individual', sub: 'one organism', color: '#b7f34a' },
    { label: 'Population', sub: 'one species', color: '#8fe06b' },
    { label: 'Community', sub: 'all species', color: '#4de1c1' },
    { label: 'Ecosystem', sub: '+ abiotic factors', color: '#7dd3fc' },
    { label: 'Biome', sub: 'large region', color: '#a78bfa' },
    { label: 'Biosphere', sub: 'all life on Earth', color: '#f472b6' },
  ];
  return (
    <Frame title="Levels of organization" caption="Each level adds a component. A community becomes an ecosystem only when the abiotic environment is included.">
      {levels.map((l, i) => (
        <g key={l.label}>
          <rect x={100 + i * 6} y={48 + i * 46} width={360 - i * 12} height={36} rx={10} fill={l.color} opacity={0.1 + i * 0.012} stroke={l.color} strokeOpacity="0.55" />
          <text x={120 + i * 6} y={71 + i * 46} fill="#e7f0ea" fontSize="12" fontWeight="700">{l.label}</text>
          <text x={440} y={71 + i * 46} textAnchor="end" fill={l.color} fontSize="9.5" fontWeight="700">{l.sub}</text>
        </g>
      ))}
      <text x="320" y="335" textAnchor="middle" fill="#7f978f" fontSize="10">Zoom out: individual → population → community → ecosystem → biome → biosphere</text>
    </Frame>
  );
}

export function WolvesDiagram() {
  return (
    <Frame title="The Yellowstone wolf cascade" caption="Wolves control elk numbers and grazing behaviour. Vegetation recovers, banks stabilize and aquatic habitat returns.">
      <Node x={105} y={95} label="Wolves" sub="keystone predator" color="#b7f34a" icon="PawPrint" />
      <Node x={105} y={205} label="Elk" sub="grazers" color="#ffc24b" icon="Leaf" />
      <Node x={320} y={205} label="Willows & aspen" sub="regenerate" color="#4de1c1" icon="Trees" />
      <Node x={320} y={95} label="Banks & beavers" sub="habitat restored" color="#7dd3fc" icon="Waves" />
      <Node x={525} y={165} label="River life" sub="aquatic habitat" color="#a78bfa" icon="Fish" />
      <Arrow from={[105, 95]} to={[105, 205]} label="control" labelOffset={-6} color="#b7f34a" />
      <Arrow from={[105, 205]} to={[320, 205]} label="less grazing" labelOffset={-14} color="#ffc24b" />
      <Arrow from={[320, 205]} to={[320, 95]} label="roots hold soil" labelOffset={-6} color="#4de1c1" />
      <Arrow from={[320, 95]} to={[525, 165]} label="pools & dams" labelOffset={-4} color="#7dd3fc" />
      <text x="320" y="330" textAnchor="middle" fill="#7f978f" fontSize="10">Remove wolves → altered elk grazing → vegetation loss → erosion and habitat decline</text>
    </Frame>
  );
}

export function FoodChainDiagram() {
  return (
    <Frame title="Pine forest food chain" caption="Arrows show the direction of energy transfer. The pine tree is the producer; the goshawk is the top carnivore.">
      <Node x={85} y={160} label="Pine tree" sub="producer · 1st" color="#b7f34a" icon="TreePine" />
      <Node x={225} y={160} label="Red squirrel" sub="primary consumer · 2nd" color="#ffc24b" icon="Squirrel" />
      <Node x={370} y={160} label="Weasel" sub="secondary consumer · 3rd" color="#ff8a65" icon="PawPrint" />
      <Node x={515} y={160} label="Goshawk" sub="tertiary consumer · 4th" color="#f472b6" icon="Bird" />
      <Arrow from={[85, 160]} to={[225, 160]} label="energy" labelOffset={-24} color="#b7f34a" />
      <Arrow from={[225, 160]} to={[370, 160]} label="energy" labelOffset={-24} color="#ffc24b" />
      <Arrow from={[370, 160]} to={[515, 160]} label="energy" labelOffset={-24} color="#ff8a65" />
      <text x="320" y="90" textAnchor="middle" fill="#e7f0ea" fontSize="12" fontWeight="800">Sun → producers → consumers</text>
      <text x="320" y="262" textAnchor="middle" fill="#7f978f" fontSize="10">About 90% of energy is used or lost as heat at each transfer.</text>
    </Frame>
  );
}

export function FoodWebDiagram({ hideText, bare }: { hideText?: boolean; bare?: boolean }) {
  const n = {
    duck: [110, 278] as [number, number],
    moss: [265, 300] as [number, number],
    guppy: [325, 178] as [number, number],
    ghost: [120, 155] as [number, number],
    catfish: [455, 85] as [number, number],
    snail: [540, 220] as [number, number],
  };
  const links: [[number, number], [number, number]][] = [
    [n.duck, n.guppy], [n.moss, n.guppy], [n.guppy, n.catfish],
    [n.duck, n.snail], [n.moss, n.snail], [n.guppy, n.snail], [n.catfish, n.snail],
    [n.duck, n.ghost], [n.moss, n.ghost], [n.guppy, n.ghost], [n.catfish, n.ghost],
    [n.ghost, n.snail],
  ];
  return (
    <Frame bare={bare} title="Pond food web" caption="This is the Q26 pond web from your practice test. Solid arrows are feeding relationships; decomposers feed on dead matter and wastes.">
      {links.map((l, i) => <Arrow key={i} from={l[0]} to={l[1]} color={i >= 7 ? '#a78bfa' : '#79958c'} dashed={i >= 7} />)}
      <Node x={n.duck[0]} y={n.duck[1]} label="Duckweed" sub="producer" color="#b7f34a" icon="Leaf" hideText={hideText} />
      <Node x={n.moss[0]} y={n.moss[1]} label="Moss ball" sub="producer" color="#b7f34a" icon="CircleDot" hideText={hideText} />
      <Node x={n.guppy[0]} y={n.guppy[1]} label="Guppies" sub="primary consumer" color="#ffc24b" icon="Fish" hideText={hideText} />
      <Node x={n.ghost[0]} y={n.ghost[1]} label="Ghost shrimp" sub="decomposer" color="#a78bfa" icon="Bug" hideText={hideText} />
      <Node x={n.catfish[0]} y={n.catfish[1]} label="Catfish" sub="secondary consumer" color="#ff8a65" icon="FishSymbol" hideText={hideText} />
      <Node x={n.snail[0]} y={n.snail[1]} label="Snail" sub="decomposer" color="#a78bfa" icon="Shell" hideText={hideText} />
      {!hideText && <text x="320" y="350" textAnchor="middle" fill="#7f978f" fontSize="9.5">Dashed purple arrows = dead matter/waste to decomposers</text>}
    </Frame>
  );
}

export function EnergyPyramidDiagram() {
  const rows = [
    { label: 'Tertiary consumers', sub: '0.1%', width: 120, color: '#f472b6' },
    { label: 'Secondary consumers', sub: '1%', width: 210, color: '#ff8a65' },
    { label: 'Primary consumers', sub: '10%', width: 310, color: '#ffc24b' },
    { label: 'Producers', sub: '100% of captured energy', width: 420, color: '#b7f34a' },
  ];
  return (
    <Frame title="Energy pyramid" caption="About 10% of energy moves up each level. The energy pyramid is always upright because energy is lost as heat.">
      {rows.map((r, i) => (
        <g key={r.label}>
          <rect x={320 - r.width / 2} y={60 + i * 62} width={r.width} height={50} rx={8} fill={r.color} opacity={0.14} stroke={r.color} strokeOpacity="0.7" />
          <text x={320} y={82 + i * 62} textAnchor="middle" fill="#e7f0ea" fontSize="11.5" fontWeight="700">{r.label}</text>
          <text x={320} y={97 + i * 62} textAnchor="middle" fill={r.color} fontSize="9.5" fontWeight="700">{r.sub}</text>
        </g>
      ))}
      <text x="320" y="330" textAnchor="middle" fill="#7f978f" fontSize="9.5">Only ~10% transfers at each step; ~90% is used for life processes and lost as heat.</text>
    </Frame>
  );
}

export function BiomassNumbersDiagram() {
  return (
    <Frame title="Biomass vs numbers pyramids" caption="Biomass usually narrows upward. A numbers pyramid can be inverted when one large producer supports many consumers.">
      <text x="160" y="42" textAnchor="middle" fill="#4de1c1" fontSize="11" fontWeight="800">BIOMASS (usually upright)</text>
      <polygon points="80,80 240,80 215,115 105,115" fill="#4de1c1" opacity="0.2" stroke="#4de1c1" />
      <polygon points="105,120 215,120 190,155 130,155" fill="#4de1c1" opacity="0.2" stroke="#4de1c1" />
      <polygon points="130,160 190,160 170,195 150,195" fill="#4de1c1" opacity="0.2" stroke="#4de1c1" />
      <text x="160" y="104" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">producers</text>
      <text x="160" y="144" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">herbivores</text>
      <text x="160" y="184" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">predators</text>
      <text x="480" y="42" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="800">NUMBERS (can invert)</text>
      <polygon points="455,80 505,80 500,115 460,115" fill="#a78bfa" opacity="0.2" stroke="#a78bfa" />
      <polygon points="425,120 535,120 520,155 440,155" fill="#a78bfa" opacity="0.2" stroke="#a78bfa" />
      <polygon points="395,160 565,160 540,195 420,195" fill="#a78bfa" opacity="0.2" stroke="#a78bfa" />
      <text x="480" y="104" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">1 tree</text>
      <text x="480" y="144" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">insects</text>
      <text x="480" y="184" textAnchor="middle" fill="#e7f0ea" fontSize="8.5">birds</text>
      <text x="320" y="250" textAnchor="middle" fill="#7f978f" fontSize="9.5">One tree can be a small producer layer in a numbers pyramid — but it still holds more energy than the insects.</text>
    </Frame>
  );
}

export function PhotosynthesisCycleDiagram() {
  return (
    <Frame title="Photosynthesis ↔ cellular respiration" caption="The products of one process are the inputs of the other. Plants do both; respiration continues at night.">
      <Node x={165} y={105} label="Chloroplast" sub="photosynthesis" color="#b7f34a" icon="Sun" r={38} />
      <Node x={475} y={105} label="Mitochondrion" sub="cellular respiration" color="#ff8a65" icon="Flame" r={38} />
      <Node x={320} y={245} label="Glucose + O₂" sub="chemical energy stored" color="#ffc24b" icon="Hexagon" r={42} />
      <Node x={320} y={55} label="CO₂ + H₂O" sub="raw materials" color="#7dd3fc" icon="Droplets" r={38} />
      <Arrow from={[205, 120]} to={[280, 225]} label="stores energy" labelOffset={10} color="#b7f34a" />
      <Arrow from={[290, 65]} to={[220, 90]} label="uses CO₂ + H₂O" labelOffset={-10} color="#7dd3fc" />
      <Arrow from={[360, 225]} to={[445, 125]} label="uses glucose + O₂" labelOffset={10} color="#ffc24b" />
      <Arrow from={[455, 70]} to={[390, 55]} label="releases CO₂ + H₂O" labelOffset={-12} color="#ff8a65" />
      <text x="320" y="335" textAnchor="middle" fill="#7f978f" fontSize="9.5">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ &nbsp;&nbsp; | &nbsp;&nbsp; C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy</text>
    </Frame>
  );
}

export function WaterCycleDiagram({ hideText, bare }: { hideText?: boolean; bare?: boolean }) {
  return (
    <Frame bare={bare} title="The water cycle" caption="Biotic processes (transpiration, respiration) and abiotic processes (evaporation, condensation, precipitation, runoff) move water.">
      <circle cx="540" cy="62" r="26" fill="#ffc24b" opacity="0.8" />
      <path d="M80 115 C110 85 165 85 195 115 C175 140 100 140 80 115Z" fill="#7dd3fc" opacity="0.18" stroke="#7dd3fc" strokeOpacity="0.4" />
      <path d="M250 120 C275 92 330 92 355 120 C330 140 275 140 250 120Z" fill="#7dd3fc" opacity="0.13" stroke="#7dd3fc" strokeOpacity="0.3" />
      <path d="M0 290 L120 210 L230 285 L340 195 L450 270 L560 200 L640 255 L640 380 L0 380Z" fill="#142522" opacity="0.9" />
      <path d="M120 312 C220 292 330 330 420 300 C490 278 560 300 610 286" fill="none" stroke="#7dd3fc" strokeWidth="8" opacity="0.35" />
      <path d="M120 312 C220 292 330 330 420 300 C490 278 560 300 610 286" fill="none" stroke="#b9ecff" strokeWidth="2" opacity="0.7" />
      <g stroke="#7dd3fc" strokeWidth="1.5" opacity="0.7">
        <line x1="130" y1="250" x2="130" y2="185" markerEnd="url(#dg-arrow)" />
        <line x1="300" y1="210" x2="300" y2="155" markerEnd="url(#dg-arrow)" />
        <line x1="500" y1="180" x2="500" y2="120" markerEnd="url(#dg-arrow)" />
      </g>
      {!hideText && (
        <>
          <text x="115" y="275" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="700">Evaporation</text>
          <text x="255" y="245" textAnchor="middle" fill="#4de1c1" fontSize="10" fontWeight="700">Transpiration</text>
          <text x="350" y="105" textAnchor="middle" fill="#b9ecff" fontSize="10" fontWeight="700">Condensation</text>
          <text x="510" y="165" textAnchor="middle" fill="#b9ecff" fontSize="10" fontWeight="700">Precipitation</text>
          <text x="560" y="335" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="700">Runoff</text>
        </>
      )}
      <text x="320" y="362" textAnchor="middle" fill="#7f978f" fontSize="9">Biotic: transpiration, photosynthesis, cellular respiration &nbsp;·&nbsp; Abiotic: evaporation, condensation, precipitation, runoff</text>
    </Frame>
  );
}

export function CarbonCycleDiagram({ hideText, bare }: { hideText?: boolean; bare?: boolean }) {
  const p = {
    atmosphere: [320, 55] as [number, number],
    producers: [130, 145] as [number, number],
    consumers: [320, 215] as [number, number],
    decomposers: [105, 300] as [number, number],
    fossil: [480, 300] as [number, number],
    industry: [545, 145] as [number, number],
  };
  return (
    <Frame bare={bare} title="The carbon cycle" caption="Photosynthesis removes CO₂; respiration, decomposition and combustion release it. Fossil fuels store carbon for millions of years.">
      {!hideText && <text x="320" y="20" textAnchor="middle" fill="#e7f0ea" fontSize="10" fontWeight="800">ATMOSPHERE</text>}
      <Arrow from={p.atmosphere} to={p.producers} color="#b7f34a" label="photosynthesis" labelOffset={-18} />
      <Arrow from={p.producers} to={p.consumers} color="#ffc24b" label="feeding" labelOffset={-16} />
      <Arrow from={p.consumers} to={p.atmosphere} color="#ff8a65" label="respiration" labelOffset={10} />
      <Arrow from={p.producers} to={p.decomposers} color="#a78bfa" label="death" labelOffset={12} />
      <Arrow from={p.decomposers} to={p.atmosphere} color="#a78bfa" label="respiration" labelOffset={12} />
      <Arrow from={p.fossil} to={p.industry} color="#ff8a65" label="extract + burn" labelOffset={-14} />
      <Arrow from={p.industry} to={p.atmosphere} color="#ff8a65" label="combustion" labelOffset={-14} />
      <Arrow from={p.atmosphere} to={p.industry} color="#7dd3fc" dashed label="diffusion" labelOffset={22} />
      <Node x={p.atmosphere[0]} y={p.atmosphere[1]} label="CO₂ in atmosphere" sub="" color="#7dd3fc" icon="Cloud" hideText={hideText} r={27} />
      <Node x={p.producers[0]} y={p.producers[1]} label="Producers" sub="" color="#b7f34a" icon="Leaf" hideText={hideText} r={27} />
      <Node x={p.consumers[0]} y={p.consumers[1]} label="Consumers" sub="" color="#ffc24b" icon="Rabbit" hideText={hideText} r={27} />
      <Node x={p.decomposers[0]} y={p.decomposers[1]} label="Decomposers" sub="" color="#a78bfa" icon="Mushroom" hideText={hideText} r={27} />
      <Node x={p.fossil[0]} y={p.fossil[1]} label="Fossil fuels" sub="" color="#ff8a65" icon="Flame" hideText={hideText} r={27} />
      <Node x={p.industry[0]} y={p.industry[1]} label="Industry" sub="" color="#ff8a65" icon="Factory" hideText={hideText} r={27} />
    </Frame>
  );
}

export function NitrogenCycleDiagram({ hideText, bare }: { hideText?: boolean; bare?: boolean }) {
  const p = {
    n2: [320, 50] as [number, number],
    fixation: [115, 115] as [number, number],
    nitrification: [295, 175] as [number, number],
    assimilation: [500, 115] as [number, number],
    ammonification: [115, 285] as [number, number],
    denitrification: [500, 285] as [number, number],
  };
  return (
    <Frame bare={bare} title="The nitrogen cycle" caption="Bacteria move nitrogen between unusable N₂ and usable ammonium/nitrate. Plants assimilate nitrates; animals get nitrogen by eating.">
      <Arrow from={p.n2} to={p.fixation} color="#4de1c1" label="fixation" labelOffset={-12} />
      <Arrow from={p.fixation} to={p.nitrification} color="#ffc24b" label="ammonia" labelOffset={10} />
      <Arrow from={p.nitrification} to={p.assimilation} color="#b7f34a" label="nitrate" labelOffset={-12} />
      <Arrow from={p.assimilation} to={p.ammonification} color="#a78bfa" label="dead matter" labelOffset={-22} />
      <Arrow from={p.ammonification} to={p.nitrification} color="#a78bfa" label="ammonia" labelOffset={10} />
      <Arrow from={p.nitrification} to={p.denitrification} color="#ff8a65" label="nitrate" labelOffset={10} />
      <Arrow from={p.denitrification} to={p.n2} color="#ff8a65" label="N₂" labelOffset={14} />
      <Node x={p.n2[0]} y={p.n2[1]} label="N₂ in atmosphere" sub="78% · unusable" color="#7dd3fc" icon="Wind" hideText={hideText} r={27} />
      <Node x={p.fixation[0]} y={p.fixation[1]} label="Fixation" sub="N₂ → NH₃" color="#4de1c1" icon="Bacteria" hideText={hideText} r={27} />
      <Node x={p.nitrification[0]} y={p.nitrification[1]} label="Nitrification" sub="NH₃ → NO₃⁻" color="#ffc24b" icon="FlaskConical" hideText={hideText} r={27} />
      <Node x={p.assimilation[0]} y={p.assimilation[1]} label="Assimilation" sub="plants use NO₃⁻" color="#b7f34a" icon="Sprout" hideText={hideText} r={27} />
      <Node x={p.ammonification[0]} y={p.ammonification[1]} label="Ammonification" sub="dead → NH₃" color="#a78bfa" icon="Mushroom" hideText={hideText} r={27} />
      <Node x={p.denitrification[0]} y={p.denitrification[1]} label="Denitrification" sub="NO₃⁻ → N₂" color="#ff8a65" icon="Undo2" hideText={hideText} r={27} />
      {!hideText && <text x="320" y="360" textAnchor="middle" fill="#7f978f" fontSize="9">Nitrifying bacteria: NH₃ → NO₂⁻ → NO₃⁻ &nbsp;·&nbsp; Denitrifying bacteria: NO₃⁻ → N₂</text>}
    </Frame>
  );
}

export function CycleLinksDiagram() {
  return (
    <Frame title="Energy flows; matter cycles" caption="The Sun supplies energy, which is eventually lost as heat. Carbon, water and nitrogen atoms cycle between living and non-living reservoirs.">
      <circle cx="320" cy="185" r="120" fill="none" stroke="#4de1c1" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.6" />
      <circle cx="320" cy="185" r="72" fill="none" stroke="#b7f34a" strokeWidth="1" opacity="0.4" />
      <Node x={320} y={65} label="Sun" sub="energy input" color="#ffc24b" icon="Sun" r={28} />
      <Node x={440} y={185} label="Living things" sub="biotic" color="#b7f34a" icon="Leaf" r={28} />
      <Node x={320} y={305} label="Heat" sub="energy lost" color="#ff8a65" icon="Flame" r={28} />
      <Node x={200} y={185} label="Abiotic reservoirs" sub="air, water, soil, rock" color="#7dd3fc" icon="Globe2" r={28} />
      <Arrow from={[320, 65]} to={[440, 185]} color="#ffc24b" label="energy" labelOffset={-10} />
      <Arrow from={[440, 185]} to={[320, 305]} color="#ff8a65" label="heat" labelOffset={-10} />
      <Arrow from={[200, 185]} to={[320, 65]} color="#7dd3fc" label="matter" labelOffset={10} />
      <Arrow from={[440, 185]} to={[200, 185]} color="#4de1c1" label="matter cycling" labelOffset={-14} />
      <text x="320" y="200" textAnchor="middle" fill="#e7f0ea" fontSize="11" fontWeight="800">ENERGY FLOWS</text>
      <text x="320" y="216" textAnchor="middle" fill="#4de1c1" fontSize="11" fontWeight="800">MATTER CYCLES</text>
    </Frame>
  );
}

export function EnergyCalcDiagram() {
  const vals = [
    { label: 'Producers', value: '50 000', color: '#b7f34a', width: 430 },
    { label: 'Primary consumers', value: '5 000', color: '#ffc24b', width: 330 },
    { label: 'Secondary consumers', value: '500', color: '#ff8a65', width: 230 },
    { label: 'Tertiary consumers', value: '50', color: '#f472b6', width: 140 },
  ];
  return (
    <Frame title="10% energy calculation" caption="At each transfer, multiply by 0.10. Show every step and include units — this is exactly what earned marks on Q27.">
      {vals.map((v, i) => (
        <g key={v.label}>
          <rect x={320 - v.width / 2} y={65 + i * 61} width={v.width} height={48} rx={8} fill={v.color} opacity="0.15" stroke={v.color} strokeOpacity="0.65" />
          <text x={320 - v.width / 2 + 12} y={88 + i * 61} fill="#e7f0ea" fontSize="10.5" fontWeight="700">{v.label}</text>
          <text x={320 + v.width / 2 - 12} y={91 + i * 61} textAnchor="end" fill={v.color} fontSize="15" fontWeight="800">{v.value}</text>
          {i > 0 && <text x="320" y={60 + i * 61} textAnchor="middle" fill="#7f978f" fontSize="8">× 0.10</text>}
        </g>
      ))}
      <text x="320" y="342" textAnchor="middle" fill="#7f978f" fontSize="9.5">If producers have 100% of captured energy: primary consumers 10%, secondary 1%, tertiary 0.1%.</text>
    </Frame>
  );
}

export function DiagramRenderer({ id }: { id: string }) {
  if (id === 'biomass-numbers') return <BiomassNumbersSlides />;
  if (id === 'cycle-links') return <CycleLinksSlides />;
  if (id === 'energy-calc') return <EnergyCalcDiagram />;
  if (['spheres','organization','wolves','foodchain','foodweb','trophic-levels','energy-pyramid','biomass-pyramid','numbers-pyramid','solar-budget','leaf-photosynthesis','photosynthesis-cycle','water-cycle','carbon-short','carbon-long','energy-budget','nitrogen-cycle','soil-bacteria','dead-zone','fertilizer'].includes(id)) {
    return <SlideDiagram id={id} />;
  }
  switch (id) {
    case 'trophic-pyramid': return <SlideDiagram id="energy-pyramid" />;
    case 'carbon-cycle': return <SlideDiagram id="carbon-short" />;
    default: return null;
  }
}

export function DiagramCanvas({ id, hideText }: { id: 'foodweb' | 'carbon' | 'nitrogen' | 'water'; hideText?: boolean }) {
  switch (id) {
    case 'foodweb': return <FoodWebDiagram hideText={hideText} bare />;
    case 'carbon': return <CarbonCycleDiagram hideText={hideText} bare />;
    case 'nitrogen': return <NitrogenCycleDiagram hideText={hideText} bare />;
    case 'water': return <WaterCycleDiagram hideText={hideText} bare />;
  }
}