import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { KartScene, type KartView } from '../components/KartScene';
import { GameEnd, GameShell, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

type Mode = 'local' | 'ai';
type Phase = 'lobby' | 'countdown' | 'racing' | 'finished';

interface RacerState {
  progress: number;
  fuel: number;
  answers: number;
  correct: number;
  boostUntil: number;
  finishedAt?: number;
}

const INITIAL: RacerState = { progress: 0, fuel: 60, answers: 0, correct: 0, boostUntil: 0 };
const COLORS = { p1: '#b7f34a', p2: '#4de1c1' };

function accuracy(r: RacerState) { return r.answers ? Math.round((r.correct / r.answers) * 100) : 0; }

function PlayerQuestion({
  player,
  question,
  feedback,
  onAnswer,
  disabled,
  ai,
}: {
  player: 1 | 2;
  question?: Question;
  feedback?: { selected: number; correct: boolean } | null;
  onAnswer: (choice: number) => void;
  disabled?: boolean;
  ai?: boolean;
}) {
  const color = player === 1 ? COLORS.p1 : COLORS.p2;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />Player {player} {ai ? '· Nova AI' : ''}</span>
        <span className="text-[8px] text-white/30">{player === 1 ? 'KEYS 1–4' : 'KEYS 7–0'}</span>
      </div>
      {question ? (
        <>
          <div className="min-h-[46px] text-[12px] font-semibold leading-snug text-white">{question.prompt}</div>
          <div className="mt-2 grid gap-1.5">
            {question.options?.map((opt, i) => {
              const selected = feedback?.selected === i;
              const correct = feedback && i === question.answer;
              return (
                <button key={i} disabled={disabled || !!feedback} onClick={() => onAnswer(i)} className={cn('flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[10px] leading-snug transition-colors', correct ? 'border-[rgba(126,231,135,0.6)] bg-[rgba(126,231,135,0.1)] text-[#c6f8ca]' : selected ? 'border-[rgba(255,107,107,0.6)] bg-[rgba(255,107,107,0.08)] text-[#ffb4ad]' : 'border-white/10 bg-white/[0.025] text-white/60 hover:border-white/25 hover:text-white')}>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/10 text-[7px] font-bold text-white/40">{player === 1 ? i + 1 : i + 7 === 10 ? 0 : i + 7}</span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex min-h-[130px] items-center justify-center text-xs text-white/35">Nova is retrieving an answer…</div>
      )}
    </div>
  );
}

export function Karting() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<Phase>('lobby');
  const [mode, setMode] = useState<Mode>('local');
  const [laps, setLaps] = useState(2);
  const [p1, setP1] = useState<RacerState>(INITIAL);
  const [p2, setP2] = useState<RacerState>(INITIAL);
  const [questions1, setQuestions1] = useState<Question[]>([]);
  const [questions2, setQuestions2] = useState<Question[]>([]);
  const [qi1, setQi1] = useState(0);
  const [qi2, setQi2] = useState(0);
  const [feedback1, setFeedback1] = useState<{ selected: number; correct: boolean } | null>(null);
  const [feedback2, setFeedback2] = useState<{ selected: number; correct: boolean } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [raceSeconds, setRaceSeconds] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const p1Ref = useRef<RacerState>(INITIAL);
  const p2Ref = useRef<RacerState>(INITIAL);
  const raceStart = useRef(0);
  const lastTick = useRef(0);
  const aiNext = useRef(0);
  const q1Ref = useRef<Question[]>([]);
  const q2Ref = useRef<Question[]>([]);
  const qi1Ref = useRef(0);
  const qi2Ref = useRef(0);
  const feedbackLock1 = useRef(false);
  const feedbackLock2 = useRef(false);
  const winnerRef = useRef<1 | 2 | null>(null);

  const start = () => {
    const pool = selectQuestions(state, { count: 40, types: ['mcq'], avoidRecent: false });
    const half = Math.max(12, Math.floor(pool.length / 2));
    const first = pool.slice(0, half);
    const second = pool.slice(half);
    setQuestions1(first);
    setQuestions2(second.length >= 10 ? second : [...pool].reverse());
    q1Ref.current = first;
    q2Ref.current = second.length >= 10 ? second : [...pool].reverse();
    setQi1(0); setQi2(0); qi1Ref.current = 0; qi2Ref.current = 0;
    setP1(INITIAL); setP2(INITIAL); p1Ref.current = INITIAL; p2Ref.current = INITIAL;
    setFeedback1(null); setFeedback2(null); feedbackLock1.current = false; feedbackLock2.current = false;
    setWinner(null); winnerRef.current = null; setRecorded(false); setRaceSeconds(0);
    setCountdown(3);
    setPhase('countdown');
    sound.play('level');
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('racing');
      raceStart.current = performance.now();
      lastTick.current = performance.now();
      aiNext.current = performance.now() + 2600;
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 900);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  const finish = (who: 1 | 2) => {
    if (winnerRef.current) return;
    winnerRef.current = who;
    setWinner(who);
    setPhase('finished');
    if (who === 1) fireConfetti();
    sound.play(who === 1 ? 'win' : 'lose');
    if (!recorded) {
      setRecorded(true);
      const player = p1Ref.current;
      const score = Math.round(player.progress * 1000 + player.correct * 120 + player.fuel * 4);
      recordGameResult('karting', score, accuracy(player), { won: who === 1 ? 1 : 0, mode, laps }, 30 + (who === 1 ? 40 : 0));
    }
  };

  useEffect(() => {
    if (phase !== 'racing') return;
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.2, (now - lastTick.current) / 1000);
      lastTick.current = now;
      const elapsed = (now - raceStart.current) / 1000;
      setRaceSeconds(Math.floor(elapsed));
      const step = (r: RacerState): RacerState => {
        const boost = now < r.boostUntil;
        const fuel = Math.max(0, r.fuel - (4.2 + (boost ? 1.2 : 0)) * dt);
        const speed = fuel > 0 ? 0.027 + (r.fuel > 70 ? 0.004 : 0) + (boost ? 0.018 : 0) : 0;
        return { ...r, fuel, progress: Math.min(laps, r.progress + speed * dt) };
      };
      const n1 = step(p1Ref.current);
      p1Ref.current = n1; setP1(n1);
      let n2 = step(p2Ref.current);
      // AI answers on its own; local player 2 answers through the panel.
      if (mode === 'ai' && now >= aiNext.current) {
        const correct = Math.random() < 0.72;
        n2 = { ...n2, fuel: Math.min(100, n2.fuel + (correct ? 26 : -8)), boostUntil: correct ? now + 2400 : n2.boostUntil, answers: n2.answers + 1, correct: n2.correct + (correct ? 1 : 0) };
        aiNext.current = now + 2800 + Math.random() * 1200;
      }
      p2Ref.current = n2; setP2(n2);
      if (n1.progress >= laps) finish(1);
      else if (n2.progress >= laps) finish(2);
      else if (elapsed >= 120) finish(n1.progress >= n2.progress ? 1 : 2);
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, laps, mode, recorded]);

  useEffect(() => {
    if (phase !== 'racing') return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (['1', '2', '3', '4'].includes(e.key)) answer(1, Number(e.key) - 1);
      if (mode === 'local' && ['7', '8', '9', '0'].includes(e.key)) answer(2, e.key === '0' ? 3 : Number(e.key) - 7);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, qi1, qi2, feedback1, feedback2]);

  const answer = (player: 1 | 2, choice: number) => {
    if (phase !== 'racing' || winnerRef.current) return;
    const q = player === 1 ? q1Ref.current[qi1Ref.current % q1Ref.current.length] : q2Ref.current[qi2Ref.current % q2Ref.current.length];
    if (!q) return;
    if (player === 1 ? feedbackLock1.current : feedbackLock2.current) return;
    const correct = choice === q.answer;
    const now = performance.now();
    const add = (prev: RacerState): RacerState => ({
      ...prev,
      fuel: Math.min(100, prev.fuel + (correct ? 28 : -10)),
      boostUntil: correct ? now + 2600 : prev.boostUntil,
      answers: prev.answers + 1,
      correct: prev.correct + (correct ? 1 : 0),
    });
    if (player === 1) {
      feedbackLock1.current = true;
      setFeedback1({ selected: choice, correct });
      setP1((prev) => { const n = add(prev); p1Ref.current = n; return n; });
      sound.play(correct ? 'correct' : 'wrong');
      window.setTimeout(() => {
        feedbackLock1.current = false;
        setFeedback1(null);
        const next = qi1Ref.current + 1;
        qi1Ref.current = next;
        setQi1(next);
      }, 650);
    } else {
      feedbackLock2.current = true;
      setFeedback2({ selected: choice, correct });
      setP2((prev) => { const n = add(prev); p2Ref.current = n; return n; });
      sound.play(correct ? 'correct' : 'wrong');
      window.setTimeout(() => {
        feedbackLock2.current = false;
        setFeedback2(null);
        const next = qi2Ref.current + 1;
        qi2Ref.current = next;
        setQi2(next);
      }, 650);
    }
  };

  const q1 = questions1[qi1 % Math.max(1, questions1.length)];
  const q2 = questions2[qi2 % Math.max(1, questions2.length)];
  const view1: KartView = { progress: p1.progress, fuel: p1.fuel, boost: performance.now() < p1.boostUntil, color: COLORS.p1 };
  const view2: KartView = { progress: p2.progress, fuel: p2.fuel, boost: performance.now() < p2.boostUntil, color: COLORS.p2 };
  const best = state.gameBests.karting;

  if (phase === 'lobby') {
    return (
      <GameShell gameId="karting">
        <div className="relative min-h-[calc(100vh-170px)] overflow-hidden rounded-3xl border border-white/10">
          <div className="absolute inset-0"><KartScene preview className="h-full w-full" /></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,12,0.95)_0%,rgba(4,8,12,0.72)_45%,rgba(4,8,12,0.25)_100%)]" />
          <div className="relative grid min-h-[calc(100vh-170px)] items-center gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full border border-[rgba(183,243,74,0.35)] bg-[rgba(183,243,74,0.1)] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-acid">3D · Local multiplayer</span><span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">1–2 players</span></div>
              <h1 className="max-w-xl font-display text-[42px] font-semibold leading-[0.92] tracking-tight text-white sm:text-[64px]">Fuel.<br />Answer.<br /><span className="text-acid">Race.</span></h1>
              <p className="mt-3 max-w-md text-[12px] leading-relaxed text-white/55">A real 3D kart race where knowledge is the fuel. Two players race split-screen, answer their own questions, and burn fuel with every second on the track.</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[10px] text-white/55">6 min</span><span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[10px] text-white/55">Split-screen 3D</span>{best && <span className="rounded-lg border border-[rgba(183,243,74,0.3)] px-2.5 py-1.5 text-[10px] font-semibold text-acid"><Icon name="Trophy" size={10} className="mr-1 inline" />Best {best.score}</span>}</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-[#071018]/85 p-4 backdrop-blur-2xl sm:p-5">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Race setup</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setMode('local')} className={cn('rounded-xl border p-3 text-left', mode === 'local' ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.08)]' : 'border-white/10 bg-white/[0.03]')}><div className="flex items-center gap-2 text-[11px] font-semibold text-white"><Icon name="Users" size={13} />2 players</div><div className="mt-1 text-[9px] text-white/35">Local split-screen</div></button>
                <button onClick={() => setMode('ai')} className="rounded-xl border p-3 text-left" style={{ borderColor: mode === 'ai' ? 'rgba(77,225,193,0.5)' : 'rgba(255,255,255,0.1)', background: mode === 'ai' ? 'rgba(77,225,193,0.08)' : 'rgba(255,255,255,0.03)' }}><div className="flex items-center gap-2 text-[11px] font-semibold text-white"><Icon name="Bot" size={13} />Vs Nova</div><div className="mt-1 text-[9px] text-white/35">AI rival</div></button>
              </div>
              <div className="mt-3"><div className="mb-1.5 text-[8px] font-bold uppercase tracking-wider text-white/30">Race length</div><div className="flex gap-2">{[1, 2, 3].map((n) => <button key={n} onClick={() => setLaps(n)} className={cn('flex-1 rounded-lg border py-2 text-[10px] font-semibold', laps === n ? 'border-[rgba(183,243,74,0.4)] bg-[rgba(183,243,74,0.08)] text-acid' : 'border-white/10 text-white/45')}>{n} lap{n > 1 ? 's' : ''}</button>)}</div></div>
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-[9px] leading-relaxed text-white/40"><span className="font-semibold text-white/70">How it works:</span> fuel constantly drains. Every correct answer adds fuel and a boost; wrong answers cost fuel. P1 uses 1–4. P2 uses 7–0. Mobile players tap their own answer buttons.</div>
              <Button variant="primary" size="lg" className="mt-4 w-full" icon="Flag" onClick={start}>Start the race</Button>
              <div className="mt-2 text-center text-[8px] text-white/25">Correct answer = +28 fuel · Wrong = −10 fuel · Fuel 0 = stopped</div>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'finished') {
    const winnerState = winner === 1 ? p1 : p2;
    return (
      <GameShell gameId="karting" hud={<><HudStat icon="Flag" label="Laps" value={`${laps}`} color="var(--mint)" /><HudStat icon="Users" label="Mode" value={mode === 'ai' ? 'vs AI' : '2P'} color="var(--amber)" /></>}>
        <GameEnd gameId="karting" score={Math.round(winnerState.progress * 1000 + winnerState.correct * 120 + winnerState.fuel * 4)} accuracy={accuracy(winnerState)} xp={30 + (winner === 1 ? 40 : 0)} onReplay={start} message={winner === 1 ? 'P1 takes the checkered flag.' : mode === 'ai' ? 'Nova takes the checkered flag.' : 'P2 takes the checkered flag.'}
          stats={[{ label: 'Winner', value: winner === 1 ? 'Player 1' : mode === 'ai' ? 'Nova AI' : 'Player 2' }, { label: 'Laps', value: `${laps}/${laps}` }, { label: 'Race time', value: `${Math.floor(raceSeconds / 60)}:${String(raceSeconds % 60).padStart(2, '0')}` }, { label: 'Answers', value: `${p1.answers + (mode === 'local' ? p2.answers : 0)}` }]}
        >
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[{ name: 'Player 1', r: p1, color: COLORS.p1, you: winner === 1 }, { name: mode === 'ai' ? 'Nova AI' : 'Player 2', r: p2, color: COLORS.p2, you: winner === 2 }].map((x) => <div key={x.name} className={cn('rounded-2xl border p-3', x.you ? 'border-[rgba(183,243,74,0.4)] bg-[rgba(183,243,74,0.06)]' : 'border-white/10 bg-black/25')}><div className="flex items-center justify-between"><span className="text-[11px] font-semibold" style={{ color: x.color }}>{x.name}</span>{x.you && <span className="chip chip-acid">Winner</span>}</div><div className="mt-2 grid grid-cols-3 gap-2 text-[9px]"><div><div className="text-white/30">Laps</div><div className="font-semibold text-white">{Math.min(laps, Math.floor(x.r.progress))}/{laps}</div></div><div><div className="text-white/30">Correct</div><div className="font-semibold text-white">{x.r.correct}/{x.r.answers}</div></div><div><div className="text-white/30">Fuel</div><div className="font-semibold text-white">{Math.round(x.r.fuel)}</div></div></div></div>)}
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-center text-[10px] text-white/40">Every correct answer was real retrieval practice. Fuel is the game layer; the mastery evidence is the answers.</div>
        </GameEnd>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="karting" hud={<><HudStat icon="Flag" label="Race" value={`${Math.min(laps, Math.floor(Math.max(p1.progress, p2.progress)))}/${laps}`} color="var(--mint)" /><HudStat icon="Clock3" label="Time" value={`${Math.floor(raceSeconds / 60)}:${String(raceSeconds % 60).padStart(2, '0')}`} /><HudStat icon="Users" label="Mode" value={mode === 'ai' ? 'vs AI' : '2P'} /></>}>
      <div className="space-y-3">
        <div className="relative h-[340px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px]">
          <KartScene p1={view1} p2={view2} className="h-full w-full" />
          <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-bold uppercase tracking-wider" style={{ color: COLORS.p1 }}>P1 cam · {Math.min(laps, Math.floor(p1.progress) + 1)}/{laps}</div>
          <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-bold uppercase tracking-wider" style={{ color: COLORS.p2 }}>{mode === 'ai' ? 'Nova cam' : 'P2 cam'} · {Math.min(laps, Math.floor(p2.progress) + 1)}/{laps}</div>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex gap-2">
            <div className="flex-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5"><div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/35"><span style={{ color: COLORS.p1 }}>P1 fuel</span><span>{Math.round(p1.fuel)}/100</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${p1.fuel}%`, background: COLORS.p1 }} /></div></div>
            <div className="flex-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5"><div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/35"><span style={{ color: COLORS.p2 }}>{mode === 'ai' ? 'Nova' : 'P2'} fuel</span><span>{Math.round(p2.fuel)}/100</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${p2.fuel}%`, background: COLORS.p2 }} /></div></div>
          </div>
          {phase === 'countdown' && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-[2px]"><div className="text-center"><div className="font-display text-[92px] font-bold leading-none text-acid" style={{ textShadow: '0 0 60px rgba(183,243,74,0.35)' }}>{countdown}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Answer to fuel</div></div></div>}
        </div>
        <div className={cn('grid gap-3', mode === 'local' ? 'lg:grid-cols-2' : 'lg:grid-cols-[1fr_0.85fr]')}>
          <PlayerQuestion player={1} question={q1} feedback={feedback1} onAnswer={(c) => answer(1, c)} disabled={phase === 'countdown'} />
          {mode === 'local' ? <PlayerQuestion player={2} question={q2} feedback={feedback2} onAnswer={(c) => answer(2, c)} disabled={phase === 'countdown'} /> : (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-mint"><span className="h-1.5 w-1.5 rounded-full bg-mint" />Nova AI · rival</span><span className="text-[8px] text-white/30">automatic</span></div>
              <div className="mt-3 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(77,225,193,0.3)] bg-[rgba(77,225,193,0.08)] text-mint"><Icon name="Bot" size={22} /></div><div><div className="text-xs font-semibold text-white">Nova is racing.</div><div className="mt-0.5 text-[10px] text-white/40">Answers with about 72% accuracy. Uses the same fuel rules.</div></div></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]"><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-white/30">Laps</div><div className="font-semibold text-white">{Math.min(laps, Math.floor(p2.progress))}/{laps}</div></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-white/30">Correct</div><div className="font-semibold text-white">{p2.correct}/{p2.answers}</div></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-white/30">Fuel</div><div className="font-semibold text-white">{Math.round(p2.fuel)}</div></div></div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[8.5px] text-white/25"><span>P1 keys 1–4 · P2 keys 7–0 · Mobile tap options</span><span>Every correct answer adds 28 fuel and a 2.6s boost.</span></div>
      </div>
    </GameShell>
  );
}