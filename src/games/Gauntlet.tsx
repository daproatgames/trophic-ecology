import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import { gradeQuestion } from '../lib/grading';
import type { Question } from '../types';
import { GameEnd, GameLocked, GameShell, GameStart, HudStat, QuestionTimer, fireConfetti } from '../components/game';
import { Button, Icon, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

const STAGES = [
  { id: 'rapid', name: 'Rapid Recall', subtitle: 'Five multiple-choice questions. 75 seconds.', time: 75, types: ['mcq'] as Question['type'][], count: 5, min: 2, max: 3 },
  { id: 'trap', name: 'Trap Protocol', subtitle: 'Five true/false statements. 50 seconds.', time: 50, types: ['truefalse'] as Question['type'][], count: 5, min: 2, max: 4 },
  { id: 'cloze', name: 'Cloze Breach', subtitle: 'Three fill-in-the-blank questions. 90 seconds.', time: 90, types: ['fill'] as Question['type'][], count: 3, min: 2, max: 4 },
  { id: 'select', name: 'Precision Lock', subtitle: 'Three multi-select questions. 90 seconds.', time: 90, types: ['multi'] as Question['type'][], count: 3, min: 3, max: 4 },
  { id: 'boss', name: 'The Examiner', subtitle: 'Three hard questions. 100 boss HP. 90 seconds.', time: 90, types: ['mcq'] as Question['type'][], count: 3, min: 4, max: 5 },
];
const BOSS_HP = 100;
const PLAYER_ATTACK = 40;

export function Gauntlet() {
  const { state, analytics, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'checkpoint' | 'end'>('start');
  const [stages, setStages] = useState<Question[][]>([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [response, setResponse] = useState<string | number | number[] | string[] | boolean | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; score: number } | null>(null);
  const [remaining, setRemaining] = useState(75);
  const [timedOut, setTimedOut] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [missed, setMissed] = useState<Question[]>([]);
  const endAt = useRef(0);
  const timerRef = useRef<number | null>(null);
  const stageOverRef = useRef(false);
  const recorded = useRef(false);
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const stage = STAGES[stageIndex];
  const q = stages[stageIndex]?.[qIndex];
  const locked = analytics.level < 3;

  useEffect(() => {
    if (phase !== 'playing') return;
    setRemaining(stage.time);
    setTimedOut(false);
    stageOverRef.current = false;
    endAt.current = Date.now() + stage.time * 1000;
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !stageOverRef.current) {
        stageOverRef.current = true;
        window.clearInterval(timerRef.current!);
        timeoutStage();
      }
    }, 100);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (!feedback && ['1', '2', '3', '4'].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (q?.options?.[i]) answer(i);
      }
      if (!feedback && stage.types.includes('truefalse')) {
        if (e.key.toLowerCase() === 't') answer(0);
        if (e.key.toLowerCase() === 'f') answer(1);
      }
      if (feedback && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, feedback, q?.id]);

  const buildStages = () => {
    const used: string[] = [];
    const built: Question[][] = [];
    for (const s of STAGES) {
      const qs = selectQuestions(state, { count: s.count, types: s.types, minDifficulty: s.min, maxDifficulty: s.max, excludeIds: used });
      const room = qs.length ? qs : selectQuestions(state, { count: s.count, types: s.types, excludeIds: used });
      used.push(...room.map((q) => q.id));
      built.push(room);
    }
    return built;
  };

  const start = () => {
    setStages(buildStages());
    setPhase('playing');
    setStageIndex(0); setQIndex(0); setLives(3); setScore(0); setCorrect(0); setAnswered(0); setBossHp(BOSS_HP); setResponse(null); setMulti([]); setInputs([]); setFeedback(null); setTimedOut(false); setCompleted(false); setMissed([]);
    recorded.current = false;
  };

  const timeoutStage = () => {
    const newLives = livesRef.current - 1;
    setLives(newLives);
    setTimedOut(true);
    sound.play('wrong');
    if (newLives <= 0) finish(false);
    else {
      setFeedback({ correct: false, explanation: 'The stage timer expired. One life lost. Take the checkpoint and try the next stage.', score: 0 });
      stageOverRef.current = true;
      window.setTimeout(() => checkpointOrEnd(false), 900);
    }
  };

  const finish = (victory: boolean) => {
    setPhase('end');
    setCompleted(victory);
    if (victory) fireConfetti();
    sound.play(victory ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('gauntlet', score + (victory ? 400 : 0), answered ? Math.round((correct / answered) * 100) : 0, { completed: victory ? 1 : 0, stage: stageIndex + 1, lives }, 40 + (victory ? 80 : 0));
    }
  };

  const checkpointOrEnd = (victory = false) => {
    if (!victory && stageIndex >= STAGES.length - 1) {
      finish(false);
      return;
    }
    if (victory) { finish(true); return; }
    setPhase('checkpoint');
  };

  const answer = (choice?: number) => {
    if (!q || feedback) return;
    let resp: string | number | number[] | string[] | boolean | null = response;
    if (q.type === 'mcq' || q.type === 'truefalse') resp = choice ?? response;
    if (q.type === 'multi') resp = multi;
    if (q.type === 'fill') resp = inputs;
    const g = gradeQuestion(q, resp, false);
    const isCorrect = q.type === 'fill' || q.type === 'multi' ? g.score >= 0.999 : g.correct;
    const gain = isCorrect ? 120 + stageIndex * 25 + Math.round(remaining * 2) : 0;
    setAnswered((a) => a + 1);
    setFeedback({ correct: isCorrect, explanation: q.explanation, score: gain });
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setScore((s) => s + gain);
      if (stage.id === 'boss') setBossHp((h) => Math.max(0, h - PLAYER_ATTACK));
      sound.play('correct');
    } else {
      setMissed((m) => [...m, q]);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) { window.setTimeout(() => finish(false), 700); }
        return next;
      });
      sound.play('wrong');
    }
  };

  const next = () => {
    if (!q || !feedback) return;
    if (stage.id === 'boss' && bossHp <= 0) {
      setScore((s) => s + 200);
      finish(true);
      return;
    }
    const nextIndex = qIndex + 1;
    if (nextIndex >= (stages[stageIndex]?.length ?? 0)) {
      if (stageIndex >= STAGES.length - 1) {
        finish(false);
        return;
      }
      setPhase('checkpoint');
      return;
    }
    setQIndex(nextIndex);
    setResponse(null);
    setMulti([]);
    setInputs([]);
    setFeedback(null);
  };

  const continueCheckpoint = () => {
    const nextStage = stageIndex + 1;
    if (nextStage >= STAGES.length) { finish(false); return; }
    setStageIndex(nextStage);
    setQIndex(0);
    setResponse(null);
    setMulti([]);
    setInputs([]);
    setFeedback(null);
    setLives((l) => Math.min(3, l + 1));
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (locked) return <GameLocked level={3} />;

  if (phase === 'start') {
    return (
      <GameShell gameId="gauntlet">
        <GameStart gameId="gauntlet" onStart={start} best={state.gameBests.gauntlet ? { score: state.gameBests.gauntlet.score, accuracy: state.gameBests.gauntlet.accuracy } : null}
          rules={[
            'Five stages, three lives, one final boss.',
            'Stage 1: rapid multiple choice. Stage 2: true/false traps. Stage 3: fill the gaps. Stage 4: multi-select precision. Stage 5: three hard questions against The Examiner.',
            'Each stage has a timer. Timing out costs a life. Wrong answers cost a life. Fill and multi-select must be completely correct.',
            'Checkpoints restore one life (max 3) and show your stage report.',
            'The final boss has 100 HP and takes 40 damage per correct answer. You must answer all three correctly to win.',
          ]}
          side={<div className="mt-4 grid gap-1.5 sm:grid-cols-5">{STAGES.map((s, i) => <div key={s.id} className="rounded-lg border border-line bg-surface-2 p-2 text-center"><div className="font-display text-lg font-semibold" style={{ color: i === 4 ? 'var(--coral)' : 'var(--amber)' }}>{i + 1}</div><div className="text-[8.5px] font-semibold">{s.name}</div><div className="text-[8px] text-dim">{s.time}s</div></div>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="gauntlet">
        <GameEnd gameId="gauntlet" score={score + (completed ? 400 : 0)} accuracy={answered ? Math.round((correct / answered) * 100) : 0} xp={40 + (completed ? 80 : 0)} onReplay={start} message={completed ? 'The Examiner falls. You completed the gauntlet.' : 'The gauntlet wins this run.'}
          stats={[{ label: 'Stages cleared', value: `${completed ? 5 : stageIndex}/5` }, { label: 'Correct', value: `${correct}/${answered}` }, { label: 'Lives left', value: lives }, { label: 'Boss HP', value: `${bossHp}/100` }]}
        >
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-coral">Final review</div><div className="max-h-[240px] space-y-2 overflow-y-auto">{missed.map((m, i) => <div key={`${m.id}-${i}`} className="text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{m.prompt}</span><br />{m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (phase === 'checkpoint') {
    return (
      <GameShell gameId="gauntlet" hud={<><HudStat icon="ShieldCheck" label="Stage" value={`${stageIndex + 1}/5`} color="var(--amber)" /><HudStat icon="Heart" label="Lives" value={lives} color="var(--coral)" /><HudStat icon="Trophy" label="Score" value={score} /></>}>
        <div className="mx-auto max-w-lg py-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(126,231,135,0.35)] bg-[rgba(126,231,135,0.08)] text-mint"><Icon name="ShieldCheck" size={26} /></div>
          <div className="eyebrow mb-1">Checkpoint</div>
          <h2 className="font-display text-2xl font-semibold">Stage {stageIndex + 1} cleared</h2>
          <p className="mt-1 text-sm text-muted">{timedOut ? 'The timer expired, but you still have lives.' : 'Stage complete. One life restored (max 3).'} Next: {STAGES[Math.min(stageIndex + 1, STAGES.length - 1)].name}.</p>
          <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{correct}</div><div className="text-[9px] text-dim">correct</div></div><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{score}</div><div className="text-[9px] text-dim">score</div></div><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{Math.min(3, lives + 1)}</div><div className="text-[9px] text-dim">lives next</div></div></div>
          <Button variant="primary" className="mt-5" onClick={continueCheckpoint} iconRight="ArrowRight">Enter {STAGES[Math.min(stageIndex + 1, STAGES.length - 1)].name}</Button>
        </div>
      </GameShell>
    );
  }

  if (!q) return null;

  const bossStage = stage.id === 'boss';
  return (
    <GameShell gameId="gauntlet" hud={<><HudStat icon="ShieldCheck" label="Stage" value={`${stageIndex + 1}/5`} color="var(--amber)" /><HudStat icon="Heart" label="Lives" value={lives} color="var(--coral)" /><HudStat icon="Trophy" label="Score" value={score} />{bossStage && <HudStat icon="Skull" label="Boss" value={`${bossHp} HP`} color="var(--coral)" />}</>}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="chip chip-amber">{stage.name}</span><span className="text-[10px] text-dim">Q{qIndex + 1}/{stages[stageIndex]?.length ?? 0} · {STAGES[stageIndex].subtitle}</span></div>
        {bossStage && <div className="mb-2"><div className="mb-1 flex justify-between text-[9px] font-bold text-dim"><span>THE EXAMINER</span><span>{bossHp}/100</span></div><ProgressBar value={bossHp} max={100} color="var(--coral)" height={7} /></div>}
        <QuestionTimer remaining={remaining} total={stage.time} color={bossStage ? 'var(--coral)' : 'var(--amber)'} />
        <div className="mt-3 rounded-2xl border border-line bg-surface/70 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2"><span className="chip">D{q.difficulty}</span><span className="chip">{q.type}</span></div>
          <h2 className="font-display text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</h2>
          {(q.type === 'mcq' || q.type === 'truefalse') && (
            <div className="mt-4 grid gap-2">
              {q.options?.map((opt, i) => {
                const reveal = !!feedback;
                const isCorrect = q.answer === i;
                const isSelected = response === i;
                return <button key={i} onClick={() => { setResponse(i); answer(i); }} disabled={reveal} className={cn('answer-tile', reveal ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed' : isSelected ? 'selected' : '')}><span className="answer-key">{q.type === 'truefalse' ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm">{opt}</span></button>;
              })}
            </div>
          )}
          {q.type === 'multi' && (
            <div className="mt-4 space-y-2">
              {q.options?.map((opt, i) => <button key={i} onClick={() => setMulti((m) => m.includes(i) ? m.filter((x) => x !== i) : [...m, i])} disabled={!!feedback} className={cn('answer-tile', multi.includes(i) && 'selected')}><span className="answer-key">{multi.includes(i) ? '✓' : String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm">{opt}</span></button>)}
              {!feedback && <Button variant="primary" size="sm" onClick={() => answer()} disabled={!multi.length} icon="Lock">Lock selections</Button>}
            </div>
          )}
          {q.type === 'fill' && (
            <div className="mt-4 space-y-2">
              {q.blanks?.map((b, i) => <div key={i}><label className="label">Blank {i + 1}</label><input className="input" value={inputs[i] ?? ''} onChange={(e) => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); }} disabled={!!feedback} placeholder={b.hint ?? 'Type the missing term'} /></div>)}
              {!feedback && <Button variant="primary" size="sm" onClick={() => answer()} disabled={inputs.filter(Boolean).length !== (q.blanks?.length ?? 0)} icon="Lock">Lock answers</Button>}
            </div>
          )}
          {feedback && (
            <div className={cn('mt-4 rounded-xl border p-3.5', feedback.correct ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)]' : 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)]')}>
              <div className="flex items-center gap-2 text-xs font-semibold">{feedback.correct ? <><Icon name="CheckCircle2" size={14} className="text-[#7ee787]" />+{feedback.score} points</> : <><Icon name="XCircle" size={14} className="text-[#ff9a94]" />Life lost</>}</div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{feedback.explanation}</p>
              {!timedOut && <Button variant="primary" size="sm" className="mt-3" onClick={next} iconRight="ArrowRight">{feedback.correct && bossStage && bossHp <= 0 ? 'Finish the boss' : qIndex + 1 >= (stages[stageIndex]?.length ?? 0) ? 'Continue' : 'Next question'}</Button>}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}