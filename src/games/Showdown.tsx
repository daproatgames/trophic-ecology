import { useEffect, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { GameEnd, GameShell, GameStart, HudStat, Podium, fireConfetti, formatTime } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

const ROUNDS = 10;
const LIMIT = 12;
const BOTS = [
  { name: 'Nova', skill: 0.82, color: '#a78bfa' },
  { name: 'Rex', skill: 0.68, color: '#ff8a65' },
  { name: 'Luna', skill: 0.56, color: '#7dd3fc' },
];
const TILES = [
  { bg: 'linear-gradient(145deg, #d94b53, #a42f3b)', shape: 'Triangle', key: 'A' },
  { bg: 'linear-gradient(145deg, #3677e8, #2551a8)', shape: 'Diamond', key: 'B' },
  { bg: 'linear-gradient(145deg, #d99b29, #a87410)', shape: 'Circle', key: 'C' },
  { bg: 'linear-gradient(145deg, #8b5cf6, #6134c4)', shape: 'Square', key: 'D' },
];

function TimerRing({ remaining, total }: { remaining: number; total: number }) {
  const pct = Math.max(0, Math.min(1, remaining / total));
  const r = 27;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex h-[68px] w-[68px] items-center justify-center">
      <svg width="68" height="68" className="-rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={remaining < total * 0.25 ? '#ff6b6b' : '#b7f34a'} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - pct * c} className="transition-[stroke-dashoffset] duration-100" />
      </svg>
      <span className="absolute font-display text-lg font-semibold text-white">{Math.ceil(remaining)}</span>
    </div>
  );
}

export function Showdown() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'reveal' | 'end'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(LIMIT);
  const [botScores, setBotScores] = useState(BOTS.map(() => 0));
  const [roundDelta, setRoundDelta] = useState<{ you: number; bots: number[] } | null>(null);
  const [missed, setMissed] = useState<Question[]>([]);
  const [scoreFlash, setScoreFlash] = useState<string | null>(null);
  const recorded = useRef(false);
  const timerRef = useRef<number | null>(null);
  const q = questions[round];

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
  }, [phase, round, q?.id]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (q?.options?.[i]) resolve(i);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q?.id, remaining]);

  const resolve = (choice: number | null) => {
    if (!q) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const isCorrect = choice !== null && choice === q.answer;
    const timeBonus = isCorrect ? Math.round(remaining * 8) : 0;
    const comboBonus = isCorrect ? combo * 25 : 0;
    const you = isCorrect ? 100 + timeBonus + comboBonus : 0;
    const newCombo = isCorrect ? combo + 1 : 0;
    const bots = BOTS.map((b) => {
      const p = Math.max(0.18, Math.min(0.94, b.skill * (1.16 - q.difficulty * 0.075)));
      return Math.random() < p ? 90 + Math.round(Math.random() * 70) : 0;
    });
    setSelected(choice);
    setScore((s) => s + you);
    setCombo(newCombo);
    setBestCombo((b) => Math.max(b, newCombo));
    if (isCorrect) { setCorrect((c) => c + 1); sound.play('correct'); setScoreFlash(`+${you}`); }
    else { setMissed((m) => [...m, q]); sound.play('wrong'); setScoreFlash('MISS'); }
    window.setTimeout(() => setScoreFlash(null), 900);
    setBotScores((prev) => prev.map((s, i) => s + bots[i]));
    setRoundDelta({ you, bots });
    setPhase('reveal');
  };

  const next = () => {
    if (round + 1 >= questions.length) finish();
    else { setRound((r) => r + 1); setSelected(null); setRoundDelta(null); setPhase('playing'); }
  };

  const finish = () => {
    setPhase('end');
    const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const won = score >= Math.max(...botScores) ? 1 : 0;
    if (won) fireConfetti();
    if (!recorded.current) {
      recorded.current = true;
      recordGameResult('showdown', score, accuracy, { won }, 20 + won * 40);
    }
    sound.play(won ? 'win' : 'lose');
  };

  const start = () => {
    const qs = selectQuestions(state, { count: ROUNDS, types: ['mcq'], avoidRecent: true });
    if (!qs.length) return;
    setQuestions(qs); setPhase('playing'); setRound(0); setScore(0); setCombo(0); setBestCombo(0); setCorrect(0); setSelected(null); setBotScores(BOTS.map(() => 0)); setRoundDelta(null); setMissed([]); recorded.current = false;
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="showdown">
        <GameStart gameId="showdown" onStart={start} best={state.gameBests.showdown ? { score: state.gameBests.showdown.score, accuracy: state.gameBests.showdown.accuracy } : null}
          rules={[
            '10 multiple-choice questions. 12 seconds each.',
            'Correct answers earn 100 points + a speed bonus + 25 per combo.',
            'Three AI rivals answer independently based on the question difficulty.',
            'Wrong answers reset your combo. The final scoreboard decides the winner.',
            'After each round you see the explanation; the goal is accuracy under time pressure.',
          ]}
          side={<div className="grid grid-cols-4 gap-2">{BOTS.map((b) => <div key={b.name} className="rounded-xl border border-white/10 bg-black/20 p-2 text-center"><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}44` }}>{b.name.slice(0, 2).toUpperCase()}</div><div className="mt-1 text-[9px] font-semibold text-white/60">{b.name}</div><div className="text-[7.5px] text-white/25">skill {Math.round(b.skill * 100)}</div></div>)}<div className="rounded-xl border p-2 text-center" style={{ borderColor: 'rgba(183,243,74,0.35)', background: 'rgba(183,243,74,0.08)' }}><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-acid text-[9px] font-bold text-[#081006]">YOU</div><div className="mt-1 text-[9px] font-semibold text-acid">You</div><div className="text-[7.5px] text-white/30">ready</div></div></div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const entries = [{ name: 'You', score, you: true, color: 'var(--acid)' }, ...BOTS.map((b, i) => ({ name: b.name, score: botScores[i], color: b.color }))];
    return (
      <GameShell gameId="showdown">
        <GameEnd gameId="showdown" score={score} accuracy={accuracy} xp={20 + (score >= Math.max(...botScores) ? 40 : 0)} onReplay={start} message={score >= Math.max(...botScores) ? 'You took the podium.' : 'Nova takes this one. Run it back.'}
          stats={[{ label: 'Correct', value: `${correct}/${questions.length}` }, { label: 'Best combo', value: `×${bestCombo}` }, { label: 'Rivals', value: BOTS.map((b, i) => `${b.name} ${botScores[i]}`).join(' · ') }]}
        >
          <div className="mt-4"><Podium entries={entries} /></div>
          {missed.length > 0 && <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4"><div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-coral"><Icon name="Target" size={12} />Review misses</div><div className="space-y-2">{missed.map((m) => <div key={m.id} className="text-[11px] leading-relaxed text-white/55"><span className="font-semibold text-white">{m.prompt}</span><br />{m.explanation}</div>)}</div></div>}
        </GameEnd>
      </GameShell>
    );
  }

  if (!q) return null;
  const standings = [{ name: 'You', score, you: true, color: '#b7f34a' }, ...BOTS.map((b, i) => ({ name: b.name, score: botScores[i], color: b.color, you: false }))].sort((a, b) => b.score - a.score);
  const playerRank = standings.findIndex((x) => x.you) + 1;

  return (
    <GameShell gameId="showdown" hud={<><HudStat icon="Trophy" label="Score" value={score} color="var(--amber)" /><HudStat icon="Flame" label="Combo" value={`×${combo}`} color="var(--coral)" /><HudStat icon="Target" label="Round" value={`${round + 1}/${questions.length}`} /></>}>
      <div className="flex min-h-[calc(100vh-190px)] flex-col">
        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_290px]">
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-md sm:p-5">
            {scoreFlash && <div key={scoreFlash + round} className={cn('game-score-pop pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 font-display text-4xl font-bold', scoreFlash === 'MISS' ? 'text-[#ff9a94]' : 'text-acid')}>{scoreFlash}</div>}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">{q.topic}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-white/45">D{q.difficulty}</span>
                {combo >= 2 && <span className="flex items-center gap-1 rounded-full border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.08)] px-2 py-1 text-[9px] font-bold text-[#ffb4ad]"><Icon name="Flame" size={10} />{combo} combo</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden gap-0.5 sm:flex">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-5 w-1.5 rounded-full" style={{ background: i < combo ? '#b7f34a' : 'rgba(255,255,255,0.08)' }} />)}</div>
                <TimerRing remaining={remaining} total={LIMIT} />
              </div>
            </div>
            <div className="py-4 sm:py-6">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Question {round + 1} of {questions.length}</div>
              <h2 className="mt-1.5 max-w-3xl font-display text-2xl font-semibold leading-[1.12] tracking-tight text-white sm:text-[34px]">{q.prompt}</h2>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
              {q.options?.map((opt, i) => {
                const t = TILES[i];
                const reveal = phase === 'reveal';
                const isCorrect = q.answer === i;
                const isSelected = selected === i;
                return (
                  <button key={i} onClick={() => phase === 'playing' && resolve(i)} disabled={phase !== 'playing'} className={cn('kahoot-tile flex items-center gap-3 text-left sm:min-h-[110px]', reveal && isCorrect && 'correct', reveal && isSelected && !isCorrect && 'wrong', reveal && !isCorrect && !isSelected && 'muted')} style={{ background: t.bg }}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/20 text-[13px] font-extrabold">{t.key}</span>
                    <span className="relative z-10 text-[15px] font-semibold leading-snug sm:text-[17px]">{opt}</span>
                    <span className="shape absolute right-4 top-3 opacity-40"><Icon name={t.shape} size={26} /></span>
                    {reveal && isCorrect && <span className="absolute right-3 bottom-3 z-10 text-white"><Icon name="CheckCircle2" size={22} /></span>}
                    {reveal && isSelected && !isCorrect && <span className="absolute right-3 bottom-3 z-10 text-white"><Icon name="XCircle" size={22} /></span>}
                  </button>
                );
              })}
            </div>
            {phase === 'reveal' && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-[#071018]/90 p-3 backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2 text-xs font-semibold text-white">{selected === q.answer ? <><Icon name="CheckCircle2" size={14} className="text-[#7ee787]" />Correct +{roundDelta?.you ?? 0}</> : <><Icon name="XCircle" size={14} className="text-[#ff9a94]" />{selected === null ? 'Time up' : 'Not quite'}</>}</div><p className="mt-1 text-[10.5px] leading-relaxed text-white/55">{q.explanation}</p></div>
                  <Button variant="primary" size="sm" onClick={next} iconRight="ArrowRight" className="shrink-0">{round + 1 >= questions.length ? 'Final standings' : 'Next round'}</Button>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-3">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-3.5 backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between"><span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/35">Live standings</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-bold text-white/45">You #{playerRank}</span></div>
              <div className="space-y-2">{standings.map((e, i) => <div key={e.name} className={cn('relative overflow-hidden rounded-xl border p-2.5', e.you ? 'border-[rgba(183,243,74,0.35)] bg-[rgba(183,243,74,0.08)]' : 'border-white/[0.08] bg-white/[0.025]')}><div className="flex items-center gap-2"><span className="w-3 text-[9px] font-bold text-white/30">{i + 1}</span><span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-extrabold', e.you ? 'bg-acid text-[#081006]' : 'border border-white/10 text-white/60')} style={!e.you ? { background: `${e.color}1f`, color: e.color } : undefined}>{e.name.slice(0, 2).toUpperCase()}</span><span className="flex-1 text-[11px] font-semibold text-white/75">{e.name}</span><span className="font-display text-sm font-semibold text-white">{e.score}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (e.score / Math.max(1, standings[0].score)) * 100)}%`, background: e.color }} /></div></div>)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[9.5px] leading-relaxed text-white/35">{combo > 0 ? <span><span className="font-bold text-acid">Combo ×{combo}</span> adds {combo * 25} points to each correct answer.</span> : 'A correct answer starts a new combo. Speed adds up to 96 bonus points.'}</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[8px] font-bold uppercase tracking-wider text-white/30">Round stakes</div><div className="mt-1 font-display text-2xl font-semibold text-white">{formatTime(remaining)}</div><div className="text-[9px] text-white/35">Speed bonus decays with the clock.</div></div>
          </aside>
        </div>
      </div>
    </GameShell>
  );
}