import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { EXAM_BLUEPRINTS, EXAM_MAP, buildExamPlan } from '../data/examBlueprints';
import { examPct, saveExamStart } from '../lib/exam';
import { downloadPracticePaper } from '../lib/pdf';
import { Button, Card, Icon, LinkButton, PageHeader, Toggle, cn } from '../components/ui';

export function Exam() {
  const { state, analytics } = useStudy();
  const [selected, setSelected] = useState('teacher-style');
  const [timed, setTimed] = useState(true);
  const [downloading, setDownloading] = useState<'paper' | 'key' | null>(null);
  const navigate = useNavigate();
  const blueprint = EXAM_MAP[selected];
  const recent = state.exams.slice(0, 5);

  const download = async (answerKey: boolean) => {
    setDownloading(answerKey ? 'key' : 'paper');
    try { await downloadPracticePaper(state, answerKey); }
    finally { setDownloading(null); }
  };

  const start = () => {
    const plan = buildExamPlan(state, selected);
    if (!plan.sections.some((s) => s.questions.length)) return;
    saveExamStart({ blueprintId: selected, timed });
    navigate('/exam/session');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exam simulator"
        title="Practise the test, not just the content."
        description="A distraction-free exam interface with flagging, navigation, timed and untimed modes, written answers, detailed marking and a topic-by-topic revision plan. All questions are fresh parallel items."
        actions={<><LinkButton to="/autopsy" icon="ScanSearch">Practice-test autopsy</LinkButton><LinkButton to="/practice" variant="ghost" icon="Dumbbell">Practice instead</LinkButton></>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-3">
          {EXAM_BLUEPRINTS.map((b) => (
            <button key={b.id} onClick={() => setSelected(b.id)} className={cn('w-full rounded-2xl border p-4 text-left transition-all sm:p-5', selected === b.id ? 'border-[rgba(183,243,74,0.45)] bg-[rgba(183,243,74,0.04)]' : 'border-line bg-surface hover:border-[var(--border-strong)]')}>
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${b.color}33`, background: `${b.color}12`, color: b.color }}><Icon name={b.icon} size={19} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                    {b.recommended && <span className="chip chip-acid">Recommended</span>}
                    {selected === b.id && <span className="chip chip-mint"><Icon name="Check" size={10} />Selected</span>}
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{b.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[9.5px] font-semibold text-dim"><span className="chip">{b.marks}</span><span className="chip"><Icon name="Clock3" size={10} />{b.minutes} min</span><span className="chip">{b.difficulty}</span></div>
                </div>
                <div className={cn('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', selected === b.id ? 'border-acid bg-acid text-[#0a1408]' : 'border-line')}>{selected === b.id && <Icon name="Check" size={12} strokeWidth={3} />}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-5" glow="rgba(183,243,74,0.12)">
            <div className="flex items-center justify-between"><div><div className="eyebrow mb-1">Your setup</div><h3 className="font-display text-lg font-semibold">{blueprint.name}</h3></div><span className="chip chip-acid">{blueprint.marks}</span></div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface-2 p-3">
              <div><div className="text-xs font-semibold">Timed mode</div><div className="mt-0.5 text-[10px] text-muted">{timed ? `${blueprint.minutes} minutes, auto-submit at 0:00` : 'No timer; finish when ready'}</div></div>
              <Toggle checked={timed} onChange={setTimed} label="Timed mode" />
            </div>
            <div className="mt-3 space-y-1.5 text-[10px] leading-relaxed text-muted">
              <div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Flag and revisit questions</div>
              <div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Answers auto-save in this tab</div>
              <div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Per-question explanations and marks</div>
              <div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />AI marking for written answers</div>
            </div>
            <Button variant="primary" size="lg" className="mt-4 w-full" onClick={start} icon="Play">Start exam</Button>
            <p className="mt-2 text-center text-[9px] leading-relaxed text-dim">Fresh questions. Approximate style and difficulty — not a copy of the uploaded test.</p>
          </Card>

          <Card className="p-4" glow="rgba(77,225,193,0.08)">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold"><Icon name="Printer" size={14} className="text-mint" />Printable teacher-style paper</div>
            <p className="text-[10px] leading-relaxed text-muted">A fresh 50-mark paper with Name/Date, Parts A–D, two-column options, matching blanks, answer lines and K/A/C/T boxes. Download it as a real PDF — no website chrome. The answer key matches the last blank paper generated in this tab.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="primary" icon="FileDown" onClick={() => void download(false)} disabled={downloading !== null}>{downloading === 'paper' ? 'Building…' : 'Blank PDF'}</Button>
              <Button size="sm" variant="ghost" icon="KeyRound" onClick={() => void download(true)} disabled={downloading !== null}>{downloading === 'key' ? 'Building…' : 'Answer key'}</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Recent exams</span><Link to="/progress" className="text-[9.5px] font-semibold text-acid">History →</Link></div>
            {recent.length === 0 ? <p className="text-[11px] leading-relaxed text-muted">No mock exams yet. The teacher-style paper is the closest simulation of your upcoming test.</p> : (
              <div className="space-y-1.5">{recent.map((e) => <Link key={e.id} to={`/exam/results/${e.id}`} className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-2 transition-colors hover:border-[var(--border-strong)]"><span className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: examPct(e) >= 70 ? 'rgba(77,225,193,0.1)' : 'rgba(255,194,75,0.1)', color: examPct(e) >= 70 ? 'var(--mint)' : 'var(--amber)' }}>{examPct(e)}%</span><div className="min-w-0 flex-1"><div className="truncate text-[10.5px] font-semibold">{e.blueprintName}</div><div className="text-[9px] text-dim">{new Date(e.at).toLocaleDateString()} · {e.totalEarned}/{e.totalPoints}</div></div><Icon name="ChevronRight" size={12} className="text-dim" /></Link>)}</div>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div><div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold"><Icon name="School" size={14} className="text-acid" />Teacher-style structure</div><p className="text-[10.5px] leading-relaxed text-muted">15 multiple choice, 5 process-matching items, 5 true/false items and 8 written questions worth 25 marks — a 50-mark parallel form.</p></div>
          <div><div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold"><Icon name="ShieldCheck" size={14} className="text-mint" />Fresh, not memorized</div><p className="text-[10.5px] leading-relaxed text-muted">The questions test the same concepts and command words as your practice test, but they are new items. No copied Q1–Q33.</p></div>
          <div><div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold"><Icon name="ChartNoAxesCombined" size={14} className="text-amber" />Marks as feedback</div><p className="text-[10.5px] leading-relaxed text-muted">Written answers are marked by AI against the model answer and marking points — not keyword matching — and each mark can be adjusted. The result updates exam history only; mastery gets its own evidence from practice.</p></div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: 'Your readiness', value: `${analytics.readiness}%`, icon: 'Target', color: 'var(--acid)' }, { label: 'Concepts at 80%+', value: `${analytics.conceptsMastered}/${Object.keys(analytics.conceptMastery).length}`, icon: 'Gem', color: 'var(--violet)' }, { label: 'Due reviews', value: analytics.dueReviews, icon: 'RotateCcw', color: 'var(--amber)' }].map((s) => <Card key={s.label} className="p-4"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wider text-dim">{s.label}</span><span style={{ color: s.color }}><Icon name={s.icon} size={14} /></span></div><div className="mt-2 font-display text-2xl font-semibold">{s.value}</div></Card>)}
      </div>
    </div>
  );
}