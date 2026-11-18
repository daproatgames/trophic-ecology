import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONCEPT_MAP } from '../data/concepts';
import { Card, Icon, LinkButton, PageHeader, SectionTitle, cn } from '../components/ui';

type Status = 'key' | 'deduction' | 'ok' | 'accepted' | 'written';
interface AuditRow { n: number; part: string; prompt: string; status: Status; note: string; concept?: string; topic?: string }

const ROWS: AuditRow[] = [
  { n: 1, part: 'A', prompt: 'How many "stops" does a nitrogen atom make?', status: 'key', note: 'Key-aligned. Matter cycles repeatedly, so there is no fixed number.', concept: 'cycle-integration', topic: 'Nitrogen' },
  { n: 2, part: 'A', prompt: 'Grass 100% → rabbit → fox: percent reaching the fox?', status: 'key', note: 'Key-aligned. 10% × 10% = 1%, with the pencil work visible on the page.', concept: 'data-calculation', topic: 'Energy' },
  { n: 3, part: 'A', prompt: 'Organization from smallest to largest.', status: 'key', note: 'Key-aligned. Population → community → ecosystem → biome → biosphere.', concept: 'ecological-organization', topic: 'Foundations' },
  { n: 4, part: 'A', prompt: 'Cellular respiration is a…', status: 'key', note: 'Key-aligned. Respiration releases CO₂, so it is a carbon source.', concept: 'cellular-respiration', topic: 'Energy' },
  { n: 5, part: 'A', prompt: 'Tadpoles in the Fraser River chain.', status: 'key', note: 'Key-aligned. Phytoplankton → plankton → tadpoles = third trophic level.', concept: 'trophic-levels', topic: 'Food webs' },
  { n: 6, part: 'A', prompt: 'Greatest biomass in the Fraser River chain.', status: 'key', note: 'Key-aligned. Plankton (producers/lowest level) among the choices.', concept: 'biomass-pyramid', topic: 'Pyramids' },
  { n: 7, part: 'A', prompt: 'All members of one species.', status: 'key', note: 'Key-aligned. Population.', concept: 'ecological-organization', topic: 'Foundations' },
  { n: 8, part: 'A', prompt: 'Cloud formation from water taken from trees.', status: 'key', note: 'Key-aligned. Transpiration.', concept: 'water-cycle', topic: 'Cycles' },
  { n: 9, part: 'A', prompt: 'Main processes cycling oxygen and carbon.', status: 'key', note: 'Key-aligned. Photosynthesis + respiration.', concept: 'photo-respiration-link', topic: 'Energy' },
  { n: 10, part: 'A', prompt: 'Primary consumers eat…', status: 'key', note: 'Key-aligned. Plants/producers.', concept: 'trophic-levels', topic: 'Food webs' },
  { n: 11, part: 'A', prompt: 'Series of cycles where chemicals are consumed and rearranged.', status: 'key', note: 'Key-aligned. Biogeochemical cycles.', concept: 'matter-energy', topic: 'Cycles' },
  { n: 12, part: 'A', prompt: 'Which cycle relies mostly on photosynthesis?', status: 'key', note: 'Key-aligned. Carbon cycle.', concept: 'carbon-cycle', topic: 'Cycles' },
  { n: 13, part: 'A', prompt: 'Characteristic biotic feature of a forest.', status: 'key', note: 'Key-aligned. Mosquitoes; the other options are abiotic.', concept: 'biotic-abiotic', topic: 'Foundations' },
  { n: 14, part: 'A', prompt: 'Factors affecting an aquatic ecosystem.', status: 'key', note: 'Key-aligned. Highway salt, fertilizer and air pollution — all of the above.', concept: 'sustainability', topic: 'Foundations' },
  { n: 15, part: 'A', prompt: 'Sugar is made of…', status: 'key', note: 'Key-aligned. C₆H₁₂O₆ = carbon, hydrogen and oxygen.', concept: 'photosynthesis', topic: 'Energy' },
  { n: 16, part: 'B', prompt: 'Processes carried out by plants (matching).', status: 'deduction', note: 'Teacher annotation: missing letter, −0.5. Plants do photosynthesis + cellular respiration. Match every required letter; extra letters also cost marks.', concept: 'exam-precision', topic: 'Part B' },
  { n: 17, part: 'B', prompt: 'Processes carried out by animals.', status: 'ok', note: 'No deduction visible. Animals carry out cellular respiration.', concept: 'exam-precision', topic: 'Part B' },
  { n: 18, part: 'B', prompt: 'Processes carried out by bacteria.', status: 'deduction', note: 'Teacher annotation: missing letter (−0.5) plus incorrect letter (0). The exact intended letter is not legible on the copy; practise the full process set: respiration, fixation, nitrification, denitrification. Some bacteria are also photosynthetic/decomposers, but course keys may exclude those.', concept: 'nitrogen-fixation', topic: 'Part B' },
  { n: 19, part: 'B', prompt: 'Process carried out by lightning.', status: 'ok', note: 'No deduction visible. Lightning = abiotic nitrogen fixation.', concept: 'nitrogen-fixation', topic: 'Part B' },
  { n: 20, part: 'B', prompt: 'Process carried out by industry.', status: 'ok', note: 'No deduction visible. Industry = combustion of fossil fuels.', concept: 'human-carbon-impact', topic: 'Part B' },
  { n: 21, part: 'C', prompt: 'Only 1% of energy passes to the next trophic level.', status: 'ok', note: 'Corrected to 10% (F). No deduction shown. The rule is ~10%, not 1%.', concept: 'energy-loss', topic: 'Part C' },
  { n: 22, part: 'C', prompt: 'Highest trophic level has more energy.', status: 'ok', note: 'Corrected "more" → "less" (F). No deduction shown.', concept: 'energy-pyramid', topic: 'Part C' },
  { n: 23, part: 'C', prompt: 'Shale is an abiotic factor.', status: 'ok', note: 'True. No deduction shown.', concept: 'biotic-abiotic', topic: 'Part C' },
  { n: 24, part: 'C', prompt: 'Plants use cellular respiration to capture energy for other trophic levels.', status: 'ok', note: 'Corrected to photosynthesis (F). No deduction shown.', concept: 'photosynthesis', topic: 'Part C' },
  { n: 25, part: 'C', prompt: 'Decomposers help release oxygen into the atmosphere.', status: 'accepted', note: 'Corrected to CO₂/C/N; teacher wrote "any of these". Clearest scientific answer: decomposers release CO₂ and nitrogen compounds (ammonia/ammonium) — not oxygen.', concept: 'feeding-roles', topic: 'Part C' },
  { n: 26, part: 'D', prompt: 'Pond food web + organism types/trophic levels.', status: 'written', note: 'Teacher sample answers show the web and roles. Duckweed/moss = producers; guppies = primary consumers; catfish = secondary; snail/ghost shrimp = decomposers. No per-question mark visible.', concept: 'food-web', topic: 'Written' },
  { n: 27, part: 'D', prompt: '245 000 units of energy at 10% efficiency.', status: 'written', note: 'Sample/working shows 245 000 → 24 500 → 2 450 → 245. This is the correct calculation chain.', concept: 'data-calculation', topic: 'Written' },
  { n: 28, part: 'D', prompt: 'One human impact on a biogeochemical cycle.', status: 'written', note: 'Teacher sample: combustion of fossil fuels returns CO₂ to the atmosphere at a high rate in the carbon cycle. Name the cycle + process + consequence.', concept: 'human-carbon-impact', topic: 'Written' },
  { n: 29, part: 'D', prompt: 'Long-term carbon capture + diagram.', status: 'written', note: 'Sample diagram: CO₂ → plants → dead matter → fossil fuels → industry → combustion → CO₂. Include CaCO₃/sedimentary rock/volcano for the long cycle.', concept: 'carbon-reservoirs', topic: 'Written' },
  { n: 30, part: 'D', prompt: 'What is a pyramid of numbers? Exception?', status: 'written', note: 'Sample: shows how many organisms are at each trophic level; a single tree (producer) can support many primary consumers, so it can invert.', concept: 'numbers-pyramid', topic: 'Written' },
  { n: 31, part: 'D', prompt: 'Reaction that absorbs light; word + chemical equation.', status: 'written', note: 'Sample: photosynthesis; 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂; carbon dioxide + water → glucose + oxygen.', concept: 'photosynthesis', topic: 'Written' },
  { n: 32, part: 'D', prompt: 'Why farmers add compost/manure.', status: 'written', note: 'Sample: organic nitrogen is decomposed (ammonification) and nitrified into nitrates, giving plants easier access without relying only on nitrogen-fixing bacteria.', concept: 'ammonification', topic: 'Written' },
  { n: 33, part: 'D', prompt: 'Oxygen lowest in a self-sustaining aquarium?', status: 'written', note: 'Sample: just before sunrise; respiration continues overnight while photosynthesis has stopped, so oxygen is depleted.', concept: 'photo-respiration-link', topic: 'Written' },
];

const STATUS_META: Record<Status, { label: string; cls: string; icon: string }> = {
  key: { label: 'Key-aligned', cls: 'chip-acid', icon: 'Check' },
  deduction: { label: 'Deduction', cls: 'chip-danger', icon: 'MinusCircle' },
  ok: { label: 'No deduction shown', cls: 'chip-mint', icon: 'CheckCircle2' },
  accepted: { label: 'Accepted correction', cls: 'chip-amber', icon: 'Info' },
  written: { label: 'Written / sample', cls: 'chip-violet', icon: 'PenLine' },
};

export function Autopsy() {
  const [filter, setFilter] = useState<'all' | 'deduction' | 'written'>('all');
  const rows = ROWS.filter((r) => filter === 'all' || (filter === 'deduction' ? r.status === 'deduction' : r.status === 'written'));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Test autopsy" title="Your practice test, read like evidence." description="A transparent breakdown of what the marked PDF actually shows — what is verified, what is uncertain, and the specific fixes that will earn the most marks." actions={<><LinkButton to="/learn/nitrogen-cycle" variant="primary" icon="Atom">Fix Part B</LinkButton><LinkButton to="/practice?mode=weak" icon="Crosshair">Targeted practice</LinkButton></>} />

      <Card className="overflow-hidden p-0" glow="rgba(255,138,101,0.12)">
        <div className="border-b border-line bg-[rgba(255,138,101,0.04)] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,138,101,0.1)] text-coral"><Icon name="FileSearch" size={16} /></span><div><div className="text-[9px] font-bold uppercase tracking-wider text-dim">Source file</div><div className="text-xs font-semibold">2026 – Biology Practice Test Solutions (05).pdf · 6 pages</div></div></div><span className="chip chip-amber"><Icon name="Info" size={10} />Marked solutions packet</span></div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="eyebrow mb-1">What is verified</div>
            <ul className="space-y-2 text-[12px] leading-relaxed text-muted">
              <li className="flex gap-2"><Icon name="Check" size={13} className="mt-0.5 shrink-0 text-mint" /><span><strong className="text-ink">All 15 multiple-choice highlight selections align with the answer key.</strong> The page has no visible MC deductions. Because this is a solutions copy, treat this as key alignment, not independent proof you can reproduce each answer under exam conditions.</span></li>
              <li className="flex gap-2"><Icon name="MinusCircle" size={13} className="mt-0.5 shrink-0 text-[#ff9a94]" /><span><strong className="text-ink">Part B has two recorded deductions:</strong> Q16 missing letter (−0.5), Q18 missing letter (−0.5) and an incorrect letter (0). The exact intended letter is not legible, so we do not invent it.</span></li>
              <li className="flex gap-2"><Icon name="PenLine" size={13} className="mt-0.5 shrink-0 text-violet" /><span><strong className="text-ink">The written pages contain teacher sample answers</strong> and worked calculations. No per-question marks or total /50 are filled in, so an overall score cannot be verified.</span></li>
              <li className="flex gap-2"><Icon name="Info" size={13} className="mt-0.5 shrink-0 text-amber" /><span><strong className="text-ink">Q25 correction:</strong> "oxygen" was changed to CO₂/C/N and the teacher wrote "any of these". The clearest answer is CO₂ + nitrogen compounds, not oxygen.</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-surface-2 p-4">
            <div className="eyebrow mb-2">Mark allocations shown</div>
            <div className="grid grid-cols-4 gap-2 text-center">{[{ l: 'K', v: '/22' }, { l: 'A', v: '/9' }, { l: 'C', v: '/12' }, { l: 'T', v: '/7' }].map((m) => <div key={m.l} className="rounded-lg border border-line bg-surface px-2 py-2"><div className="font-display text-lg font-semibold">{m.l}</div><div className="text-[9px] text-dim">{m.v}</div></div>)}</div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2"><span className="text-[10px] font-semibold text-muted">Overall</span><span className="font-display text-lg font-semibold text-dim">/50 <span className="text-[9px] font-normal">not filled</span></span></div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-dim">K = knowledge, A = application, C = communication, T = thinking. Sections: Part A [9K/6A], B [5K], C [4K/1A], D [4K/2A/12C/7T].</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[{ n: '01', title: 'Organism ↔ process matching', text: 'The only explicit deductions. Bacteria are the sharp edge: know which processes belong to them and match every required letter.', color: 'var(--coral)', link: '/learn/nitrogen-cycle', cta: 'Nitrogen lesson' },
          { n: '02', title: 'Decomposer outputs', text: 'Decomposers release CO₂ and nitrogen compounds such as ammonia/ammonium. They consume oxygen and do not release it as a key product.', color: 'var(--amber)', link: '/learn/energy-in-ecosystems', cta: 'Energy lesson' },
          { n: '03', title: 'Written precision', text: 'Name the cycle, the process, the direction and the consequence. The 10% calculations are already strong — protect them with units and steps.', color: 'var(--mint)', link: '/learn/connections-exam-skills', cta: 'Exam skills' }].map((p) => (
          <Card key={p.n} className="p-4" hover><div className="font-display text-2xl font-bold opacity-20" style={{ color: p.color }}>{p.n}</div><h3 className="mt-1 font-display text-base font-semibold">{p.title}</h3><p className="mt-1 text-[10.5px] leading-relaxed text-muted">{p.text}</p><Link to={p.link} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: p.color }}>{p.cta} <Icon name="ArrowRight" size={10} /></Link></Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionTitle title="Question ledger" description="Every visible item, mapped to the concept it tests." action={<div className="scroll-x">{([{ id: 'all', label: `All 33` }, { id: 'deduction', label: 'Deductions (2)' }, { id: 'written', label: 'Written (8)' }] as const).map((f) => <button key={f.id} onClick={() => setFilter(f.id)} className={cn('chip shrink-0', filter === f.id && 'chip-acid')}>{f.label}</button>)}</div>} />
        <div className="space-y-1.5">
          {rows.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <details key={r.n} className="group rounded-xl border border-line bg-surface-2 px-3 py-2.5">
                <summary className="flex cursor-pointer list-none items-center gap-2.5">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[9px] font-bold', r.status === 'deduction' ? 'border-[rgba(255,107,107,0.3)] text-[#ff9a94]' : 'border-line text-muted')}>Q{r.n}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{r.prompt}</span>
                  <span className={cn('chip shrink-0', meta.cls)}><Icon name={meta.icon} size={9} />{meta.label}</span>
                  <Icon name="ChevronDown" size={12} className="hidden shrink-0 text-dim transition-transform group-open:rotate-180 sm:block" />
                </summary>
                <div className="mt-2 border-t border-line pt-2 text-[10.5px] leading-relaxed text-muted">
                  <p>{r.note}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="chip">Part {r.part}</span>
                    {r.concept && <span className="chip">Concept: {CONCEPT_MAP[r.concept]?.name ?? r.concept}</span>}
                    {r.concept && <Link to={`/learn/${CONCEPT_MAP[r.concept]?.lessonId}?concept=${r.concept}`} className="text-[10px] font-semibold text-acid">Open lesson →</Link>}
                    {r.concept && <Link to={`/practice?mode=weak&concept=${r.concept}`} className="text-[10px] font-semibold text-muted hover:text-ink">Practise →</Link>}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
        <p className="mt-3 text-[9.5px] leading-relaxed text-dim">This ledger is based only on what is visible in the uploaded PDF. It does not invent a score, a teacher comment, or an answer the copy does not show. Questions marked "key-aligned" are not proof of independent mastery; the platform requires fresh evidence.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5"><div className="eyebrow mb-2">Your risk if you only reread</div><h3 className="font-display text-lg font-semibold">Recognition is not retrieval.</h3><p className="mt-1 text-[11px] leading-relaxed text-muted">The highlighted answers look familiar, but the exam asks you to produce the answer without a highlight. The engine therefore caps mastery from repeated easy items and requires new questions, harder difficulty and different formats.</p><div className="mt-3 flex flex-wrap gap-2"><LinkButton to="/practice?mode=diagnostic" variant="primary" size="sm" icon="ScanLine">Run the 10-question calibration</LinkButton><LinkButton to="/arcade/boss" size="sm" icon="Skull">Test it in a boss fight</LinkButton></div></Card>
        <Card className="p-5"><div className="eyebrow mb-2">High-yield next actions</div><div className="space-y-2">{['Re-do the Part B process table from memory, then check.', 'Explain why decomposers release CO₂ and nitrogen compounds, not oxygen.', 'Write one full human-impact answer with cycle + process + consequence.', 'Complete the nitrogen lesson quiz and the teacher-style mock.'].map((t, i) => <div key={t} className="flex gap-2 text-[10.5px] leading-relaxed text-muted"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line text-[8px] font-bold">{i + 1}</span>{t}</div>)}</div><LinkButton to="/learn/nitrogen-cycle" className="mt-3" size="sm" icon="Atom">Start with nitrogen</LinkButton></Card>
      </div>
    </div>
  );
}