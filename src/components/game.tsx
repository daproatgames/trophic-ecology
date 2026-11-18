import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import type { Question } from '../types';
import { GAME_MAP } from '../data/gamesContent';
import { CountUp, Button, Icon, LinkButton, ProgressBar, Ring, cn } from './ui';
import { useStudy } from '../state/StudyContext';

export function fireConfetti(colors = ['#b7f34a', '#4de1c1', '#ffc24b', '#a78bfa', '#f472b6']) {
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.62 }, colors, disableForReducedMotion: true, zIndex: 90 });
  window.setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors, zIndex: 90 }), 160);
  window.setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors, zIndex: 90 }), 240);
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const endedRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  useEffect(() => { setRemaining(seconds); endedRef.current = false; }, [seconds]);
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const initial = remaining;
    const timer = window.setInterval(() => {
      const left = Math.max(0, initial - (Date.now() - start) / 1000);
      setRemaining(left);
      if (left <= 0 && !endedRef.current) {
        endedRef.current = true;
        window.clearInterval(timer);
        onEndRef.current();
      }
    }, 100);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return remaining;
}

export function useStopwatch(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const t = window.setInterval(() => setSeconds((Date.now() - start) / 1000), 250);
    return () => window.clearInterval(t);
  }, [running]);
  return seconds;
}

/** A real animated particle field behind the games. */
function GameBackdrop({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = Array.from({ length: 58 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 2.1 + 0.4,
      vx: (Math.random() - 0.5) * 0.00016, vy: -Math.random() * 0.00025 - 0.00004,
      a: Math.random() * 0.5 + 0.08,
    }));
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // faint orbit rings
      ctx.save();
      ctx.translate(w * 0.72, h * 0.34);
      ctx.rotate(0.3);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.05;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 130 * i, 48 * i, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color]);
  return (
    <>
      <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" style={{ background: `radial-gradient(ellipse 60% 45% at 70% 0%, ${color}1f, transparent 65%), radial-gradient(ellipse 50% 45% at 10% 100%, ${color}0d, transparent 65%)` }} />
      <div className="game-scanlines pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
    </>
  );
}

export function GameShell({
  gameId,
  children,
  hud,
  compact,
}: {
  gameId: string;
  children: React.ReactNode;
  hud?: React.ReactNode;
  compact?: boolean;
}) {
  const game = GAME_MAP[gameId];
  const { state, setSettings } = useStudy();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!game) return <div className="empty-state">Game not found.</div>;
  return (
    <div className="game-page relative min-h-screen overflow-x-hidden" style={{ '--game-color': game.color, '--game-color-soft': `${game.color}22` } as React.CSSProperties}>
      <GameBackdrop color={game.color} />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1340px] flex-col px-3 pb-5 pt-3 sm:px-6 sm:pt-5">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link to="/arcade" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-white/70 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white" aria-label="Back to arcade"><Icon name="ArrowLeft" size={17} /></Link>
            <span className="hidden h-8 w-[1px] bg-white/10 sm:block" />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${game.color}55`, background: `${game.color}16`, color: game.color }}><Icon name={game.icon} size={17} /></span>
            <div className="min-w-0">
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/40">{game.category} · {game.skills.slice(0, 2).join(' / ')}</div>
              <h1 className="truncate font-display text-lg font-semibold leading-tight text-white sm:text-xl">{game.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hud}
            <span className="hidden h-7 w-[1px] bg-white/10 sm:block" />
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-white/50 backdrop-blur-md hover:text-white" onClick={() => setSettings({ sound: !state.settings.sound })} aria-label="Toggle sound"><Icon name={state.settings.sound ? 'Volume2' : 'VolumeX'} size={15} /></button>
          </div>
        </header>
        <main className={cn('relative flex-1', compact ? '' : 'py-1')}>{children}</main>
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[9px] text-white/30">
          <span>{game.tagline}</span>
          <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full" style={{ background: game.color }} />Answers update your real mastery model</span>
        </footer>
      </div>
      {mounted && <div className="pointer-events-none fixed inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${game.color}, transparent)` }} />}
    </div>
  );
}

export function HudStat({ icon, label, value, color }: { icon: string; label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 backdrop-blur-md">
      <span style={{ color: color ?? 'rgba(255,255,255,0.55)' }}><Icon name={icon} size={13} /></span>
      <div className="leading-none"><div className="text-[7.5px] font-bold uppercase tracking-wider text-white/35">{label}</div><div className="mt-0.5 text-[11px] font-bold tabular-nums text-white">{value}</div></div>
    </div>
  );
}

export function GameStart({
  gameId,
  rules,
  children,
  onStart,
  startLabel = 'Enter the arena',
  best,
  side,
}: {
  gameId: string;
  rules: string[];
  children?: React.ReactNode;
  onStart: () => void;
  startLabel?: string;
  best?: { score: number; accuracy: number } | null;
  side?: React.ReactNode;
}) {
  const game = GAME_MAP[gameId];
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-170px)] w-full max-w-6xl items-center justify-center py-3">
      <span className="pointer-events-none absolute -left-10 bottom-0 hidden font-display text-[280px] font-bold leading-none text-white/[0.018] lg:block">{game.name.slice(0, 1)}</span>
      <span className="pointer-events-none absolute -right-20 top-10 hidden h-72 w-72 rounded-full border border-white/[0.04] lg:block" />
      <div className="relative grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <div className="relative mx-auto mb-5 flex h-32 w-32 items-center justify-center lg:mx-0">
            <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-dashed" style={{ borderColor: `${game.color}44` }} />
            <div className="absolute inset-4 rounded-full border" style={{ borderColor: `${game.color}22`, background: `${game.color}08` }} />
            <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${game.color}22` }} />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl border" style={{ borderColor: `${game.color}66`, background: `linear-gradient(145deg, ${game.color}22, rgba(0,0,0,0.35))`, color: game.color }}><Icon name={game.icon} size={38} /></span>
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/50"><span className="h-1 w-1 rounded-full" style={{ background: game.color }} />{game.category} mode</div>
          <h2 className="font-display text-[34px] font-semibold leading-[0.98] tracking-tight text-white sm:text-[48px]">{game.name}</h2>
          <p className="mt-2 font-display text-lg font-medium" style={{ color: game.color }}>{game.tagline}</p>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-white/50 lg:mx-0">{game.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[10px] text-white/55"><Icon name="Clock3" size={11} />{game.minutes} min</span>
            {game.skills.map((s) => <span key={s} className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[10px] text-white/55">{s}</span>)}
            {best && <span className="rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold" style={{ borderColor: `${game.color}44`, color: game.color }}><Icon name="Trophy" size={10} className="mr-1 inline" />Best {best.score}</span>}
          </div>
          <div className="mt-5"><Button variant="primary" size="lg" icon="Play" onClick={onStart} className="w-full shadow-2xl lg:w-auto">{startLabel}</Button></div>
          {side && <div className="mt-5">{side}</div>}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Mission briefing</span><span className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-1 w-4 rounded-full" style={{ background: i < 3 ? game.color : 'rgba(255,255,255,0.1)' }} />)}</span></div>
          <div className="space-y-2.5">{rules.map((r, i) => <div key={r} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[8px] font-bold" style={{ borderColor: `${game.color}33`, color: game.color }}>{String(i + 1).padStart(2, '0')}</span><span className="text-[10.5px] leading-relaxed text-white/55">{r}</span></div>)}</div>
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function GameEnd({
  gameId,
  score,
  accuracy,
  xp,
  stats,
  onReplay,
  hideReplay,
  extra,
  message,
  children,
}: {
  gameId: string;
  score: number;
  accuracy: number;
  xp?: number;
  stats?: { label: string; value: string | number }[];
  onReplay: () => void;
  hideReplay?: boolean;
  extra?: React.ReactNode;
  message?: string;
  children?: React.ReactNode;
}) {
  const game = GAME_MAP[gameId];
  return (
    <div className="mx-auto w-full max-w-4xl py-3 sm:py-6">
      <div className="text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${game.color}33` }} />
          <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-dashed" style={{ borderColor: `${game.color}44` }} />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border" style={{ borderColor: `${game.color}66`, background: `${game.color}16`, color: game.color }}><Icon name="Trophy" size={26} /></span>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: game.color }}>Run complete</div>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{message ?? 'Session saved.'}</h2>
        <p className="mt-1 text-[11px] text-white/40">{game.name} · evidence written to your mastery model</p>
      </div>

      <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl sm:grid-cols-[180px_1fr] sm:p-5">
        <div className="flex items-center justify-center"><Ring value={accuracy} size={156} stroke={10} colorFrom={game.color} colorTo="var(--acid)"><span className="font-display text-4xl font-semibold text-white">{Math.round(accuracy)}%</span><span className="text-[8px] uppercase tracking-wider text-white/35">accuracy</span></Ring></div>
        <div>
          <div className="flex items-end justify-between"><div><div className="text-[8.5px] font-bold uppercase tracking-wider text-white/35">Final score</div><div className="font-display text-5xl font-semibold tracking-tight text-white"><CountUp value={score} /></div></div>{xp !== undefined && <span className="rounded-lg border px-2.5 py-1.5 text-[11px] font-bold" style={{ borderColor: `${game.color}44`, background: `${game.color}12`, color: game.color }}>+{xp} XP</span>}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{stats?.map((s) => <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-2"><div className="text-[8px] uppercase tracking-wider text-white/30">{s.label}</div><div className="mt-0.5 text-sm font-semibold text-white">{s.value}</div></div>)}</div>
        </div>
      </div>
      {children}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {!hideReplay && <Button variant="primary" icon="RotateCcw" onClick={onReplay}>Run it again</Button>}
        <LinkButton to="/arcade" icon="Gamepad2">Arcade</LinkButton>
        <LinkButton to="/progress" icon="ChartNoAxesCombined">Progress</LinkButton>
      </div>
      {extra}
    </div>
  );
}

export function ScoreBar({ score, max, color = 'var(--acid)' }: { score: number; max: number; color?: string }) {
  return <ProgressBar value={score} max={max} height={5} color={color} />;
}

export function Podium({ entries }: { entries: { name: string; score: number; you?: boolean; color?: string }[] }) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const order = [1, 0, 2];
  return (
    <div className="flex items-end justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
      {order.map((idx, place) => {
        const e = sorted[idx];
        if (!e) return null;
        const heights = [92, 128, 72];
        return (
          <div key={e.name} className="flex max-w-[160px] flex-1 flex-col items-center">
            <div className={cn('mb-1.5 flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold', e.you ? 'text-[#071006]' : 'border border-white/15 bg-white/5 text-white/50')} style={e.you ? { background: 'var(--acid)' } : undefined}>{e.name.slice(0, 2).toUpperCase()}</div>
            <div className="text-[10px] font-semibold text-white">{e.name}</div>
            <div className="text-[9px] text-white/35">{e.score.toLocaleString()}</div>
            <div className="mt-1 flex w-full items-start justify-center rounded-t-lg border border-b-0 border-white/10 bg-white/[0.05] pt-2 font-display text-lg font-bold" style={{ height: heights[place], color: place === 1 ? 'var(--amber)' : 'rgba(255,255,255,0.4)' }}>{idx + 1}</div>
          </div>
        );
      })}
    </div>
  );
}

export function QuestionTimer({ remaining, total, color = 'var(--acid)' }: { remaining: number; total: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all duration-100" style={{ width: `${pct}%`, background: remaining < total * 0.25 ? 'var(--coral)' : color, boxShadow: `0 0 12px ${color}66` }} /></div>
      <span className="w-8 text-right text-[10px] font-bold tabular-nums" style={{ color: remaining < total * 0.25 ? 'var(--coral)' : 'rgba(255,255,255,0.45)' }}>{Math.ceil(remaining)}s</span>
    </div>
  );
}

export function GameQuestionMeta({ question, index, total }: { question: Question; index?: number; total?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white/45">{question.topic}</span>
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-white/45">D{question.difficulty}</span>
      {index !== undefined && total !== undefined && <span className="ml-auto text-[10px] font-bold text-white/30">{index + 1}/{total}</span>}
    </div>
  );
}

export function GameLocked({ level }: { level: number }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/30"><Icon name="Lock" size={32} /></div>
        <div className="eyebrow mb-1">Capstone locked</div>
        <h1 className="font-display text-3xl font-semibold">Reach Level {level} first.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">The Final Exam Gauntlet is the capstone test of this unit. Earn XP through practice, lessons or any arcade game. XP alone does not raise mastery, but it unlocks this run.</p>
        <div className="mt-5 rounded-xl border border-line bg-surface p-3"><ProgressBar value={0} max={level} /></div>
        <div className="mt-5 flex justify-center gap-2"><LinkButton to="/practice?mode=mixed" variant="primary" icon="Dumbbell">Earn XP in practice</LinkButton><LinkButton to="/arcade" icon="Gamepad2">Other games</LinkButton></div>
      </div>
    </div>
  );
}

export function ScorePopup({ text, color = 'var(--acid)', show }: { text: string; color?: string; show: boolean }) {
  return (
    <span className={cn('pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 font-display text-4xl font-bold transition-all duration-500', show ? 'opacity-100' : 'opacity-0')} style={{ color }}>{text}</span>
  );
}