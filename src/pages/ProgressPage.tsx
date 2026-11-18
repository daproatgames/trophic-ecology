import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { CONCEPTS, TOPICS, TOPIC_MAP } from '../data/concepts';
import { examPct } from '../lib/exam';
import { RadarChart, ReadinessBreakdown } from '../components/charts';
import { Card, Icon, LinkButton, PageHeader, ProgressBar, Ring, SectionTitle } from '../components/ui';

export function ProgressPage() {
  const { state, analytics } = useStudy();
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<'weak' | 'strong' | 'name'>('weak');
  const concepts = useMemo(() => CONCEPTS.filter((c) => filter === 'all' || c.topic === filter).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'weak' ? (analytics.conceptMastery[a.id] ?? 0) - (analytics.conceptMastery[b.id] ?? 0) : (analytics.conceptMastery[b.id] ?? 0) - (analytics.conceptMastery[a.id] ?? 0)), [filter, sort, analytics.conceptMastery]);
  const evidence = useMemo(() => {
    const map: Record<string, { count: number; last: number; due: number }> = {};
    for (const a of state.attempts) {
      for (const id of a.concepts) {
        if (!map[id]) map[id] = { count: 0, last: 0, due: 0 };
        map[id].count += 1;
        map[id].last = Math.max(map[id].last, a.at);
      }
    }
    return map;
  }, [state.attempts]);
  const remaining = CONCEPTS.filter((c) => (analytics.conceptMastery[c.id] ?? 0) < 70).length;
  const studyMinutes = Math.round(state.totalStudyMs / 60000);
  const recentSessions = state.sessions.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Progress & mastery" title="What the numbers actually mean." description="Mastery is evidence, not time spent. This page shows the concept-level model, spaced-repetition schedule and the exact readiness formula so you can see what to fix next." actions={<><LinkButton to="/practice?mode=weak" variant="primary" icon="Crosshair">Fix weakest</LinkButton><LinkButton to="/autopsy" icon="ScanSearch">Test autopsy</LinkButton></>} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5 sm:p-6" glow="rgba(183,243,74,0.1)">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Ring value={analytics.readiness} size={170} stroke={11}><span className="font-display text-4xl font-semibold">{analytics.readiness}%</span><span className="text-[9px] uppercase tracking-wider text-dim">test readiness</span></Ring>
            <div className="flex-1"><div className="eyebrow mb-2">Readiness breakdown</div><ReadinessBreakdown analytics={analytics} /><div className="mt-2 text-[9.5px] leading-relaxed text-dim">Formula: mastery 50% + coverage 15% + rigor 15% + recent 20% − unresolved weakness penalty.</div></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><div><div className="eyebrow mb-1">Unit coverage</div><div className="font-display text-3xl font-semibold">{analytics.conceptsStarted}<span className="text-base text-muted">/{CONCEPTS.length}</span></div></div><span className="chip chip-mint">{analytics.distinctQuestions} distinct questions</span></div>
          <div className="mt-3"><ProgressBar value={analytics.conceptsStarted} max={CONCEPTS.length} height={6} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg border border-line bg-surface-2 p-2.5 text-center"><div className="font-display text-xl font-semibold">{analytics.conceptsMastered}</div><div className="text-[8.5px] text-dim">mastered</div></div><div className="rounded-lg border border-line bg-surface-2 p-2.5 text-center"><div className="font-display text-xl font-semibold">{remaining}</div><div className="text-[8.5px] text-dim">below 70%</div></div><div className="rounded-lg border border-line bg-surface-2 p-2.5 text-center"><div className="font-display text-xl font-semibold">{analytics.dueReviews + analytics.dueFlashcards}</div><div className="text-[8.5px] text-dim">due reviews</div></div></div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">A concept only reaches 80%+ with distinct questions, harder items and at least two formats. Repeating one easy question caps at 45%.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <Card className="p-5"><SectionTitle title="Mastery map" description="Percent mastery by topic." /><div className="mx-auto max-w-[360px]"><RadarChart analytics={analytics} size={330} /></div><div className="mt-2 grid grid-cols-2 gap-1.5">{TOPICS.map((t) => <div key={t.id} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-[10px]"><span className="flex items-center gap-1.5 text-muted"><span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />{t.shortName}</span><span className="font-bold" style={{ color: t.color }}>{analytics.topicMastery[t.id]}%</span></div>)}</div></Card>

        <Card className="p-5"><SectionTitle title="Study history" description="Effective time and recent sessions." /><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-xl font-semibold">{Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m</div><div className="text-[8.5px] text-dim">effective time</div></div><div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-xl font-semibold">{analytics.questionsAnswered}</div><div className="text-[8.5px] text-dim">questions</div></div><div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-xl font-semibold">{analytics.correctPct}%</div><div className="text-[8.5px] text-dim">accuracy</div></div><div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-xl font-semibold">{state.streak.current}d</div><div className="text-[8.5px] text-dim">daily streak</div></div></div>
          <div className="mt-4"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-dim">Recent sessions</span><Link to="/lockin" className="text-[9.5px] font-semibold text-acid">Lock in →</Link></div>{recentSessions.length === 0 ? <p className="text-[10.5px] text-muted">No recorded sessions yet. Practice and Lock-In sessions appear here.</p> : <div className="space-y-1.5">{recentSessions.map((s) => <div key={s.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(183,243,74,0.08)] text-acid"><Icon name={s.mode === 'lock-in' ? 'Lock' : 'Dumbbell'} size={11} /></span><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-semibold">{s.mode === 'lock-in' ? 'Lock-In session' : s.mode}</div><div className="text-[8.5px] text-dim">{new Date(s.startedAt).toLocaleDateString()} · {Math.round(s.effectiveMs / 60000)} min · {s.questions} Q</div></div><span className="text-[9px] font-bold" style={{ color: s.questions && s.correct / s.questions >= 0.7 ? 'var(--mint)' : 'var(--amber)' }}>{s.questions ? Math.round((s.correct / s.questions) * 100) : 0}%</span></div>)}</div>}</div>
          {state.exams.length > 0 && <div className="mt-4 border-t border-line pt-3"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-dim">Mock exams</div><div className="space-y-1">{state.exams.slice(0, 3).map((e) => <Link key={e.id} to={`/exam/results/${e.id}`} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[10px]"><span className="truncate text-muted">{e.blueprintName}</span><span className="font-bold" style={{ color: examPct(e) >= 70 ? 'var(--mint)' : 'var(--amber)' }}>{examPct(e)}%</span></Link>)}</div></div>}
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Concept-level tracker" description="Every testable concept, sorted by weakness. Evidence count matters: one easy question cannot prove mastery." action={<div className="flex gap-2"><select className="select h-8 w-auto px-2 py-0 text-[10px]" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter concept topic"><option value="all">All topics</option>{TOPICS.map((t) => <option key={t.id} value={t.id}>{t.shortName}</option>)}</select><select className="select h-8 w-auto px-2 py-0 text-[10px]" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort concepts"><option value="weak">Weakest first</option><option value="strong">Strongest first</option><option value="name">A–Z</option></select></div>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead><tr className="border-b border-line text-[9px] uppercase tracking-wider text-dim"><th className="pb-2 pl-2">Concept</th><th className="pb-2">Topic</th><th className="w-40 pb-2">Mastery</th><th className="pb-2">Evidence</th><th className="pb-2">Last practised</th><th className="pb-2 pr-2 text-right">Action</th></tr></thead>
            <tbody>{concepts.map((c) => { const m = analytics.conceptMastery[c.id] ?? 0; const e = evidence[c.id]; const topic = TOPIC_MAP[c.topic]; return <tr key={c.id} className="border-b border-line/60 last:border-0"><td className="py-2.5 pl-2"><div className="text-[11px] font-semibold">{c.name}</div><div className="text-[9px] text-dim">{c.short}</div></td><td className="py-2.5"><Link to={`/learn/${c.lessonId}?concept=${c.id}`} className="chip" style={{ borderColor: `${topic.color}30`, color: topic.color }}>{topic.shortName}</Link></td><td className="py-2.5"><div className="flex items-center gap-2"><ProgressBar value={m} height={4} className="w-24" color={m >= 80 ? 'var(--mint)' : m < 35 ? 'var(--amber)' : undefined} /><span className="text-[10px] font-bold tabular-nums" style={{ color: m >= 80 ? 'var(--mint)' : 'var(--muted)' }}>{m}%</span></div></td><td className="py-2.5 text-[10px] text-muted">{e?.count ?? 0} answers</td><td className="py-2.5 text-[10px] text-dim">{e?.last ? new Date(e.last).toLocaleDateString() : '—'}</td><td className="py-2.5 pr-2 text-right"><div className="flex justify-end gap-1"><Link to={`/learn/${c.lessonId}?concept=${c.id}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-muted hover:text-acid" aria-label={`Lesson for ${c.name}`}><Icon name="BookOpen" size={11} /></Link><Link to={`/practice?mode=weak&concept=${c.id}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-muted hover:text-acid" aria-label={`Practise ${c.name}`}><Icon name="Dumbbell" size={11} /></Link></div></td></tr>; })}</tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[{ icon: 'Brain', title: 'Mastery caps', text: 'One easy question caps at 45%. One format caps at 75%. No hard evidence caps at 65%. Six+ distinct questions and three formats are needed for 100%.' }, { icon: 'Clock3', title: 'Spaced repetition', text: 'Correct answers return after 1, 3, 7 and 16+ days. A wrong answer returns in 30 minutes. Due reviews are prioritized in drills.' }, { icon: 'Route', title: 'Adaptive difficulty', text: 'The engine targets roughly 75–80% success. Strong recent accuracy raises difficulty; repeated misses lower it and trigger a lesson recommendation.' }].map((x) => <Card key={x.title} className="p-4"><div className="flex items-center gap-2 text-xs font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(183,243,74,0.07)] text-acid"><Icon name={x.icon} size={14} /></span>{x.title}</div><p className="mt-2 text-[10.5px] leading-relaxed text-muted">{x.text}</p></Card>)}
      </div>
    </div>
  );
}