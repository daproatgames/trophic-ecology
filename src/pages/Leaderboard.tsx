import { useCallback, useEffect, useState } from 'react';
import { useCloud } from '../state/CloudContext';
import type { Board, LeaderRow } from '../lib/cloud';
import { Button, Card, Icon, LinkButton, PageHeader, cn } from '../components/ui';

const BOARDS: { id: Board; name: string; description: string; icon: string; color: string; unit: string }[] = [
  { id: 'karting', name: 'Fuel Kart 3D', description: 'Best karting score. Speed, answers and fuel efficiency.', icon: 'Flag', color: '#ff8a65', unit: 'pts' },
  { id: 'exam', name: 'Exam', description: 'Best mock-exam percentage across teacher-style, quick, full and challenge papers.', icon: 'FileCheck2', color: '#7dd3fc', unit: '%' },
  { id: 'mastery', name: 'Mastery', description: 'Demonstrated test readiness from the adaptive mastery model.', icon: 'ChartNoAxesCombined', color: '#b7f34a', unit: '%' },
  { id: 'xp', name: 'XP', description: 'Long-term learning effort and progression.', icon: 'Zap', color: '#a78bfa', unit: 'XP' },
];

export function Leaderboard() {
  const { profile, getBoard, publishStats, loading } = useCloud();
  const [board, setBoard] = useState<Board>('karting');
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async (id: Board) => {
    setLoadingRows(true); setError('');
    const res = await getBoard(id);
    setLoadingRows(false);
    if (res.error) setError(res.error);
    else setRows(res.rows ?? []);
  }, [getBoard]);

  useEffect(() => { void load(board); }, [board, load]);

  const publish = async () => {
    const res = await publishStats();
    setMessage(res.ok ? 'Your scores are live.' : 'Could not publish. Check your connection.');
    if (res.ok) void load(board);
  };

  const meta = BOARDS.find((b) => b.id === board)!;
  const myIndex = profile ? rows.findIndex((r) => r.id === profile.id) : -1;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Global leaderboards" title="The unit is bigger than your browser." description="Cloud scores are shared across devices through Firebase. Sign in to publish your karting, exam, mastery and XP records — then see exactly where you stand." actions={profile ? <Button variant="primary" icon="CloudUpload" onClick={publish} disabled={loading}>{loading ? 'Publishing…' : 'Publish my stats'}</Button> : <LinkButton to="/account" variant="primary" icon="UserPlus">Create a cloud account</LinkButton>} />

      {message && <div className="rounded-xl border border-[rgba(183,243,74,0.25)] bg-[rgba(183,243,74,0.05)] px-3.5 py-2.5 text-[11px] text-[#d9f99d]">{message}</div>}

      <div className="scroll-x">
        {BOARDS.map((b) => <button key={b.id} onClick={() => setBoard(b.id)} className={cn('chip shrink-0', board === b.id && 'chip-acid')} style={board === b.id ? undefined : undefined}><Icon name={b.icon} size={11} />{b.name}</button>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
            <div><div className="eyebrow mb-1" style={{ color: meta.color }}>{meta.name} leaderboard</div><h2 className="font-display text-xl font-semibold">{meta.description}</h2></div>
            <Button size="sm" variant="ghost" icon="RefreshCw" onClick={() => void load(board)} disabled={loadingRows}>Refresh</Button>
          </div>
          {loadingRows ? <div className="flex items-center justify-center p-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-acid" /></div> : error ? <div className="p-8 text-center"><Icon name="CloudOff" size={24} className="mb-2 text-coral" /><p className="text-xs text-muted">{error}</p><Button size="sm" className="mt-3" onClick={() => void load(board)}>Try again</Button></div> : rows.length === 0 ? (
            <div className="empty-state m-5"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted"><Icon name={meta.icon} size={21} /></div><h3 className="font-display text-lg font-semibold">No scores yet.</h3><p className="mt-1 text-xs text-muted">Be the first to claim this board.</p>{profile ? <Button variant="primary" size="sm" className="mt-3" onClick={publish} icon="CloudUpload">Publish my score</Button> : <LinkButton to="/account" variant="primary" size="sm" className="mt-3" icon="UserPlus">Create an account</LinkButton>}</div>
          ) : (
            <div className="divide-y divide-line">
              {rows.map((r, i) => {
                const mine = profile?.id === r.id;
                const medal = i === 0 ? '#ffc24b' : i === 1 ? '#c6d3d0' : i === 2 ? '#d9a26a' : 'var(--muted)';
                return <div key={r.id} className={cn('flex items-center gap-3 px-4 py-3 sm:px-5', mine && 'bg-[rgba(183,243,74,0.06)]')}><span className="w-7 font-display text-lg font-semibold" style={{ color: medal }}>{i + 1}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: `${r.avatar ?? '#b7f34a'}18`, color: r.avatar ?? '#b7f34a', border: `1px solid ${r.avatar ?? '#b7f34a'}33` }}>{r.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{r.name}{mine && <span className="ml-1.5 text-[8px] uppercase tracking-wider text-acid">you</span>}</div><div className="text-[9px] text-dim">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'} · {r.accuracy}% accuracy</div></div><div className="text-right"><div className="font-display text-lg font-semibold tabular-nums">{r.score.toLocaleString()}<span className="ml-1 text-[9px] font-normal text-dim">{meta.unit}</span></div>{i === 0 && <div className="text-[8px] font-bold uppercase tracking-wider text-amber">Leader</div>}</div></div>;
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="eyebrow mb-2">Your position</div>
            {profile ? <><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: `${profile.avatar}18`, color: profile.avatar }}>{profile.name.slice(0, 2).toUpperCase()}</span><div><div className="text-xs font-semibold">{profile.name}</div><div className="text-[9px] text-dim">@{profile.username}</div></div></div><div className="mt-3 rounded-xl border border-line bg-surface-2 p-3"><div className="text-[9px] uppercase tracking-wider text-dim">Current rank</div><div className="mt-1 font-display text-3xl font-semibold">{myIndex >= 0 ? `#${myIndex + 1}` : '—'}</div><div className="text-[9px] text-muted">{myIndex >= 0 ? `${rows[myIndex].score.toLocaleString()} ${meta.unit}` : 'Publish your stats to enter.'}</div></div><Button size="sm" variant="primary" className="mt-3 w-full" onClick={publish} icon="Trophy">Publish stats</Button></> : <><p className="text-[10.5px] leading-relaxed text-muted">Create a free cloud profile to enter global boards and carry progress across devices.</p><LinkButton to="/account" variant="primary" size="sm" className="mt-3 w-full" icon="UserPlus">Create account</LinkButton></>}
          </Card>
          <Card className="p-4"><div className="eyebrow mb-2">How scores work</div><div className="space-y-2 text-[10px] leading-relaxed text-muted"><div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Karting: best score, submitted after a race.</div><div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Exam: best percentage, submitted after marking.</div><div className="flex gap-2"><Icon name="Check" size={11} className="mt-0.5 shrink-0 text-mint" />Mastery and XP: published from your account.</div><div className="flex gap-2"><Icon name="ShieldCheck" size={11} className="mt-0.5 shrink-0 text-mint" />One entry per account; updates replace your previous best.</div></div></Card>
        </div>
      </div>
    </div>
  );
}