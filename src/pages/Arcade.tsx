import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';
import { GAMES, GAME_MAP, type GameMeta } from '../data/gamesContent';
import { Button, Card, Icon, LinkButton, PageHeader, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

const CATEGORIES = [
  { id: 'all', label: 'All games' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'boss', label: 'Boss' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'recall', label: 'Recall' },
  { id: 'lab', label: 'Lab' },
  { id: 'capstone', label: 'Capstone' },
  { id: 'race', label: '3D / Multiplayer' },
];

function GameArt({ game, large }: { game: GameMeta; large?: boolean }) {
  const color = game.color;
  const common = 'absolute inset-0';
  return (
    <div className={cn('relative overflow-hidden border-b border-line', large ? 'h-[150px]' : 'h-[120px]')} style={{ background: `linear-gradient(135deg, ${color}18, transparent 65%)` }}>
      <div className={common} style={{ backgroundImage: `radial-gradient(circle at 75% 20%, ${color}22, transparent 45%)` }} />
      <div className="absolute -right-4 -top-6 font-display text-[100px] font-bold leading-none opacity-[0.06]" style={{ color }}>{game.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        {game.id === 'showdown' && (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-2xl border" style={{ borderColor: `${color}55`, background: `${color}18`, color }}><Icon name="Swords" size={28} /></div>
            <div className="font-display text-2xl font-bold text-dim">VS</div>
            <div className="flex h-14 w-14 rotate-[6deg] items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted"><Icon name="Bot" size={24} /></div>
          </div>
        )}
        {game.id === 'tower' && (
          <div className="flex flex-col items-center gap-0.5">{[70, 56, 44, 32].map((w, i) => <div key={w} className="h-3 rounded-sm border" style={{ width: w, borderColor: `${color}66`, background: `${color}${20 + i * 6}` }} />)}<div className="mt-1 h-3 w-3 rounded-full" style={{ background: color }} /></div>
        )}
        {game.id === 'boss' && <div className="relative"><div className="absolute inset-0 animate-pulse rounded-full blur-xl" style={{ background: `${color}33` }} /><div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2" style={{ borderColor: `${color}66`, color }}><Icon name="Skull" size={36} /></div></div>}
        {game.id === 'speed' && <div className="relative h-20 w-28"><div className="absolute bottom-0 left-1/2 h-16 w-32 -translate-x-1/2 rounded-t-full border-4 border-b-0" style={{ borderColor: `${color}66` }} /><div className="absolute bottom-0 left-1/2 h-1 w-14 origin-left rotate-[-35deg] rounded-full" style={{ background: color }} /><div className="absolute bottom-[-4px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: color }} /></div>}
        {game.id === 'memory' && <div className="grid grid-cols-3 gap-1.5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex h-8 w-8 items-center justify-center rounded-md border" style={{ borderColor: `${color}40`, background: i % 2 ? `${color}16` : 'var(--surface-2)', color }}>{i % 3 === 0 ? <Icon name="Leaf" size={12} /> : null}</div>)}</div>}
        {game.id === 'jeopardy' && <div className="grid grid-cols-5 gap-1">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="flex h-5 w-9 items-center justify-center rounded-[3px] border font-display text-[8px] font-bold" style={{ borderColor: `${color}45`, background: `${color}${10 + (i % 3) * 5}`, color }}>{['100', '300', '500'][i % 3]}</div>)}</div>}
        {game.id === 'escape' && <div className="relative flex h-20 w-16 items-end justify-center"><div className="h-20 w-16 rounded-t-full border-2" style={{ borderColor: `${color}55`, background: `${color}10` }} /><div className="absolute bottom-2 h-2 w-2 rounded-full" style={{ background: color }} /></div>}
        {game.id === 'detective' && <div className="relative"><Icon name="Search" size={54} style={{ color }} /><div className="absolute -bottom-1 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-[10px]">?</div></div>}
        {game.id === 'flashcards' && <div className="relative h-16 w-24"><div className="absolute left-3 top-2 h-14 w-20 rotate-[-8deg] rounded-lg border" style={{ borderColor: `${color}33`, background: `${color}08` }} /><div className="absolute left-0 top-0 flex h-14 w-20 rotate-[4deg] items-center justify-center rounded-lg border" style={{ borderColor: `${color}55`, background: `${color}14`, color }}><Icon name="Leaf" size={24} /></div></div>}
        {game.id === 'fill' && <div className="w-32 space-y-2"><div className="h-2 w-full rounded bg-surface-3" /><div className="flex items-center gap-1"><div className="h-2 w-10 rounded bg-surface-3" /><div className="h-5 w-14 rounded border border-dashed" style={{ borderColor: color, background: `${color}12` }} /><div className="h-2 w-8 rounded bg-surface-3" /></div><div className="h-2 w-4/5 rounded bg-surface-3" /></div>}
        {game.id === 'drag' && <div className="relative h-20 w-32"><div className="absolute left-0 top-8 h-8 w-8 rounded-lg border" style={{ borderColor: `${color}55`, background: `${color}14`, color }}><Icon name="Leaf" size={15} /></div><div className="absolute right-0 top-0 h-8 w-8 rounded-lg border border-line bg-surface-2" /><div className="absolute bottom-0 right-4 h-8 w-8 rounded-lg border border-line bg-surface-2" /><svg className="absolute inset-0" viewBox="0 0 128 80"><path d="M34 46 C60 46, 60 18, 90 18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" /><path d="M34 46 C60 50, 70 64, 94 66" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" /></svg></div>}
        {game.id === 'survival' && <div className="flex items-center gap-1.5">{[0, 1, 2].map((i) => <Icon key={i} name="Heart" size={32} className="animate-pulse" style={{ color, animationDelay: `${i * 0.15}s` } as React.CSSProperties} />)}</div>}
        {game.id === 'truefalse' && <div className="flex items-center gap-3"><div className="flex h-11 w-16 items-center justify-center rounded-full border-2" style={{ borderColor: `${color}55`, background: `${color}12` }}><div className="h-8 w-8 translate-x-2 rounded-full" style={{ background: color }} /></div><span className="font-display text-2xl font-bold" style={{ color }}>T/F</span></div>}
        {game.id === 'karting' && (
          <div className="relative h-24 w-40">
            <div className="absolute bottom-2 left-0 right-0 h-10 rounded-[50%] border-4 border-white/15" />
            <div className="absolute bottom-5 left-2 h-5 w-10 rounded-md border border-[rgba(255,138,101,0.5)] bg-[rgba(255,138,101,0.2)]" />
            <div className="absolute bottom-5 right-4 h-5 w-10 rounded-md border border-[rgba(77,225,193,0.5)] bg-[rgba(77,225,193,0.2)]" />
            <div className="absolute left-1/2 top-1 -translate-x-1/2 font-display text-[46px] font-bold text-white/10">3D</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-[0.2em] text-[#FF8A65]">local multiplayer</div>
          </div>
        )}
        {game.id === 'wordle' && <div className="flex gap-1.5">{['T', 'R', 'O', 'P', 'H'].map((l, i) => <div key={l} className="flex h-10 w-10 items-center justify-center rounded-md border font-display text-sm font-bold" style={{ borderColor: i === 0 || i === 4 ? color : 'var(--border)', background: i === 0 ? color : i === 4 ? `${color}30` : i === 2 ? 'rgba(255,194,75,0.25)' : 'var(--surface-2)', color: i === 0 ? '#081006' : 'var(--text)' }}>{l}</div>)}</div>}
        {game.id === 'gauntlet' && <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((n) => <div key={n} className="flex h-10 w-8 items-center justify-center rounded-md border font-display text-[10px] font-bold" style={{ borderColor: `${color}${40 + n * 8}`, background: `${color}${8 + n * 3}`, color }}>{n}</div>)}</div>}
      </div>
    </div>
  );
}

export function Arcade() {
  const { state, analytics } = useStudy();
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();
  const filtered = useMemo(() => category === 'all' ? GAMES : GAMES.filter((g) => g.category === category), [category]);
  const played = Object.keys(state.gameBests).filter((id) => GAME_MAP[id]).length;
  const unlocked = GAMES.filter((g) => analytics.level >= g.unlockLevel).length;
  const recommended = GAMES.find((g) => g.id === 'flashcards')!;

  const randomGame = () => {
    const pool = GAMES.filter((g) => analytics.level >= g.unlockLevel);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    sound.play('click');
    navigate(`/arcade/${pick.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arcade"
        title="Play with a purpose."
        description="Every game writes real evidence to the same mastery model. Speed is never worth more than understanding: repeated easy answers earn less XP and cannot push a concept to mastery."
        actions={<><Button icon="Shuffle" onClick={randomGame}>Surprise me</Button><LinkButton to="/practice?mode=review" variant="primary" icon="RotateCcw">Clear due reviews</LinkButton></>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Games', value: GAMES.length, icon: 'Gamepad2', color: 'var(--acid)' },
          { label: 'Unlocked', value: unlocked, icon: 'LockOpen', color: 'var(--mint)' },
          { label: 'Games played', value: played, icon: 'PlayCircle', color: 'var(--amber)' },
          { label: 'Best-run XP', value: Object.values(state.gameBests).reduce((s, b) => s + b.score, 0), icon: 'Trophy', color: 'var(--violet)' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wider text-dim">{s.label}</span><span style={{ color: s.color }}><Icon name={s.icon} size={14} /></span></div>
            <div className="mt-2 font-display text-2xl font-semibold">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" glow="rgba(255,138,101,0.12)">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,138,101,0.1)] text-[#FF8A65]"><Icon name="Users" size={18} /></span><div><div className="eyebrow mb-1">New · 3D multiplayer</div><h2 className="font-display text-lg font-semibold">Fuel Kart 3D</h2><p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted">Online room codes, local split-screen, and a simple rule: correct answers are fuel. Race a friend on another device or Nova AI on a rendered 3D circuit.</p></div></div>
        <LinkButton to="/arcade/karting" variant="primary" size="sm" icon="Flag">Start engine</LinkButton>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" glow="rgba(244,114,182,0.1)">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(244,114,182,0.1)] text-pink"><Icon name="Sparkles" size={18} /></span>
          <div><div className="eyebrow mb-1">Recommended for your data</div><h2 className="font-display text-lg font-semibold">{recommended.name}</h2><p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted">{state.flashcards && Object.keys(state.flashcards).length ? 'Your flashcard schedule has cards ready. Confidence ratings update the next due date, so the app remembers what needs another pass.' : 'Build your first spaced-repetition schedule. Rate each card honestly; due dates adapt to your recall.'}</p></div>
        </div>
        <LinkButton to="/arcade/flashcards" variant="primary" size="sm" icon="Layers">Review cards</LinkButton>
      </Card>

      <div className="scroll-x">
        {CATEGORIES.map((c) => <button key={c.id} onClick={() => setCategory(c.id)} className={cn('chip shrink-0', category === c.id && 'chip-acid')}>{c.label}<span className="ml-1 text-[9px] opacity-60">{c.id === 'all' ? GAMES.length : GAMES.filter((g) => g.category === c.id).length}</span></button>)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((game) => {
          const locked = analytics.level < game.unlockLevel;
          const best = state.gameBests[game.id];
          return (
            <Card key={game.id} className={cn('group overflow-hidden p-0', locked && 'opacity-90')} hover>
              <GameArt game={game} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><h3 className="font-display text-lg font-semibold leading-tight">{game.name}</h3><p className="mt-0.5 text-[11px] font-medium" style={{ color: game.color }}>{game.tagline}</p></div>
                  {locked ? <span className="chip"><Icon name="Lock" size={10} />Lv {game.unlockLevel}</span> : <><span className="chip chip-mint">{best ? `${best.score} pts` : 'New'}</span>{game.multiplayer && <span className="chip chip-amber">2P</span>}</>}
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted">{game.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{game.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}<span className="chip"><Icon name="Clock3" size={10} />{game.minutes} min</span></div>
                {locked ? (
                  <div className="mt-3 rounded-lg border border-line bg-surface-2 p-2.5">
                    <div className="mb-1 flex justify-between text-[9px] font-semibold text-dim"><span>Reach Level {game.unlockLevel}</span><span>{analytics.level}/{game.unlockLevel}</span></div>
                    <ProgressBar value={analytics.level} max={game.unlockLevel} height={4} />
                    <Link to="/practice?mode=mixed" className="mt-1.5 inline-flex text-[9.5px] font-semibold text-acid">Earn XP in practice →</Link>
                  </div>
                ) : (
                  <Link to={`/arcade/${game.id}`} className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-[11px] font-semibold transition-colors group-hover:border-[var(--border-strong)]">
                    <span>Play {game.name}</span><Icon name="ArrowRight" size={13} />
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(183,243,74,0.1)] text-acid"><Icon name="ShieldCheck" size={15} /></span><p className="text-[11px] leading-relaxed text-muted"><strong className="text-ink">Anti-farming rules:</strong> repeated correct answers earn 30% XP, mastery caps based on distinct questions and formats, and self-rated flashcards do not inflate concept mastery.</p></div>
        <LinkButton to="/progress" size="sm" icon="ChartNoAxesCombined">See the model</LinkButton>
      </Card>
    </div>
  );
}