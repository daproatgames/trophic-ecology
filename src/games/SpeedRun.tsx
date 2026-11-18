import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { GameEnd, GameShell, GameStart, HudStat, QuestionTimer, fireConfetti } from '../components/game';
import { Icon, cn } from '../components/ui';
import { SpeedGauge } from '../components/gameArt';
import { sound } from '../lib/sound';

type Duration = 60 | 90 | 120;

export function SpeedRun() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [duration, setDuration] = useState<Duration>(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [remaining, setRemaining] = useState<number>(duration);
  const [feedback, setFeedback] = useState<{ choice: number | null; correct: boolean } | null>(null);
  const [missed, setMissed] = useState<Question[]>([]);
  const endAt = useRef(0);
  const timerRef = useRef<number | null>(null);
  const recorded = useRef(false);
  const lock = useRef(false);
  const q = questions[index];

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        finish();
      }
    }, 100);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (lock.current) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (q?.options?.[i]) resolve(i);
      }
      if (e.key.toLowerCase() === 't') resolve(0);
      if (e.key.toLowerCase() === 'f') resolve(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, q?.id]);

  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase('end');
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    if (correct >= 20) fireConfetti();
    sound.play(correct >= answered * 0.7 ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('speed', score, accuracy, { correct, answered, seconds: duration }, 15 + Math.round(correct / 2));
    }
  };

  const resolve = (choice: number | null) => {
    if (!q || phase !== 'playing' || lock.current) return;
    lock.current = true;
    const isCorrect = choice !== null && choice === q.answer;
    setFeedback({ choice, correct: isCorrect });
    setAnswered((a) => a + 1);
    if (isCorrect) {
      const gain = 100 + combo * 15;
      setScore((s) => s + gain);
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      endAt.current += 2000;
      sound.play('correct');
    } else {
      setCombo(0);
      endAt.current -= 4000;
      setMissed((m) => [...m, q]);
      sound.play('wrong');
    }
    window.setTimeout(() => {
      lock.current = false;
      setFeedback(null);
      if (index + 1 >= questions.length) finish();
      else setIndex((i) => i + 1);
    }, isCorrect ? 280 : 520);
  };

  const start = () => {
    const qs = selectQuestions(state, { count: 60, types: ['mcq', 'truefalse'], avoidRecent: false });
    setQuestions(qs);
    setIndex(0);
    setScore(0);
    setCorrect(0);
    setAnswered(0);
    setCombo(0);
    setBestCombo(0);
    setMissed([]);
    setFeedback(null);
    setRemaining(duration);
    endAt.current = Date.now() + duration * 1000;
    recorded.current = false;
    lock.current = false;
    setPhase('playing');
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="speed">
        <GameStart gameId="speed" onStart={start} best={state.gameBests.speed ? { score: state.gameBests.speed.score, accuracy: state.gameBests.speed.accuracy } : null}
          rules={[
            'Answer as many questions as possible before the clock hits zero.',
            'Correct answers add 2 seconds and build a combo multiplier.',
            'Wrong answers cost 4 seconds and reset the combo.',
            'No per-question explanation during the sprint; review every miss on the results screen.',
            'Keyboard 1–4 answers multiple choice. T/F answers true/false.',
          ]}
          side={<div className="mt-4 flex justify-center gap-2">{([60, 90, 120] as Duration[]).map((d) => <button key={d} onClick={() => setDuration(d)} className={cn('rounded-lg border px-3 py-2 text-xs font-semibold', duration === d ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.08)] text-acid' : 'border-line bg-surface-2 text-muted')}>{d}s</button>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    return (
      <GameShell gameId="speed">
        <GameEnd gameId="speed" score={score} accuracy={accuracy} xp={15 + Math.round(correct / 2)} onReplay={start} message={correct >= 20 ? 'Rapid retrieval unlocked.' : 'Time. Review the misses, then go again.'}
          stats={[{ label: 'Correct', value: `${correct}/${answered}` }, { label: 'Best combo', value: `×${bestCombo}` }, { label: 'Questions/min', value: answered ? (answered / (duration / 60)).toFixed(1) : '0' }, { label: 'Time', value: `${duration}s` }]}
        >
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-coral">Review misses ({missed.length})</div><div className="max-h-[220px] space-y-2 overflow-y-auto">{missed.map((m, i) => <div key={`${m.id}-${i}`} className="text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{m.prompt}</span><br />{m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (!q) return null;

  return (
    <GameShell gameId="speed" hud={<><HudStat icon="Trophy" label="Score" value={score} color="var(--amber)" /><HudStat icon="Flame" label="Combo" value={`×${combo}`} color="var(--coral)" /><HudStat icon="Check" label="Correct" value={correct} color="var(--mint)" /></>}>
      <div className="grid min-h-[calc(100vh-190px)] gap-4 lg:grid-cols-[1fr_250px]">
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-md sm:p-5">
          <div className="flex items-center justify-between"><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Question {answered + 1} · {q.type === 'truefalse' ? 'True / False' : 'Multiple choice'}</span><span className="flex items-center gap-1 text-[10px] font-bold text-mint"><Icon name="Flame" size={12} />{combo} combo</span></div>
          <div className="flex flex-1 flex-col justify-center py-5">
          <h2 className="mb-5 max-w-3xl font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">{q.prompt}</h2>
          <div className={cn('grid gap-2.5', q.type === 'truefalse' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
            {q.options?.map((opt, i) => {
              const reveal = feedback !== null;
              const isCorrect = q.answer === i;
              const isSelected = feedback?.choice === i;
              return (
                <button key={i} onClick={() => resolve(i)} disabled={reveal} className={cn('flex items-center gap-3 rounded-xl border p-3.5 text-left font-medium transition-all', q.type === 'truefalse' ? 'min-h-[150px] flex-col justify-center text-2xl' : 'min-h-[86px] text-[15px]', reveal ? isCorrect ? 'border-[rgba(126,231,135,0.6)] bg-[rgba(126,231,135,0.1)] text-white' : isSelected ? 'border-[rgba(255,107,107,0.6)] bg-[rgba(255,107,107,0.09)] text-white' : 'border-white/[0.06] bg-white/[0.02] text-white/35' : 'border-white/10 bg-white/[0.035] text-white/85 hover:border-[rgba(77,225,193,0.4)] hover:bg-white/[0.06]')}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-bold text-white/45">{q.type === 'truefalse' ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}</span>{opt}
                </button>
              );
            })}
          </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[9px] text-white/30"><span>Correct: +2 seconds · Wrong: −4 seconds</span><span>{answered} answered · {correct} correct</span></div>
        </div>
        <aside className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Time remaining</div>
          <SpeedGauge remaining={remaining} total={duration} size={220} />
          <div className="w-full"><QuestionTimer remaining={remaining} total={duration} color="var(--mint)" /></div>
          <div className="grid w-full grid-cols-2 gap-2"><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-center"><div className="font-display text-xl font-semibold text-white">{correct}</div><div className="text-[8px] uppercase tracking-wider text-white/30">correct</div></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-center"><div className="font-display text-xl font-semibold text-white">{combo}×</div><div className="text-[8px] uppercase tracking-wider text-white/30">combo</div></div></div>
          <div className="w-full rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-center"><div className="text-[8px] font-bold uppercase tracking-wider text-white/30">Scoring</div><p className="mt-1 text-[9px] leading-relaxed text-white/45">Correct answers add 100 × combo and +2 seconds. Wrong answers cost 4 seconds. Review every miss at the end.</p></div>
        </aside>
      </div>
    </GameShell>
  );
}