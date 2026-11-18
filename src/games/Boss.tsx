import { useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import type { Question } from '../types';
import { BOSSES, type BossConfig } from '../data/gamesContent';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, ProgressBar, cn } from '../components/ui';
import { BossCanvas } from '../components/gameArt';
import { sound } from '../lib/sound';

export function Boss() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'select' | 'start' | 'playing' | 'reveal' | 'end'>('select');
  const [boss, setBoss] = useState<BossConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [focusUsed, setFocusUsed] = useState(false);
  const [repairUsed, setRepairUsed] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [damage, setDamage] = useState(0);
  const [shake, setShake] = useState(false);
  const [hitPopup, setHitPopup] = useState<{ key: number; text: string; color: string } | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const q = questions[index];

  const triggerHit = (text: string, color: string) => { setShake(true); setHitPopup({ key: Date.now(), text, color }); window.setTimeout(() => setShake(false), 420); window.setTimeout(() => setHitPopup(null), 900); };

  const chooseBoss = (b: BossConfig) => {
    setBoss(b);
    setPhase('start');
    setBossHp(b.hp);
  };

  const start = () => {
    if (!boss) return;
    const qs = selectQuestions(state, { count: boss.questionCount, topics: [boss.topic], types: ['mcq', 'truefalse'], minDifficulty: boss.minDifficulty, maxDifficulty: boss.maxDifficulty });
    const sorted = [...qs].sort((a, b) => a.difficulty - b.difficulty);
    setQuestions(sorted);
    setIndex(0);
    setPlayerHp(100);
    setBossHp(boss.hp);
    setStreak(0);
    setSelected(null);
    setFocusUsed(false);
    setRepairUsed(false);
    setHidden([]);
    setLog([]);
    setWon(false);
    setDamage(0);
    setRecorded(false);
    setCorrectCount(0);
    setPhase('playing');
  };

  const resolve = (choice: number | null) => {
    if (!q || !boss || phase !== 'playing') return;
    const correct = choice !== null && choice === q.answer;
    if (correct) {
      const dmg = 12 + q.difficulty * 5 + streak * 4;
      const newBossHp = Math.max(0, bossHp - dmg);
      setBossHp(newBossHp);
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setDamage(dmg);
      triggerHit(`-${dmg}`, boss.color);
      setLog((l) => [`You hit ${boss.name} for ${dmg} damage.`, ...l]);
      sound.play('correct');
      if (newBossHp <= 0) {
        setSelected(choice);
        setPhase('reveal');
        window.setTimeout(() => end(true), 900);
        return;
      }
    } else {
      const dmg = 12 + q.difficulty * 3 + Math.floor(Math.random() * 6);
      const newPlayerHp = Math.max(0, playerHp - dmg);
      setPlayerHp(newPlayerHp);
      setStreak(0);
      triggerHit(`-${dmg} HP`, '#ff6b6b');
      setLog((l) => [`${boss.name} strikes back for ${dmg} damage.`, ...l]);
      sound.play('wrong');
      if (newPlayerHp <= 0) {
        setSelected(choice);
        setPhase('reveal');
        window.setTimeout(() => end(false), 900);
        return;
      }
    }
    setSelected(choice);
    setPhase('reveal');
  };

  const end = (victory: boolean) => {
    setWon(victory);
    setPhase('end');
    if (victory) fireConfetti();
    sound.play(victory ? 'win' : 'lose');
    if (!recorded && boss) {
      setRecorded(true);
      const accuracy = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
      recordGameResult(boss.id, Math.max(0, index * 100 + (victory ? 400 : 0) + (100 - playerHp)), accuracy, { won: victory ? 1 : 0, boss: boss.name }, 30 + (victory ? 50 : 0));
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      end(false);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setHidden([]);
    setPhase('playing');
  };

  const useFocus = () => {
    if (focusUsed || !q || q.type !== 'mcq' || phase !== 'playing') return;
    const wrong = (q.options ?? []).map((_, i) => i).filter((i) => i !== q.answer);
    setHidden(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
    setFocusUsed(true);
    sound.play('pop');
  };

  const repair = () => {
    if (repairUsed || playerHp >= 100) return;
    setPlayerHp((h) => Math.min(100, h + 25));
    setRepairUsed(true);
    setLog((l) => ['You repaired 25 HP.', ...l]);
    sound.play('pop');
  };

  if (phase === 'select') {
    return (
      <GameShell gameId="boss">
        <div className="mx-auto flex min-h-[calc(100vh-170px)] max-w-4xl flex-col justify-center py-4">
          <div className="text-center"><h2 className="font-display text-2xl font-semibold">Choose your boss</h2><p className="mt-1 text-sm text-muted">Each boss draws from one topic. Their questions get harder as their HP falls.</p></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {BOSSES.map((b) => (
              <button key={b.id} onClick={() => chooseBoss(b)} className="group rounded-2xl border border-line bg-surface/60 p-5 text-left transition-all hover:-translate-y-1 hover:border-[var(--border-strong)]">
                <div className="relative mx-auto mb-1 flex h-[132px] w-[132px] items-center justify-center"><div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${b.color}24` }} /><BossCanvas bossId={b.id} color={b.color} hpPct={1} phase={0} size={132} /></div>
                <div className="text-center"><div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: b.color }}>{b.title}</div><h3 className="mt-0.5 font-display text-lg font-semibold">{b.name}</h3></div>
                <p className="mt-2 text-[10.5px] leading-relaxed text-muted">{b.description}</p>
                <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-dim">{b.hp} HP · {b.questionCount} Qs</span><span className="font-semibold" style={{ color: b.color }}>Fight →</span></div>
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  if (!boss) return null;

  if (phase === 'start') {
    return (
      <GameShell gameId="boss">
        <GameStart gameId="boss" onStart={start} best={state.gameBests[boss.id] ? { score: state.gameBests[boss.id].score, accuracy: state.gameBests[boss.id].accuracy } : null}
          rules={[
            `Fight ${boss.name} (${boss.hp} HP). You have 100 HP.`,
            'Correct answers deal 12 + (difficulty × 5) + streak damage. Wrong answers let the boss attack.',
            'You may use Focus once to remove two wrong options and Repair once to heal 25 HP.',
            'Questions get harder as the fight continues. At 50% boss HP, the phase changes.',
            'Defeat the boss before your HP reaches zero. Accuracy matters more than speed.',
          ]}
          side={<div className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-center text-[10.5px] text-muted">Boss topic: <strong className="text-ink">{boss.topic}</strong> · phases: {boss.phases.join(' → ')}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="boss">
        <GameEnd gameId="boss" score={Math.max(0, index * 100 + (won ? 400 : 0) + (100 - playerHp))} accuracy={won ? 100 : Math.max(10, 100 - Math.round((bossHp / boss.hp) * 100))} xp={30 + (won ? 50 : 0)} onReplay={start}
          message={won ? `${boss.name} defeated.` : `${boss.name} wins this round.`}
          stats={[{ label: 'Player HP', value: playerHp }, { label: 'Boss HP', value: `${bossHp}/${boss.hp}` }, { label: 'Questions', value: `${index + 1}/${questions.length}` }, { label: 'Final streak', value: streak }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 text-center text-xs leading-relaxed text-muted">{won ? 'Boss levels require actual understanding: the questions escalate and the run is unforgiving of random guessing. Your mastery evidence has been updated.' : 'The boss exposes the concept it kept attacking. Review the explanation, then run the fight again with that concept in mind.'}</div>
        </GameEnd>
      </GameShell>
    );
  }

  if (!q) return null;
  const phaseName = bossHp / boss.hp > 0.5 ? boss.phases[0] : bossHp / boss.hp > 0.2 ? boss.phases[1] : boss.phases[2];

  return (
    <GameShell gameId="boss" hud={<><HudStat icon="Heart" label="Your HP" value={`${playerHp}/100`} color="var(--coral)" /><HudStat icon="Skull" label="Boss HP" value={`${bossHp}/${boss.hp}`} color={boss.color} /><HudStat icon="Flame" label="Streak" value={`×${streak}`} color="var(--amber)" /></>}>
      <div className="grid min-h-[calc(100vh-190px)] gap-4 lg:grid-cols-[320px_1fr]">
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
          <div className={cn('relative mx-auto flex h-[300px] w-full items-center justify-center', shake && 'screen-shake')}>
            <BossCanvas bossId={boss.id} color={boss.color} hpPct={bossHp / boss.hp} phase={bossHp / boss.hp > 0.5 ? 0 : bossHp / boss.hp > 0.2 ? 1 : 2} attacking={shake} size={290} />
            {hitPopup && <div key={hitPopup.key} className="game-score-pop pointer-events-none absolute left-1/2 top-[28%] z-20 -translate-x-1/2 font-display text-4xl font-bold" style={{ color: hitPopup.color, textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>{hitPopup.text}</div>}
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: `${boss.color}33`, color: boss.color }}>{phaseName}</span>
          </div>
          <h2 className="mt-2 text-center font-display text-xl font-semibold">{boss.name}</h2>
          <div className="mt-3"><div className="mb-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-dim"><span>Boss HP</span><span style={{ color: boss.color }}>{bossHp}/{boss.hp}</span></div><ProgressBar value={bossHp} max={boss.hp} color={boss.color} height={6} /></div>
          <div className="mt-3"><div className="mb-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-dim"><span>Your HP</span><span className="text-[#ff9a94]">{playerHp}/100</span></div><ProgressBar value={playerHp} max={100} color="var(--coral)" height={6} /></div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1 text-[10px]" icon="Crosshair" onClick={useFocus} disabled={focusUsed || q.type !== 'mcq' || phase !== 'playing'}>{focusUsed ? 'Focus used' : 'Focus'}</Button>
            <Button size="sm" variant="ghost" className="flex-1 text-[10px]" icon="Wrench" onClick={repair} disabled={repairUsed || playerHp >= 100}>Repair</Button>
          </div>
          <div className="mt-3 border-t border-white/10 pt-2">
            <div className="mb-1.5 flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/30"><span>Phase</span><span>{phaseName}</span></div>
            <div className="flex gap-1">{[0,1,2].map((p) => <span key={p} className="h-1.5 flex-1 rounded-full" style={{ background: p <= (bossHp / boss.hp > 0.5 ? 0 : bossHp / boss.hp > 0.2 ? 1 : 2) ? boss.color : 'rgba(255,255,255,0.07)' }} />)}</div>
          </div>
          <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2.5">
            <div className="mb-1.5 text-[8px] font-bold uppercase tracking-wider text-white/30">Combat log</div>
            {log.length === 0 ? <p className="text-[9px] leading-relaxed text-white/25">No moves yet. Answer correctly to damage {boss.name}. Wrong answers trigger a counterattack.</p> : <div className="space-y-1">{log.slice(0, 6).map((l, i) => <div key={i} className="text-[9px] leading-relaxed text-white/45">• {l}</div>)}</div>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-[7.5px] uppercase tracking-wider text-white/30">Your hit</div><div className="text-[10px] font-semibold text-white">12 + 5×D + streak</div></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-[7.5px] uppercase tracking-wider text-white/30">Boss hit</div><div className="text-[10px] font-semibold text-white">12 + 3×D</div></div>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col">
          <div className="mb-2 flex items-center justify-between"><span className="chip" style={{ borderColor: `${boss.color}33`, background: `${boss.color}12`, color: boss.color }}>{boss.name} · {phaseName}</span><span className="text-[10px] font-bold text-dim">Q{index + 1}/{questions.length}</span></div>
          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-line bg-surface/70 p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2"><span className="chip">D{q.difficulty}</span>{streak >= 2 && <span className="chip chip-danger"><Icon name="Flame" size={10} />×{streak} damage bonus</span>}</div>
            <h2 className="font-display text-lg font-semibold leading-snug sm:text-xl">{q.prompt}</h2>
            <div className="mt-4 grid gap-2">
              {q.options?.map((opt, i) => {
                const reveal = phase === 'reveal';
                const isCorrect = q.answer === i;
                const isSelected = selected === i;
                if (hidden.includes(i) && !reveal) return null;
                return (
                  <button key={i} onClick={() => phase === 'playing' && resolve(i)} disabled={phase !== 'playing'} className={cn('answer-tile', reveal ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed' : '')}>
                    <span className="answer-key">{String.fromCharCode(65 + i)}</span><span className="pt-1 text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
            {phase === 'reveal' && (
              <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold">{selected === q.answer ? <><Icon name="Swords" size={14} style={{ color: boss.color }} />Hit for {damage} damage</> : <><Icon name="ShieldAlert" size={14} className="text-[#ff9a94]" />The boss strikes back</>}</div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{q.explanation}</p>
                {playerHp > 0 && bossHp > 0 && <Button variant="primary" size="sm" className="mt-3" iconRight="ArrowRight" onClick={next}>Next turn</Button>}
              </div>
            )}
          </div>
          <div className="mt-2 text-[9.5px] text-dim">Focus removes two wrong options. Repair heals 25 HP. Each can be used once per fight.</div>
        </div>
      </div>
    </GameShell>
  );
}