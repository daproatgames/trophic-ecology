import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { ESCAPE_ROOMS, type EscapePuzzle } from '../data/gamesContent';
import { normalizeText } from '../lib/grading';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

function isTextCorrect(value: string, accepted: string[]) { const v = normalizeText(value); return !!v && accepted.some((a) => v === normalizeText(a) || v.includes(normalizeText(a))); }

export function Escape() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'exit' | 'end'>('start');
  const [roomIndex, setRoomIndex] = useState(0);
  const [solved, setSolved] = useState<Record<string, string[]>>({});
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [sequencePick, setSequencePick] = useState<string[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [escaped, setEscaped] = useState(false);
  const [exitCode, setExitCode] = useState('');
  const recorded = useRef(false);
  const startTime = useRef(0);
  const room = ESCAPE_ROOMS[roomIndex];
  const roomSolved = (solved[room.id] ?? []).length;
  const totalSolved = ESCAPE_ROOMS.reduce((s, r) => s + (solved[r.id]?.length ?? 0), 0);

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'exit') return;
    const t = window.setInterval(() => setSeconds(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' || phase === 'exit') {
      if (seconds >= 720) finish(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase]);

  const start = () => {
    setPhase('playing');
    setRoomIndex(0);
    setSolved({});
    setHintsUsed([]);
    setInput('');
    setSequencePick([]);
    setChoice(null);
    setMessage(null);
    setSeconds(0);
    setEscaped(false);
    setExitCode('');
    setActivePuzzle(null);
    startTime.current = Date.now();
    recorded.current = false;
  };

  const currentPuzzle = room.puzzles.find((p) => p.id === activePuzzle);
  const score = Math.max(0, 1000 - hintsUsed.length * 50 - Math.floor(seconds / 60) * 20 + totalSolved * 80 + (escaped ? 300 : 0));

  const finish = (didEscape: boolean) => {
    setPhase('end');
    setEscaped(didEscape);
    if (didEscape) fireConfetti();
    sound.play(didEscape ? 'win' : 'lose');
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('escape', Math.max(0, 1000 - hintsUsed.length * 50 - Math.floor(seconds / 60) * 20 + totalSolved * 80 + (didEscape ? 300 : 0)), Math.round((totalSolved / 12) * 100), { escaped: didEscape ? 1 : 0, hints: hintsUsed.length, rooms: roomIndex + 1 }, 25 + (didEscape ? 75 : 0));
    }
  };

  const submit = (p: EscapePuzzle) => {
    let correct = false;
    if (p.type === 'text') correct = isTextCorrect(input, p.accepted ?? []);
    if (p.type === 'number') correct = Number(input) === p.numberAnswer;
    if (p.type === 'sequence') correct = sequencePick.join('|') === (p.sequence ?? []).join('|');
    if (p.type === 'choice') correct = choice === p.choiceAnswer;
    if (!correct) {
      setMessage({ type: 'wrong', text: 'That lock did not open. Re-read the clue and try again — or use a hint.' });
      sound.play('wrong');
      return;
    }
    const nextSolved = { ...solved, [room.id]: [...(solved[room.id] ?? []), p.id] };
    setSolved(nextSolved);
    setMessage({ type: 'correct', text: p.explanation });
    sound.play('correct');
    setInput('');
    setSequencePick([]);
    setChoice(null);
    setActivePuzzle(null);
    if (nextSolved[room.id].length === room.puzzles.length) {
      setTimeout(() => sound.play('level'), 300);
    }
  };

  const nextRoom = () => {
    if (roomIndex >= ESCAPE_ROOMS.length - 1) { setPhase('exit'); setMessage(null); return; }
    setRoomIndex((i) => i + 1);
    setActivePuzzle(null);
    setMessage(null);
    setInput('');
    setSequencePick([]);
    setChoice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tryExit = () => {
    if (isTextCorrect(exitCode, ['fertilizer', 'fertilizers', 'artificial fertilizer', 'fertilizer runoff'])) {
      setEscaped(true);
      setPhase('end');
      fireConfetti();
      sound.play('win');
      if (!recorded.current) {
        recorded.current = true;
        recordGameResult('escape', 1000 - hintsUsed.length * 50 - Math.floor(seconds / 60) * 20 + 12 * 80 + 300, 100, { escaped: 1, hints: hintsUsed.length, rooms: 4 }, 100);
      }
    } else {
      setMessage({ type: 'wrong', text: 'The final lock rejects that answer. Think about the nitrogen-cycle human impact from the slides.' });
      sound.play('wrong');
    }
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="escape">
        <GameStart gameId="escape" onStart={start} best={state.gameBests.escape ? { score: state.gameBests.escape.score, accuracy: state.gameBests.escape.accuracy } : null}
          rules={[
            'Four rooms, three locks each, twelve minutes total.',
            'Solve every lock in a room to open the next door.',
            'Each hint costs 50 points. Time also reduces your score.',
            'After the fourth room, one final synthesis lock guards the exit.',
            'You can attempt locks in any order. Wrong answers do not cost a life — only points and time.',
          ]}
          side={<div className="mt-4 flex flex-wrap justify-center gap-2">{ESCAPE_ROOMS.map((r, i) => <span key={r.id} className="chip"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-line text-[8px]">{i + 1}</span>{r.name}</span>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="escape">
        <GameEnd gameId="escape" score={score} accuracy={Math.round((totalSolved / 12) * 100)} xp={25 + (escaped ? 75 : 0)} onReplay={start} message={escaped ? 'You escaped the Ecology Vault.' : 'The vault locked you in.'}
          stats={[{ label: 'Rooms', value: `${Math.min(roomIndex + 1, 4)}/4` }, { label: 'Locks', value: `${totalSolved}/12` }, { label: 'Hints', value: hintsUsed.length }, { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 text-center text-xs leading-relaxed text-muted">{escaped ? 'Every room required a different part of the ecology unit: energy, pyramids, cycles and nitrogen. That is the synthesis your test will reward.' : 'The locks you solved are saved as evidence. Replay with the solutions in mind — each room is a different topic.'}</div>
        </GameEnd>
      </GameShell>
    );
  }

  if (phase === 'exit') {
    return (
      <GameShell gameId="escape" hud={<><HudStat icon="DoorOpen" label="Rooms" value="4/4" color="var(--violet)" /><HudStat icon="Lightbulb" label="Hints" value={hintsUsed.length} color="var(--amber)" /><HudStat icon="Clock3" label="Time" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`} /></>}>
        <div className="mx-auto max-w-xl py-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.1)] text-violet"><Icon name="DoorOpen" size={30} /></div>
          <div className="eyebrow mb-1">Final exit lock</div>
          <h2 className="font-display text-2xl font-semibold">One last synthesis question</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">Four rooms are open. The exit asks you to name the human-made input that runs off fields and causes algal blooms. Type it below.</p>
          <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-5">
            <input className="input text-center" value={exitCode} onChange={(e) => setExitCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tryExit()} placeholder="Type the answer…" aria-label="Final exit answer" />
            <Button variant="primary" className="mt-3 w-full" onClick={tryExit} disabled={!exitCode.trim()} icon="KeyRound">Unlock the exit</Button>
            {message && <div className={cn('mt-3 rounded-lg border px-3 py-2 text-[11px]', message.type === 'wrong' ? 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.06)] text-[#ffb4ad]' : 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.06)] text-[#b8f3bd]')}>{message.text}</div>}
          </div>
          <div className="mt-3 text-[10px] text-dim">Score so far: {score} · Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="escape" hud={<><HudStat icon="DoorOpen" label="Room" value={`${roomIndex + 1}/4`} color={room.color} /><HudStat icon="KeyRound" label="Locks" value={`${roomSolved}/3`} color="var(--amber)" /><HudStat icon="Lightbulb" label="Hints" value={hintsUsed.length} /><HudStat icon="Clock3" label="Time" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`} /></>}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><div className="eyebrow">Room {roomIndex + 1} of 4</div><h2 className="font-display text-xl font-semibold" style={{ color: room.color }}>{room.name}</h2><p className="mt-0.5 text-[11px] text-muted">{room.subtitle}</p></div>
          <span className="chip" style={{ borderColor: `${room.color}33`, background: `${room.color}0f`, color: room.color }}><Icon name="KeyRound" size={11} />{roomSolved}/3 locks</span>
        </div>
        <ProgressBar value={roomSolved} max={3} color={room.color} height={5} />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {room.puzzles.map((p, i) => {
            const done = (solved[room.id] ?? []).includes(p.id);
            const isActive = activePuzzle === p.id;
            return (
              <button key={p.id} onClick={() => { if (!done) { setActivePuzzle(isActive ? null : p.id); setMessage(null); setInput(''); setSequencePick([]); setChoice(null); } }} className={cn('rounded-xl border p-3 text-left transition-all', done ? 'border-[rgba(126,231,135,0.35)] bg-[rgba(126,231,135,0.05)]' : isActive ? 'border-[rgba(183,243,74,0.45)] bg-surface-2' : 'border-line bg-surface-2/60 hover:border-[var(--border-strong)]')}>
                <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: done ? 'var(--mint)' : room.color }}>Lock {i + 1}</span>{done ? <Icon name="Unlock" size={13} className="text-mint" /> : <Icon name="Lock" size={12} className="text-dim" />}</div>
                <div className="mt-1.5 line-clamp-2 text-[10.5px] font-medium leading-snug">{p.prompt}</div>
              </button>
            );
          })}
        </div>

        {currentPuzzle && (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <div className="mb-2 flex items-center gap-2"><span className="chip" style={{ color: room.color }}>Lock {room.puzzles.findIndex((p) => p.id === currentPuzzle.id) + 1}</span><span className="text-[9px] text-dim">{currentPuzzle.type}</span></div>
            <h3 className="font-display text-lg font-semibold leading-snug">{currentPuzzle.prompt}</h3>
            {currentPuzzle.type === 'sequence' ? (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap gap-1.5">{sequencePick.length === 0 ? <span className="text-[10px] text-dim">Click the options in the correct order.</span> : sequencePick.map((s, i) => <button key={`${s}-${i}`} onClick={() => setSequencePick((p) => p.filter((_, j) => j !== i))} className="chip chip-acid">{i + 1}. {s} <Icon name="X" size={9} /></button>)}</div>
                <div className="flex flex-wrap gap-1.5">{(currentPuzzle.sequence ?? []).slice().sort().map((s) => <button key={s} onClick={() => setSequencePick((p) => p.includes(s) ? p : [...p, s])} disabled={sequencePick.includes(s)} className={cn('chip', sequencePick.includes(s) && 'opacity-30')}>{s}</button>)}</div>
              </div>
            ) : currentPuzzle.type === 'choice' ? (
              <div className="mt-3 grid gap-2">{currentPuzzle.choices?.map((c, i) => <button key={c} onClick={() => setChoice(i)} className={cn('answer-tile', choice === i && 'selected')}>{c}</button>)}</div>
            ) : (
              <input className="input mt-4" type={currentPuzzle.type === 'number' ? 'number' : 'text'} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit(currentPuzzle)} placeholder={currentPuzzle.type === 'number' ? 'Enter a number…' : 'Type your answer…'} aria-label="Lock answer" />
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm" onClick={() => submit(currentPuzzle)} disabled={currentPuzzle.type === 'sequence' ? sequencePick.length !== (currentPuzzle.sequence?.length ?? 0) : currentPuzzle.type === 'choice' ? choice === null : !input.trim()} icon="KeyRound">Try lock</Button>
              <Button size="sm" variant="ghost" icon="Lightbulb" onClick={() => { setHintsUsed((h) => h.includes(currentPuzzle.id) ? h : [...h, currentPuzzle.id]); setMessage({ type: 'correct', text: currentPuzzle.hint }); }} disabled={hintsUsed.includes(currentPuzzle.id)}>{hintsUsed.includes(currentPuzzle.id) ? 'Hint used (−50)' : 'Hint (−50 points)'}</Button>
              <span className="ml-auto text-[9.5px] text-dim">Score: {score}</span>
            </div>
            {message && <div className={cn('mt-3 rounded-lg border px-3 py-2 text-[11px] leading-relaxed', message.type === 'wrong' ? 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.06)] text-[#ffb4ad]' : 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.06)] text-[#b8f3bd]')}>{message.text}</div>}
          </div>
        )}

        {roomSolved === 3 && (
          <div className="mt-4 rounded-2xl border border-[rgba(77,225,193,0.25)] bg-[rgba(77,225,193,0.05)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="flex items-center gap-1.5 text-sm font-semibold text-mint"><Icon name="Unlock" size={15} />Room cleared.</div><p className="mt-1 text-[11px] text-muted">{room.exitExplanation}</p></div><Button variant="primary" size="sm" iconRight="ArrowRight" onClick={nextRoom}>{roomIndex >= 3 ? 'Approach the final exit' : 'Enter the next room'}</Button></div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[9.5px] text-dim"><span>Hints cost 50 points each. Wrong locks do not cost lives.</span><button className="font-semibold text-muted hover:text-ink" onClick={() => finish(false)}>Give up and end run</button></div>
      </div>
    </GameShell>
  );
}