import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { CONCEPT_MAP, TOPIC_MAP } from '../data/concepts';
import { LESSON_MAP } from '../data/lessons';
import { FLASHCARDS } from '../data/flashcards';
import { selectQuestions } from '../lib/learning';
import { Button, Card, Icon, LinkButton, Modal, PageHeader, ProgressBar, Ring, TopicPill, cn } from '../components/ui';
import { DiagramRenderer } from '../components/diagrams';
import { InlineQuestionSet } from '../components/InlineQuestionSet';
import { sound } from '../lib/sound';

type BlockType = 'learn' | 'recall' | 'review' | 'break' | 'assessment';
interface PlanBlock { id: string; type: BlockType; minutes: number; conceptId?: string; title: string; description: string }

const PLAN_LENGTHS: Record<number, number[]> = {
  25: [7, 5, 7, 2, 4],
  45: [7, 5, 8, 3, 7, 10, 5],
  50: [8, 6, 8, 4, 8, 6, 6, 4],
  90: [8, 6, 8, 4, 8, 6, 8, 4, 8, 6, 8, 4, 8, 4],
};

function buildPlan(duration: number, tomorrow: boolean, weakIds: string[]): PlanBlock[] {
  const concepts = weakIds.length ? weakIds : ['ecosystem-definition', 'nitrogen-fixation', 'photosynthesis', 'carbon-cycle'];
  const lengths = PLAN_LENGTHS[duration] ?? PLAN_LENGTHS[50];
  const types: BlockType[] = tomorrow
    ? ['learn', 'recall', 'review', 'break', 'learn', 'review', 'assessment']
    : ['learn', 'recall', 'review', 'break', 'learn', 'recall', 'review', 'assessment'];
  let conceptIndex = 0;
  return lengths.map((minutes, i) => {
    const type = tomorrow ? (['learn', 'recall', 'review', 'break', 'learn', 'review', 'assessment'] as BlockType[])[i] : types[i % types.length];
    const conceptId = concepts[conceptIndex % concepts.length];
    if (type === 'learn') conceptIndex++;
    const concept = CONCEPT_MAP[conceptId];
    const meta = type === 'learn' ? { title: `Learn: ${concept?.name ?? 'weak concept'}`, description: 'Read the targeted explanation, then mark it reviewed.' }
      : type === 'recall' ? { title: 'Active recall: flashcards', description: 'Flip, retrieve, then rate your confidence.' }
      : type === 'review' ? { title: 'Adaptive retrieval', description: 'Answer a short set weighted to your weakest concepts.' }
      : type === 'break' ? { title: 'Recovery break', description: 'Look away from the screen. Let the ideas settle.' }
      : { title: 'Quick assessment', description: 'Three questions to prove what stuck.' };
    return { id: `block-${i}`, type, minutes, conceptId, ...meta };
  });
}

function LearnBlock({ conceptId, onDone }: { conceptId: string; onDone: () => void }) {
  const { state, markSectionRead } = useStudy();
  const concept = CONCEPT_MAP[conceptId];
  const lesson = concept ? LESSON_MAP[concept.lessonId] : undefined;
  const section = useMemo(() => {
    if (!lesson || !concept) return undefined;
    return lesson.sections.find((s) => s.terms?.some((t) => t.term.toLowerCase().includes(concept.name.toLowerCase().split(' ')[0])) || s.body.some((b) => b.toLowerCase().includes(concept.name.toLowerCase().split(' ')[0]))) ?? lesson.sections[0];
  }, [lesson, concept]);
  const [reviewed, setReviewed] = useState(false);
  if (!lesson || !section || !concept) return null;
  const topic = TOPIC_MAP[lesson.topic];
  const already = state.lessons[lesson.id]?.sectionsRead.includes(section.id);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex flex-wrap items-center gap-2"><TopicPill name={topic.shortName} color={topic.color} /><span className="chip"><Icon name="Clock3" size={10} />Read + mark</span></div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{concept.name}</h2>
      <p className="mt-1 text-sm text-muted">{concept.short}</p>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: topic.color }}>{section.title}</div>
        <div className="mt-2 space-y-2.5">{section.body.map((p, i) => <p key={i} className="text-[13px] leading-relaxed text-muted">{p}</p>)}</div>
        <div className="mt-3 rounded-xl border border-[rgba(183,243,74,0.2)] bg-[rgba(183,243,74,0.04)] p-3"><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-acid"><Icon name="Sparkles" size={11} />Simpler</div><p className="mt-1 text-[11.5px] leading-relaxed text-muted">{section.simpler}</p></div>
        {section.terms && <div className="mt-3 grid gap-1.5 sm:grid-cols-2">{section.terms.map((t) => <div key={t.term} className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="text-[10px] font-semibold" style={{ color: topic.color }}>{t.term}</div><div className="mt-0.5 text-[10px] leading-relaxed text-muted">{t.def}</div></div>)}</div>}
        {section.visual && <div className="mt-3"><DiagramRenderer id={section.visual} /></div>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant={reviewed || already ? 'default' : 'primary'} size="sm" icon={reviewed || already ? 'Check' : 'BookOpen'} onClick={() => { markSectionRead(lesson.id, section.id); setReviewed(true); onDone(); }} disabled={reviewed}>{reviewed || already ? 'Section reviewed' : 'Mark reviewed & continue'}</Button>
        <Link to={`/learn/${lesson.id}?concept=${concept.id}`} className="text-[10px] font-semibold text-muted hover:text-ink">Open full lesson →</Link>
      </div>
      <div className="mt-3 rounded-lg border border-line bg-surface-2 p-2.5 text-[10px] leading-relaxed text-dim">Key facts: {lesson.keyFacts.slice(0, 2).join(' · ')}</div>
    </div>
  );
}

function RecallBlock({ conceptId, onDone }: { conceptId: string; onDone: () => void }) {
  const { rateFlashcard, state } = useStudy();
  const cards = useMemo(() => {
    const related = FLASHCARDS.filter((f) => f.conceptId === conceptId);
    return [...related, ...FLASHCARDS.filter((f) => f.conceptId !== conceptId)].slice(0, 5);
  }, [conceptId]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(0);
  const card = cards[index];
  if (!card) return null;
  const rate = (rating: 1 | 2 | 3 | 4) => {
    rateFlashcard(card.id, rating, true);
    setRated((r) => r + 1);
    sound.play(rating >= 3 ? 'correct' : 'wrong');
    if (index + 1 >= cards.length) onDone();
    else { setIndex((i) => i + 1); setFlipped(false); }
  };
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-2 flex items-center justify-between"><div><div className="eyebrow">Active recall</div><h2 className="font-display text-2xl font-semibold">Say it before you flip.</h2></div><span className="chip">{rated}/{cards.length} rated</span></div>
      <button onClick={() => { setFlipped((f) => !f); sound.play('flip'); }} className="w-full [perspective:1000px]">
        <div className={cn('relative min-h-[230px] rounded-2xl border border-line bg-surface p-6 text-center transition-transform duration-500 [transform-style:preserve-3d]', flipped && '[transform:rotateY(180deg)]')}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 [backface-visibility:hidden]"><span className="chip mb-3">{card.topic}</span><div className="font-display text-3xl font-semibold">{card.term}</div><p className="mt-2 text-[10px] text-dim">Tap or press Space to reveal</p></div>
          <div className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-[rgba(183,243,74,0.28)] bg-[#0b1710] p-6 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]"><div className="text-[9px] font-bold uppercase tracking-wider text-acid">Definition</div><p className="mt-2 text-sm leading-relaxed text-ink">{card.definition}</p>{card.example && <p className="mt-2 text-[10px] text-muted">Example: {card.example}</p>}</div>
        </div>
      </button>
      {flipped ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ r: 1, l: 'Again' }, { r: 2, l: 'Hard' }, { r: 3, l: 'Good' }, { r: 4, l: 'Easy' }].map((b) => <button key={b.l} onClick={() => rate(b.r as 1 | 2 | 3 | 4)} className={cn('rounded-lg border px-2 py-2 text-[10px] font-bold', b.r === 1 ? 'border-[rgba(255,107,107,0.25)] text-[#ffb4ad]' : b.r === 2 ? 'border-[rgba(255,194,75,0.25)] text-[#d9b876]' : b.r === 3 ? 'border-[rgba(77,225,193,0.25)] text-mint' : 'border-[rgba(183,243,74,0.25)] text-acid')}>{b.l}</button>)}</div> : <div className="mt-3 text-center"><Button size="sm" variant="primary" icon="FlipHorizontal2" onClick={() => { setFlipped(true); sound.play('flip'); }}>Reveal definition</Button></div>}
      <p className="mt-3 text-center text-[9.5px] text-dim">Next due: {state.flashcards[card.id]?.dueAt ? new Date(state.flashcards[card.id].dueAt).toLocaleDateString() : 'new card'}</p>
    </div>
  );
}

function ReviewBlock({ conceptId, onDone }: { conceptId: string; onDone: () => void }) {
  const { state } = useStudy();
  const [ids] = useState(() => selectQuestions(state, { count: 5, prioritizeConcepts: [conceptId], types: ['mcq', 'truefalse', 'fill', 'short'], avoidRecent: true }).map((q) => q.id));
  return <div className="mx-auto max-w-2xl"><div className="mb-2"><div className="eyebrow">Deliberate retrieval</div><h2 className="font-display text-2xl font-semibold">Five questions. Full focus.</h2></div><InlineQuestionSet ids={ids} mode="lockin-review" compact onFinish={onDone} finishLabel="Finish review block" /></div>;
}

function BreakBlock({ minutes }: { minutes: number }) {
  return (
    <div className="mx-auto max-w-md py-6 text-center">
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center"><div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(77,225,193,0.18),transparent_65%)]" /><div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-[rgba(77,225,193,0.3)] bg-[rgba(77,225,193,0.05)]"><Icon name="Wind" size={24} className="text-mint" /><span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-mint">{minutes} min</span></div></div>
      <h2 className="mt-4 font-display text-2xl font-semibold">Look away. Breathe.</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">No screens, no notes. Let your brain consolidate. The next block will resume automatically, or skip when ready.</p>
    </div>
  );
}

function AssessmentBlock({ weakIds, onDone }: { weakIds: string[]; onDone: (correct: number, total: number) => void }) {
  const { state } = useStudy();
  const [ids] = useState(() => selectQuestions(state, { count: 3, prioritizeConcepts: weakIds, types: ['mcq', 'truefalse'], avoidRecent: false }).map((q) => q.id));
  return <div className="mx-auto max-w-2xl"><div className="mb-2"><div className="eyebrow">Quick assessment</div><h2 className="font-display text-2xl font-semibold">Prove what stuck.</h2><p className="mt-1 text-[11px] text-muted">Three questions from your weakest areas. This is the exit ticket for the session.</p></div><InlineQuestionSet ids={ids} mode="lockin-assessment" onFinish={onDone} finishLabel="Finish assessment" /></div>;
}

export function LockIn() {
  const { state, analytics, recordSession, recordStudyTime } = useStudy();
  const [params] = useSearchParams();
  const [duration, setDuration] = useState(() => params.get('preset') === 'tomorrow' ? 45 : 50);
  const [tomorrow, setTomorrow] = useState(params.get('preset') === 'tomorrow');
  const [blockIndex, setBlockIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [blockDone, setBlockDone] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'session' | 'end'>('setup');
  const [effectiveSeconds, setEffectiveSeconds] = useState(0);
  const [assessment, setAssessment] = useState<{ correct: number; total: number } | null>(null);
  const [plan, setPlan] = useState<PlanBlock[]>([]);
  const effectiveRef = useRef(0);
  const remainingRef = useRef(0);
  const startAttempts = useRef(0);
  const recorded = useRef(false);
  const advanceRef = useRef<() => void>(() => {});
  const weakIds = analytics.weakest.map((w) => w.id);

  const preview = useMemo(() => buildPlan(duration, tomorrow, weakIds), [duration, tomorrow, weakIds]);
  const totalMinutes = preview.reduce((s, b) => s + b.minutes, 0);
  const block = plan[blockIndex];

  const begin = () => {
    const p = buildPlan(duration, tomorrow, weakIds);
    setPlan(p);
    setBlockIndex(0);
    setRemaining(p[0].minutes * 60);
    remainingRef.current = p[0].minutes * 60;
    effectiveRef.current = 0;
    setEffectiveSeconds(0);
    setPaused(false);
    setBlockDone(false);
    setAssessment(null);
    setPhase('session');
    recorded.current = false;
    startAttempts.current = state.attempts.length;
    sound.play('level');
  };

  const finish = () => {
    if (phase === 'end') return;
    const attempted = state.attempts.slice(startAttempts.current);
    const correct = attempted.filter((a) => a.correct >= 0.7).length;
    if (!recorded.current) {
      recorded.current = true;
      recordStudyTime(effectiveRef.current * 1000);
      recordSession({
        id: `lockin-${Date.now()}`,
        mode: 'lock-in',
        startedAt: Date.now() - effectiveRef.current * 1000,
        endedAt: Date.now(),
        questions: attempted.length,
        correct,
        effectiveMs: effectiveRef.current * 1000,
      });
    }
    setPhase('end');
    sound.play('win');
  };

  const advance = () => {
    if (blockIndex + 1 >= plan.length) { finish(); return; }
    setBlockIndex((i) => i + 1);
    setBlockDone(false);
    const next = plan[blockIndex + 1];
    setRemaining(next.minutes * 60);
    remainingRef.current = next.minutes * 60;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  advanceRef.current = advance;

  useEffect(() => {
    if (phase !== 'session' || paused) return;
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      effectiveRef.current += 1;
      setEffectiveSeconds(effectiveRef.current);
      const left = Math.max(0, remainingRef.current - 1);
      remainingRef.current = left;
      setRemaining(left);
      if (left <= 0) {
        advanceRef.current();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, paused, blockIndex]);

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Lock-In Mode" title="Maximum learning efficiency, not maximum screen time." description="A distraction-free session that alternates learning, active recall and adaptive review. Weak concepts are prioritized. The block timer pauses when you leave the tab." actions={<LinkButton to="/practice?mode=review" icon="RotateCcw">Clear reviews first</LinkButton>} />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-5" glow="rgba(183,243,74,0.12)">
            <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(183,243,74,0.1)] text-acid"><Icon name="TimerReset" size={19} /></span><div><div className="eyebrow mb-1">Choose a session</div><h2 className="font-display text-xl font-semibold">How long can you truly focus?</h2><p className="mt-1 text-[11px] leading-relaxed text-muted">Pick a duration. The plan alternates learn → recall → review, with breaks. Shorter is better than distracted.</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[25, 45, 50, 90].map((d) => <button key={d} onClick={() => { setDuration(d); setTomorrow(false); }} className={cn('rounded-xl border px-3 py-3 text-center transition-all', duration === d && !tomorrow ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.07)]' : 'border-line bg-surface-2 hover:border-[var(--border-strong)]')}><div className="font-display text-2xl font-semibold">{d}<span className="text-xs text-muted">m</span></div><div className="text-[9px] text-dim">{d === 25 ? 'Quick reset' : d === 45 ? 'Test tomorrow' : d === 50 ? 'Standard' : 'Deep session'}</div></button>)}
            </div>
            <button onClick={() => { setTomorrow(true); setDuration(45); }} className={cn('mt-2 w-full rounded-xl border p-3 text-left transition-all', tomorrow ? 'border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.05)]' : 'border-line bg-surface-2')}><div className="flex items-center gap-2"><Icon name="AlarmClock" size={15} className="text-coral" /><span className="text-xs font-semibold">My Test Is Tomorrow</span><span className="chip chip-danger ml-auto">High priority</span></div><p className="mt-1 text-[10px] leading-relaxed text-muted">A 45-minute emergency plan: two weakest lessons, active recall, adaptive review, and a quick exit assessment.</p></button>
            <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-dim">Plan preview · {totalMinutes} min</span><span className="text-[9px] text-dim">{preview.length} blocks</span></div><div className="space-y-1.5">{preview.map((b, i) => <div key={b.id} className="flex items-center gap-2 text-[10px]"><span className={cn('flex h-5 w-5 items-center justify-center rounded border text-[8px] font-bold', b.type === 'break' ? 'border-line text-dim' : 'border-[rgba(183,243,74,0.25)] bg-[rgba(183,243,74,0.05)] text-acid')}>{i + 1}</span><span className={cn('w-14 font-semibold', b.type === 'break' ? 'text-dim' : 'text-muted')}>{b.type}</span><span className="flex-1 truncate text-muted">{b.title}</span><span className="font-bold text-dim">{b.minutes}m</span></div>)}</div></div>
            <Button variant="primary" size="lg" className="mt-4 w-full" onClick={begin} icon="Lock">Lock in for {totalMinutes} minutes</Button>
            <p className="mt-2 text-center text-[9px] text-dim">The timer pauses when the tab is hidden. Effective time is what counts.</p>
          </Card>

          <div className="space-y-4">
            <Card className="p-5"><div className="eyebrow mb-2">What gets prioritized</div><div className="space-y-2">{analytics.weakest.slice(0, 4).map((w) => { const c = CONCEPT_MAP[w.id]; return <div key={w.id} className="flex items-center gap-2"><div className="min-w-0 flex-1"><div className="truncate text-[10.5px] font-semibold">{c?.name}</div><ProgressBar value={w.mastery} height={3} className="mt-1" /></div><span className="w-7 text-right text-[9px] font-bold text-muted">{w.mastery}%</span></div>; })}</div><p className="mt-3 text-[10px] leading-relaxed text-dim">The plan uses your current weakest concepts and updates as you answer. No passive video loops.</p></Card>
            <Card className="p-5"><div className="eyebrow mb-2">Session rules</div><div className="space-y-2 text-[10.5px] leading-relaxed text-muted">{['Phone face-down, other tabs closed.', 'Speak your retrieval answer before flipping.', 'Do not skip the break; consolidation is part of the method.', 'The final assessment is not optional scoring — it tells you what moved.'].map((r) => <div key={r} className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />{r}</div>)}</div></Card>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const attempted = state.attempts.slice(startAttempts.current);
    const correct = attempted.filter((a) => a.correct >= 0.7).length;
    const minutes = Math.max(1, Math.round(effectiveRef.current / 60));
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader eyebrow="Session complete" title="You locked in." description={`${minutes} effective minutes · ${attempted.length} questions attempted · ${correct} correct. The session is saved.`} actions={<LinkButton to="/" variant="primary" icon="LayoutDashboard">Back to basecamp</LinkButton>} />
        <Card className="p-5" glow="rgba(183,243,74,0.12)">
          <div className="flex flex-col items-center gap-5 sm:flex-row"><Ring value={attempted.length ? Math.round((correct / attempted.length) * 100) : 0} size={150} stroke={10}><span className="font-display text-3xl font-semibold">{attempted.length ? Math.round((correct / attempted.length) * 100) : 0}%</span><span className="text-[9px] uppercase tracking-wider text-dim">session accuracy</span></Ring><div className="w-full flex-1 space-y-2"><div className="flex justify-between text-sm"><span className="text-muted">Effective study time</span><span className="font-semibold">{minutes} min</span></div><div className="flex justify-between text-sm"><span className="text-muted">Questions</span><span className="font-semibold">{attempted.length}</span></div><div className="flex justify-between text-sm"><span className="text-muted">Quick assessment</span><span className="font-semibold">{assessment ? `${assessment.correct}/${assessment.total}` : 'not completed'}</span></div><div className="flex justify-between text-sm"><span className="text-muted">XP earned in session</span><span className="font-semibold text-acid">+{Math.max(2, Math.round(effectiveRef.current / 60) * 2)}</span></div></div></div>
        </Card>
        <Card className="p-5"><div className="eyebrow mb-2">What to do next</div><p className="text-xs leading-relaxed text-muted">Do not immediately start another long session. Use the next 10 minutes to clear due reviews or read the explanation for any question you missed. The best next action is on your dashboard.</p><div className="mt-3 flex flex-wrap gap-2"><LinkButton to="/practice?mode=review" variant="primary" size="sm" icon="RotateCcw">Clear due reviews</LinkButton><LinkButton to="/progress" size="sm" icon="ChartNoAxesCombined">See what changed</LinkButton></div></Card>
      </div>
    );
  }

  if (!block) return null;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const blockPct = Math.round(((block.minutes * 60 - remaining) / (block.minutes * 60)) * 100);
  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto bg-[var(--bg)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,243,74,0.07),transparent_70%)]" />
      <header className="sticky top-0 z-10 border-b border-line bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-acid text-[#0a1408]"><Icon name="Lock" size={14} /></span><div><div className="text-[8px] font-bold uppercase tracking-[0.18em] text-dim">Lock-In Mode</div><div className="text-[11px] font-semibold">Block {blockIndex + 1} of {plan.length} · {block.type}</div></div></div>
          <div className="flex items-center gap-2"><span className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-display text-lg font-semibold tabular-nums', remaining < 60 ? 'border-[rgba(255,107,107,0.4)] text-[#ff9a94]' : 'border-line bg-surface-2')}><Icon name="Clock3" size={13} />{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span><button onClick={() => setPaused((p) => !p)} className="btn btn-icon" aria-label={paused ? 'Resume' : 'Pause'}><Icon name={paused ? 'Play' : 'Pause'} size={15} /></button><button onClick={() => setConfirmExit(true)} className="btn btn-icon" aria-label="Exit session"><Icon name="X" size={16} /></button></div>
        </div>
        <ProgressBar value={blockIndex} max={plan.length} height={3} />
      </header>
      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><div className="eyebrow">{block.type} · {block.minutes} min block</div><h1 className="mt-0.5 font-display text-xl font-semibold">{block.title}</h1><p className="mt-0.5 text-[11px] text-muted">{block.description}</p></div><div className="flex items-center gap-2"><span className="chip">Effective {Math.floor(effectiveSeconds / 60)}m</span>{paused && <span className="chip chip-amber">Paused</span>}</div></div>
        <ProgressBar value={blockPct} max={100} height={4} className="mb-5" />
        {block.type === 'learn' && <LearnBlock key={block.id} conceptId={block.conceptId!} onDone={() => setBlockDone(true)} />}
        {block.type === 'recall' && <RecallBlock key={block.id} conceptId={block.conceptId!} onDone={() => setBlockDone(true)} />}
        {block.type === 'review' && <ReviewBlock key={block.id} conceptId={block.conceptId!} onDone={() => setBlockDone(true)} />}
        {block.type === 'break' && <BreakBlock minutes={block.minutes} />}
        {block.type === 'assessment' && <AssessmentBlock key={block.id} weakIds={weakIds} onDone={(correct, total) => { setAssessment({ correct, total }); setBlockDone(true); }} />}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4"><span className="text-[10px] text-dim">{block.type === 'break' ? 'Break time is part of the method.' : blockDone ? 'Block task complete.' : 'Complete the task when you are ready, or let the timer advance.'}</span><Button variant={blockDone || block.type === 'break' ? 'primary' : 'ghost'} size="sm" onClick={advance} iconRight="ArrowRight">{blockIndex + 1 >= plan.length ? 'Finish session' : block.type === 'break' ? 'Skip break' : 'Next block'}</Button></div>
      </main>
      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title="Exit Lock-In?" description="Your answered questions are already saved. The session summary will include the effective time completed so far." footer={<><Button variant="ghost" onClick={() => setConfirmExit(false)}>Keep focusing</Button><Button variant="primary" onClick={finish}>End session</Button></>}><p className="text-sm text-muted">This will end the block plan and record the work you have done. You can start a new session later.</p></Modal>
    </div>
  );
}