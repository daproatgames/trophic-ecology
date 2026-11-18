import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../types';
import { useStudy } from '../state/StudyContext';
import { gradeQuestion } from '../lib/grading';
import type { GradeResult } from '../lib/grading';
import { TOPIC_MAP } from '../data/concepts';
import { Button, Icon, TopicPill, cn } from './ui';
import { sound } from '../lib/sound';

const TYPE_LABEL: Record<Question['type'], string> = {
  mcq: 'Multiple choice',
  multi: 'Multiple select',
  truefalse: 'True / false',
  fill: 'Fill in the blanks',
  short: 'Short answer',
  scenario: 'Scenario',
  error: 'Error analysis',
  causeeffect: 'Cause & effect',
  compare: 'Compare & contrast',
  teachback: 'Teach-back',
};

const OPEN_TYPES: Question['type'][] = ['short', 'scenario', 'error', 'causeeffect', 'compare', 'teachback'];

export interface QuestionResult {
  score: number;
  response: string | number | string[] | number[] | boolean | null;
  correct: boolean;
}

export function QuestionRunner({
  question,
  mode,
  index,
  total,
  compact,
  silent,
  autoRecord = true,
  onComplete,
  onNext,
  nextLabel = 'Next question',
  showNext = true,
  nextDisabled,
  className,
}: {
  question: Question;
  mode: string;
  index?: number;
  total?: number;
  compact?: boolean;
  silent?: boolean;
  autoRecord?: boolean;
  onComplete?: (result: QuestionResult) => void;
  onNext?: () => void;
  nextLabel?: string;
  showNext?: boolean;
  nextDisabled?: boolean;
  className?: string;
}) {
  const { recordAnswer } = useStudy();
  const [selected, setSelected] = useState<number | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [tfChoice, setTfChoice] = useState<number | null>(null);
  const [inputs, setInputs] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'answering' | 'selfassess' | 'reviewed'>('answering');
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const recordedRef = useRef(false);
  const completedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = OPEN_TYPES.includes(question.type);
  const displayScore = finalScore ?? grade?.score ?? 0;
  const displayCorrect = displayScore >= 0.7;
  const isFill = question.type === 'fill';
  const topic = TOPIC_MAP[question.topic];

  const reset = useCallback(() => {
    setSelected(null);
    setMulti([]);
    setTfChoice(null);
    setInputs(Array((question.blanks ?? []).length).fill(''));
    setText('');
    setPhase('answering');
    setGrade(null);
    setShowHint(false);
    setFinalScore(null);
    recordedRef.current = false;
    completedRef.current = false;
  }, [question]);

  useEffect(() => {
    reset();
  }, [question.id, reset]);

  const response = useMemo(() => {
    if (question.type === 'mcq') return selected;
    if (question.type === 'truefalse') return tfChoice;
    if (question.type === 'multi') return multi;
    if (question.type === 'fill') return inputs;
    return text;
  }, [question.type, selected, tfChoice, multi, inputs, text]);

  const canCheck = useMemo(() => {
    if (question.type === 'mcq') return selected !== null;
    if (question.type === 'truefalse') return tfChoice !== null;
    if (question.type === 'multi') return multi.length > 0;
    if (question.type === 'fill') return inputs.some((v) => v.trim().length > 0);
    return text.trim().length >= 8;
  }, [question.type, selected, tfChoice, multi, inputs, text]);

  const persist = useCallback((score: number, resp: typeof response) => {
    if (recordedRef.current || !autoRecord) return;
    recordedRef.current = true;
    recordAnswer({ question, response: resp, score, mode, silent });
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.({ score, response: resp, correct: score >= 0.7 });
    }
  }, [autoRecord, mode, onComplete, question, recordAnswer, silent]);

  const check = useCallback(() => {
    if (!canCheck || phase !== 'answering') return;
    const g = gradeQuestion(question, response, true);
    setGrade(g);
    if (isOpen) {
      setPhase('selfassess');
    } else {
      setPhase('reviewed');
      setFinalScore(g.score);
      persist(g.score, response);
    }
    sound.play(g.correct ? 'correct' : 'wrong');
    requestAnimationFrame(() => {
      document.getElementById('question-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [canCheck, phase, question, response, isOpen, persist]);

  const assess = useCallback((score: number) => {
    if (!grade) return;
    setFinalScore(score);
    setPhase('reviewed');
    persist(score, response);
    sound.play(score >= 0.7 ? 'correct' : 'wrong');
  }, [grade, persist, response]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && phase === 'answering') {
          e.preventDefault();
          check();
        }
        return;
      }
      if (e.key === 'Enter') {
        if (phase === 'reviewed' && showNext && onNext) { e.preventDefault(); onNext(); }
        else if (phase === 'answering' && canCheck) { e.preventDefault(); check(); }
      }
      if (phase !== 'answering') return;
      if (e.key.toLowerCase() === 'h' && (question.hints?.length || isFill)) { setShowHint(true); return; }
      if (question.type === 'mcq' && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (question.options?.[i]) { setSelected(i); sound.play('select'); }
      }
      if (question.type === 'truefalse') {
        if (e.key.toLowerCase() === 't') { setTfChoice(0); sound.play('select'); }
        if (e.key.toLowerCase() === 'f') { setTfChoice(1); sound.play('select'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, canCheck, check, showNext, onNext, question, isFill]);

  const hintText = question.hints?.[0] ?? (isFill ? question.blanks?.find((_, i) => !inputs[i]?.trim())?.hint : undefined) ?? (isOpen ? `A strong answer mentions: ${question.rubric?.[0]?.label ?? 'the key process and its consequence'}.` : undefined);

  const whyWrongFor = (idx: number) => question.whyWrong?.[idx];

  return (
    <div ref={containerRef} className={cn('space-y-4', className)} data-testid="question-runner">
      <div className="flex flex-wrap items-center gap-2">
        <TopicPill name={topic.shortName} color={topic.color} />
        <span className="chip">{TYPE_LABEL[question.type]}</span>
        <span className="chip" title={`Difficulty ${question.difficulty}/5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: i < question.difficulty ? 'var(--amber)' : 'var(--surface-3)' }} />
          ))}
          <span className="ml-1">D{question.difficulty}</span>
        </span>
        {index !== undefined && total !== undefined && <span className="ml-auto text-[11px] font-bold tabular-nums text-dim">{index + 1} / {total}</span>}
      </div>

      {question.context && <div className="rounded-xl border border-line bg-surface-2 p-3.5 text-xs leading-relaxed text-muted">{question.context}</div>}

      <h3 className={cn('font-display font-semibold leading-snug tracking-tight', compact ? 'text-lg' : 'text-xl sm:text-[24px]')}>{question.prompt}</h3>

      {question.type === 'mcq' && (
        <div className="grid gap-2.5" role="group" aria-label="Answer choices">
          {question.options?.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = question.answer === i;
            const reviewed = phase !== 'answering';
            const cls = reviewed
              ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed'
              : isSelected ? 'selected' : '';
            return (
              <button
                key={i}
                className={cn('answer-tile', cls)}
                onClick={() => { if (phase === 'answering') { setSelected(i); sound.play('select'); } }}
                disabled={phase !== 'answering'}
                data-testid={`answer-option-${i}`}
                aria-pressed={isSelected}
              >
                <span className="answer-key">{String.fromCharCode(65 + i)}</span>
                <span className="pt-1 text-sm leading-relaxed">{opt}</span>
                {reviewed && isCorrect && <Icon name="Check" size={18} className="ml-auto mt-0.5 shrink-0 text-[#7ee787]" />}
                {reviewed && isSelected && !isCorrect && <Icon name="X" size={18} className="ml-auto mt-0.5 shrink-0 text-[#ff9a94]" />}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {['True', 'False'].map((opt, i) => {
            const isSelected = tfChoice === i;
            const isCorrect = question.answer === i;
            const reviewed = phase !== 'answering';
            return (
              <button
                key={opt}
                onClick={() => { if (phase === 'answering') { setTfChoice(i); sound.play('select'); } }}
                disabled={phase !== 'answering'}
                className={cn('answer-tile justify-center py-6', reviewed ? (isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed') : isSelected ? 'selected' : '')}
                data-testid={`tf-option-${i}`}
              >
                <span className="flex flex-col items-center gap-2">
                  <Icon name={i === 0 ? 'Check' : 'X'} size={24} />
                  <span className="font-display text-lg font-semibold">{opt}</span>
                  <span className="kbd">{i === 0 ? 'T' : 'F'}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'multi' && (
        <div className="grid gap-2.5" role="group" aria-label="Select all correct answers">
          {question.options?.map((opt, i) => {
            const isSelected = multi.includes(i);
            const isCorrect = Array.isArray(question.answer) && question.answer.includes(i);
            const reviewed = phase !== 'answering';
            return (
              <button
                key={i}
                onClick={() => { if (phase === 'answering') { setMulti((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]); sound.play('select'); } }}
                disabled={phase !== 'answering'}
                className={cn('answer-tile', reviewed ? (isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed') : isSelected ? 'selected' : '')}
                aria-pressed={isSelected}
                data-testid={`multi-option-${i}`}
              >
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border', isSelected ? 'border-transparent bg-acid text-[#0a1408]' : 'border-line')} style={{ background: isSelected ? 'var(--acid)' : 'transparent' }}>
                  {isSelected && <Icon name="Check" size={13} strokeWidth={3} />}
                </span>
                <span className="text-sm leading-relaxed">{opt}</span>
                {reviewed && isCorrect && <Icon name="Check" size={17} className="ml-auto shrink-0 text-[#7ee787]" />}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'fill' && (
        <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-3 text-[15px] leading-[2.1] text-ink">
            {question.prompt.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                <span>{part}</span>
                {i < arr.length - 1 && (
                  <span className="inline-flex flex-col">
                    <input
                      className={cn('input mx-1 inline-block h-9 w-[140px] px-2 text-center text-sm font-semibold')}
                      style={{
                        borderColor: phase !== 'answering' && grade?.blankResults?.[i]
                          ? grade.blankResults[i].correct ? 'rgba(126,231,135,0.6)' : 'rgba(255,107,107,0.6)'
                          : undefined,
                        background: phase !== 'answering' && grade?.blankResults?.[i]
                          ? grade.blankResults[i].correct ? 'rgba(126,231,135,0.07)' : 'rgba(255,107,107,0.07)'
                          : undefined,
                      }}
                      value={inputs[i] ?? ''}
                      onChange={(e) => {
                        const next = [...inputs];
                        next[i] = e.target.value;
                        setInputs(next);
                      }}
                      disabled={phase !== 'answering'}
                      placeholder={`blank ${i + 1}`}
                      aria-label={`Blank ${i + 1}`}
                      data-testid={`fill-blank-${i}`}
                    />
                    {phase !== 'answering' && grade?.blankResults?.[i] && !grade.blankResults[i].correct && (
                      <span className="text-[9.5px] font-semibold text-[#ffb4ad]">→ {grade.blankResults[i].accepted}</span>
                    )}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] text-dim">Type the missing terms. Spelling variants and equivalent terms are accepted where appropriate.</p>
        </div>
      )}

      {isOpen && (
        <div>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={phase !== 'answering'}
            placeholder={question.type === 'teachback' ? 'Explain it in your own words, as if teaching a classmate…' : 'Write your answer in complete sentences…'}
            aria-label="Your written answer"
            data-testid="written-answer"
          />
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-dim">
            <span>{isOpen ? 'Use precise scientific terms. Equivalent phrasing is accepted.' : ''}</span>
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      )}

      {showHint && hintText && phase === 'answering' && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[rgba(255,194,75,0.2)] bg-[rgba(255,194,75,0.06)] p-3 text-xs leading-relaxed text-[#ffd48a]">
          <Icon name="Lightbulb" size={15} className="mt-0.5 shrink-0" />
          <span><strong className="font-semibold">Hint:</strong> {hintText}</span>
        </div>
      )}

      {phase === 'answering' && (
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={check} disabled={!canCheck} icon="Check" data-testid="check-answer">
            Check answer
          </Button>
          {(hintText || question.hints?.length) && (
            <Button variant="ghost" onClick={() => setShowHint((v) => !v)} icon="Lightbulb" className="text-muted">
              {showHint ? 'Hide hint' : 'Hint'}
            </Button>
          )}
          <span className="ml-auto hidden text-[10.5px] text-dim sm:flex sm:items-center sm:gap-1.5">
            <span className="kbd">Enter</span> check · <span className="kbd">H</span> hint
          </span>
        </div>
      )}

      {phase === 'selfassess' && grade && (
        <div className="feedback" data-testid="self-assess">
          <div className="flex items-center gap-2">
            <Icon name="ScanSearch" size={17} className="text-[#ffc24b]" />
            <h4 className="font-display text-base font-semibold">Auto-check: {Math.round(grade.score * 100)}% of rubric ideas</h4>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Written science answers can be correct without matching an exact sentence. Read the model answer and rubric, then score yourself honestly. Your rating updates mastery.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-sm" onClick={() => assess(0)} data-testid="self-score-0">Not yet · 0</button>
            <button className="btn btn-sm" onClick={() => assess(0.5)} data-testid="self-score-0.5">Partly · 0.5</button>
            <button className="btn btn-sm" onClick={() => assess(1)} data-testid="self-score-1">Got it · 1</button>
            <button className="btn btn-sm btn-primary" onClick={() => assess(grade.score)} data-testid="self-score-auto">Use auto score</button>
          </div>
        </div>
      )}

      {phase === 'reviewed' && grade && (
        <div id="question-feedback" className={cn('feedback space-y-3', displayCorrect ? 'correct' : 'wrong')} data-testid="feedback" aria-live="polite">
          <div className="flex items-center gap-2.5">
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', displayCorrect ? 'bg-[rgba(126,231,135,0.15)] text-[#7ee787]' : 'bg-[rgba(255,107,107,0.15)] text-[#ff9a94]')}>
              <Icon name={displayCorrect ? 'Check' : 'X'} size={16} strokeWidth={3} />
            </span>
            <div>
              <h4 className="font-display text-base font-semibold">
                {finalScore !== null && finalScore > 0 && finalScore < 1 ? 'Partial credit' : displayCorrect ? 'Correct' : 'Not quite'}
                {finalScore !== null && <span className="ml-2 text-xs font-medium text-muted">{Math.round(finalScore * 100)}%</span>}
              </h4>
              {!displayCorrect && <p className="text-[11px] text-muted">Read the explanation, then try a similar question. The mistake is data, not a failure.</p>}
            </div>
          </div>

          {question.type === 'mcq' && selected !== null && !displayCorrect && whyWrongFor(selected) && (
            <div className="rounded-lg border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.05)] px-3 py-2 text-xs leading-relaxed text-[#ffb4ad]">
              <strong className="font-semibold">Why that option fails:</strong> {whyWrongFor(selected)}
            </div>
          )}
          {question.type === 'multi' && (
            <div className="text-xs leading-relaxed text-muted">
              <strong className="text-ink">Correct selections:</strong>{' '}
              {Array.isArray(question.answer) ? question.answer.map((i) => question.options?.[i]).join(' · ') : ''}
            </div>
          )}

          <p className="text-[13.5px] leading-relaxed text-muted">{question.explanation}</p>

          {isOpen && (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-line bg-surface-3/50 p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-acid">Model answer</div>
                <p className="text-xs leading-relaxed text-ink/90">{question.modelAnswer}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grade.matched?.map((m) => <span key={m} className="chip chip-acid"><Icon name="Check" size={11} />{m}</span>)}
                {grade.missing?.map((m) => <span key={m} className="chip chip-danger"><Icon name="Minus" size={11} />{m}</span>)}
              </div>
            </div>
          )}

          {question.type === 'fill' && grade.blankResults && (
            <div className="grid gap-1.5">
              {grade.blankResults.map((b) => (
                <div key={b.index} className="flex items-center gap-2 text-xs">
                  <Icon name={b.correct ? 'CheckCircle2' : 'XCircle'} size={14} className={b.correct ? 'text-[#7ee787]' : 'text-[#ff9a94]'} />
                  <span className="text-muted">Blank {b.index + 1}:</span>
                  <span className="font-semibold">{b.correct ? b.response : `accepted: ${b.accepted}`}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1 text-[10px] text-dim">Source: {question.source}</div>
        </div>
      )}

      {phase === 'reviewed' && showNext && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="hidden text-[10.5px] text-dim sm:block">Press <span className="kbd">Enter</span></span>
          <Button variant="primary" onClick={onNext} disabled={nextDisabled} iconRight="ArrowRight" data-testid="next-question">
            {nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
}