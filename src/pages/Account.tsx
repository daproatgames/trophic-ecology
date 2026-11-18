import { useState } from 'react';
import { useCloud } from '../state/CloudContext';
import { useStudy } from '../state/StudyContext';
import { Button, Card, Icon, PageHeader, ProgressBar, SectionTitle, cn } from '../components/ui';

export function Account() {
  const { profile, loading, error, signUp, signIn, signOut, saveProgress, restoreProgress, publishStats, clearError } = useCloud();
  const { state, analytics } = useStudy();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const ok = mode === 'up' ? await signUp(username, password, displayName || username) : await signIn(username, password);
    if (ok) setMessage({ ok: true, text: mode === 'up' ? 'Account created. Your cloud save is ready.' : 'Signed in. Your local progress is still available.' });
    setPassword('');
  };

  const cloudSave = async () => {
    const res = await saveProgress();
    setMessage(res.ok ? { ok: true, text: 'Progress backed up to your cloud account.' } : { ok: false, text: res.error ?? 'Cloud save failed.' });
  };
  const cloudRestore = async () => {
    const res = await restoreProgress();
    setMessage(res.ok ? { ok: true, text: 'Cloud save restored. Your local progress now matches it.' } : { ok: false, text: res.error ?? 'Restore failed.' });
  };
  const publish = async () => {
    const res = await publishStats();
    setMessage(res.ok ? { ok: true, text: 'Scores published to the global leaderboards.' } : { ok: false, text: res.error ?? 'Publish failed.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title={profile ? `Signed in as ${profile.name}.` : 'Keep your progress beyond one browser.'} description="TROPHIC cloud profiles are lightweight game accounts: no email, no spam. A username and password unlock your cloud save and global leaderboards on any device." actions={<a href="#/leaderboard" className="btn btn-sm" ><Icon name="Trophy" size={14} />Leaderboards</a>} />

      {message && <div className={cn('rounded-xl border px-3.5 py-2.5 text-[11px]', message.ok ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)] text-[#b8f3bd]' : 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]')}>{message.text}</div>}
      {(error || loading) && <div className={cn('rounded-xl border px-3.5 py-2.5 text-[11px]', error ? 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]' : 'border-line bg-surface-2 text-muted')}>{loading ? 'Talking to Firebase…' : error}<button className="ml-2 underline" onClick={clearError}>dismiss</button></div>}

      {profile ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-5" glow="rgba(183,243,74,0.1)">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border text-lg font-bold" style={{ borderColor: `${profile.avatar}44`, background: `${profile.avatar}14`, color: profile.avatar }}>{profile.name.slice(0, 2).toUpperCase()}</span>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-dim">Cloud profile</div><div className="font-display text-xl font-semibold">{profile.name}</div><div className="text-[10px] text-muted">@{profile.username} · {profile.id.slice(0, 8)}…</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{state.xp}</div><div className="text-[9px] text-dim">XP</div></div><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{analytics.readiness}%</div><div className="text-[9px] text-dim">readiness</div></div><div className="rounded-xl border border-line bg-surface-2 p-3"><div className="font-display text-2xl font-semibold">{analytics.questionsAnswered}</div><div className="text-[9px] text-dim">answers</div></div></div>
            <div className="mt-4 flex flex-wrap gap-2"><Button variant="primary" size="sm" icon="CloudUpload" onClick={cloudSave} disabled={loading}>Cloud save</Button><Button size="sm" icon="CloudDownload" onClick={cloudRestore} disabled={loading}>Restore cloud</Button><Button size="sm" icon="Trophy" onClick={publish} disabled={loading}>Publish stats</Button></div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-dim">Cloud save stores a snapshot. Local progress continues to save automatically even without an account.</p>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Your local evidence" description="This is what a cloud save would include." />
            <div className="space-y-2.5">{Object.entries(analytics.topicMastery).map(([id, value]) => <div key={id}><div className="mb-1 flex justify-between text-[10px]"><span className="capitalize text-muted">{id.replace('foodwebs', 'food webs')}</span><span className="font-semibold">{value}%</span></div><ProgressBar value={value} height={3} /></div>)}</div>
            <Button variant="ghost" size="sm" icon="LogOut" className="mt-4 w-full" onClick={() => { signOut(); setMessage({ ok: true, text: 'Signed out. Local progress remains on this device.' }); }}>Sign out</Button>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="p-5 sm:p-6" glow="rgba(77,225,193,0.1)">
            <div className="mb-4 flex rounded-xl border border-line bg-surface-2 p-1">{[{ id: 'in', label: 'Sign in' }, { id: 'up', label: 'Create account' }].map((m) => <button key={m.id} onClick={() => { setMode(m.id as 'in' | 'up'); clearError(); }} className={cn('flex-1 rounded-lg py-2 text-xs font-semibold transition-colors', mode === m.id ? 'bg-surface-3 text-ink shadow' : 'text-muted')}>{m.label}</button>)}</div>
            <form onSubmit={submit} className="space-y-3">
              <div><label className="label" htmlFor="acct-username">Username</label><input id="acct-username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="e.g. eco_alex" /></div>
              {mode === 'up' && <div><label className="label" htmlFor="acct-name">Display name</label><input id="acct-name" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Name shown on leaderboards" maxLength={24} /></div>}
              <div><label className="label" htmlFor="acct-password">Password</label><input id="acct-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} placeholder="At least 6 characters" /></div>
              <Button variant="primary" className="w-full" type="submit" disabled={loading} icon={mode === 'up' ? 'UserPlus' : 'LogIn'}>{loading ? 'Please wait…' : mode === 'up' ? 'Create cloud account' : 'Sign in'}</Button>
            </form>
            <p className="mt-3 text-[9px] leading-relaxed text-dim">Your password is never stored. Your account ID is a SHA-256 hash of your username/password; it is used to fetch your cloud profile. There is no email recovery, so keep your password safe.</p>
          </Card>
          <Card className="p-5">
            <div className="eyebrow mb-2">Why create an account?</div>
            <div className="space-y-3">{[
              { icon: 'Trophy', title: 'Global leaderboards', text: 'Compare karting scores, exam results, mastery and XP with everyone who plays TROPHIC.' },
              { icon: 'CloudUpload', title: 'Cloud save & restore', text: 'Move your progress between devices or recover it after clearing browser data.' },
              { icon: 'Gamepad2', title: 'No spam, no email', text: 'A lightweight username and password. No inbox, no verification link, no marketing.' },
            ].map((f) => <div key={f.title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-acid"><Icon name={f.icon} size={14} /></span><div><div className="text-xs font-semibold">{f.title}</div><p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{f.text}</p></div></div>)}</div>
            <div className="mt-4 rounded-xl border border-[rgba(255,194,75,0.2)] bg-[rgba(255,194,75,0.05)] p-3 text-[9.5px] leading-relaxed text-[#d9b876]">This is a game account, not a school identity. Do not reuse an important password.</div>
          </Card>
        </div>
      )}
    </div>
  );
}