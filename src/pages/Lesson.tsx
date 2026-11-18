import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { LESSONS, LESSON_MAP } from '../data/lessons';
import { CONCEPT_MAP, TOPIC_MAP } from '../data/concepts';
import type { Question } from '../types';
import { Button, Card, Icon, LinkButton, Ring, TopicPill, cn } from '../components/ui';
import { DiagramRenderer } from '../components/diagrams';
import { InlineQuestionSet } from '../components/InlineQuestionSet';
import { QuestionRunner } from '../components/QuestionRunner';

export function Lesson() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const conceptId = params.get('concept');
  const { state, markSectionRead, saveLessonQuiz, completeLesson, markLessonFlag } = useStudy();
  const lesson = lessonId ? LESSON_MAP[lessonId] : undefined;
  const [simpler, setSimpler] = useState(false);
  const [active, setActive] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [showTeach, setShowTeach] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    setSimpler(!!state.lessons[lessonId ?? '']?.simplerUsed);
    setShowChallenge(false);
    setShowTeach(false);
  }, [lessonId]);

  useEffect(() => {
    if (!lesson) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.getAttribute('data-section');
          if (id) setActive(id);
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0.1 },
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="empty-state mx-auto mt-20 max-w-lg">
        <Icon name="BookX" size={28} className="mb-3 text-muted" />
        <h1 className="font-display text-xl font-semibold">Lesson not found</h1>
        <p className="mt-1 text-sm text-muted">The lesson link may be out of date.</p>
        <LinkButton to="/learn" variant="primary" className="mt-4" icon="ArrowLeft">Back to Learning Hub</LinkButton>
      </div>
    );
  }

  const topic = TOPIC_MAP[lesson.topic];
  const lp = state.lessons[lesson.id];
  const read = new Set(lp?.sectionsRead ?? []);
  const allRead = read.size >= lesson.sections.length;
  const quizBest = lp?.quizBest ?? 0;
  const completed = !!lp?.completed;
  const progress = Math.round((read.size / lesson.sections.length) * 100);
  const nextLesson = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1];
  const prevLesson = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) - 1];
  const concept = conceptId ? CONCEPT_MAP[conceptId] : null;

  const teachQuestion: Question = useMemo(() => ({
    id: `teach-${lesson.id}`,
    type: 'teachback',
    topic: lesson.topic,
    concepts: [lesson.topic === 'integration' ? 'cycle-integration' : 'exam-precision'],
    difficulty: 4,
    prompt: lesson.teachBack.prompt,
    rubric: lesson.teachBack.checklist.map((label) => ({
      label,
      synonyms: [label.toLowerCase(), ...((label.toLowerCase().match(/[a-z]{5,}/g) ?? []).slice(0, 4))],
    })),
    modelAnswer: lesson.keyFacts.join(' '),
    explanation: 'A strong teach-back answer uses the course terminology, states the mechanism, and gives a concrete example from the unit.',
    source: `Lesson: ${lesson.title}`,
  }), [lesson]);

  const toggleSimpler = () => {
    const next = !simpler;
    setSimpler(next);
    if (next) markLessonFlag(lesson.id, 'simplerUsed');
  };

  useEffect(() => {
    if (allRead && quizBest >= 80 && !completed) completeLesson(lesson.id);
  }, [allRead, quizBest, completed, lesson.id, completeLesson]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link to="/learn" className="flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-ink"><Icon name="ArrowLeft" size={13} />Learning Hub</Link>
        <span className="text-dim">/</span>
        <span className="text-[11px] text-dim">{lesson.title}</span>
        {concept && <><span className="text-dim">/</span><span className="chip chip-amber"><Icon name="Target" size={10} />Fixing {concept.name}</span></>}
      </div>

      <Card className="mb-5 overflow-hidden p-0" glow={`${topic.color}18`}>
        <div className="relative p-5 sm:p-7">
          <div className="absolute right-4 top-2 font-display text-[130px] font-bold leading-none opacity-[0.035]" style={{ color: topic.color }}>{String(LESSONS.findIndex((l) => l.id === lesson.id) + 1).padStart(2, '0')}</div>
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <TopicPill name={topic.name} color={topic.color} />
                <span className="chip"><Icon name="Clock3" size={11} />{lesson.minutes} min</span>
                <span className="chip"><Icon name="Layers" size={11} />{lesson.sections.length} sections</span>
                {completed && <span className="chip chip-mint"><Icon name="Check" size={11} />Mastered</span>}
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[40px]">{lesson.title}</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{lesson.subtitle}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant={simpler ? 'primary' : 'default'} size="sm" icon="Sparkles" onClick={toggleSimpler}>
                  {simpler ? 'Simpler mode on' : 'Explain It Simpler'}
                </Button>
                <Button size="sm" icon="Swords" onClick={() => { setShowChallenge((v) => !v); document.getElementById('challenge')?.scrollIntoView({ behavior: 'smooth' }); }}>Challenge Me</Button>
                <Button size="sm" icon="MessageSquare" onClick={() => { setShowTeach((v) => !v); document.getElementById('teachback')?.scrollIntoView({ behavior: 'smooth' }); }}>Teach-back</Button>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Ring value={progress} size={104} stroke={8}>
                <span className="font-display text-2xl font-semibold">{progress}%</span>
                <span className="text-[8px] uppercase tracking-wider text-dim">read</span>
              </Ring>
              <div className="space-y-1.5 text-[10.5px]">
                <div className="flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', allRead ? 'bg-mint' : 'bg-amber')} />{read.size}/{lesson.sections.length} sections read</div>
                <div className="flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', quizBest >= 80 ? 'bg-mint' : 'bg-amber')} />Quiz best: {lp?.quizBest != null ? `${quizBest}%` : 'not taken'}</div>
                <div className="flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', completed ? 'bg-mint' : 'bg-surface-3')} />{completed ? 'Lesson complete' : 'Completion: 80%+ quiz'}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[86px] space-y-3">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">In this lesson</span>
                <span className="text-[10px] font-bold text-dim">{read.size}/{lesson.sections.length}</span>
              </div>
              <nav className="space-y-1">
                {lesson.sections.map((s, i) => {
                  const isRead = read.has(s.id);
                  return (
                    <button key={s.id} onClick={() => { setActive(s.id); document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] transition-colors', active === s.id ? 'bg-surface-3 text-ink' : 'text-muted hover:bg-surface-2')}>
                      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold', isRead ? 'border-transparent bg-[rgba(77,225,193,0.15)] text-mint' : 'border-line text-dim')}>{isRead ? <Icon name="Check" size={10} /> : i + 1}</span>
                      <span className="line-clamp-2">{s.title}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-3 border-t border-line pt-3">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted" icon="Swords" onClick={() => setShowChallenge((v) => !v)}>Challenge Me</Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted" icon="MessageSquare" onClick={() => setShowTeach((v) => !v)}>Teach-back</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="eyebrow mb-2">Key facts to memorize</div>
              <ul className="space-y-2">
                {lesson.keyFacts.slice(0, 4).map((f) => <li key={f} className="flex gap-2 text-[10.5px] leading-relaxed text-muted"><span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: topic.color }} />{f}</li>)}
              </ul>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {lesson.sections.map((section, i) => {
            const isRead = read.has(section.id);
            return (
              <section key={section.id} id={`section-${section.id}`} data-section={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }} className="scroll-mt-24">
                <Card className="overflow-hidden p-0">
                  <div className="border-b border-line px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold" style={{ borderColor: `${topic.color}30`, background: `${topic.color}0d`, color: topic.color }}>{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <h2 className="font-display text-xl font-semibold tracking-tight">{section.title}</h2>
                          {section.terms?.[0] && <div className="mt-1 text-[10px] text-dim">Key term: {section.terms[0].term}</div>}
                        </div>
                      </div>
                      {isRead && <span className="chip chip-mint shrink-0"><Icon name="Check" size={10} />Read</span>}
                    </div>
                  </div>
                  <div className="lesson-body p-5 sm:p-6">
                    <div className="space-y-3">
                      {section.body.map((p, j) => <p key={j}>{p}</p>)}
                    </div>

                    {section.bullets && (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {section.bullets.map((b) => (
                          <li key={b} className="flex gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[12px] leading-relaxed">
                            <span className="mt-0.5 shrink-0" style={{ color: topic.color }}><Icon name="ChevronRight" size={13} /></span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.terms && section.terms.length > 0 && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {section.terms.map((t) => (
                          <div key={t.term} className="rounded-xl border border-line bg-surface-2 p-3">
                            <div className="text-[11px] font-bold" style={{ color: topic.color }}>{t.term}</div>
                            <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{t.def}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.visual && (
                      <div className="mt-4">
                        <DiagramRenderer id={section.visual} />
                      </div>
                    )}

                    {section.misconception && (
                      <div className="mt-4 rounded-xl border border-[rgba(255,138,101,0.22)] bg-[rgba(255,138,101,0.05)] p-3.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-coral"><Icon name="TriangleAlert" size={12} />Common misconception</div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted"><span className="font-semibold text-[#ffb9a9]">Myth:</span> {section.misconception.myth}</p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-muted"><span className="font-semibold text-[#7ee787]">Truth:</span> {section.misconception.truth}</p>
                      </div>
                    )}

                    {(simpler || section.simpler) && (
                      <div className={cn('mt-4 rounded-xl border border-[rgba(183,243,74,0.18)] bg-[rgba(183,243,74,0.04)] p-3.5 transition-all', !simpler && 'hidden')}>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-acid"><Icon name="Sparkles" size={12} />Explain it simpler</div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{section.simpler}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="text-[10px] text-dim">Concept evidence from this section counts only when you answer questions.</span>
                      <Button size="sm" variant={isRead ? 'default' : 'primary'} icon={isRead ? 'Check' : 'BookOpen'} onClick={() => markSectionRead(lesson.id, section.id)} disabled={isRead}>
                        {isRead ? 'Marked read' : 'Got it — mark read'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </section>
            );
          })}

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div><div className="eyebrow mb-1">Quick check</div><h2 className="font-display text-lg font-semibold">Three fast retrieval questions</h2><p className="mt-0.5 text-[11px] text-muted">Low stakes. These answers count as evidence, so answer honestly.</p></div>
              <span className="chip chip-mint"><Icon name="Zap" size={11} />3 Qs</span>
            </div>
            <InlineQuestionSet ids={lesson.quickCheck} mode="lesson-quick-check" compact />
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div><div className="eyebrow mb-1">End-of-lesson quiz</div><h2 className="font-display text-lg font-semibold">Prove it with five mixed questions</h2><p className="mt-0.5 text-[11px] text-muted">Score 80%+ after marking all sections read to complete the lesson. Retrying is allowed; only improvement is rewarded.</p></div>
              <div className="flex items-center gap-2">{quizBest > 0 && <span className="chip chip-amber">Best {quizBest}%</span>}<span className={cn('chip', allRead ? 'chip-mint' : '')}>{allRead ? 'Sections complete' : 'Read all sections first'}</span></div>
            </div>
            <InlineQuestionSet
              ids={lesson.quiz}
              mode="lesson-quiz"
              title="Lesson quiz"
              description="5 questions · mixed difficulty"
              onFinish={(correct, total) => {
                const pct = total ? Math.round((correct / total) * 100) : 0;
                saveLessonQuiz(lesson.id, correct, total);
                if (allRead && pct >= 80 && !completed) completeLesson(lesson.id);
              }}
              finishLabel="Submit quiz"
            />
            {completed && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[rgba(77,225,193,0.2)] bg-[rgba(77,225,193,0.05)] px-3 py-2.5 text-[11px] text-mint"><Icon name="Trophy" size={14} />Lesson mastered. Mastery now depends on harder, varied evidence.</div>
            )}
          </Card>

          <div id="challenge" className="scroll-mt-24">
            <Card className={cn('p-5', showChallenge ? '' : 'border-dashed')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,194,75,0.1)] text-amber"><Icon name="Swords" size={16} /></span>
                  <div><div className="eyebrow mb-1">Challenge Me</div><h2 className="font-display text-lg font-semibold">Harder application questions</h2><p className="mt-0.5 text-[11px] text-muted">These push beyond definitions. Completing them strengthens the rigor component of readiness.</p></div>
                </div>
                <Button size="sm" variant={showChallenge ? 'default' : 'primary'} icon={showChallenge ? 'ChevronUp' : 'Flame'} onClick={() => setShowChallenge((v) => !v)}>{showChallenge ? 'Hide challenge' : 'Reveal challenge'}</Button>
              </div>
              {showChallenge && (
                <div className="mt-4">
                  <InlineQuestionSet ids={lesson.challenge} mode="lesson-challenge" onFinish={() => markLessonFlag(lesson.id, 'challengeDone')} finishLabel="Finish challenge" />
                </div>
              )}
            </Card>
          </div>

          <div id="teachback" className="scroll-mt-24">
            <Card className={cn('p-5', showTeach ? '' : 'border-dashed')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(167,139,250,0.1)] text-violet"><Icon name="MessageSquare" size={16} /></span>
                  <div><div className="eyebrow mb-1">Teach-back</div><h2 className="font-display text-lg font-semibold">Explain it in your own words</h2><p className="mt-0.5 text-[11px] text-muted">The hardest test of understanding is explaining it simply. Write, compare with the model, then self-assess.</p></div>
                </div>
                <Button size="sm" variant={showTeach ? 'default' : 'primary'} icon="PenLine" onClick={() => setShowTeach((v) => !v)}>{showTeach ? 'Hide' : 'Start teach-back'}</Button>
              </div>
              {showTeach && (
                <div className="mt-4">
                  <QuestionRunner
                    question={teachQuestion}
                    mode="lesson-teachback"
                    onComplete={() => markLessonFlag(lesson.id, 'teachBackDone')}
                    showNext={false}
                  />
                  {lp?.teachBackDone && <div className="mt-3 flex items-center gap-2 text-[10.5px] text-mint"><Icon name="CheckCircle2" size={13} />Teach-back completed for this lesson.</div>}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row">
            {prevLesson ? <LinkButton to={`/learn/${prevLesson.id}`} icon="ArrowLeft" className="justify-start">Previous: {prevLesson.title}</LinkButton> : <span />}
            {nextLesson ? <LinkButton to={`/learn/${nextLesson.id}`} variant="primary" iconRight="ArrowRight" className="justify-end sm:justify-center">Next: {nextLesson.title}</LinkButton> : <LinkButton to="/practice?mode=mixed" variant="primary" iconRight="ArrowRight">Practice the unit</LinkButton>}
          </div>
        </div>
      </div>
    </div>
  );
}