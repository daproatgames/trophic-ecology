import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import type { Question, TopicId } from '../types';
import { CONCEPT_MAP, TOPICS, TOPIC_MAP } from '../data/concepts';
import { QUESTIONS } from '../data/questions';
import { buildReviewQueue, dailyChallengeFor, selectQuestions } from '../lib/learning';
import { Button, Card, Icon, LinkButton, Modal, PageHeader, ProgressBar, Ring, Segmented, TopicPill } from '../components/ui';
import { QuestionRunner, type QuestionResult } from '../components/QuestionRunner';
import { MatchingLab, SortingLab } from '../components/labs';
import { DiagramLab } from '../components/labs';

type Mode = 'diagnostic' | 'review' | 'weak' | 'mixed' | 'daily' | 'custom' | 'mistakes';
type Tab = 'drills' | 'library' | 'matching' | 'sorting' | 'diagrams';

interface Session {
  label: string;
  mode: Mode;
  questions: Question[];
  index: number;
  startedAt: number;
}

interface ResultItem {
  questionId: string;
  score: number;
}

const TYPE_LABEL: Record<Question['type'], string> = {
  mcq: 'MCQ', multi: 'Multi-select', truefalse: 'True/False', fill: 'Fill-in', short: 'Short answer', scenario: 'Scenario', error: 'Error analysis', causeeffect: 'Cause & effect', compare: 'Compare', teachback: 'Teach-back',
};

function buildDiagnostic(state: ReturnType<typeof useStudy>['state']): Question[] {
  const picked: Question[] = [];
  for (const topic of TOPICS) {
    const [q] = selectQuestions(state, {
      count: 1,
      topics: [topic.id],
      types: ['mcq', 'multi', 'fill', 'truefalse'],
      minDifficulty: 2,
      maxDifficulty: 3,
      excludeIds: picked.map((p) => p.id),
      avoidRecent: false,
    });
    if (q) picked.push(q);
  }
  const extra = selectQuestions(state, {
    count: 10 - picked.length,
    types: ['mcq', 'multi', 'fill', 'truefalse'],
    minDifficulty: 2,
    maxDifficulty: 4,
    excludeIds: picked.map((p) => p.id),
    avoidRecent: false,
  });
  return [...picked, ...extra].slice(0, 10);
}

function buildCustomQuestions(
  state: ReturnType<typeof useStudy>['state'],
  opts: { topic: TopicId | 'all'; count: number; difficulty: 'adaptive' | 'foundation' | 'challenge'; style: 'mixed' | 'mcq' | 'written'; concept?: string | null },
): Question[] {
  const types: Question['type'][] | undefined =
    opts.style === 'mcq' ? ['mcq', 'truefalse'] : opts.style === 'written' ? ['fill', 'short', 'scenario', 'error', 'causeeffect', 'compare'] : undefined;
  const range = opts.difficulty === 'foundation' ? { minDifficulty: 1, maxDifficulty: 2 } : opts.difficulty === 'challenge' ? { minDifficulty: 4, maxDifficulty: 5 } : {};
  return selectQuestions(state, {
    count: opts.count,
    types,
    topics: opts.topic === 'all' ? undefined : [opts.topic],
    prioritizeConcepts: opts.concept ? [opts.concept] : undefined,
    ...range,
  });
}

export function Practice() {
  const { state, analytics, recordSession } = useStudy();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('drills');
  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [customTopic, setCustomTopic] = useState<TopicId | 'all'>('all');
  const [customCount, setCustomCount] = useState(10);
  const [customDifficulty, setCustomDifficulty] = useState<'adaptive' | 'foundation' | 'challenge'>('adaptive');
  const [customStyle, setCustomStyle] = useState<'mixed' | 'mcq' | 'written'>('mixed');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<Question['type'] | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [visibleCount, setVisibleCount] = useState(18);
  const resultsRef = useRef<ResultItem[]>([]);
  const xpStartRef = useRef(state.xp);
  const sessionRecorded = useRef(false);
  const autoStarted = useRef(false);
  const conceptParam = params.get('concept');
  const modeParam = params.get('mode') as Mode | null;

  useEffect(() => {
    if (!session) return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [session]);

  const startSession = useCallback((label: string, mode: Mode, questions: Question[]) => {
    if (!questions.length) return;
    setSession({ label, mode, questions, index: 0, startedAt: Date.now() });
    setResults([]);
    resultsRef.current = [];
    setFinished(false);
    setElapsed(0);
    setConfirmEnd(false);
    setTab('drills');
    xpStartRef.current = state.xp;
    sessionRecorded.current = false;
    setParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setParams, state.xp]);

  const startMode = useCallback((mode: Mode) => {
    if (mode === 'daily') {
      const ids = state.dailyChallenge.questionIds.length ? state.dailyChallenge.questionIds : dailyChallengeFor(state);
      const qs = ids.map((id) => QUESTIONS.find((q) => q.id === id)).filter(Boolean) as Question[];
      if (qs.length) return startSession('Daily challenge', mode, qs);
    }
    if (mode === 'review') {
      const queue = buildReviewQueue(state, 12);
      if (queue.length) return startSession('Smart review', mode, queue);
      const qs = selectQuestions(state, { count: 10, prioritizeConcepts: analytics.weakest.map((w) => w.id) });
      return startSession('Weak-area review', mode, qs);
    }
    if (mode === 'diagnostic') {
      return startSession('10-question calibration', mode, buildDiagnostic(state));
    }
    if (mode === 'weak') {
      const qs = selectQuestions(state, {
        count: 12,
        prioritizeConcepts: conceptParam ? [conceptParam, ...analytics.weakest.map((w) => w.id)] : analytics.weakest.map((w) => w.id),
        excludeIds: [],
      });
      return startSession(conceptParam ? `Target: ${CONCEPT_MAP[conceptParam]?.name ?? 'weak concept'}` : 'Weakness drill', mode, qs);
    }
    if (mode === 'mistakes') return;
    const qs = selectQuestions(state, { count: 12 });
    startSession('Mixed mastery drill', 'mixed', qs);
  }, [analytics.weakest, conceptParam, startSession, state]);

  useEffect(() => {
    if (autoStarted.current) return;
    if (!modeParam) return;
    if (['daily', 'review', 'diagnostic', 'weak', 'mixed'].includes(modeParam)) {
      autoStarted.current = true;
      startMode(modeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishSession = useCallback(() => {
    if (!session) return;
    const finalResults = resultsRef.current;
    const correct = finalResults.filter((r) => r.score >= 0.7).length;
    if (!sessionRecorded.current) {
      sessionRecorded.current = true;
      recordSession({
        id: `session-${Date.now()}`,
        mode: session.mode,
        startedAt: session.startedAt,
        endedAt: Date.now(),
        questions: finalResults.length,
        correct,
        effectiveMs: Date.now() - session.startedAt,
      });
    }
    setFinished(true);
    setSession(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recordSession, session]);

  const handleNext = () => {
    if (!session) return;
    if (session.index + 1 >= session.questions.length) finishSession();
    else setSession({ ...session, index: session.index + 1 });
  };

  const handleResult = (r: QuestionResult) => {
    const item = { questionId: session?.questions[session.index]?.id ?? '', score: r.score };
    resultsRef.current = [...resultsRef.current, item];
    setResults(resultsRef.current);
  };

  const currentQuestion = session?.questions[session.index];
  const questionResults = results.filter((r) => r.questionId);
  const correctCount = questionResults.filter((r) => r.score >= 0.7).length;
  const xpGained = state.xp - xpStartRef.current;

  // Library filters
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return QUESTIONS.filter((q) => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (difficultyFilter === 'easy' && q.difficulty > 2) return false;
      if (difficultyFilter === 'medium' && (q.difficulty < 3 || q.difficulty > 3)) return false;
      if (difficultyFilter === 'hard' && q.difficulty < 4) return false;
      if (s) {
        const hay = `${q.prompt} ${q.concepts.map((c) => CONCEPT_MAP[c]?.name).join(' ')} ${q.source} ${q.options?.join(' ') ?? ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [search, topicFilter, typeFilter, difficultyFilter]);

  const missed = questionResults.filter((r) => r.score < 0.7).map((r) => r.questionId);
  const sessionTopics = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    questionResults.forEach((r) => {
      const q = QUESTIONS.find((x) => x.id === r.questionId);
      if (!q) return;
      if (!map[q.topic]) map[q.topic] = { correct: 0, total: 0 };
      map[q.topic].total += 1;
      if (r.score >= 0.7) map[q.topic].correct += 1;
    });
    return map;
  }, [questionResults]);

  if (finished) {
    const finalCorrect = questionResults.filter((r) => r.score >= 0.7).length;
    const pct = questionResults.length ? Math.round((finalCorrect / questionResults.length) * 100) : 0;
    const missedQuestions = [...new Set(missed)].map((id) => QUESTIONS.find((q) => q.id === id)).filter(Boolean) as Question[];
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Session complete" title={pct >= 80 ? 'Strong session. Evidence logged.' : pct >= 50 ? 'Progress logged. Review the misses.' : 'Useful data — now correct it.'} description="Every answer updated your mastery model, spaced-repetition schedule and readiness score. XP is secondary; the mistakes are the real study list." actions={<><LinkButton to="/" icon="LayoutDashboard">Basecamp</LinkButton><LinkButton to="/exam" variant="primary" icon="FileCheck2">Mock exam</LinkButton></>} />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card className="p-5" glow="rgba(183,243,74,0.12)">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <Ring value={pct} size={150} stroke={10}><span className="font-display text-4xl font-semibold">{pct}%</span><span className="text-[9px] uppercase tracking-wider text-dim">accuracy</span></Ring>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between text-sm"><span className="text-muted">Correct</span><span className="font-semibold">{finalCorrect} / {questionResults.length}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted">XP earned</span><span className="font-semibold text-acid">+{Math.max(0, xpGained)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted">Time</span><span className="font-semibold">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted">Best streak</span><span className="font-semibold">{state.bestSessionStreak}</span></div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="eyebrow mb-2">Topic breakdown</div>
            {Object.keys(sessionTopics).length === 0 ? <p className="text-xs text-muted">No topic data.</p> : (
              <div className="space-y-2.5">
                {TOPICS.filter((t) => sessionTopics[t.id]).map((t) => {
                  const d = sessionTopics[t.id];
                  const p = Math.round((d.correct / d.total) * 100);
                  return <div key={t.id}><div className="mb-1 flex justify-between text-[10.5px]"><span className="text-muted">{t.name}</span><span className="font-semibold" style={{ color: t.color }}>{d.correct}/{d.total}</span></div><ProgressBar value={p} color={t.color} height={4} /></div>;
                })}
              </div>
            )}
          </Card>
        </div>

        {missedQuestions.length > 0 && (
          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><div className="eyebrow mb-1">Correct these next</div><h2 className="font-display text-lg font-semibold">{missedQuestions.length} question{missedQuestions.length === 1 ? '' : 's'} to review</h2></div><Button size="sm" variant="primary" icon="RotateCcw" onClick={() => startSession('Mistake review', 'mistakes', missedQuestions)}>Review mistakes now</Button></div>
            <div className="space-y-2">
              {missedQuestions.map((q) => (
                <details key={q.id} className="rounded-xl border border-line bg-surface-2 p-3">
                  <summary className="cursor-pointer list-none text-xs font-semibold">{q.prompt}</summary>
                  <div className="mt-2 text-[11px] leading-relaxed text-muted">{q.explanation}</div>
                </details>
              ))}
            </div>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" icon="Dumbbell" onClick={() => startMode('mixed')}>New mixed drill</Button>
          <Button icon="Crosshair" onClick={() => startMode('weak')}>Target weakest concepts</Button>
          <LinkButton to="/lockin" icon="TimerReset">Lock in</LinkButton>
        </div>
      </div>
    );
  }

  if (session && currentQuestion) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="btn btn-icon" onClick={() => setConfirmEnd(true)} aria-label="End session"><Icon name="X" size={17} /></button>
            <div><div className="eyebrow">{session.label}</div><div className="text-xs font-semibold">{session.index + 1} of {session.questions.length} · {TOPIC_MAP[currentQuestion.topic].shortName}</div></div>
          </div>
          <div className="flex items-center gap-3 text-[10.5px]">
            <span className="flex items-center gap-1 font-bold text-[#7ee787]"><Icon name="CheckCircle2" size={13} />{correctCount}</span>
            <span className="flex items-center gap-1 font-bold text-[#ff9a94]"><Icon name="XCircle" size={13} />{questionResults.length - correctCount}</span>
            <span className="flex items-center gap-1 font-semibold text-muted"><Icon name="Flame" size={13} />{state.bestSessionStreak}</span>
            <span className="flex items-center gap-1 font-semibold text-muted tabular-nums"><Icon name="Clock3" size={13} />{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirmEnd(true)}>End</Button>
          </div>
        </div>
        <ProgressBar value={session.index} max={session.questions.length} height={5} />
        <Card className="p-5 sm:p-6">
          <QuestionRunner
            key={currentQuestion.id}
            question={currentQuestion}
            mode={`practice-${session.mode}`}
            index={session.index}
            total={session.questions.length}
            onComplete={handleResult}
            onNext={handleNext}
            nextLabel={session.index + 1 >= session.questions.length ? 'Finish session' : 'Next question'}
          />
        </Card>
        <div className="flex items-center justify-between text-[10px] text-dim">
          <span>Answers save automatically. Leaving early keeps completed evidence.</span>
          <span>Session streak: {state.bestSessionStreak}</span>
        </div>
        <Modal open={confirmEnd} onClose={() => setConfirmEnd(false)} title="End this session?" description="Your completed answers are already saved. The summary will include only the questions you finished." footer={<><Button variant="ghost" onClick={() => setConfirmEnd(false)}>Keep going</Button><Button variant="danger" onClick={finishSession}>End and see summary</Button></>}>
          <p className="text-sm leading-relaxed text-muted">You have answered {questionResults.length} of {session.questions.length} questions. Ending now will still update your mastery and spaced-repetition schedule.</p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice"
        title="Deliberate practice, not random clicking."
        description="Adaptive drills select questions based on your current mastery, due reviews and recent accuracy. Every format is graded with feedback and a transparent explanation."
        actions={<><LinkButton to="/autopsy" icon="ScanSearch">Test autopsy</LinkButton><LinkButton to="/exam" variant="primary" icon="FileCheck2">Exam simulator</LinkButton></>}
      />

      <div className="scroll-x">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'drills', label: 'Adaptive drills', icon: 'Target' },
            { value: 'library', label: `Question library (${QUESTIONS.length})`, icon: 'Library' },
            { value: 'matching', label: 'Matching lab', icon: 'Link2' },
            { value: 'sorting', label: 'Sorting lab', icon: 'ListFilter' },
            { value: 'diagrams', label: 'Diagram lab', icon: 'Waypoints' },
          ]}
        />
      </div>

      {conceptParam && tab === 'drills' && (
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(255,194,75,0.18)] bg-[rgba(255,194,75,0.05)] px-3 py-2.5 text-[11px] text-[#d9b876]"><Icon name="Crosshair" size={14} />Targeting {CONCEPT_MAP[conceptParam]?.name ?? conceptParam}. <Link to="/practice?mode=weak" className="font-semibold underline">Start targeted drill</Link></div>
      )}

      {tab === 'drills' && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { mode: 'diagnostic' as Mode, title: '10-question calibration', desc: 'One question from every topic plus three mixed. Best first session if you have little evidence.', icon: 'ScanLine', color: 'var(--acid)', meta: state.attempts.length < 8 ? 'Recommended now' : `${analytics.questionsAnswered} answers logged`, tag: '≈ 8 min' },
              { mode: 'review' as Mode, title: 'Smart review', desc: 'Due spaced-repetition questions plus your weakest concepts, interleaved to prevent predictability.', icon: 'RotateCcw', color: 'var(--mint)', meta: `${analytics.dueReviews} due questions`, tag: '≈ 10 min' },
              { mode: 'weak' as Mode, title: 'Weakness drill', desc: 'Twelve questions weighted toward your five lowest-mastery concepts. Difficulty adapts to current evidence.', icon: 'Crosshair', color: 'var(--amber)', meta: analytics.weakest[0] ? `Focus: ${CONCEPT_MAP[analytics.weakest[0].id]?.name}` : 'No weakness yet', tag: '≈ 10 min' },
              { mode: 'mixed' as Mode, title: 'Mixed mastery', desc: 'Interleaved retrieval across all seven topics. Harder questions appear as your mastery rises.', icon: 'Shuffle', color: 'var(--sky)', meta: `${analytics.overallMastery}% unit mastery`, tag: '≈ 12 min' },
              { mode: 'daily' as Mode, title: 'Daily challenge', desc: 'Five mixed questions. Protecting the daily streak is nice; the retrieval evidence is the real reward.', icon: 'Sun', color: 'var(--coral)', meta: state.dailyChallenge.completed ? 'Completed today' : `${state.dailyChallenge.answeredIds.length}/5 answered`, tag: '≈ 5 min' },
            ].map((d) => (
              <Card key={d.mode} className="flex flex-col justify-between p-4" hover>
                <div>
                  <div className="flex items-start justify-between gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${d.color}14`, color: d.color }}><Icon name={d.icon} size={17} /></span><span className="chip">{d.tag}</span></div>
                  <h3 className="mt-3 font-display text-base font-semibold">{d.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{d.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2"><span className="truncate text-[9.5px] font-semibold text-dim">{d.meta}</span><Button size="sm" variant={d.mode === 'diagnostic' && state.attempts.length < 8 ? 'primary' : 'default'} onClick={() => startMode(d.mode)} iconRight="ArrowRight">Start</Button></div>
              </Card>
            ))}

            <Card className="flex flex-col justify-between border-dashed p-4">
              <div><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(167,139,250,0.1)] text-violet"><Icon name="SlidersHorizontal" size={17} /></span><span className="chip">Custom</span></div><h3 className="mt-3 font-display text-base font-semibold">Build a drill</h3><p className="mt-1 text-[11px] leading-relaxed text-muted">Choose a topic, length, difficulty and format. This is deliberate practice, not a random quiz.</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select className="select h-8 px-2 py-0 text-[10px]" value={customTopic} onChange={(e) => setCustomTopic(e.target.value as TopicId | 'all')} aria-label="Topic"><option value="all">All topics</option>{TOPICS.map((t) => <option key={t.id} value={t.id}>{t.shortName}</option>)}</select>
                <select className="select h-8 px-2 py-0 text-[10px]" value={customCount} onChange={(e) => setCustomCount(Number(e.target.value))} aria-label="Question count">{[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} questions</option>)}</select>
                <select className="select h-8 px-2 py-0 text-[10px]" value={customDifficulty} onChange={(e) => setCustomDifficulty(e.target.value as typeof customDifficulty)} aria-label="Difficulty"><option value="adaptive">Adaptive</option><option value="foundation">Foundation</option><option value="challenge">Challenge</option></select>
                <select className="select h-8 px-2 py-0 text-[10px]" value={customStyle} onChange={(e) => setCustomStyle(e.target.value as typeof customStyle)} aria-label="Format"><option value="mixed">Mixed formats</option><option value="mcq">Multiple choice</option><option value="written">Written/applied</option></select>
              </div>
              <Button size="sm" className="mt-3 w-full" icon="Play" onClick={() => startSession('Custom drill', 'custom', buildCustomQuestions(state, { topic: customTopic, count: customCount, difficulty: customDifficulty, style: customStyle, concept: conceptParam }))}>Start custom drill</Button>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(183,243,74,0.1)] text-acid"><Icon name="Brain" size={17} /></span><div><h3 className="font-display text-base font-semibold">How adaptive selection works</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{[
                'Weak concepts are up-weighted 3–4×.',
                'Due review questions get priority.',
                'Recently seen questions are suppressed.',
                'Topics are interleaved, max two in a row.',
                'Difficulty targets ~75–80% success.',
                'Harder, varied evidence raises mastery caps.',
              ].map((t) => <div key={t} className="flex gap-2 text-[10.5px] leading-relaxed text-muted"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-acid" />{t}</div>)}</div></div></div>
            </Card>
            <Card className="p-4">
              <div className="eyebrow mb-1">Due now</div>
              <div className="flex items-end gap-4"><div><div className="font-display text-3xl font-semibold">{analytics.dueReviews}</div><div className="text-[9px] text-dim">question reviews</div></div><div><div className="font-display text-3xl font-semibold">{analytics.dueFlashcards}</div><div className="text-[9px] text-dim">flashcards</div></div></div>
              <Button size="sm" variant="primary" className="mt-3 w-full" icon="RotateCcw" onClick={() => startMode('review')}>Clear review queue</Button>
              <Link to="/arcade/flashcards" className="mt-2 block text-center text-[10px] font-semibold text-muted hover:text-ink">Review flashcards instead →</Link>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Your weakest concepts</span><Link to="/progress" className="text-[10px] font-semibold text-acid">Full tracker →</Link></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {analytics.weakest.map((w) => {
                const c = CONCEPT_MAP[w.id];
                return <Link key={w.id} to={`/practice?mode=weak&concept=${w.id}`} className="rounded-xl border border-line bg-surface-2 p-2.5 transition-colors hover:border-[var(--border-strong)]"><div className="truncate text-[10.5px] font-semibold">{c?.name ?? w.id}</div><div className="mt-1 flex items-center gap-1.5"><ProgressBar value={w.mastery} height={3} className="flex-1" /><span className="text-[9px] font-bold text-muted">{w.mastery}%</span></div></Link>;
              })}
            </div>
          </Card>
        </>
      )}

      {tab === 'library' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
              <div className="relative"><Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" /><input className="input h-9 pl-9 text-xs" placeholder="Search prompts, concepts, options…" value={search} onChange={(e) => { setSearch(e.target.value); setVisibleCount(18); }} aria-label="Search question bank" /></div>
              <select className="select h-9 py-0 text-xs" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value as TopicId | 'all')} aria-label="Filter by topic"><option value="all">All topics</option>{TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              <select className="select h-9 py-0 text-xs" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as Question['type'] | 'all')} aria-label="Filter by type"><option value="all">All formats</option>{Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <select className="select h-9 py-0 text-xs" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)} aria-label="Filter by difficulty"><option value="all">Any difficulty</option><option value="easy">Easy (D1–2)</option><option value="medium">Medium (D3)</option><option value="hard">Hard (D4–5)</option></select>
              <Button size="sm" variant="primary" icon="Play" disabled={filtered.length === 0} onClick={() => startSession('Filtered drill', 'custom', filtered.slice(0, 10))}>Practise 10</Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-dim"><span>{filtered.length} questions match</span><span>·</span><span>Click a card to try it alone, or start a 10-question filtered drill.</span></div>
          </Card>

          {filtered.length === 0 ? (
            <div className="empty-state"><Icon name="SearchX" size={24} className="mb-2 text-muted" /><h3 className="font-display text-lg font-semibold">No questions match</h3><p className="mt-1 text-xs text-muted">Clear the search or widen the filters.</p><Button className="mt-3" size="sm" onClick={() => { setSearch(''); setTopicFilter('all'); setTypeFilter('all'); setDifficultyFilter('all'); }}>Reset filters</Button></div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.slice(0, visibleCount).map((q) => (
                  <Card key={q.id} className="p-4" hover>
                    <div className="flex items-start justify-between gap-2"><div className="flex flex-wrap items-center gap-1.5"><TopicPill name={TOPIC_MAP[q.topic].shortName} color={TOPIC_MAP[q.topic].color} /><span className="chip">{TYPE_LABEL[q.type]}</span><span className="chip">D{q.difficulty}</span></div><button onClick={() => startSession('Single question', 'custom', [q])} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-muted hover:text-acid" aria-label="Try this question"><Icon name="Play" size={12} /></button></div>
                    <h3 className="mt-2.5 line-clamp-2 text-[12.5px] font-semibold leading-snug">{q.prompt}</h3>
                    <div className="mt-2 text-[9.5px] text-dim">{q.concepts.map((c) => CONCEPT_MAP[c]?.name).filter(Boolean).slice(0, 2).join(' · ')}</div>
                    <div className="mt-2.5 flex items-center justify-between"><span className="text-[9px] text-dim">{q.source}</span><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => startSession('Single question', 'custom', [q])}>Try it <Icon name="ArrowRight" size={10} /></Button></div>
                  </Card>
                ))}
              </div>
              {visibleCount < filtered.length && <div className="text-center"><Button onClick={() => setVisibleCount((n) => n + 18)} icon="ChevronDown">Show more ({filtered.length - visibleCount} remaining)</Button></div>}
            </>
          )}
        </div>
      )}

      {tab === 'matching' && <MatchingLab />}
      {tab === 'sorting' && <SortingLab />}
      {tab === 'diagrams' && <DiagramLab />}
    </div>
  );
}