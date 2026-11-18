import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { GameEnd, GameShell, GameStart, HudStat, QuestionTimer, fireConfetti } from '../components/game';
import { Button, cn } from '../components/ui';
import { sound } from '../lib/sound';

const LIMIT = 20;

export function Survival() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [shields, setShields] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [remaining, setRemaining] = useState(LIMIT);
  const [message, setMessage] = useState('');
  const [missed, setMissed] = useState<Question[]>([]);
  const [verdict, setVerdict] = useState<'survived' | 'eliminated'>('eliminated');
  const recorded = useRef(false);
  const timerRef = useRef<number | null>(null);
  const q = questions[index];

  useEffect(() => {
    if (phase !== 'playing' || !q) return;
    setRemaining(LIMIT);
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, LIMIT - (Date.now() - start) / 1000);
      setRemaining(left);
      if (left <= 0) { window.clearInterval(timerRef.current!); resolve(null); }
    }, 100);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, q?.id]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) { const i = Number(e.key) - 1; if (q?.options?.[i]) resolve(i); }
      if (e.key.toLowerCase() === 't') resolve(0);
      if (e.key.toLowerCase() === 'f') resolve(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, q?.id]);

  const finish = (survived: boolean) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setVerdict(survived ? 'survived' : 'eliminated');
    setPhase('end');
    if (survived) fireConfetti();
    sound.play(survived ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('survival', score, index + 1 ? Math.round((correct / (index + 1)) * 100) : 0, { level, lives, survived: survived ? 1 : 0 }, 20 + level * 5);
    }
  };

  const loseLife = () => {
    if (shields > 0) {
      setShields((s) => s - 1);
      setMessage('Shield absorbed the hit. Streak reset.');
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      setMessage(nextLives <= 0 ? 'No lives left.' : `Life lost. ${nextLives} remaining.`);
      if (nextLives <= 0) {
        setSelected(null);
        window.setTimeout(() => finish(false), 700);
        return true;
      }
    }
    return false;
  };

  const resolve = (choice: number | null) => {
    if (!q || phase !== 'playing' || selected !== null) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const isCorrect = choice !== null && choice === q.answer;
    if (isCorrect) {
      const newCorrect = correct + 1;
      const newStreak = streak + 1;
      const newLevel = Math.floor(newCorrect / 4) + 1;
      setCorrect(newCorrect);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setLevel(newLevel);
      setScore((s) => s + 80 + newLevel * 25 + newStreak * 15 + Math.round(remaining * 2));
      setMessage(newStreak % 5 === 0 ? 'Shield earned.' : `Correct. Level ${newLevel}.`);
      if (newStreak % 5 === 0) setShields((s) => Math.min(2, s + 1));
      sound.play('correct');
      setSelected(choice);
      window.setTimeout(() => next(true), 650);
    } else {
      setStreak(0);
      setMissed((m) => [...m, q]);
      setSelected(choice);
      sound.play('wrong');
      const dead = loseLife();
      if (!dead) window.setTimeout(() => next(false), 1000);
    }
  };

  const next = (wasCorrect: boolean) => {
    if (!wasCorrect && lives <= 0 && shields <= 0) { finish(false); return; }
    if (index + 1 >= questions.length) { finish(true); return; }
    setIndex((i) => i + 1);
    setSelected(null);
    setHidden([]);
    setMessage('');
  };

  const useFifty = () => {
    if (fiftyUsed || !q || q.type !== 'mcq') return;
    const wrong = (q.options ?? []).map((_, i) => i).filter((i) => i !== q.answer);
    setHidden(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
    setFiftyUsed(true);
    sound.play('pop');
  };

  const start = () => {
    const pool = selectQuestions(state, { count: 40, types: ['mcq', 'truefalse'], avoidRecent: false });
    const sorted = [...pool].sort((a, b) => a.difficulty - b.difficulty || Math.random() - 0.5);
    setQuestions(sorted);
    setPhase('playing');
    setIndex(0); setLives(3); setShields(0); setStreak(0); setBestStreak(0); setCorrect(0); setScore(0); setLevel(1); setSelected(null); setHidden([]); setFiftyUsed(false); setMessage(''); setMissed([]);
    recorded.current = false;
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="survival">
        <GameStart gameId="survival" onStart={start} best={state.gameBests.survival ? { score: state.gameBests.survival.score, accuracy: state.gameBests.survival.accuracy } : null}
          rules={[
            'Endless questions. You have 3 lives and 20 seconds per question.',
            'Every 4 correct answers raises the level and the difficulty.',
            'Every 5-answer streak earns a shield (max 2). A shield absorbs one wrong answer.',
            'One 50:50 lifeline removes two wrong options from a multiple-choice question.',
            'Wrong answers and timeouts cost a shield or a life. Survive the full question bank to win.',
          ]}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="survival">
        <GameEnd gameId="survival" score={score} accuracy={index + 1 ? Math.round((correct / (index + 1)) * 100) : 0} xp={20 + level * 5} onReplay={start} message={verdict === 'survived' ? 'You survived the bank.' : 'Eliminated — but stronger for it.'}
          stats={[{ label: 'Level reached', value: level }, { label: 'Correct', value: `${correct}/${index}` }, { label: 'Best streak', value: bestStreak }, { label: 'Lives left', value: lives }]}
        >
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-coral">The questions that caught you</div><div className="max-h-[220px] space-y-2 overflow-y-auto">{missed.map((m, i) => <div key={`${m.id}-${i}`} className="text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{m.prompt}</span><br />{m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (!q) return null;

  return (
    <GameShell gameId="survival" hud={<><HudStat icon="Heart" label="Lives" value={'♥'.repeat(lives) + '♡'.repeat(3 - lives)} color="var(--coral)" /><HudStat icon="Shield" label="Shields" value={shields} color="var(--sky)" /><HudStat icon="Flame" label="Streak" value={`×${streak}`} color="var(--amber)" /><HudStat icon="Trophy" label="Score" value={score} /></>}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between"><span className="chip chip-danger">Level {level}</span><span className="text-[10px] font-semibold text-dim">Q{index + 1} · {correct} correct</span></div>
        <QuestionTimer remaining={remaining} total={LIMIT} color="var(--coral)" />
        <div className="mt-3 rounded-2xl border border-line bg-surface/70 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2"><span className="chip">D{q.difficulty}</span>{message && <span className="chip chip-mint">{message}</span>}</div>
          <h2 className="font-display text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {q.options?.map((opt, i) => {
              if (hidden.includes(i) && selected === null) return null;
              const reveal = selected !== null;
              const isCorrect = q.answer === i;
              const isSelected = selected === i;
              return (
                <button key={i} onClick={() => resolve(i)} disabled={reveal} className={cn('answer-tile', reveal ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed' : '')}>
                  <span className="answer-key">{q.type === 'truefalse' ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Button size="sm" variant="ghost" icon="Scissors" onClick={useFifty} disabled={fiftyUsed || q.type !== 'mcq' || selected !== null}>{fiftyUsed ? '50:50 used' : '50:50'}</Button>
            <span className="text-[9.5px] text-dim">Next shield at {5 - (streak % 5)} streak</span>
          </div>
        </div>
        <div className="mt-3 text-center text-[9.5px] text-dim">{message && selected !== null ? message : 'A shield absorbs one wrong answer before you lose a life.'}</div>
      </div>
    </GameShell>
  );
}