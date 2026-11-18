import { useMemo, useState } from 'react';
import { DIAGRAM_LABS, MATCHING_SETS, ORDER_SETS, SORTING_SETS } from '../data/labs';
import { DiagramCanvas } from './diagrams';
import { Button, Icon, ProgressBar, cn } from './ui';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingLab() {
  const [setIndex, setSetIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const set = MATCHING_SETS[setIndex];
  const rights = useMemo(() => shuffle(set.pairs.map((p, i) => ({ text: p.right, index: i }))), [set, round]);
  const complete = Object.keys(matched).length === set.pairs.length;
  const accuracy = set.pairs.length ? Math.round((set.pairs.length / Math.max(1, set.pairs.length + mistakes)) * 100) : 0;
  const score = Math.max(0, 1000 - mistakes * 40);

  const reset = (newSetIndex = setIndex) => {
    setSetIndex(newSetIndex);
    setSelectedLeft(null);
    setMatched({});
    setMistakes(0);
    setWrongFlash(null);
    setRound((r) => r + 1);
  };

  const chooseRight = (rightIndex: number) => {
    if (selectedLeft === null || matched[selectedLeft] !== undefined) return;
    if (rightIndex === selectedLeft) {
      setMatched((m) => ({ ...m, [selectedLeft]: rightIndex }));
      setSelectedLeft(null);
    } else {
      setMistakes((m) => m + 1);
      setWrongFlash(rightIndex);
      window.setTimeout(() => setWrongFlash(null), 450);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="scroll-x">
        {MATCHING_SETS.map((s, i) => (
          <button key={s.id} onClick={() => reset(i)} className={cn('chip shrink-0', i === setIndex && 'chip-acid')}>{s.title}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="font-display text-lg font-semibold">{set.title}</h3><p className="mt-0.5 text-[11px] text-muted">{set.description}</p></div>
          <div className="flex items-center gap-2"><span className="chip">{Object.keys(matched).length}/{set.pairs.length} pairs</span><span className="chip chip-danger">{mistakes} misses</span></div>
        </div>
        <ProgressBar value={Object.keys(matched).length} max={set.pairs.length} className="mb-4" height={4} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Terms</div>
            {set.pairs.map((p, i) => {
              const isMatched = matched[i] !== undefined;
              return (
                <button key={`l-${i}`} onClick={() => !isMatched && setSelectedLeft(i)} disabled={isMatched} className={cn('w-full rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all', isMatched ? 'border-[rgba(126,231,135,0.35)] bg-[rgba(126,231,135,0.06)] text-[#b8f3bd]' : selectedLeft === i ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.08)]' : 'border-line bg-surface-2 hover:border-line')}>
                  <span className="flex items-center gap-2">{isMatched && <Icon name="CheckCircle2" size={13} className="text-[#7ee787]" />}{p.left}</span>
                  {isMatched && <span className="mt-1 block pl-5 text-[10px] font-normal text-muted">{p.right}</span>}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Matches</div>
            {rights.map((r) => {
              const matchedAlready = Object.values(matched).includes(r.index);
              return (
                <button key={`r-${r.index}`} onClick={() => chooseRight(r.index)} disabled={matchedAlready} className={cn('w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-relaxed transition-all', matchedAlready ? 'border-[rgba(126,231,135,0.25)] bg-[rgba(126,231,135,0.04)] text-muted opacity-60' : wrongFlash === r.index ? 'animate-shake border-[rgba(255,107,107,0.55)] bg-[rgba(255,107,107,0.08)]' : 'border-line bg-surface-2 hover:border-line')}>
                  {r.text}
                </button>
              );
            })}
          </div>
        </div>
        {selectedLeft === null && !complete && <p className="mt-3 text-[10px] text-dim">Select a term on the left, then its match on the right. Wrong matches cost accuracy but teach the distinction.</p>}
        {complete && (
          <div className="mt-4 rounded-xl border border-[rgba(126,231,135,0.25)] bg-[rgba(126,231,135,0.05)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#b8f3bd]"><Icon name="Trophy" size={16} />Set complete — {accuracy}% accuracy</div>
              <div className="flex gap-2"><span className="chip chip-mint">{score} pts</span><Button size="sm" icon="RotateCcw" onClick={() => reset()}>Replay</Button></div>
            </div>
            <div className="mt-3 grid gap-1.5">
              {set.pairs.map((p, i) => (
                <div key={`${p.left}-${i}`} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[10.5px] leading-relaxed"><span className="font-semibold text-ink">{p.left}</span> — {p.right} <span className="text-dim">· {p.explanation}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SortingLab({ initialIndex = 0, onCheck }: { initialIndex?: number; onCheck?: (correct: number, total: number) => void }) {
  const [setIndex, setSetIndex] = useState(initialIndex);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const set = SORTING_SETS[setIndex];
  const allAssigned = Object.keys(assignments).length === set.items.length;
  const correctCount = checked ? set.items.filter((it, i) => assignments[i] === it.category).length : 0;
  const pct = Math.round((correctCount / set.items.length) * 100);

  const reset = (idx = setIndex) => { setSetIndex(idx); setAssignments({}); setChecked(false); setDragging(null); setSelected(null); };
  const assign = (index: number, category: string) => { setAssignments((a) => ({ ...a, [index]: category })); setSelected(null); setChecked(false); };

  return (
    <div className="space-y-4">
      <div className="scroll-x">
        {SORTING_SETS.map((s, i) => <button key={s.id} onClick={() => reset(i)} className={cn('chip shrink-0', i === setIndex && 'chip-acid')}>{s.title}</button>)}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="font-display text-lg font-semibold">{set.title}</h3><p className="mt-0.5 text-[11px] text-muted">{set.instruction}</p></div>
          <span className="chip">{Object.keys(assignments).length}/{set.items.length} placed</span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-line bg-surface-2 p-3">
          {set.items.map((item, i) => {
            const assigned = assignments[i];
            return (
              <button
                key={`${item.text}-${i}`}
                draggable={!assigned}
                onDragStart={() => setDragging(i)}
                onDragEnd={() => setDragging(null)}
                onClick={() => setSelected(selected === i ? null : i)}
                className={cn('rounded-lg border px-2.5 py-1.5 text-[10.5px] font-medium transition-all', assigned ? 'border-line bg-surface-3/40 text-dim' : dragging === i ? 'opacity-50' : selected === i ? 'border-[rgba(183,243,74,0.55)] bg-[rgba(183,243,74,0.08)]' : 'border-line bg-surface hover:border-[var(--border-strong)]')}
              >
                {item.text}
              </button>
            );
          })}
          {allAssigned && <span className="px-2 py-1.5 text-[10px] text-dim">All placed — check your answers.</span>}
        </div>
        <div className={cn('grid gap-2.5', set.categories.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-2')}>
          {set.categories.map((cat) => {
            const items = set.items.map((it, i) => ({ ...it, i })).filter((it) => assignments[it.i] === cat.id);
            return (
              <div
                key={cat.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragging !== null) assign(dragging, cat.id); }}
                onClick={() => { if (selected !== null) assign(selected, cat.id); }}
                className={cn('min-h-[110px] rounded-xl border border-dashed p-2.5 transition-colors', selected !== null ? 'border-[rgba(183,243,74,0.35)] bg-[rgba(183,243,74,0.025)]' : 'border-line bg-surface-2/50')}
              >
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</span><span className="text-[9px] text-dim">{items.length}</span></div>
                <div className="space-y-1.5">
                  {items.map((it) => {
                    const correct = assignments[it.i] === it.category;
                    return (
                      <button key={it.i} onClick={(e) => { e.stopPropagation(); setSelected(it.i); }} className={cn('w-full rounded-lg border px-2 py-1.5 text-left text-[10px] leading-snug', checked ? correct ? 'border-[rgba(126,231,135,0.4)] bg-[rgba(126,231,135,0.07)]' : 'border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.07)]' : 'border-line bg-surface')}>
                        {it.text}{checked && !correct && <span className="mt-0.5 block text-[8.5px] text-[#ffb4ad]">→ {set.categories.find((c) => c.id === it.category)?.label}: {it.explanation}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" disabled={!allAssigned} onClick={() => { setChecked(true); onCheck?.(set.items.filter((it, i) => assignments[i] === it.category).length, set.items.length); }} icon="Check">Check sorting</Button>
          <Button size="sm" variant="ghost" onClick={() => reset()} icon="RotateCcw">Reset</Button>
          {selected !== null && <span className="text-[10px] text-dim">Now tap a category (or drag the chip).</span>}
          {checked && <span className={cn('ml-auto chip', pct === 100 ? 'chip-mint' : pct >= 70 ? 'chip-amber' : 'chip-danger')}>{correctCount}/{set.items.length} correct · {pct}%</span>}
        </div>
        {checked && pct === 100 && <div className="mt-3 flex items-center gap-2 rounded-xl border border-[rgba(126,231,135,0.25)] bg-[rgba(126,231,135,0.05)] px-3 py-2 text-[11px] text-[#b8f3bd]"><Icon name="CheckCircle2" size={14} />Perfect classification. Evidence logged for this concept.</div>}
      </div>
    </div>
  );
}

export function DiagramLab({ initialIndex = 0, onCheck }: { initialIndex?: number; onCheck?: (correct: number, total: number) => void }) {
  const [labIndex, setLabIndex] = useState(initialIndex);
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const lab = DIAGRAM_LABS[labIndex];
  const bank = useMemo(() => shuffle(lab.bank), [lab]);
  const usedLabels = Object.values(assigned);
  const allAssigned = Object.keys(assigned).length === lab.zones.length;
  const correctCount = checked ? lab.zones.filter((z) => assigned[z.id] === z.label).length : 0;
  const pct = Math.round((correctCount / lab.zones.length) * 100);

  const reset = (idx = labIndex) => { setLabIndex(idx); setAssigned({}); setSelected(null); setChecked(false); setDragging(null); };
  const place = (zoneId: string, label: string) => {
    setAssigned((a) => {
      const cleaned = Object.fromEntries(Object.entries(a).filter(([, v]) => v !== label));
      return { ...cleaned, [zoneId]: label };
    });
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <div className="scroll-x">
        {DIAGRAM_LABS.map((l, i) => <button key={l.id} onClick={() => reset(i)} className={cn('chip shrink-0', i === labIndex && 'chip-acid')}>{l.title}</button>)}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="font-display text-lg font-semibold">{lab.title}</h3><p className="mt-0.5 text-[11px] text-muted">{lab.instruction}</p></div>
          <span className="chip">{Object.keys(assigned).length}/{lab.zones.length} labels</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-line" onDragOver={(e) => e.preventDefault()}>
          <DiagramCanvas id={lab.diagram} hideText />
          {lab.zones.map((z) => {
            const value = assigned[z.id];
            const correct = value === z.label;
            return (
              <button
                key={z.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragging) place(z.id, dragging); }}
                onClick={() => { if (selected) place(z.id, selected); else if (value) setAssigned((a) => { const n = { ...a }; delete n[z.id]; return n; }); }}
                className={cn('absolute flex min-h-[30px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border px-1.5 py-1 text-center text-[8.5px] font-bold leading-tight shadow-lg backdrop-blur-sm transition-all sm:w-[112px] sm:text-[9.5px]', value ? checked ? correct ? 'border-[rgba(126,231,135,0.6)] bg-[rgba(10,30,18,0.9)] text-[#b8f3bd]' : 'border-[rgba(255,107,107,0.6)] bg-[rgba(35,12,12,0.9)] text-[#ffb4ad]' : 'border-[rgba(183,243,74,0.45)] bg-[rgba(8,20,14,0.88)] text-acid' : selected ? 'border-[rgba(183,243,74,0.4)] bg-[rgba(10,22,16,0.85)] text-muted hover:bg-[rgba(183,243,74,0.08)]' : 'border-white/20 bg-black/55 text-dim hover:border-white/40')}
                style={{ left: `${z.x}%`, top: `${z.y}%` }}
                aria-label={`Zone ${z.id}`}
              >
                {value ?? 'drop label'}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {bank.map((label) => {
            const used = usedLabels.includes(label);
            return (
              <button
                key={label}
                draggable={!used}
                onDragStart={() => setDragging(label)}
                onDragEnd={() => setDragging(null)}
                onClick={() => !used && setSelected(selected === label ? null : label)}
                disabled={used}
                className={cn('rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all', used ? 'border-line bg-surface-3/30 text-dim opacity-50' : selected === label ? 'border-[rgba(183,243,74,0.55)] bg-[rgba(183,243,74,0.1)] text-acid' : 'border-line bg-surface-2 hover:border-[var(--border-strong)]')}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" disabled={!allAssigned} onClick={() => { setChecked(true); onCheck?.(lab.zones.filter((z) => assigned[z.id] === z.label).length, lab.zones.length); }} icon="Check">Check labels</Button>
          <Button variant="ghost" size="sm" onClick={() => reset()} icon="RotateCcw">Reset</Button>
          {selected && <span className="text-[10px] text-dim">Now tap a zone (or drag the label). Tap a placed label to remove it.</span>}
          {checked && <span className={cn('ml-auto chip', pct === 100 ? 'chip-mint' : pct >= 70 ? 'chip-amber' : 'chip-danger')}>{correctCount}/{lab.zones.length} correct · {pct}%</span>}
        </div>
        {checked && (
          <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-surface-2 p-3">
            {lab.zones.map((z) => {
              const correct = assigned[z.id] === z.label;
              return <div key={z.id} className="flex items-center gap-2 text-[10.5px]"><Icon name={correct ? 'CheckCircle2' : 'XCircle'} size={12} className={correct ? 'text-[#7ee787]' : 'text-[#ff9a94]'} /><span className="text-muted">{z.label}:</span><span className={correct ? 'text-[#b8f3bd]' : 'text-[#ffb4ad]'}>{assigned[z.id] ?? 'empty'}</span></div>;
            })}
            <p className="border-t border-line pt-2 text-[10px] leading-relaxed text-dim">{lab.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderLab({ initialIndex = 0, onCheck }: { initialIndex?: number; onCheck?: (correct: number, total: number) => void }) {
  const [setIndex, setSetIndex] = useState(initialIndex);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const set = ORDER_SETS[setIndex];
  const bank = useMemo(() => shuffle(set.steps.map((s) => s.text)), [set, setIndex]);
  const allPicked = picked.length === set.steps.length;
  const correct = checked ? set.steps.filter((s, i) => picked[i] === s.text).length : 0;
  const pct = Math.round((correct / set.steps.length) * 100);
  const reset = (idx = setIndex) => { setSetIndex(idx); setPicked([]); setChecked(false); };
  return (
    <div className="space-y-4">
      <div className="scroll-x">{ORDER_SETS.map((o, i) => <button key={o.id} onClick={() => reset(i)} className={cn('chip shrink-0', i === setIndex && 'chip-acid')}>{o.title}</button>)}</div>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-display text-lg font-semibold">{set.title}</h3><p className="mt-0.5 text-[11px] text-muted">{set.instruction}</p></div><span className="chip">{picked.length}/{set.steps.length} placed</span></div>
        <div className="my-3 min-h-[44px] rounded-xl border border-dashed border-line bg-surface-2 p-2.5">
          {picked.length === 0 ? <span className="text-[10px] text-dim">Click the steps below in the correct order. Click a placed step to remove it.</span> : <div className="flex flex-wrap gap-1.5">{picked.map((p, i) => <button key={`${p}-${i}`} onClick={() => { setPicked((x) => x.filter((_, j) => j !== i)); setChecked(false); }} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 text-[10px] font-medium"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-3 text-[8px] font-bold">{i + 1}</span>{p}<span className="text-dim">×</span></button>)}</div>}
        </div>
        <div className="flex flex-wrap gap-1.5">{bank.map((b) => <button key={b} onClick={() => { if (!picked.includes(b)) { setPicked((p) => [...p, b]); setChecked(false); } }} disabled={picked.includes(b)} className={cn('rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-colors', picked.includes(b) ? 'border-line bg-surface-3/30 text-dim opacity-40' : 'border-line bg-surface-2 hover:border-[var(--border-strong)]')}>{b}</button>)}</div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" disabled={!allPicked} onClick={() => { setChecked(true); onCheck?.(set.steps.filter((s, i) => picked[i] === s.text).length, set.steps.length); }} icon="Check">Check order</Button>
          <Button variant="ghost" size="sm" onClick={() => reset()} icon="RotateCcw">Reset</Button>
          {checked && <span className={cn('ml-auto chip', pct === 100 ? 'chip-mint' : pct >= 65 ? 'chip-amber' : 'chip-danger')}>{correct}/{set.steps.length} in place · {pct}%</span>}
        </div>
        {checked && <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-surface-2 p-3">{set.steps.map((st, i) => <div key={st.text} className="flex gap-2 text-[10px]"><span className="font-bold text-dim">{i + 1}.</span><span className={picked[i] === st.text ? 'text-[#b8f3bd]' : 'text-[#ffb4ad]'}>{st.text}</span><span className="text-dim">— {st.explanation}</span></div>)}<p className="border-t border-line pt-2 text-[10px] text-muted">{set.explanation}</p></div>}
      </div>
    </div>
  );
}
