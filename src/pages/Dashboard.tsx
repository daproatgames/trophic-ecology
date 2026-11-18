import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '../data/achievements';
import { CONCEPT_MAP, TOPIC_MAP } from '../data/concepts';
import { QUESTION_MAP } from '../data/questions';
import { LESSONS, LESSON_MAP } from '../data/lessons';
import { recommendations } from '../lib/learning';
import { ActivityBars, MasteryDonut, RadarChart, TopicBars } from '../components/charts';
import { Card, CountUp, Icon, InfoTip, LinkButton, ProgressBar, Ring, SectionTitle, cn } from '../components/ui';

function formatStudy(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late-night session';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const { state, analytics, ensureDailyChallenge } = useStudy();
  const rec = useMemo(() => recommendations(state, analytics), [state, analytics]);

  useEffect(() => {
    ensureDailyChallenge();
  }, [ensureDailyChallenge]);

  const dailyIds = state.dailyChallenge.questionIds;
  const daily = state.dailyChallenge;
  const dailyDone = daily.completed;
  const dailyAnswered = daily.answeredIds.length;
  const studyTime = formatStudy(state.totalStudyMs);
  const dueTotal = analytics.dueReviews + analytics.dueFlashcards;
  const weakest = analytics.weakest[0];
  const weakestConcept = weakest ? CONCEPT_MAP[weakest.id] : null;
  const nextLesson = useMemo(() => {
    if (weakestConcept) return LESSON_MAP[weakestConcept.lessonId];
    return LESSONS.find((l) => !state.lessons[l.id]?.completed) ?? LESSONS[0];
  }, [weakestConcept, state.lessons]);

  const readinessStatus = analytics.readiness >= 85 ? 'Mastery range' : analytics.readiness >= 70 ? 'Test ready' : analytics.readiness >= 50 ? 'On track' : analytics.readiness >= 25 ? 'Building' : 'Foundations';
  const statusColor = analytics.readiness >= 70 ? 'var(--mint)' : analytics.readiness >= 50 ? 'var(--acid)' : 'var(--amber)';

  const recentAttempts = [...state.attempts].reverse().slice(0, 5);
  const recentAchievements = Object.entries(state.achievements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, at]) => ({ ach: ACHIEVEMENT_MAP[id], at }))
    .filter((x) => x.ach);

  const weakestList = analytics.weakest.slice(0, 3).map((w) => ({ ...w, concept: CONCEPT_MAP[w.id], lesson: CONCEPT_MAP[w.id] ? LESSON_MAP[CONCEPT_MAP[w.id].lessonId] : undefined }));


  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-[rgba(183,243,74,0.14)] p-0" glow="rgba(183,243,74,0.14)">
        <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:p-8">
          <div className="relative z-10">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="chip chip-acid"><span className="h-1.5 w-1.5 rounded-full bg-acid" />UNIT 5 · ECOLOGY</span>
              {state.attempts.length < 8 ? <span className="chip chip-amber">Provisional baseline</span> : <span className="chip chip-mint">Live evidence</span>}
              <span className="chip"><Icon name="Target" size={11} />{analytics.conceptsStarted}/{Object.keys(CONCEPT_MAP).length} concepts touched</span>
            </div>
            <h1 className="max-w-2xl font-display text-[32px] font-semibold leading-[1.04] tracking-tight sm:text-[44px]">
              {greeting()}. <span className="text-muted">Let's turn understanding into</span> <span className="text-acid">test readiness.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Your marked practice test points to <strong className="font-semibold text-ink">Part B process matching</strong> and <strong className="font-semibold text-ink">written precision</strong> as the highest-value fixes. Build evidence across formats — not just easy repetitions.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <LinkButton to={rec.to} variant="primary" icon="Play" iconRight="ArrowRight" className="min-w-[190px]">{rec.cta}</LinkButton>
              <LinkButton to="/lockin?preset=tomorrow" icon="TimerReset">Lock in for 45 min</LinkButton>
              <LinkButton to="/exam" variant="ghost" icon="FileCheck2" className="hidden sm:inline-flex">Mock exam</LinkButton>
            </div>
            {state.attempts.length < 8 && (
              <div className="mt-4 flex items-start gap-2 text-[10.5px] leading-relaxed text-dim">
                <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
                <span>Readiness starts from a low-confidence estimate based on your marked paper. Real answers and harder questions quickly replace it. The 10-question calibration accelerates this.</span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 lg:pr-4">
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(183,243,74,0.14),transparent_65%)] blur-xl" />
              <Ring value={analytics.readiness} size={196} stroke={12}>
                <span className="font-display text-[46px] font-semibold leading-none tracking-tight"><CountUp value={analytics.readiness} /><span className="text-2xl text-muted">%</span></span>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: statusColor }}>{readinessStatus}</span>
                <span className="mt-1 text-[9px] text-dim">TEST READINESS</span>
              </Ring>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-line bg-surface-2/70 px-3 py-2">
                <div className="font-display text-lg font-semibold">{analytics.conceptsMastered}<span className="text-xs text-muted">/{Object.keys(CONCEPT_MAP).length}</span></div>
                <div className="text-[9px] uppercase tracking-wider text-dim">concepts mastered</div>
              </div>
              <div className="rounded-xl border border-line bg-surface-2/70 px-3 py-2">
                <div className="font-display text-lg font-semibold">{state.streak.current}<span className="text-xs text-muted">d</span></div>
                <div className="text-[9px] uppercase tracking-wider text-dim">daily streak</div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-t border-line bg-[rgba(0,0,0,0.12)] px-5 py-4 sm:px-7 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-2 text-[11px] text-muted"><Icon name="Activity" size={14} className="text-acid" /><span>Readiness = mastery 50% · coverage 15% · rigor 15% · recent 20% − weakness penalty</span></div>
            {[
              { label: 'Mastery', value: analytics.readinessParts.mastery, color: 'var(--acid)' },
              { label: 'Coverage', value: analytics.readinessParts.coverage, color: 'var(--mint)' },
              { label: 'Rigor', value: analytics.readinessParts.rigor, color: 'var(--amber)' },
              { label: 'Recent', value: analytics.readinessParts.recent, color: 'var(--sky)' },
            ].map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex justify-between text-[9.5px] font-semibold"><span className="text-dim">{p.label}</span><span style={{ color: p.color }}>{p.value}%</span></div>
                <div className="h-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Next move + daily challenge */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2" glow="rgba(77,225,193,0.12)">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(77,225,193,0.25)] bg-[rgba(77,225,193,0.08)] text-mint"><Icon name={rec.type === 'review' ? 'RotateCcw' : rec.type === 'lesson' ? 'BookOpen' : rec.type === 'game' ? 'Sword' : 'Target'} size={20} /></span>
              <div>
                <div className="eyebrow mb-1">Recommended next move</div>
                <h2 className="font-display text-xl font-semibold tracking-tight">{rec.title}</h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">{rec.description}</p>
              </div>
            </div>
            <span className="chip chip-mint"><Icon name="Sparkles" size={11} />Adaptive</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LinkButton to={rec.to} variant="primary" size="sm" iconRight="ArrowRight">{rec.cta}</LinkButton>
            {weakestConcept && <Link to={`/learn/${weakestConcept.lessonId}?concept=${weakestConcept.id}`} className="btn btn-sm" ><Icon name="BookOpen" size={14} />Review the concept</Link>}
            <span className="ml-auto text-[10px] text-dim">Selected from your weakest concept, due reviews and current readiness.</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5" glow="rgba(255,194,75,0.14)">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Daily challenge</div>
            {dailyDone ? <span className="chip chip-mint"><Icon name="Check" size={11} />Complete</span> : <span className="chip chip-amber">5 questions</span>}
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold">{dailyDone ? 'Today is locked in.' : 'Five questions. One clean win.'}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">{dailyDone ? `${daily.correct}/5 correct. The streak is protected; extra practice still counts toward mastery.` : 'A small mixed set from across the unit. Keep the daily streak alive.'}</p>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: Math.max(5, dailyIds.length) }).map((_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < dailyAnswered ? 'var(--acid)' : 'var(--surface-3)' }} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-dim">{dailyAnswered}/{dailyIds.length || 5} answered</span>
            <LinkButton to="/practice?mode=daily" size="sm" variant={dailyDone ? 'default' : 'primary'} iconRight="ArrowRight">{dailyDone ? 'Replay' : 'Start'}</LinkButton>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,194,75,0.18),transparent_70%)]" />
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Questions answered', value: analytics.questionsAnswered, icon: 'ListChecks', color: 'var(--acid)', sub: `${analytics.distinctQuestions} distinct` },
          { label: 'Correct rate', value: analytics.correctPct, icon: 'Target', color: 'var(--mint)', sub: `${analytics.hardCorrect} hard correct`, suffix: '%' },
          { label: 'Study time', value: studyTime, icon: 'Clock3', color: 'var(--sky)', sub: 'effective time', raw: true },
          { label: 'Concepts mastered', value: analytics.conceptsMastered, icon: 'Gem', color: 'var(--violet)', sub: '80%+ mastery' },
          { label: 'Reviews due', value: dueTotal, icon: 'RotateCcw', color: 'var(--amber)', sub: `${analytics.dueFlashcards} flashcards` },
          { label: 'Daily streak', value: state.streak.current, icon: 'Flame', color: 'var(--coral)', sub: `best ${state.streak.longest} days`, suffix: 'd' },
        ].map((s) => (
          <Card key={s.label} className="p-4" hover>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}14`, color: s.color }}><Icon name={s.icon} size={15} /></span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-dim">{s.label}</span>
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold leading-none tracking-tight">
              {s.raw ? s.value : <><CountUp value={s.value as number} />{s.suffix ?? ''}</>}
            </div>
            <div className="mt-1 text-[10px] text-dim">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Mastery + weakest */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-7">
          <SectionTitle title="Mastery map" description="Seven topic areas. High mastery requires varied formats and harder questions." action={<LinkButton to="/progress" size="sm" variant="ghost" iconRight="ArrowUpRight">Full breakdown</LinkButton>} />
          <div className="grid gap-5 md:grid-cols-[minmax(220px,0.9fr)_1.1fr] md:items-center">
            <div className="mx-auto w-full max-w-[330px]"><RadarChart analytics={analytics} size={300} /></div>
            <div><TopicBars analytics={analytics} /></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[10px] text-dim">
            <Icon name="Info" size={12} />
            <span>Mastery caps at 45% for one easy question · 75% for only one format · 100% requires 6+ distinct questions with hard evidence.</span>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card className="p-5">
            <SectionTitle title="Fix these first" description="Your lowest-mastery concepts right now." action={<Link to="/autopsy" className="text-[10px] font-semibold text-acid">Why? →</Link>} />
            <div className="space-y-2.5">
              {weakestList.map((w, i) => (
                <div key={w.id} className="group rounded-xl border border-line bg-surface-2 p-3 transition-colors hover:border-line">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-[10px] font-bold text-muted">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{w.concept?.name ?? w.id}</div>
                      <div className="mt-1 flex items-center gap-2"><ProgressBar value={w.mastery} className="flex-1" height={4} color={w.mastery < 30 ? 'amber' : undefined} /><span className="w-7 text-right text-[10px] font-bold tabular-nums text-muted">{w.mastery}%</span></div>
                    </div>
                    <Link to={`/practice?concept=${w.id}&mode=weak`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-acid" aria-label={`Practise ${w.concept?.name}`}><Icon name="ArrowRight" size={13} /></Link>
                  </div>
                </div>
              ))}
            </div>
            <LinkButton to="/practice?mode=weak" variant="primary" size="sm" className="mt-4 w-full" icon="Crosshair">Target the weakest concepts</LinkButton>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div><div className="eyebrow">Streak</div><div className="mt-1 flex items-baseline gap-2"><span className="font-display text-2xl font-semibold">{state.streak.current}</span><span className="text-xs text-muted">days</span></div></div>
              <div className="flex gap-1.5">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={cn('h-6 w-2 rounded-full', i < Math.min(7, state.streak.current) ? 'bg-acid' : 'bg-surface-3')} />)}</div>
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-dim">Current daily streak. Longest: {state.streak.longest} days. A day counts when you complete at least one meaningful answer or lesson section.</p>
          </Card>
        </div>
      </div>

      {/* Activity + review */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-7">
          <SectionTitle title="Last 7 days" description="Questions answered per day, with accuracy on hover." action={<span className="text-[10px] text-dim">{state.attempts.length ? `${state.attempts.length} total attempts` : 'No attempts yet'}</span>} />
          <ActivityBars attempts={state.attempts} />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
            <div><div className="text-[9px] uppercase tracking-wider text-dim">Recent accuracy</div><div className="mt-0.5 font-display text-lg font-semibold">{analytics.recentAccuracy}%</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-dim">Strongest</div><div className="mt-0.5 truncate text-xs font-semibold">{analytics.strongest[0] ? CONCEPT_MAP[analytics.strongest[0].id]?.name : '—'}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-dim">Weakest</div><div className="mt-0.5 truncate text-xs font-semibold">{weakestConcept?.name ?? '—'}</div></div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-5">
          <SectionTitle title="Retrieval queue" description="Spaced repetition keeps old answers from fading." action={<InfoTip text="Questions return after 1, 3, 7 and 16 days if answered correctly. Wrong answers return within 30 minutes." />} />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-line bg-surface-2 p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-dim"><Icon name="Repeat2" size={12} /> Questions due</div>
              <div className="mt-2 font-display text-2xl font-semibold">{analytics.dueReviews}</div>
              <Link to="/practice?mode=review" className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-acid">Smart review <Icon name="ArrowRight" size={10} /></Link>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-dim"><Icon name="Layers" size={12} /> Flashcards due</div>
              <div className="mt-2 font-display text-2xl font-semibold">{analytics.dueFlashcards}</div>
              <Link to="/arcade/flashcards" className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-acid">Review cards <Icon name="ArrowRight" size={10} /></Link>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted">Next lesson in your path</span>
              <Link to={`/learn/${nextLesson.id}`} className="text-[10px] font-semibold text-acid">Open →</Link>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${TOPIC_MAP[nextLesson.topic].color}16`, color: TOPIC_MAP[nextLesson.topic].color }}><Icon name="BookOpen" size={14} /></span>
              <div className="min-w-0"><div className="truncate text-xs font-semibold">{nextLesson.title}</div><div className="text-[10px] text-dim">{nextLesson.minutes} min · {nextLesson.sections.length} sections</div></div>
              <MasteryDonut value={analytics.topicMastery[nextLesson.topic]} color={TOPIC_MAP[nextLesson.topic].color} size={40} />
            </div>
          </div>
        </Card>
      </div>

      {/* Autopsy insight */}
      <Card className="p-5" glow="rgba(255,138,101,0.1)">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,138,101,0.25)] bg-[rgba(255,138,101,0.08)] text-coral"><Icon name="ScanSearch" size={18} /></span>
            <div>
              <div className="eyebrow mb-1">From your marked practice test</div>
              <h2 className="font-display text-lg font-semibold">Only the precision marks went missing — not the big ideas.</h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted">The marked copy shows Part B Q16 and Q18 deductions (missing letters; one incorrect letter). Q18 is the bacteria/process matching. Your written corrections also show a decomposer-output slip: CO₂ and nitrogen compounds, not oxygen.</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="chip chip-danger"><Icon name="MinusCircle" size={10} />Part B matching</span>
                <span className="chip chip-amber"><Icon name="Wind" size={10} />Decomposer outputs</span>
                <span className="chip chip-mint"><Icon name="Check" size={10} />10% calculations</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <LinkButton to="/autopsy" variant="primary" size="sm" icon="ScanSearch">Open autopsy</LinkButton>
            <LinkButton to="/learn/nitrogen-cycle" size="sm" icon="Atom">Nitrogen lesson</LinkButton>
          </div>
        </div>
      </Card>

      {/* Recent attempts + achievements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Recent evidence" description="Your last five answers." action={<LinkButton to="/practice" size="sm" variant="ghost" iconRight="ArrowUpRight">Practice</LinkButton>} />
          {recentAttempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface-2 p-5 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted"><Icon name="Compass" size={16} /></div>
              <p className="text-xs font-semibold">No evidence yet</p>
              <p className="mt-1 text-[10.5px] text-muted">Your first answer starts the adaptive model. Try the 10-question calibration.</p>
              <LinkButton to="/practice?mode=diagnostic" size="sm" variant="primary" className="mt-3" icon="Play">Start calibration</LinkButton>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentAttempts.map((a) => {
                const q = QUESTION_MAP[a.questionId];
                const c = CONCEPT_MAP[a.concepts[0]];
                return (
                  <div key={a.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', a.correct >= 0.7 ? 'bg-[rgba(126,231,135,0.12)] text-[#7ee787]' : 'bg-[rgba(255,107,107,0.12)] text-[#ff9a94]')}><Icon name={a.correct >= 0.7 ? 'Check' : 'X'} size={12} strokeWidth={3} /></span>
                    <div className="min-w-0 flex-1"><div className="truncate text-[11.5px] font-medium">{q?.prompt ?? a.questionId}</div><div className="text-[9.5px] text-dim">{c?.name ?? a.topic} · {a.mode}</div></div>
                    <span className="shrink-0 text-[9px] font-semibold text-dim">{new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="Trophy shelf" description="Meaningful learning milestones." action={<LinkButton to="/achievements" size="sm" variant="ghost" iconRight="ArrowUpRight">All {ACHIEVEMENTS.length}</LinkButton>} />
          {recentAchievements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface-2 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-dim"><Icon name="Lock" size={16} /></span>
                <div><div className="text-xs font-semibold">Nothing unlocked yet — and that's fine.</div><p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">Achievements require evidence: first answers, hard questions, corrected mistakes, boss wins and mastery. No participation trophies.</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ACHIEVEMENTS.slice(0, 3).map((a) => <span key={a.id} className="chip opacity-70"><Icon name={a.icon} size={10} />{a.name}</span>)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {recentAchievements.map(({ ach }) => (
                <div key={ach!.id} className="rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,194,75,0.1)] text-amber"><Icon name={ach!.icon} size={15} /></span><div className="min-w-0"><div className="truncate text-[11px] font-semibold">{ach!.name}</div><div className="text-[9px] text-dim">{ach!.tier}</div></div></div>
                  <div className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-muted">{ach!.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}