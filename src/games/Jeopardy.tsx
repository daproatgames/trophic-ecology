import { useEffect, useMemo, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { FINAL_JEOPARDY, JEOPARDY_CATEGORIES, JEOPARDY_CLUES, type JeopardyClue } from '../data/gamesContent';
import { normalizeText } from '../lib/grading';
import { GameEnd, GameShell, GameStart, HudStat, Podium, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

const CLUE_TIME = 20;

function acceptedMatch(answer: string, accepted: string[]) {
  const a = normalizeText(answer);
  if (!a) return false;
  return accepted.some((x) => {
    const n = normalizeText(x);
    return a === n || a.includes(n) || n.includes(a);
  });
}

export function Jeopardy() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'board' | 'wager' | 'clue' | 'result' | 'final-wager' | 'final-clue' | 'final-result' | 'end'>('start');
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const [current, setCurrent] = useState<JeopardyClue | null>(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(CLUE_TIME);
  const [dailyDouble, setDailyDouble] = useState('');
  const [wager, setWager] = useState(200);
  const [steal, setSteal] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<JeopardyClue[]>([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [finalWager, setFinalWager] = useState(500);
  const [botWager, setBotWager] = useState(500);
  const [finalTime, setFinalTime] = useState(30);
  const [finalCorrect, setFinalCorrect] = useState(false);
  const judged = useRef(false);
  const finalJudged = useRef(false);
  const recorded = useRef(false);
  const best = state.gameBests.jeopardy;

  const byCategory = useMemo(() => {
    const map: Record<string, JeopardyClue[]> = {};
    for (const c of JEOPARDY_CATEGORIES) map[c] = JEOPARDY_CLUES.filter((q) => q.category === c).sort((a, b) => a.value - b.value);
    return map;
  }, []);

  useEffect(() => {
    if (phase !== 'clue') return;
    setTimeLeft(CLUE_TIME);
    judged.current = false;
    const start = Date.now();
    const t = window.setInterval(() => {
      const left = Math.max(0, CLUE_TIME - (Date.now() - start) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(t);
        if (!judged.current) judge('');
      }
    }, 100);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current?.id]);

  useEffect(() => {
    if (phase !== 'final-clue') return;
    finalJudged.current = false;
    setFinalTime(30);
    const start = Date.now();
    const t = window.setInterval(() => {
      const left = Math.max(0, 30 - (Date.now() - start) / 1000);
      setFinalTime(left);
      if (left <= 0) {
        window.clearInterval(t);
        if (!finalJudged.current) judgeFinal('');
      }
    }, 100);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    const ddPool = JEOPARDY_CLUES.filter((q) => q.value >= 300);
    setDailyDouble(ddPool[Math.floor(Math.random() * ddPool.length)].id);
    setPhase('board');
    setPlayerScore(0);
    setBotScore(0);
    setUsed([]);
    setCurrent(null);
    setAnswer('');
    setAttempts(0);
    setCorrectCount(0);
    setMissed([]);
    setFinalAnswer('');
    setFinalWager(500);
    setBotWager(500);
    setSteal(false);
    setWasCorrect(false);
    setFinalCorrect(false);
    recorded.current = false;
  };

  const openClue = (clue: JeopardyClue) => {
    if (used.includes(clue.id)) return;
    setCurrent(clue);
    setAnswer('');
    setWasCorrect(false);
    setSteal(false);
    setWager(200);
    setPhase(clue.id === dailyDouble ? 'wager' : 'clue');
    sound.play('select');
  };

  const judge = (value: string) => {
    if (!current || judged.current) return;
    judged.current = true;
    setAttempts((a) => a + 1);
    const correct = acceptedMatch(value, current.acceptable);
    setWasCorrect(correct);
    const amount = current.id === dailyDouble ? wager : current.value;
    if (correct) {
      setPlayerScore((s) => s + amount);
      setCorrectCount((c) => c + 1);
      sound.play('correct');
      setSteal(false);
    } else {
      setPlayerScore((s) => s - amount);
      setMissed((m) => [...m, current]);
      sound.play('wrong');
      if (current.id !== dailyDouble && Math.random() < 0.55) {
        setBotScore((s) => s + current.value);
        setSteal(true);
      }
    }
    setUsed((u) => [...u, current.id]);
    setPhase('result');
  };

  const backToBoard = () => {
    if (used.length >= JEOPARDY_CLUES.length) {
      setFinalWager(Math.max(100, Math.min(1000, playerScore > 0 ? playerScore : 100)));
      setBotWager(Math.max(100, Math.min(1000, botScore > 0 ? botScore : 100)));
      setPhase('final-wager');
    } else {
      setPhase('board');
      setCurrent(null);
    }
  };

  const startFinal = () => {
    setPhase('final-clue');
    setFinalAnswer('');
    finalJudged.current = false;
  };

  const judgeFinal = (value: string) => {
    if (finalJudged.current) return;
    finalJudged.current = true;
    const correct = acceptedMatch(value, FINAL_JEOPARDY.acceptable) && normalizeText(value).length > 8;
    setFinalCorrect(correct);
    const botCorrect = Math.random() < 0.55;
    if (correct) setPlayerScore((s) => s + finalWager);
    else setPlayerScore((s) => s - finalWager);
    if (botCorrect) setBotScore((s) => s + botWager);
    else setBotScore((s) => s - botWager);
    setPhase('final-result');
    sound.play(correct ? 'correct' : 'wrong');
  };

  const endGame = () => {
    setPhase('end');
    const won = playerScore > botScore;
    if (won) fireConfetti();
    sound.play(won ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('jeopardy', playerScore, attempts ? Math.round((correctCount / attempts) * 100) : 0, { won: won ? 1 : 0, bot: botScore }, 30 + (won ? 50 : 0));
    }
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="jeopardy">
        <GameStart gameId="jeopardy" onStart={start} best={best ? { score: best.score, accuracy: best.accuracy } : null}
          rules={[
            '25 clues across five categories. Values run 100 → 500.',
            'Type the answer — "What is…" phrasing is accepted. Spelling variants and equivalent terms are checked.',
            'Correct answer: add the clue value. Wrong answer: subtract it, and Dr. Nova may steal.',
            'One Daily Double lets you wager before seeing the clue. The bot does not steal on a Daily Double.',
            'Clear the board to reach Final Jeopardy, where you wager and answer one synthesis clue.',
          ]}
          side={<div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted"><span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1"><span className="h-1.5 w-1.5 rounded-full bg-acid" />You</span><span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1"><span className="h-1.5 w-1.5 rounded-full bg-violet" />Dr. Nova</span><span className="text-dim">· typed answers</span></div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const won = playerScore > botScore;
    const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 0;
    return (
      <GameShell gameId="jeopardy">
        <GameEnd gameId="jeopardy" score={playerScore} accuracy={accuracy} xp={30 + (won ? 50 : 0)} onReplay={start} message={won ? 'You win the board.' : 'Dr. Nova takes the board.'}
          stats={[{ label: 'Your score', value: playerScore }, { label: 'Dr. Nova', value: botScore }, { label: 'Correct clues', value: `${correctCount}/${attempts}` }, { label: 'Final Jeopardy', value: finalCorrect ? 'Correct' : 'Missed' }]}
        >
          <div className="mt-4"><Podium entries={[{ name: 'You', score: playerScore, you: true }, { name: 'Dr. Nova', score: botScore, color: '#a78bfa' }]} /></div>
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-coral">Clues to review</div><div className="space-y-2">{missed.map((m) => <div key={m.id} className="text-[10.5px] leading-relaxed text-muted"><span className="font-semibold text-ink">{m.clue}</span><br /><span className="text-[#b8f3bd]">Answer: {m.answer}</span> · {m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (phase === 'board') {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /><HudStat icon="Grid3X3" label="Clues left" value={JEOPARDY_CLUES.length - used.length} /></>}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 flex items-center justify-between"><div><div className="eyebrow">The board</div><h2 className="font-display text-xl font-semibold">Pick a category and value</h2></div><span className="chip chip-violet"><Icon name="Sparkles" size={10} />Daily Double hidden</span></div>
          <div className="overflow-x-auto rounded-xl border border-line bg-[#071018] p-2">
            <div className="grid min-w-[620px] grid-cols-5 gap-1.5">
              {JEOPARDY_CATEGORIES.map((cat) => <div key={cat} className="flex h-12 items-center justify-center rounded-lg border border-[rgba(255,194,75,0.25)] bg-[rgba(255,194,75,0.07)] px-1 text-center font-display text-[10px] font-bold tracking-wider text-amber">{cat}</div>)}
              {[100, 200, 300, 400, 500].map((value) =>
                JEOPARDY_CATEGORIES.map((cat) => {
                  const clue = byCategory[cat].find((c) => c.value === value)!;
                  const isUsed = used.includes(clue.id);
                  return <button key={clue.id} onClick={() => openClue(clue)} disabled={isUsed} className={cn('flex h-16 items-center justify-center rounded-lg border font-display text-lg font-bold transition-all sm:h-20 sm:text-2xl', isUsed ? 'cursor-default border-line/40 bg-surface-3/10 text-transparent' : 'border-[rgba(255,194,75,0.16)] bg-[#0d1a27] text-amber hover:border-[rgba(255,194,75,0.5)] hover:bg-[#15263a]')}>{isUsed ? '' : value}</button>;
                }),
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-dim"><span>Click any value to open a clue.</span><button onClick={() => { setFinalWager(Math.max(100, Math.min(1000, playerScore > 0 ? playerScore : 100))); setPhase('final-wager'); }} className="font-semibold text-muted hover:text-ink">Skip to Final Jeopardy</button></div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'wager') {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /></>}>
        <div className="mx-auto max-w-md py-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,194,75,0.4)] bg-[rgba(255,194,75,0.1)] text-amber"><Icon name="Sparkles" size={30} /></div>
          <h2 className="font-display text-2xl font-semibold">Daily Double</h2>
          <p className="mt-1 text-sm text-muted">Wager before you see the clue. You can risk 100–1000 points.</p>
          <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-5">
            <div className="font-display text-4xl font-semibold text-amber">{wager}</div>
            <input type="range" min={100} max={1000} step={100} value={wager} onChange={(e) => setWager(Number(e.target.value))} className="mt-3 w-full accent-[var(--amber)]" aria-label="Daily Double wager" />
            <div className="mt-1 flex justify-between text-[9px] text-dim"><span>100</span><span>1000</span></div>
          </div>
          <Button variant="primary" className="mt-4" onClick={() => setPhase('clue')} iconRight="ArrowRight">Reveal the clue</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'clue' && current) {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /><HudStat icon="Clock3" label="Time" value={`${Math.ceil(timeLeft)}s`} /></>}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between"><span className="chip chip-amber">{current.category} · {current.id === dailyDouble ? 'DAILY DOUBLE' : current.value}</span><span className="text-[10px] font-bold text-dim">{Math.ceil(timeLeft)}s</span></div>
          <div className="progress-track mb-4"><div className="progress-fill" style={{ width: `${(timeLeft / CLUE_TIME) * 100}%`, background: timeLeft < 6 ? 'var(--coral)' : 'var(--amber)' }} /></div>
          <div className="rounded-2xl border border-[rgba(255,194,75,0.25)] bg-[#0b1622] p-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber">Clue</div>
            <p className="mx-auto mt-3 max-w-xl font-display text-xl font-semibold leading-snug sm:text-2xl">{current.clue}</p>
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && answer.trim()) judge(answer); }} className="input mt-5 text-center text-base" placeholder="Type your answer…" autoFocus aria-label="Your answer" />
            <div className="mt-3 flex items-center justify-center gap-2"><Button variant="primary" onClick={() => judge(answer)} disabled={!answer.trim()}>Submit answer</Button><Button variant="ghost" onClick={() => judge('')}>Pass</Button></div>
            <p className="mt-2 text-[9.5px] text-dim">"What is…" is optional. Spelling variants are accepted where the science is unambiguous.</p>
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'result' && current) {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /></>}>
        <div className="mx-auto max-w-2xl py-4 text-center">
          <div className={cn('mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full', wasCorrect ? 'bg-[rgba(126,231,135,0.12)] text-[#7ee787]' : 'bg-[rgba(255,107,107,0.12)] text-[#ff9a94]')}><Icon name={wasCorrect ? 'Check' : 'X'} size={26} strokeWidth={3} /></div>
          <h2 className="font-display text-2xl font-semibold">{wasCorrect ? 'Correct.' : 'Not this time.'}</h2>
          <p className="mt-1 text-xs text-muted">{wasCorrect ? `+${current.id === dailyDouble ? wager : current.value} points` : `−${current.id === dailyDouble ? wager : current.value} points`}{steal ? ' · Dr. Nova steals the clue.' : ''}</p>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Correct response</div>
            <div className="mt-1 font-display text-xl font-semibold text-[#b8f3bd]">{current.answer}</div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">{current.explanation}</p>
          </div>
          <Button variant="primary" className="mt-4" onClick={backToBoard} iconRight="ArrowRight">Back to the board</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'final-wager') {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /></>}>
        <div className="mx-auto max-w-md py-8 text-center">
          <div className="eyebrow mb-2">Final Jeopardy</div>
          <h2 className="font-display text-2xl font-semibold">{FINAL_JEOPARDY.category}</h2>
          <p className="mt-1 text-sm text-muted">Wager up to 1000 points, then answer the synthesis clue.</p>
          <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-5">
            <div className="font-display text-4xl font-semibold text-amber">{finalWager}</div>
            <input type="range" min={100} max={1000} step={100} value={finalWager} onChange={(e) => setFinalWager(Number(e.target.value))} className="mt-3 w-full accent-[var(--amber)]" aria-label="Final Jeopardy wager" />
            <div className="mt-1 flex justify-between text-[9px] text-dim"><span>100</span><span>1000</span></div>
          </div>
          <Button variant="primary" className="mt-4" onClick={startFinal} iconRight="ArrowRight">Lock wager & see clue</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'final-clue') {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Clock3" label="Time" value={`${Math.ceil(finalTime)}s`} /></>}>
        <div className="mx-auto max-w-2xl py-4">
          <div className="mb-3 text-center"><div className="eyebrow mb-1">Final Jeopardy · {FINAL_JEOPARDY.category}</div><div className="text-[10px] font-bold text-amber">Wager: {finalWager} points</div></div>
          <div className="rounded-2xl border border-[rgba(255,194,75,0.25)] bg-[#0b1622] p-6 text-center">
            <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{FINAL_JEOPARDY.clue}</p>
            <textarea value={finalAnswer} onChange={(e) => setFinalAnswer(e.target.value)} className="textarea mt-5 text-center text-sm" placeholder="Write a complete explanation…" aria-label="Final Jeopardy answer" />
            <div className="mt-3 flex justify-center"><Button variant="primary" onClick={() => judgeFinal(finalAnswer)} disabled={!finalAnswer.trim()}>Submit final answer</Button></div>
            <div className="mt-2 text-[10px] text-dim">{Math.ceil(finalTime)}s remaining</div>
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'final-result') {
    return (
      <GameShell gameId="jeopardy" hud={<><HudStat icon="Trophy" label="Your score" value={playerScore} color="var(--amber)" /><HudStat icon="Bot" label="Dr. Nova" value={botScore} color="var(--violet)" /></>}>
        <div className="mx-auto max-w-2xl py-4 text-center">
          <div className={cn('mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full', finalCorrect ? 'bg-[rgba(126,231,135,0.12)] text-[#7ee787]' : 'bg-[rgba(255,107,107,0.12)] text-[#ff9a94]')}><Icon name={finalCorrect ? 'Trophy' : 'X'} size={26} /></div>
          <h2 className="font-display text-2xl font-semibold">{finalCorrect ? 'Final answer correct.' : 'Final answer missed.'}</h2>
          <p className="mt-1 text-xs text-muted">Your score: {playerScore} · Dr. Nova: {botScore}</p>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-left"><div className="text-[10px] font-bold uppercase tracking-wider text-dim">Model response</div><p className="mt-1 text-sm leading-relaxed text-[#b8f3bd]">{FINAL_JEOPARDY.answer}</p><p className="mt-2 text-[11px] leading-relaxed text-muted">{FINAL_JEOPARDY.explanation}</p></div>
          <Button variant="primary" className="mt-4" onClick={endGame} iconRight="ArrowRight">See final results</Button>
        </div>
      </GameShell>
    );
  }

  return null;
}