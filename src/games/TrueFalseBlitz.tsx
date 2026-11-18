import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { TF_BLITZ_STATEMENTS, type TFBlitzStatement } from '../data/gamesContent';
import { GameEnd, GameShell, GameStart, HudStat, QuestionTimer, fireConfetti } from '../components/game';
import { Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const DURATION = 60;

export function TrueFalseBlitz() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [pool, setPool] = useState<TFBlitzStatement[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [missed, setMissed] = useState<TFBlitzStatement[]>([]);
  const [remaining, setRemaining] = useState(DURATION);
  const endAt = useRef(0);
  const timer = useRef<number | null>(null);
  const lock = useRef(false);
  const recorded = useRef(false);
  const statement = pool[index];

  useEffect(() => {
    if (phase !== 'playing') return;
    timer.current = window.setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) { window.clearInterval(timer.current!); finish(); }
    }, 100);
    return () => { if (timer.current) window.clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (lock.current) return;
      if (e.key.toLowerCase() === 't' || e.key === 'ArrowLeft') answer(true);
      if (e.key.toLowerCase() === 'f' || e.key === 'ArrowRight') answer(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  const finish = () => {
    if (timer.current) window.clearInterval(timer.current);
    setPhase('end');
    if (correct >= 20) fireConfetti();
    sound.play(correct >= answered * 0.7 ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('truefalse', score, answered ? Math.round((correct / answered) * 100) : 0, { correct, answered }, 15 + Math.round(correct / 2));
    }
  };

  const answer = (value: boolean) => {
    if (!statement || phase !== 'playing' || lock.current) return;
    lock.current = true;
    const isCorrect = value === statement.answer;
    setAnswered((a) => a + 1);
    setFeedback({ correct: isCorrect, explanation: statement.explanation });
    if (isCorrect) {
      setScore((s) => s + 100 + streak * 15);
      setCorrect((c) => c + 1);
      setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n; });
      sound.play('correct');
    } else {
      setStreak(0);
      setMissed((m) => [...m, statement]);
      endAt.current -= 3000;
      sound.play('wrong');
    }
    window.setTimeout(() => {
      lock.current = false;
      setFeedback(null);
      if (index + 1 >= pool.length) { setPool(shuffle(TF_BLITZ_STATEMENTS)); setIndex(0); }
      else setIndex((i) => i + 1);
    }, isCorrect ? 350 : 800);
  };

  const start = () => {
    setPool(shuffle(TF_BLITZ_STATEMENTS));
    setPhase('playing');
    setIndex(0); setScore(0); setCorrect(0); setAnswered(0); setStreak(0); setBestStreak(0); setMissed([]); setFeedback(null); setRemaining(DURATION);
    endAt.current = Date.now() + DURATION * 1000;
    recorded.current = false;
    lock.current = false;
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="truefalse">
        <GameStart gameId="truefalse" onStart={start} best={state.gameBests.truefalse ? { score: state.gameBests.truefalse.score, accuracy: state.gameBests.truefalse.accuracy } : null}
          rules={[
            '60 seconds. Decide whether each statement is true or false.',
            'Correct answers add 100 points plus a streak bonus. Wrong answers cost 3 seconds.',
            'This mode targets unit misconceptions — many statements are deliberately tempting.',
            'The explanation appears after each answer; read it before the next statement.',
            'Keyboard: T / F or ← / →.',
          ]}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="truefalse">
        <GameEnd gameId="truefalse" score={score} accuracy={answered ? Math.round((correct / answered) * 100) : 0} xp={15 + Math.round(correct / 2)} onReplay={start} message={correct >= 20 ? 'Trap detector calibrated.' : 'Blitz complete. The misses are your misconception list.'}
          stats={[{ label: 'Correct', value: `${correct}/${answered}` }, { label: 'Best streak', value: bestStreak }, { label: 'Statements', value: answered }, { label: 'Time', value: '60s' }]}
        >
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-coral">Statements to revisit</div><div className="max-h-[240px] space-y-2 overflow-y-auto">{missed.map((m, i) => <div key={`${m.id}-${i}`} className="text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{m.statement}</span> <span className={m.answer ? 'text-[#b8f3bd]' : 'text-[#ffb4ad]'}>({m.answer ? 'True' : 'False'})</span><br />{m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (!statement) return null;

  return (
    <GameShell gameId="truefalse" hud={<><HudStat icon="Trophy" label="Score" value={score} color="var(--amber)" /><HudStat icon="Flame" label="Streak" value={`×${streak}`} color="var(--coral)" /><HudStat icon="Target" label="Correct" value={correct} color="var(--mint)" /></>}>
      <div className="mx-auto max-w-2xl">
        <QuestionTimer remaining={remaining} total={DURATION} color="var(--sky)" />
        <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-line bg-surface/70 p-6 text-center">
          <span className="chip mb-4">Statement {answered + 1}</span>
          <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{statement.statement}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button onClick={() => answer(true)} disabled={!!feedback} className={cn('flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-2xl border text-lg font-bold transition-all', feedback ? feedback.correct && statement.answer ? 'border-[rgba(126,231,135,0.55)] bg-[rgba(126,231,135,0.09)]' : 'border-line bg-surface-2 opacity-60' : 'border-[rgba(126,231,135,0.25)] bg-[rgba(126,231,135,0.05)] hover:-translate-y-0.5 hover:bg-[rgba(126,231,135,0.1)]')}>
            <Icon name="Check" size={24} className="text-[#7ee787]" /><span>TRUE</span><span className="kbd">T</span>
          </button>
          <button onClick={() => answer(false)} disabled={!!feedback} className={cn('flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-2xl border text-lg font-bold transition-all', feedback ? !feedback.correct && !statement.answer ? 'border-[rgba(255,107,107,0.55)] bg-[rgba(255,107,107,0.09)]' : 'border-line bg-surface-2 opacity-60' : 'border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.05)] hover:-translate-y-0.5 hover:bg-[rgba(255,107,107,0.1)]')}>
            <Icon name="X" size={24} className="text-[#ff9a94]" /><span>FALSE</span><span className="kbd">F</span>
          </button>
        </div>
        <div className={cn('mt-3 min-h-[54px] rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed transition-all', feedback ? feedback.correct ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)] text-[#b8f3bd]' : 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]' : 'border-transparent text-dim')}>
          {feedback ? feedback.explanation : 'Read carefully. The wording is the trap: "all", "always", "only" and reversed directions are common tells.'}
        </div>
      </div>
    </GameShell>
  );
}