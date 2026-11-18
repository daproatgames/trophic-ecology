import { useMemo, useRef, useState } from 'react';
import type { Question } from '../types';
import { QUESTION_MAP } from '../data/questions';
import { QuestionRunner } from './QuestionRunner';
import { Button, Icon, ProgressBar, cn } from './ui';

export function InlineQuestionSet({
  ids,
  questions,
  mode,
  title,
  description,
  compact,
  onFinish,
  finishLabel = 'See result',
  allowRetry = true,
  className,
}: {
  ids?: string[];
  questions?: Question[];
  mode: string;
  title?: string;
  description?: string;
  compact?: boolean;
  onFinish?: (correct: number, total: number) => void;
  finishLabel?: string;
  allowRetry?: boolean;
  className?: string;
}) {
  const list = useMemo(() => questions ?? (ids ?? []).map((id) => QUESTION_MAP[id]).filter(Boolean) as Question[], [ids, questions]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const finishedRef = useRef(false);
  const correctRef = useRef(0);
  const q = list[index];

  if (!list.length) return null;

  const finish = (finalCorrect: number) => {
    setDone(true);
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinish?.(finalCorrect, list.length);
    }
  };

  const next = () => {
    if (index + 1 >= list.length) finish(correctRef.current);
    else setIndex(index + 1);
  };

  const retry = () => {
    setIndex(0);
    setCorrect(0);
    correctRef.current = 0;
    setDone(false);
    setRound((r) => r + 1);
    finishedRef.current = false;
  };

  if (done) {
    const pct = Math.round((correct / list.length) * 100);
    return (
      <div className={cn('rounded-2xl border border-line bg-surface p-5', className)}>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: pct >= 80 ? 'rgba(126,231,135,0.12)' : pct >= 50 ? 'rgba(255,194,75,0.12)' : 'rgba(255,107,107,0.12)', color: pct >= 80 ? '#7ee787' : pct >= 50 ? 'var(--amber)' : '#ff9a94' }}>
            <Icon name={pct >= 80 ? 'Trophy' : pct >= 50 ? 'Target' : 'RefreshCw'} size={26} />
          </div>
          <h3 className="font-display text-xl font-semibold">{pct >= 80 ? 'Strong retrieval' : pct >= 50 ? 'Getting there' : 'Not yet — and that is useful'}</h3>
          <p className="mt-1 text-xs text-muted">{correct} of {list.length} correct ({pct}%). {pct >= 80 ? 'High-quality evidence logged.' : 'Review the explanations, then run it again. Repetition without review will not raise mastery much.'}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {allowRetry && <Button onClick={retry} icon="RotateCcw" size="sm">Try again</Button>}
            <span className="chip chip-mint"><Icon name="Database" size={10} />Evidence saved</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-4 sm:p-5', className)}>
      {(title || description) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-base font-semibold">{title}</h3>}
            {description && <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>}
          </div>
          <span className="chip">{index + 1} / {list.length}</span>
        </div>
      )}
      <ProgressBar value={index} max={list.length} className="mb-4" height={4} />
      {q && (
        <QuestionRunner
          key={`${q.id}-${round}`}
          question={q}
          mode={mode}
          index={index}
          total={list.length}
          compact={compact}
          onComplete={(r) => { if (r.correct) { correctRef.current += 1; setCorrect(correctRef.current); } }}
          onNext={next}
          nextLabel={index + 1 >= list.length ? finishLabel : 'Next question'}
        />
      )}
    </div>
  );
}

export function QuestionListPreview({ ids, className }: { ids: string[]; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {ids.map((id, i) => {
        const q = QUESTION_MAP[id];
        if (!q) return null;
        return (
          <div key={id} className="flex items-center gap-2 text-[10.5px] text-muted">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-line text-[8px] font-bold">{i + 1}</span>
            <span className="truncate">{q.prompt}</span>
          </div>
        );
      })}
    </div>
  );
}