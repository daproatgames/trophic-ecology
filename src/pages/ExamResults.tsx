import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { QUESTION_MAP } from '../data/questions';
import { CONCEPT_MAP, TOPIC_MAP } from '../data/concepts';
import { LESSON_MAP } from '../data/lessons';
import { examPct, saveExamStart } from '../lib/exam';
import { formatAnswer } from '../lib/grading';
import { Button, Card, Icon, LinkButton, PageHeader, ProgressBar, Ring, cn } from '../components/ui';

const GRADE = (pct: number) => pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'Below target';
const SECTION_LABELS: Record<string, string> = { 'part-a': 'Part A — Multiple choice', 'part-b': 'Part B — Process matching', 'part-c': 'Part C — True or false', 'part-d': 'Part D — Written answers', mcq: 'Section A — Multiple choice', tf: 'Section B — True or false', fill: 'Section C — Fill in the blanks', short: 'Section D — Short answer', app: 'Section E — Application', multi: 'Section B — Multi-select', written: 'Section C — Written reasoning' };

export function ExamResults() {
  const { examId } = useParams();
  const { state, updateExamSelfScore } = useStudy();
  const navigate = useNavigate();
  const exam = state.exams.find((e) => e.id === examId);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'flagged' | 'written'>('all');
  if (!exam) {
    return <div className="empty-state mx-auto mt-20 max-w-lg"><Icon name="FileX" size={26} className="mb-2 text-muted" /><h1 className="font-display text-xl font-semibold">Result not found</h1><p className="mt-1 text-sm text-muted">This exam result is not in your saved progress.</p><LinkButton to="/exam" variant="primary" className="mt-4" icon="FileCheck2">Take a mock exam</LinkButton></div>;
  }
  const pct = examPct(exam);
  const mins = Math.round(exam.durationMs / 60000);
  const answers = exam.answers.map((a) => ({ ...a, q: QUESTION_MAP[a.questionId] })).filter((a) => a.q);
  const filtered = answers.filter((a) => {
    if (filter === 'wrong') return (a.score ?? 0) < 0.7;
    if (filter === 'flagged') return a.flagged;
    if (filter === 'written') return ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(a.q!.type);
    return true;
  });
  const topicRows = Object.entries(exam.byTopic).map(([id, d]) => ({ id, ...d, pct: d.total ? Math.round((d.earned / d.total) * 100) : 0, meta: TOPIC_MAP[id as keyof typeof TOPIC_MAP] })).sort((a, b) => a.pct - b.pct);
  const weakTopics = topicRows.filter((t) => t.pct < 70).slice(0, 3);
  const wrong = answers.filter((a) => (a.score ?? 0) < 0.7);
  const written = answers.filter((a) => ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(a.q!.type));
  const weakConcepts = [...new Set(wrong.flatMap((a) => a.q!.concepts))].map((id) => CONCEPT_MAP[id]).filter(Boolean).slice(0, 4);

  const retake = () => {
    saveExamStart({ blueprintId: exam.blueprintId, timed: exam.durationMs < 1000 * 60 * 90 });
    navigate('/exam/session');
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Exam results" title={`${GRADE(pct)} · ${pct}%`} description={`${exam.blueprintName} · ${exam.totalEarned}/${exam.totalPoints} marks · ${mins < 1 ? '<1 min' : `${mins} min`} used`} actions={<><Button variant="ghost" onClick={() => window.print()} icon="Printer">Print</Button><Button onClick={retake} icon="RotateCcw">Retake</Button><LinkButton to="/exam" variant="primary" icon="FileCheck2">New exam</LinkButton></>} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5" glow={pct >= 70 ? 'rgba(77,225,193,0.12)' : 'rgba(255,194,75,0.12)'}>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Ring value={pct} size={160} stroke={11} colorFrom={pct >= 70 ? 'var(--mint)' : 'var(--amber)'} colorTo={pct >= 70 ? 'var(--acid)' : 'var(--coral)'}>
              <span className="font-display text-4xl font-semibold">{pct}%</span><span className="text-[9px] uppercase tracking-wider text-dim">overall</span>
            </Ring>
            <div className="w-full flex-1">
              <div className="flex items-center justify-between text-sm"><span className="text-muted">Marks earned</span><span className="font-semibold">{exam.totalEarned} / {exam.totalPoints}</span></div>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted">Answered</span><span className="font-semibold">{answers.filter((a) => a.response !== null && String(a.response).trim() !== '').length}/{answers.length}</span></div>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted">Flagged</span><span className="font-semibold">{answers.filter((a) => a.flagged).length}</span></div>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted">Written self-check</span><span className="font-semibold text-amber">available below</span></div>
              <div className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[10px] leading-relaxed text-muted">{pct >= 80 ? 'Strong exam performance. Focus remaining time on written precision and the weakest topic below.' : pct >= 60 ? 'Solid foundation, but the written and application marks are where the next gains are.' : 'Use the topic breakdown and revision plan below. Do not simply retake; study the misses first.'}</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="eyebrow mb-2">Section breakdown</div>
          <div className="space-y-2.5">
            {Object.entries(exam.bySection).map(([id, d]) => {
              const p = d.total ? Math.round((d.earned / d.total) * 100) : 0;
              return <div key={id}><div className="mb-1 flex justify-between text-[10.5px]"><span className="text-muted">{SECTION_LABELS[id] ?? id}</span><span className="font-semibold">{d.earned}/{d.total}</span></div><ProgressBar value={p} height={4} color={p >= 70 ? 'var(--mint)' : 'var(--amber)'} /></div>;
            })}
          </div>
          <div className="mt-3 border-t border-line pt-2 text-[10px] leading-relaxed text-dim">Written marks are auto-scored by rubric keywords, then can be adjusted below. The practice test’s actual /50 was not filled in on your uploaded copy, so no comparison is invented.</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between"><span className="eyebrow">Topic performance</span><span className="text-[10px] text-dim">weakest first</span></div>
          <div className="space-y-3">{topicRows.map((t) => <div key={t.id}><div className="mb-1 flex justify-between text-[11px]"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: t.meta?.color }} />{t.meta?.name ?? t.id}</span><span className="font-semibold" style={{ color: t.meta?.color }}>{t.pct}% <span className="text-dim">({t.earned}/{t.total})</span></span></div><ProgressBar value={t.pct} height={4} color={t.meta?.color} /></div>)}</div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,194,75,0.1)] text-amber"><Icon name="Route" size={15} /></span><div><div className="eyebrow">Revision plan</div><h2 className="font-display text-base font-semibold">Fix these before the retake</h2></div></div>
          {weakTopics.length === 0 ? <p className="text-[11px] leading-relaxed text-muted">No topic below 70%. Keep interleaving practice and written explanations to protect the result.</p> : <div className="space-y-2">{weakTopics.map((t) => { const lesson = t.meta ? LESSON_MAP[`${t.id === 'foundations' ? 'ecology-foundations' : t.id === 'foodwebs' ? 'food-chains-webs' : t.id === 'pyramids' ? 'ecological-pyramids' : t.id === 'energy' ? 'energy-in-ecosystems' : t.id === 'cycles' ? 'water-carbon-cycles' : 'nitrogen-cycle'}`] : undefined; return <div key={t.id} className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="flex items-center justify-between text-[11px]"><span className="font-semibold">{t.meta?.name ?? t.id}</span><span className="font-bold" style={{ color: t.meta?.color }}>{t.pct}%</span></div><div className="mt-1 flex gap-2">{lesson && <Link to={`/learn/${lesson.id}`} className="text-[9.5px] font-semibold text-acid">Lesson →</Link>}<Link to={`/practice?mode=weak`} className="text-[9.5px] font-semibold text-muted hover:text-ink">Drill →</Link></div></div>; })}</div>}
          {weakConcepts.length > 0 && <div className="mt-3 border-t border-line pt-2"><div className="text-[9px] font-bold uppercase tracking-wider text-dim">Concepts to revisit</div><div className="mt-1.5 flex flex-wrap gap-1.5">{weakConcepts.map((c) => <Link key={c.id} to={`/learn/${c.lessonId}?concept=${c.id}`} className="chip hover:border-[var(--border-strong)]">{c.name}</Link>)}</div></div>}
          <Button variant="primary" size="sm" className="mt-3 w-full" onClick={retake} icon="RotateCcw">Retake this paper</Button>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><div className="eyebrow mb-1">Question review</div><h2 className="font-display text-lg font-semibold">Every mark explained</h2><p className="mt-0.5 text-[11px] text-muted">Use the filters to focus. For written answers, compare with the model answer and adjust your score honestly.</p></div>
          <div className="scroll-x">{([{ id: 'all', label: `All (${answers.length})` }, { id: 'wrong', label: `Incorrect (${wrong.length})` }, { id: 'flagged', label: `Flagged (${answers.filter((a) => a.flagged).length})` }, { id: 'written', label: `Written (${written.length})` }] as const).map((f) => <button key={f.id} onClick={() => setFilter(f.id)} className={cn('chip shrink-0', filter === f.id && 'chip-acid')}>{f.label}</button>)}</div>
        </div>
        <div className="space-y-3">
          {filtered.map((a) => {
            const q = a.q!;
            const score = a.score ?? 0;
            const points = a.points ?? 1;
            const earned = Math.round(score * points * 10) / 10;
            const isWritten = ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(q.type);
            const userResponse = Array.isArray(a.response) ? a.response.join(', ') : String(a.response ?? '—');
            return (
              <details key={a.questionId} className="group rounded-xl border border-line bg-surface-2 p-3.5" open={filter === 'wrong' && score < 0.7}>
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold', score >= 0.7 ? 'bg-[rgba(126,231,135,0.12)] text-[#7ee787]' : 'bg-[rgba(255,107,107,0.12)] text-[#ff9a94]')}>{score >= 0.7 ? '✓' : '×'}</span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><span className="chip">{q.type}</span><span className="chip">{TOPIC_MAP[q.topic].shortName}</span>{a.flagged && <span className="chip chip-amber"><Icon name="Flag" size={9} />Flagged</span>}</div><div className="mt-1.5 text-[11.5px] font-semibold leading-snug">{q.prompt}</div></div>
                  <span className="shrink-0 text-[10px] font-bold tabular-nums text-muted">{earned}/{points}</span>
                </summary>
                <div className="mt-3 space-y-2 border-t border-line pt-3 text-[10.5px] leading-relaxed">
                  <div className="rounded-lg border border-line bg-surface px-3 py-2"><span className="font-bold text-dim">Your answer:</span> <span className={score >= 0.7 ? 'text-[#b8f3bd]' : 'text-[#ffb4ad]'}>{userResponse || '— blank —'}</span></div>
                  <div className="rounded-lg border border-line bg-surface px-3 py-2"><span className="font-bold text-dim">Correct / model answer:</span> <span className="text-[#b8f3bd]">{q.type === 'fill' ? formatAnswer(q) : q.type === 'multi' || q.type === 'mcq' || q.type === 'truefalse' ? formatAnswer(q) : q.modelAnswer}</span></div>
                  <div className="rounded-lg border border-line bg-surface px-3 py-2 text-muted"><span className="font-bold text-dim">Why:</span> {q.explanation}</div>
                  {isWritten && (
                    <div className="rounded-lg border border-[rgba(255,194,75,0.2)] bg-[rgba(255,194,75,0.04)] p-2.5">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-amber">Self-check this written answer</div>
                      <p className="mt-1 text-[10px] text-muted">Auto-score: {Math.round(score * 100)}%. Read the model answer, then choose the mark you would actually award.</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">{([0, 0.5, 1] as const).map((s) => <button key={s} onClick={() => updateExamSelfScore(exam.id, a.questionId, s)} className={cn('btn btn-sm h-7 text-[10px]', Math.abs(score - s) < 0.01 && 'btn-primary')}>{s === 0 ? '0%' : s === 0.5 ? '50%' : '100%'}</button>)}<span className="self-center text-[9px] text-dim">updates your saved mark</span></div>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted">No questions match this filter.</p>}
        </div>
      </Card>
    </div>
  );
}