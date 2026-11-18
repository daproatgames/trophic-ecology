import { useMemo, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { Card, Icon, PageHeader, ProgressBar, Ring, cn } from '../components/ui';

const TIER = {
  bronze: { color: '#d9a26a', label: 'Bronze' },
  silver: { color: '#c6d3d0', label: 'Silver' },
  gold: { color: '#ffc24b', label: 'Gold' },
  platinum: { color: '#a78bfa', label: 'Platinum' },
};

export function Achievements() {
  const { state, analytics } = useStudy();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id]);
  const list = ACHIEVEMENTS.filter((a) => filter === 'all' || (filter === 'unlocked' ? !!state.achievements[a.id] : !state.achievements[a.id]));
  const totalXp = unlocked.reduce((s, a) => s + a.xp, 0);
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);
  const next = useMemo(() => ACHIEVEMENTS.filter((a) => !state.achievements[a.id]).sort((a, b) => {
    const pa = a.progress?.(state, analytics); const pb = b.progress?.(state, analytics);
    return (pb ? pb.value / pb.target : 0) - (pa ? pa.value / pa.target : 0);
  })[0], [state, analytics]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Achievements" title="Proof of work, not participation trophies." description="Every unlock is tied to a learning behaviour: correcting a mistake, answering hard questions, mastering a topic, defeating a boss or completing a full capstone." actions={<span className="chip chip-acid"><Icon name="Trophy" size={11} />{unlocked.length}/{ACHIEVEMENTS.length} unlocked</span>} />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5" glow="rgba(255,194,75,0.1)">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Ring value={pct} size={150} stroke={10} colorFrom="var(--amber)" colorTo="var(--acid)"><span className="font-display text-3xl font-semibold">{pct}%</span><span className="text-[9px] uppercase tracking-wider text-dim">trophy case</span></Ring>
            <div className="flex-1"><div className="eyebrow mb-1">Trophy case</div><h2 className="font-display text-xl font-semibold">{unlocked.length} of {ACHIEVEMENTS.length} earned</h2><p className="mt-1 text-[11px] leading-relaxed text-muted">Achievement XP is bonus recognition; it does not raise concept mastery. The learning evidence does that separately.</p><div className="mt-3 flex flex-wrap gap-2"><span className="chip chip-amber">{totalXp} bonus XP</span><span className="chip">{Object.keys(state.gameBests).length} game bests</span><span className="chip">{state.exams.length} exams</span></div></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="eyebrow mb-2">Closest to unlocking</div>
          {next ? <><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${TIER[next.tier].color}16`, color: TIER[next.tier].color }}><Icon name={next.icon} size={18} /></span><div><div className="text-sm font-semibold">{next.name}</div><div className="text-[10px] text-muted">{next.description}</div></div></div>{next.progress && (() => { const p = next.progress(state, analytics); return <div className="mt-3"><div className="mb-1 flex justify-between text-[9px] font-semibold text-dim"><span>Progress</span><span>{p.value}/{p.target}</span></div><ProgressBar value={p.value} max={p.target} height={5} /></div>; })()}<div className="mt-2 text-[9px] text-dim">Worth +{next.xp} XP</div></> : <p className="text-[11px] text-muted">All achievements unlocked. That is genuine unit mastery — now protect it with spaced review.</p>}
        </Card>
      </div>

      <div className="scroll-x">
        {([{ id: 'all', label: `All (${ACHIEVEMENTS.length})` }, { id: 'unlocked', label: `Unlocked (${unlocked.length})` }, { id: 'locked', label: `Locked (${ACHIEVEMENTS.length - unlocked.length})` }] as const).map((f) => <button key={f.id} onClick={() => setFilter(f.id)} className={cn('chip shrink-0', filter === f.id && 'chip-acid')}>{f.label}</button>)}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const isUnlocked = !!state.achievements[a.id];
          const p = a.progress?.(state, analytics);
          const tier = TIER[a.tier];
          return (
            <Card key={a.id} className={cn('p-4', !isUnlocked && 'opacity-85')} style={{ borderColor: isUnlocked ? `${tier.color}33` : undefined }}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: isUnlocked ? `${tier.color}44` : 'var(--border)', background: isUnlocked ? `${tier.color}14` : 'var(--surface-2)', color: isUnlocked ? tier.color : 'var(--muted-2)' }}><Icon name={isUnlocked ? a.icon : 'Lock'} size={18} /></span>
                <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-xs font-semibold">{a.name}</h3><span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: isUnlocked ? tier.color : 'var(--muted-2)' }}>{tier.label}</span></div><p className="mt-1 text-[10px] leading-relaxed text-muted">{a.description}</p></div>
              </div>
              {isUnlocked ? <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[9px]"><span className="flex items-center gap-1 font-semibold" style={{ color: tier.color }}><Icon name="CheckCircle2" size={11} />Unlocked {new Date(state.achievements[a.id]).toLocaleDateString()}</span><span className="font-bold text-acid">+{a.xp} XP</span></div> : <div className="mt-3 border-t border-line pt-2">{p ? <><div className="mb-1 flex justify-between text-[9px] font-semibold text-dim"><span>Progress</span><span>{p.value}/{p.target}</span></div><ProgressBar value={p.value} max={p.target} height={3} /></> : <div className="flex justify-between text-[9px] text-dim"><span>Not started</span><span>+{a.xp} XP</span></div>}</div>}
            </Card>
          );
        })}
      </div>

      <Card className="p-4 text-center"><p className="text-[10.5px] leading-relaxed text-muted"><strong className="text-ink">Why these conditions?</strong> Achievements reward correction, difficulty, breadth and persistence. Repeating the same easy multiple-choice question earns reduced XP and cannot unlock mastery trophies.</p></Card>
    </div>
  );
}