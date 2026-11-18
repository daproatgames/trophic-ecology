import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { WORDLE_WORDS, type WordleWord } from '../data/gamesContent';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

const ROUNDS = 3;
const MAX = 6;

function evaluate(guess: string, target: string): ('correct' | 'present' | 'absent' | 'empty')[] {
  const result: ('correct' | 'present' | 'absent' | 'empty')[] = Array(guess.length).fill('absent');
  const counts: Record<string, number> = {};
  for (const ch of target) counts[ch] = (counts[ch] ?? 0) + 1;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) { result[i] = 'correct'; counts[guess[i]]--; }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    if (counts[guess[i]] > 0) { result[i] = 'present'; counts[guess[i]]--; }
  }
  return result;
}

function pickWords(): WordleWord[] {
  const pool = [...WORDLE_WORDS];
  const out: WordleWord[] = [];
  while (out.length < ROUNDS && pool.length) out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
  return out;
}

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export function Wordle() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'round-end' | 'end'>('start');
  const [words, setWords] = useState<WordleWord[]>([]);
  const [round, setRound] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [solved, setSolved] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [roundResults, setRoundResults] = useState<{ word: string; solved: boolean; guesses: number; hint: number }[]>([]);
  const recorded = useRef(false);
  const target = words[round];
  const evaluations = guesses.map((g) => evaluate(g, target?.word ?? ''));
  const best = state.gameBests.wordle;

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      else if (e.key === 'Backspace') { e.preventDefault(); setCurrent((c) => c.slice(0, -1)); }
      else if (/^[a-zA-Z]$/.test(e.key) && current.length < (target?.word.length ?? 5)) { setCurrent((c) => (c + e.key).toUpperCase()); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current, target?.word, guesses]);

  const submit = () => {
    if (!target || phase !== 'playing' || current.length !== target.word.length) { setMessage(`Guess must be ${target?.word.length ?? 5} letters.`); return; }
    const guess = current.toUpperCase();
    if (guesses.includes(guess)) { setMessage('Already guessed. Try a different word.'); return; }
    const nextGuesses = [...guesses, guess];
    const isSolved = guess === target.word;
    setGuesses(nextGuesses);
    setCurrent('');
    setMessage('');
    sound.play(isSolved ? 'correct' : 'wrong');
    if (isSolved || nextGuesses.length >= MAX) {
      setSolved(isSolved);
      const gained = isSolved ? 200 + (MAX - nextGuesses.length) * 40 - hintLevel * 40 : 0;
      setScore((s) => s + Math.max(0, gained));
      if (isSolved) setSolvedCount((c) => c + 1);
      setRoundResults((r) => [...r, { word: target.word, solved: isSolved, guesses: nextGuesses.length, hint: hintLevel }]);
      setPhase('round-end');
      if (isSolved) fireConfetti();
    }
  };

  const nextRound = () => {
    if (round + 1 >= words.length) {
      setPhase('end');
      sound.play('win');
      if (!recorded.current) {
        recorded.current = true;
        recordGameResult('wordle', score, Math.round((solvedCount / words.length) * 100), { solved: solvedCount, rounds: words.length }, 20 + solvedCount * 15);
      }
    } else {
      setRound((r) => r + 1);
      setGuesses([]);
      setCurrent('');
      setSolved(false);
      setHintLevel(0);
      setMessage('');
      setPhase('playing');
    }
  };

  const start = () => {
    setWords(pickWords());
    setRound(0); setGuesses([]); setCurrent(''); setSolved(false); setHintLevel(0); setMessage(''); setScore(0); setSolvedCount(0); setRoundResults([]);
    recorded.current = false;
    setPhase('playing');
  };

  const hint = () => {
    if (hintLevel >= 2 || !target) return;
    setHintLevel((h) => h + 1);
    setMessage(hintLevel === 0 ? `Definition: ${target.definition}` : `First letter: ${target.word[0]}`);
    sound.play('pop');
  };

  const keyStatus = (key: string): 'correct' | 'present' | 'absent' | '' => {
    let status: 'correct' | 'present' | 'absent' | '' = '';
    guesses.forEach((g, gi) => {
      const e = evaluations[gi];
      for (let i = 0; i < g.length; i++) {
        if (g[i] !== key) continue;
        if (e[i] === 'correct') status = 'correct';
        else if (e[i] === 'present' && status !== 'correct') status = 'present';
        else if (e[i] === 'absent' && !status) status = 'absent';
      }
    });
    return status;
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="wordle">
        <GameStart gameId="wordle" onStart={start} best={best ? { score: best.score, accuracy: best.accuracy } : null}
          rules={[
            'Three unit terms. Six guesses each.',
            'Green = correct letter in the correct position. Yellow = letter is present but in the wrong position. Grey = letter is not in the term.',
            'Hints reveal the definition (level 1) and first letter (level 2), but reduce the round score.',
            'Use the on-screen keyboard or type. Enter submits; Backspace deletes.',
            'Every answer comes from the unit’s key vocabulary.',
          ]}
          side={<div className="mt-4 flex flex-wrap justify-center gap-1.5">{['NICHE', 'TROPHIC', 'GLUCOSE'].map((w) => <span key={w} className="chip">{w.length} letters</span>)}<span className="chip">3 rounds</span></div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="wordle">
        <GameEnd gameId="wordle" score={score} accuracy={Math.round((solvedCount / words.length) * 100)} xp={20 + solvedCount * 15} onReplay={start} message={solvedCount === words.length ? 'All three terms cracked.' : 'Round set complete.'}
          stats={[{ label: 'Solved', value: `${solvedCount}/${words.length}` }, { label: 'Rounds', value: words.length }, { label: 'Hints used', value: roundResults.reduce((s, r) => s + r.hint, 0) }, { label: 'Score', value: score }]}
        >
          <div className="mt-4 grid gap-1.5 sm:grid-cols-3">{roundResults.map((r) => <div key={r.word} className="rounded-lg border border-line bg-surface-2 p-3 text-center"><div className="font-display text-sm font-bold text-acid">{r.word}</div><div className="mt-1 text-[9.5px] text-dim">{r.solved ? `Solved in ${r.guesses}` : 'Not solved'} · {r.hint} hints</div></div>)}</div>
        </GameEnd>
      </GameShell>
    );
  }

  if (!target) return null;

  if (phase === 'round-end') {
    return (
      <GameShell gameId="wordle" hud={<><HudStat icon="Grid3X3" label="Round" value={`${round + 1}/${words.length}`} color="var(--pink)" /><HudStat icon="Trophy" label="Score" value={score} color="var(--amber)" /></>}>
        <div className="mx-auto max-w-xl py-6 text-center">
          <div className={cn('mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full', solved ? 'bg-[rgba(126,231,135,0.12)] text-[#7ee787]' : 'bg-[rgba(255,194,75,0.12)] text-amber')}><Icon name={solved ? 'Check' : 'Search'} size={26} /></div>
          <h2 className="font-display text-2xl font-semibold">{solved ? `Cracked in ${guesses.length}.` : 'The term was…'}</h2>
          <div className="mt-4 flex justify-center gap-1.5">{target.word.split('').map((ch, i) => <span key={i} className={cn('flex h-11 w-11 items-center justify-center rounded-lg border font-display text-lg font-bold', solved ? 'border-[rgba(126,231,135,0.4)] bg-[rgba(126,231,135,0.12)] text-[#b8f3bd]' : 'border-[rgba(255,194,75,0.35)] bg-[rgba(255,194,75,0.08)] text-amber')}>{ch}</span>)}</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{target.definition}</p>
          <p className="mt-1 text-[10px] text-dim">Topic: {target.topic} · Concept: {target.concept}</p>
          <Button variant="primary" className="mt-5" onClick={nextRound} iconRight="ArrowRight">{round + 1 >= words.length ? 'See results' : 'Next term'}</Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="wordle" hud={<><HudStat icon="Grid3X3" label="Round" value={`${round + 1}/${words.length}`} color="var(--pink)" /><HudStat icon="Trophy" label="Score" value={score} color="var(--amber)" /><HudStat icon="Lightbulb" label="Hints" value={`${hintLevel}/2`} /></>}>
      <div className="mx-auto max-w-lg">
        <div className="mb-3 flex items-center justify-between"><span className="chip">{target.word.length} letters · {target.topic}</span><span className="text-[10px] font-bold text-dim">{guesses.length}/{MAX} guesses</span></div>
        <div className="space-y-1.5">
          {Array.from({ length: MAX }).map((_, ri) => {
            const guess = guesses[ri];
            const isCurrent = ri === guesses.length && !solved;
            const letters = guess ? guess.split('') : isCurrent ? current.padEnd(target.word.length, ' ').split('') : Array(target.word.length).fill(' ');
            const e = guess ? evaluations[ri] : [];
            return (
              <div key={ri} className="flex justify-center gap-1.5">
                {letters.map((ch, ci) => (
                  <div key={ci} className={cn('flex h-11 w-11 items-center justify-center rounded-md border font-display text-base font-bold uppercase transition-all sm:h-12 sm:w-12', !ch.trim() ? 'border-line bg-surface-2' : e[ci] === 'correct' ? 'border-transparent bg-[#4a8f5b] text-white' : e[ci] === 'present' ? 'border-transparent bg-[#a9852d] text-white' : e[ci] === 'absent' ? 'border-line bg-surface-3 text-dim' : 'border-[rgba(183,243,74,0.45)] bg-surface-3 text-ink')} style={ch.trim() && !guess ? { borderColor: 'rgba(183,243,74,0.6)' } : undefined}>{ch.trim() ? ch : ''}</div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-3 min-h-[34px] text-center text-[11px] leading-relaxed">
          {message ? <span className="text-[#ffd48a]">{message}</span> : <span className="text-dim">Type a {target.word.length}-letter term. Green = exact, yellow = present, grey = absent.</span>}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" icon="Lightbulb" onClick={hint} disabled={hintLevel >= 2}>Hint ({2 - hintLevel} left)</Button>
          <Button size="sm" variant="ghost" icon="Delete" onClick={() => setCurrent((c) => c.slice(0, -1))} disabled={!current}>Delete</Button>
          <Button size="sm" variant="primary" onClick={submit} disabled={current.length !== target.word.length} iconRight="CornerDownLeft">Enter</Button>
        </div>
        <div className="mt-4 space-y-1.5">
          {KEY_ROWS.map((row) => (
            <div key={row} className="flex justify-center gap-1">
              {row.split('').map((k) => {
                const status = keyStatus(k);
                return <button key={k} onClick={() => current.length < target.word.length && setCurrent((c) => c + k)} className={cn('flex h-9 flex-1 max-w-[34px] items-center justify-center rounded text-[10px] font-bold transition-colors', status === 'correct' ? 'bg-[#4a8f5b] text-white' : status === 'present' ? 'bg-[#a9852d] text-white' : status === 'absent' ? 'bg-surface-3 text-dim' : 'border border-line bg-surface-2 hover:bg-surface-3')}>{k}</button>;
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}