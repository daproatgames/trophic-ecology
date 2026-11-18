import { useMemo } from 'react';
import { useStudy } from '../state/StudyContext';
import { LESSONS, LESSON_MAP } from '../data/lessons';
import { CONCEPT_MAP, TOPIC_MAP } from '../data/concepts';
import { Card, Icon, LinkButton, PageHeader, ProgressBar, Ring, SectionTitle, TopicPill } from '../components/ui';
import { MasteryDonut } from '../components/charts';

export function Learn() {
  const { state, analytics } = useStudy();
  const completed = Object.values(state.lessons).filter((l) => l.completed).length;
  const totalSections = LESSONS.reduce((s, l) => s + l.sections.length, 0);
  const readSections = LESSONS.reduce((s, l) => s + (state.lessons[l.id]?.sectionsRead.length ?? 0), 0);
  const overall = Math.round((readSections / totalSections) * 100);
  const recommendedLesson = useMemo(() => {
    const weakest = analytics.weakest[0];
    if (weakest) {
      const concept = CONCEPT_MAP[weakest.id];
      if (concept) return LESSON_MAP[concept.lessonId];
    }
    return LESSONS.find((l) => !state.lessons[l.id]?.completed) ?? LESSONS[0];
  }, [analytics.weakest, state.lessons]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning Hub"
        title="Six decks. Seven lessons. One connected system."
        description="Every lesson is built from your unit materials: definitions, diagrams, examples, misconceptions and retrieval checks. Use Explain It Simpler when a section feels dense, and Challenge Me when it feels easy."
        actions={<><LinkButton to="/practice" icon="Dumbbell">Practise instead</LinkButton><LinkButton to="/autopsy" variant="primary" icon="ScanSearch">Start with your gaps</LinkButton></>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-6" glow="rgba(183,243,74,0.12)">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Ring value={overall} size={132} stroke={9}>
              <span className="font-display text-3xl font-semibold">{overall}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-dim">read</span>
            </Ring>
            <div className="flex-1">
              <div className="eyebrow mb-1">Unit progress</div>
              <h2 className="font-display text-xl font-semibold">{completed}/7 lessons mastered</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">A lesson is complete when you mark every section read and score at least 80% on its end quiz. The challenge and teach-back are optional evidence boosters.</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-lg font-semibold">{readSections}</div><div className="text-[9px] text-dim">sections read</div></div>
                <div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-lg font-semibold">{totalSections}</div><div className="text-[9px] text-dim">total sections</div></div>
                <div className="rounded-lg border border-line bg-surface-2 p-2.5"><div className="font-display text-lg font-semibold">{analytics.overallMastery}%</div><div className="text-[9px] text-dim">unit mastery</div></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="eyebrow mb-2">Recommended start</div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${TOPIC_MAP[recommendedLesson.topic].color}16`, color: TOPIC_MAP[recommendedLesson.topic].color }}><Icon name="BookOpen" size={18} /></span>
            <div>
              <h3 className="font-display text-lg font-semibold">{recommendedLesson.title}</h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{recommendedLesson.subtitle}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-dim"><span>{recommendedLesson.sections.length} sections · {recommendedLesson.minutes} min</span><span>{state.lessons[recommendedLesson.id]?.sectionsRead.length ?? 0}/{recommendedLesson.sections.length} read</span></div>
          <ProgressBar value={state.lessons[recommendedLesson.id]?.sectionsRead.length ?? 0} max={recommendedLesson.sections.length} className="mt-1.5" height={4} />
          <LinkButton to={`/learn/${recommendedLesson.id}`} variant="primary" size="sm" className="mt-4 w-full" iconRight="ArrowRight">Continue lesson</LinkButton>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: 'Volume2', title: 'Explain It Simpler', text: 'Plain-language analogies layered on top of the exact course terminology. Toggle it globally or per section.' },
          { icon: 'Swords', title: 'Challenge Me', text: 'Two higher-difficulty application questions per lesson. Optional, but they unlock higher mastery caps.' },
          { icon: 'MessageSquare', title: 'Teach-Back', text: 'Explain the concept in your own words, compare against a model answer and score yourself honestly.' },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-acid"><Icon name={f.icon} size={15} /></span>
            <div><div className="text-xs font-semibold">{f.title}</div><p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{f.text}</p></div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle title="Study path" description="Follow the deck order or jump to a weakness. Every lesson is standalone." action={<span className="chip"><Icon name="Clock3" size={11} />≈ 2 hours total</span>} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LESSONS.map((lesson, i) => {
            const topic = TOPIC_MAP[lesson.topic];
            const lp = state.lessons[lesson.id];
            const read = lp?.sectionsRead.length ?? 0;
            const pct = Math.round((read / lesson.sections.length) * 100);
            const done = !!lp?.completed;
            return (
              <Card key={lesson.id} hover className="overflow-hidden p-0" glow={`${topic.color}20`}>
                <div className="relative h-[104px] overflow-hidden border-b border-line" style={{ background: `linear-gradient(135deg, ${topic.color}15, transparent 65%)` }}>
                  <div className="absolute -right-5 -top-8 font-display text-[110px] font-bold leading-none opacity-[0.055]" style={{ color: topic.color }}>{String(i + 1).padStart(2, '0')}</div>
                  <div className="absolute inset-0 flex items-start justify-between p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: `${topic.color}33`, background: `${topic.color}12`, color: topic.color }}><Icon name={topic.icon} size={18} /></span>
                    {done ? <span className="chip chip-mint"><Icon name="Check" size={10} />Mastered</span> : <span className="chip">{lesson.minutes} min</span>}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <TopicPill name={topic.shortName} color={topic.color} />
                    <MasteryDonut value={analytics.topicMastery[lesson.topic]} color={topic.color} size={40} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold leading-tight">{lesson.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{lesson.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between text-[9.5px] font-semibold text-dim"><span>{read}/{lesson.sections.length} sections</span><span>{lp?.quizBest != null ? `Quiz ${lp.quizBest}%` : 'No quiz yet'}</span></div>
                  <ProgressBar value={pct} className="mt-1.5" height={4} color={topic.color} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-dim">{lesson.keyFacts.length} key facts</span>
                    <LinkButton to={`/learn/${lesson.id}`} size="sm" variant={done ? 'default' : 'primary'} iconRight="ArrowRight">{done ? 'Review' : read > 0 ? 'Continue' : 'Open'}</LinkButton>
                  </div>
                </div>
              </Card>
            );
          })}

        </div>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(167,139,250,0.1)] text-violet"><Icon name="Brain" size={18} /></span>
          <div><h3 className="font-display text-base font-semibold">Reading is not mastery.</h3><p className="mt-0.5 max-w-2xl text-[11px] leading-relaxed text-muted">Each lesson ends with retrieval practice, and the mastery model only counts answer evidence. Use the lesson to build understanding, then prove it in Practice or the Arcade.</p></div>
        </div>
        <LinkButton to="/practice?mode=mixed" size="sm" icon="Dumbbell">Start mixed practice</LinkButton>
      </Card>
    </div>
  );
}