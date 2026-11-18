import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { GameEnd, GameShell, GameStart, HudStat, QuestionTimer, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { TowerCanvas } from '../components/gameArt';
import { sound } from '../lib/sound';

const FLOORS = 12;
const LIMIT = 20;

export function Tower() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'reveal' | 'end'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [floors, setFloors] = useState(0);
  const [supports, setSupports] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(LIMIT);
  const [outcome, setOutcome] = useState<'summit' | 'collapse' | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
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

  const finish = (result: 'summit' | 'collapse', finalFloors = floors) => {
    setOutcome(result);
    setPhase('end');
    const accuracy = index + 1 > 0 ? Math.round((finalFloors / Math.max(1, index + 1)) * 100) : 0;
    if (result === 'summit') fireConfetti();
    sound.play(result === 'summit' ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('tower', score + finalFloors * 120, accuracy, { floors: finalFloors, summit: result === 'summit' ? 1 : 0 }, 20 + (result === 'summit' ? 50 : 0));
    }
  };

  const resolve = (choice: number | null) => {
    if (!q || phase !== 'playing') return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const isCorrect = choice !== null && choice === q.answer;
    const newCombo = isCorrect ? combo + 1 : 0;
    if (isCorrect) {
      const newFloors = floors + 1;
      setFloors(newFloors);
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setScore((s) => s + 100 + Math.round(remaining * 4) + newCombo * 15);
      sound.play('correct');
      if (newFloors >= FLOORS) {
        setSelected(choice);
        setPhase('reveal');
        setTimeout(() => finish('summit', newFloors), 700);
        return;
      }
    } else {
      setCombo(0);
      setWrongCount((w) => w + 1);
      const newSupports = supports - 1;
      setSupports(newSupports);
      sound.play('wrong');
      if (newSupports <= 0) {
        setSelected(choice);
        setPhase('reveal');
        setTimeout(() => finish('collapse', floors), 800);
        return;
      }
    }
    setSelected(choice);
    setPhase('reveal');
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase('playing');
  };

  const start = () => {
    const pool = selectQuestions(state, { count: 16, types: ['mcq', 'truefalse'] });
    const sorted = [...pool].sort((a, b) => a.difficulty - b.difficulty);
    setQuestions(sorted);
    setPhase('playing');
    setIndex(0);
    setFloors(0);
    setSupports(3);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setSelected(null);
    setOutcome(null);
    setWrongCount(0);
    recorded.current = false;
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="tower">
        <GameStart gameId="tower" onStart={start} best={state.gameBests.tower ? { score: state.gameBests.tower.score, accuracy: state.gameBests.tower.accuracy } : null}
          rules={[
            'Answer correctly to build one floor. Reach 12 floors to summit.',
            'You have 3 structural supports. Each wrong answer (or timeout) creates an obstacle and costs one support.',
            'Lose all 3 supports and the tower collapses.',
            'Correct answers score 100 + a time bonus + a combo bonus. The floor height is part of your final score.',
            'Questions get harder as you climb.',
          ]}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="tower">
        <GameEnd gameId="tower" score={score + floors * 120} accuracy={Math.round((floors / Math.max(1, index + 1)) * 100)} xp={20 + (outcome === 'summit' ? 50 : 0)} onReplay={start}
          message={outcome === 'summit' ? 'Summit reached. The structure holds.' : 'The tower collapsed — but the evidence is saved.'}
          stats={[{ label: 'Floors built', value: `${floors}/${FLOORS}` }, { label: 'Supports left', value: supports }, { label: 'Best combo', value: `×${bestCombo}` }, { label: 'Obstacles', value: wrongCount }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 text-center"><p className="text-xs text-muted">{outcome === 'summit' ? 'You built all twelve floors. The hardest questions are at the top — mastery requires exactly this kind of climb.' : 'A collapse is data: three wrong answers in one run usually point to one weak concept. Check your weakest topic, then rebuild.'}</p></div>
        </GameEnd>
      </GameShell>
    );
  }

  if (!q) return null;

  return (
    <GameShell gameId="tower" hud={<><HudStat icon="Building2" label="Floor" value={`${floors}/${FLOORS}`} color="var(--amber)" /><HudStat icon="Heart" label="Supports" value={'◆'.repeat(supports) + '◇'.repeat(3 - supports)} color="var(--coral)" /><HudStat icon="Trophy" label="Score" value={score} /></>}>
      <div className="grid min-h-[calc(100vh-190px)] items-stretch gap-4 lg:grid-cols-[330px_1fr]">
        <div className={cn('relative order-2 flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-xl lg:order-1', phase === 'reveal' && selected !== q.answer && 'screen-shake')}>
          <TowerCanvas floors={floors} wrongCount={wrongCount} supports={supports} collapsed={false} size={340} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white/50">Summit · 12</span>
            <span className="flex gap-0.5">{Array.from({ length: 3 }).map((_, i) => <span key={i} className={cn('text-sm', i < supports ? 'text-acid' : 'text-white/10')}>◆</span>)}</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-bold text-white/60">FLOOR {floors}/12</span>
            {wrongCount > 0 && <span className="rounded-md border border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.1)] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#ffb4ad]">{wrongCount} obstacle{wrongCount > 1 ? 's' : ''}</span>}
          </div>
        </div>

        <div className="order-1 flex flex-col justify-center lg:order-2">
          <QuestionTimer remaining={remaining} total={LIMIT} color="var(--amber)" />
          <div className="mt-3 rounded-2xl border border-line bg-surface/70 p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2"><span className="chip chip-amber">Floor {floors + 1}</span><span className="chip">D{q.difficulty}</span>{combo >= 2 && <span className="chip chip-danger"><Icon name="Flame" size={10} />×{combo}</span>}</div>
            <h2 className="font-display text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</h2>
            <div className="mt-4 grid gap-2">
              {q.options?.map((opt, i) => {
                const reveal = phase === 'reveal';
                const isCorrect = q.answer === i;
                const isSelected = selected === i;
                return (
                  <button key={i} onClick={() => phase === 'playing' && resolve(i)} disabled={phase !== 'playing'} className={cn('answer-tile', reveal ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed' : '')}>
                    <span className="answer-key">{String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
            {phase === 'reveal' && (
              <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold">{selected === q.answer ? <><Icon name="CheckCircle2" size={14} className="text-[#7ee787]" />Floor added</> : <><Icon name="XCircle" size={14} className="text-[#ff9a94]" />{selected === null ? 'Time up — support lost' : 'Obstacle created'}</>}</div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{q.explanation}</p>
                {supports > 0 && floors < FLOORS && <Button variant="primary" size="sm" className="mt-3" iconRight="ArrowRight" onClick={next}>Keep climbing</Button>}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-dim"><span>Wrong answers create obstacles; they do not advance the floor.</span><span>Combo ×{combo}</span></div>
        </div>
      </div>
    </GameShell>
  );
}