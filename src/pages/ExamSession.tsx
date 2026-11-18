import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import type { ExamAnswer } from '../types';
import type { ExamPlan } from '../data/examBlueprints';
import { buildExamPlan } from '../data/examBlueprints';
import { clearExamDraft, emptyAnswers, gradeExamPlan, examPct, loadExamDraft, loadExamStart, saveExamDraft } from '../lib/exam';
import { useCloud } from '../state/CloudContext';
import { Button, Icon, LinkButton, Modal, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

function hasResponse(a: ExamAnswer): boolean {
  if (Array.isArray(a.response)) return a.response.length > 0 && a.response.some((x) => String(x).trim());
  if (typeof a.response === 'boolean') return true;
  return String(a.response ?? '').trim().length > 0;
}

export function ExamSession() {
  const { state, saveExam } = useStudy();
  const { submitExam } = useCloud();
  const navigate = useNavigate();
  const startConfig = useMemo(() => loadExamStart(), []);
  const draft = useMemo(() => loadExamDraft(), []);
  const blueprintId = startConfig?.blueprintId ?? draft?.blueprintId;
  const timed = startConfig?.timed ?? draft?.timed ?? true;
  const [plan] = useState<ExamPlan | null>(() => {
    if (draft?.plan && (!blueprintId || draft.blueprintId === blueprintId)) return draft.plan;
    if (blueprintId) return buildExamPlan(state, blueprintId);
    return null;
  });
  const [answers, setAnswers] = useState<ExamAnswer[]>(() => {
    if (draft?.plan && plan && draft.blueprintId === plan.id && draft.answers?.length === emptyAnswers(plan).length) return draft.answers;
    return plan ? emptyAnswers(plan) : [];
  });
  const [index, setIndex] = useState(draft?.index ?? 0);
  const [startedAt] = useState(draft?.startedAt ?? Date.now());
  const [remaining, setRemaining] = useState(() => {
    if (!plan || !timed) return Infinity;
    const spent = draft ? (Date.now() - draft.startedAt) / 1000 : 0;
    return Math.max(0, plan.minutes * 60 - spent);
  });
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [saved, setSaved] = useState(true);
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

  const flat = useMemo(() => plan ? plan.sections.flatMap((s) => s.questions.map((q) => ({ ...q, sectionTitle: s.title, sectionId: s.id }))) : [], [plan]);
  const current = flat[index];
  const currentSection = plan?.sections.find((s) => s.id === current?.sectionId);
  const answeredCount = answers.filter(hasResponse).length;
  const flaggedCount = answers.filter((a) => a.flagged).length;

  useEffect(() => {
    if (!plan) return;
    setSaved(false);
    const t = window.setTimeout(() => {
      saveExamDraft({ blueprintId: plan.id, timed, answers, index, startedAt, planName: plan.name, plan });
      setSaved(true);
    }, 400);
    return () => window.clearTimeout(t);
  }, [answers, index, plan, startedAt, timed]);

  const submit = () => {
    if (!plan || submittedRef.current) return;
    submittedRef.current = true;
    const result = gradeExamPlan(plan, answers, startedAt, Date.now());
    clearExamDraft();
    saveExam(result);
    const pct = examPct(result);
    void submitExam(pct, pct);
    navigate(`/exam/results/${result.id}`);
  };

  const submittedRef = useRef(false);
  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    if (!plan || !timed) return;
    const t = window.setInterval(() => {
      const left = Math.max(0, remainingRef.current - 1);
      setRemaining(left);
      remainingRef.current = left;
      if (left <= 0) {
        window.clearInterval(t);
        submitRef.current();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [plan, timed]);

  useEffect(() => {
    if (!plan) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight' && index < flat.length - 1) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
      if (e.key.toLowerCase() === 'f') updateAnswer(answers[index]?.questionId, (a) => ({ ...a, flagged: !a.flagged }));
      if (current?.question.type === 'mcq' && ['1', '2', '3', '4'].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (current.question.options?.[i] !== undefined) updateAnswer(current.question.id, (a) => ({ ...a, response: i }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, flat.length, current?.question.id, answers]);

  if (!plan || !current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
        <div className="empty-state max-w-md"><Icon name="FileWarning" size={28} className="mb-3 text-muted" /><h1 className="font-display text-xl font-semibold">No exam in progress</h1><p className="mt-1 text-sm text-muted">Start a paper from the exam simulator. If you refreshed, the saved draft may have expired.</p><LinkButton to="/exam" variant="primary" className="mt-4" icon="ArrowLeft">Back to exams</LinkButton></div>
      </div>
    );
  }

  const answer = answers[index];
  const section = plan.sections.find((s) => s.id === answer.section);

  const updateAnswer = (questionId: string | undefined, updater: (a: ExamAnswer) => ExamAnswer) => {
    if (!questionId) return;
    setAnswers((prev) => prev.map((a) => a.questionId === questionId ? updater(a) : a));
    setSaved(false);
    sound.play('select');
  };

  const setResponse = (value: ExamAnswer['response']) => {
    updateAnswer(current.question.id, (a) => ({ ...a, response: value }));
  };

  const toggleMulti = (i: number) => {
    const currentValue = Array.isArray(answer.response) ? answer.response as number[] : [];
    const next = currentValue.includes(i) ? currentValue.filter((x) => x !== i) : [...currentValue, i];
    setResponse(next);
  };

  const fillInputs = Array.isArray(answer.response) ? answer.response as string[] : [];

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  const urgent = timed && remaining < 300;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/exam" onClick={(e) => { if (!confirm('Exit the exam? Your draft is saved in this tab.')) e.preventDefault(); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted hover:text-ink" aria-label="Exit exam"><Icon name="ArrowLeft" size={15} /></Link>
            <div className="min-w-0"><div className="truncate text-[9px] font-bold uppercase tracking-wider text-dim">Exam in progress · {plan.teacherStyle ? 'Teacher-style' : 'Mock'}</div><div className="truncate font-display text-sm font-semibold">{plan.name}</div></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={cn('hidden items-center gap-1.5 text-[10px] font-semibold sm:flex', saved ? 'text-dim' : 'text-amber')}><span className={cn('h-1.5 w-1.5 rounded-full', saved ? 'bg-mint' : 'bg-amber')} />{saved ? 'Saved' : 'Saving…'}</span>
            <span className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-sm font-semibold tabular-nums', urgent ? 'border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.08)] text-[#ff9a94]' : 'border-line bg-surface-2')}><Icon name="Clock3" size={13} />{timed ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : 'Untimed'}</span>
            <Button size="sm" variant="primary" onClick={() => setConfirmSubmit(true)} >Submit</Button>
          </div>
        </div>
        {timed && <ProgressBar value={remaining} max={plan.minutes * 60} height={2} color={urgent ? 'var(--coral)' : 'var(--acid)'} />}
      </header>

      <div className="mx-auto max-w-7xl px-3 pb-28 pt-[84px] sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
          <main>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><span className="chip chip-acid">{section?.title}</span><span className="text-[10px] text-dim">Question {index + 1} of {flat.length}</span></div>
              <div className="flex items-center gap-2"><span className="chip">{current.points} mark{current.points !== 1 ? 's' : ''}</span><button onClick={() => updateAnswer(answer.questionId, (a) => ({ ...a, flagged: !a.flagged }))} className={cn('flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold', answer.flagged ? 'border-[rgba(255,194,75,0.4)] bg-[rgba(255,194,75,0.08)] text-amber' : 'border-line text-muted hover:text-ink')}><Icon name="Flag" size={12} />{answer.flagged ? 'Flagged' : 'Flag'}</button></div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
              {currentSection && <div className="mb-4 rounded-xl border border-line bg-surface-2 p-3 text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{currentSection.title}:</span> {currentSection.instructions}</div>}
              <h1 className="font-display text-xl font-semibold leading-snug sm:text-[24px]">{current.question.prompt}</h1>
              {current.question.context && <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">{current.question.context}</div>}
              <div className="mt-5">
                {current.question.type === 'mcq' && (
                  <div className="grid gap-2.5">
                    {current.question.options?.map((opt, i) => <button key={i} onClick={() => setResponse(i)} className={cn('answer-tile', answer.response === i && 'selected')}><span className="answer-key">{String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm leading-relaxed">{opt}</span></button>)}
                  </div>
                )}
                {current.question.type === 'truefalse' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((opt, i) => <button key={opt} onClick={() => setResponse(i)} className={cn('answer-tile justify-center py-7', answer.response === i && 'selected')}><span className="flex flex-col items-center gap-2"><Icon name={i === 0 ? 'Check' : 'X'} size={22} /><span className="font-display text-lg font-semibold">{opt}</span></span></button>)}
                  </div>
                )}
                {current.question.type === 'multi' && (
                  <div className="grid gap-2.5">
                    {current.question.options?.map((opt, i) => {
                      const selected = Array.isArray(answer.response) && (answer.response as number[]).includes(i);
                      return <button key={i} onClick={() => toggleMulti(i)} className={cn('answer-tile', selected && 'selected')}><span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border', selected ? 'border-transparent bg-acid text-[#0a1408]' : 'border-line')}>{selected && <Icon name="Check" size={12} strokeWidth={3} />}</span><span className="text-sm leading-relaxed">{opt}</span></button>;
                    })}
                    <p className="text-[10px] text-dim">Select all that apply. All required selections must be correct for full marks.</p>
                  </div>
                )}
                {current.question.type === 'fill' && (
                  <div className="space-y-3">
                    {current.question.blanks?.map((b, i) => <div key={i}><label className="label">Blank {i + 1}</label><input className="input" value={fillInputs[i] ?? ''} onChange={(e) => { const next = [...fillInputs]; next[i] = e.target.value; setResponse(next); }} placeholder={b.hint ?? 'Type the missing term'} /></div>)}
                  </div>
                )}
                {['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'].includes(current.question.type) && (
                  <div><textarea className="textarea min-h-[210px]" value={typeof answer.response === 'string' ? answer.response : ''} onChange={(e) => setResponse(e.target.value)} placeholder="Write a complete answer. Name the process, the direction and the consequence." aria-label="Written answer" /><div className="mt-1.5 flex items-center justify-between text-[10px] text-dim"><span>Auto-scored by rubric keywords, then self-check at the end.</span><span>{typeof answer.response === 'string' ? answer.response.trim().split(/\s+/).filter(Boolean).length : 0} words</span></div></div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} icon="ArrowLeft">Previous</Button>
                <div className="flex gap-2">
                  {answer.flagged && <span className="hidden items-center gap-1 text-[10px] text-amber sm:flex"><Icon name="Flag" size={11} />Flagged for review</span>}
                  <Button variant="primary" onClick={() => setIndex((i) => Math.min(flat.length - 1, i + 1))} disabled={index === flat.length - 1} iconRight="ArrowRight">Next</Button>
                </div>
              </div>
            </div>
          </main>

          <aside>
            <div className="sticky top-[84px] rounded-2xl border border-line bg-surface p-3.5">
              <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Question map</span><span className="text-[9px] font-bold text-dim">{answeredCount}/{flat.length}</span></div>
              <ProgressBar value={answeredCount} max={flat.length} height={3} className="mb-3" />
              <div className="grid grid-cols-7 gap-1 lg:grid-cols-6">
                {flat.map((f, i) => {
                  const a = answers.find((x) => x.questionId === f.question.id);
                  return <button key={f.question.id} onClick={() => setIndex(i)} className={cn('relative flex h-8 items-center justify-center rounded-md border text-[9px] font-bold transition-colors', i === index ? 'border-acid bg-[rgba(183,243,74,0.15)] text-acid' : hasResponse(a!) ? 'border-[rgba(77,225,193,0.28)] bg-[rgba(77,225,193,0.06)] text-mint' : 'border-line bg-surface-2 text-muted')} aria-label={`Question ${i + 1}${a?.flagged ? ', flagged' : ''}`}>{i + 1}{a?.flagged && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber" />}</button>;
                })}
              </div>
              <div className="mt-3 space-y-1 text-[9.5px] text-dim"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[rgba(77,225,193,0.28)] bg-[rgba(77,225,193,0.06)]" />Answered</div><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-line bg-surface-2" />Unanswered</div><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Flagged</div></div>
              <div className="mt-3 border-t border-line pt-3"><div className="flex justify-between text-[10px]"><span className="text-muted">Answered</span><span className="font-semibold">{answeredCount}/{flat.length}</span></div><div className="mt-1 flex justify-between text-[10px]"><span className="text-muted">Flagged</span><span className="font-semibold">{flaggedCount}</span></div><div className="mt-1 flex justify-between text-[10px]"><span className="text-muted">Marks</span><span className="font-semibold">{plan.totalPoints}</span></div></div>
              <Button variant="primary" className="mt-3 w-full" onClick={() => setConfirmSubmit(true)}>Review & submit</Button>
            </div>
          </aside>
        </div>
      </div>

      <Modal open={confirmSubmit} onClose={() => setConfirmSubmit(false)} title="Submit the exam?" description={timed ? `Time remaining: ${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, '0')}` : 'Untimed exam'} footer={<><Button variant="ghost" onClick={() => setConfirmSubmit(false)}>Keep working</Button><Button variant="primary" onClick={submit} icon="Send">Submit and mark</Button></>}>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-line bg-surface-2 p-3 text-center"><div className="font-display text-2xl font-semibold">{answeredCount}</div><div className="text-[9px] text-dim">answered</div></div>
          <div className="rounded-xl border border-line bg-surface-2 p-3 text-center"><div className="font-display text-2xl font-semibold">{flat.length - answeredCount}</div><div className="text-[9px] text-dim">blank</div></div>
          <div className="rounded-xl border border-line bg-surface-2 p-3 text-center"><div className="font-display text-2xl font-semibold text-amber">{flaggedCount}</div><div className="text-[9px] text-dim">flagged</div></div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">Unanswered questions score zero. Written answers are auto-scored by rubric keywords and can be self-checked on the results page.</p>
      </Modal>
    </div>
  );
}