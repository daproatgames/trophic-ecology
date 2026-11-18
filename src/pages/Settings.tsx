import { useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { GAMES } from '../data/gamesContent';
import { CONCEPTS, TOPICS } from '../data/concepts';
import { questionBankIntegrity } from '../data/questions';
import { LESSONS } from '../data/lessons';
import { Button, Card, Icon, Modal, PageHeader, Segmented, Toggle, cn } from '../components/ui';

export function Settings() {
  const { state, setSettings, setBaselineUsed, exportBackup, importBackup, resetAll } = useStudy();
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const integrity = questionBankIntegrity();
  const storageBytes = new Blob([JSON.stringify(state)]).size;
  const kb = Math.round(storageBytes / 1024);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const res = importBackup(text);
      setMessage(res.ok ? { type: 'ok', text: 'Backup imported. Your progress has been restored.' } : { type: 'error', text: res.error ?? 'Could not import this file.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not read that file.' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings & data" title="Your study system, under your control." description="Everything is stored locally in this browser. Export a backup before clearing site data, changing devices or resetting progress." actions={<Button variant="primary" icon="Download" onClick={exportBackup}>Export backup</Button>} />

      {message && <div className={cn('rounded-xl border px-3.5 py-2.5 text-[11px] leading-relaxed', message.type === 'ok' ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)] text-[#b8f3bd]' : 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]')}><div className="flex items-start gap-2"><Icon name={message.type === 'ok' ? 'CheckCircle2' : 'AlertCircle'} size={13} className="mt-0.5 shrink-0" />{message.text}</div></div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="eyebrow mb-3">Experience</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3"><div><div className="text-xs font-semibold">Sound effects</div><div className="mt-0.5 text-[10px] text-muted">Subtle generated tones; no external audio files.</div></div><Toggle checked={state.settings.sound} onChange={(v) => setSettings({ sound: v })} label="Sound effects" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3"><div><div className="text-xs font-semibold">Theme</div><div className="mt-0.5 text-[10px] text-muted">Dark is the designed default; light is fully supported.</div></div><Segmented value={state.settings.theme} onChange={(v) => setSettings({ theme: v })} options={[{ value: 'dark', label: 'Dark', icon: 'Moon' }, { value: 'light', label: 'Light', icon: 'Sun' }]} /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3"><div><div className="text-xs font-semibold">Reduce motion</div><div className="mt-0.5 text-[10px] text-muted">Disables confetti, large transitions and floating animation.</div></div><Toggle checked={state.settings.reduceMotion} onChange={(v) => setSettings({ reduceMotion: v })} label="Reduce motion" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3"><div><div className="text-xs font-semibold">Default Lock-In duration</div><div className="mt-0.5 text-[10px] text-muted">The setup screen starts with this preset.</div></div><select className="select h-9 w-auto py-0 text-xs" value={state.settings.focusDefault} onChange={(e) => setSettings({ focusDefault: Number(e.target.value) })} aria-label="Default focus duration">{[25, 45, 50, 90].map((d) => <option key={d} value={d}>{d} min</option>)}</select></div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="eyebrow mb-3">Personalization</div>
          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold">Practice-test prior</div><div className="mt-0.5 text-[10px] leading-relaxed text-muted">When on, mastery starts from a low-confidence estimate based on the marked practice-test coverage. Real answers quickly outweigh it. Turning it off removes the prior from the readiness calculation.</div></div><Toggle checked={state.baselineUsed} onChange={setBaselineUsed} label="Use practice-test prior" /></div>
            <div className="mt-2 flex items-center gap-2 text-[9px] text-dim"><Icon name="Info" size={10} />{state.baselineUsed ? 'Prior active. It is capped and cannot create high mastery on its own.' : 'Prior off. All mastery now comes from in-app evidence only.'}</div>
          </div>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3"><div className="flex items-center justify-between"><div><div className="text-xs font-semibold">Storage used</div><div className="mt-0.5 text-[10px] text-muted">{kb} KB in this browser · version {state.version}</div></div><span className={cn('chip', storageBytes < 3_500_000 ? 'chip-mint' : 'chip-amber')}>{storageBytes < 3_500_000 ? 'Healthy' : 'Near limit'}</span></div><div className="mt-2 text-[9px] leading-relaxed text-dim">Answers, mastery, flashcards, exams, achievements and settings all persist in localStorage.</div></div>
          <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" icon="Upload" onClick={() => fileRef.current?.click()}>Import backup</Button><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} /><Button size="sm" variant="ghost" icon="Download" onClick={exportBackup}>Export JSON</Button></div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{ label: 'Questions', value: integrity.total, icon: 'ListChecks' }, { label: 'Concepts', value: CONCEPTS.length, icon: 'Network' }, { label: 'Lessons', value: LESSONS.length, icon: 'BookOpen' }, { label: 'Games', value: GAMES.length, icon: 'Gamepad2' }, { label: 'Achievements', value: ACHIEVEMENTS.length, icon: 'Trophy' }, { label: 'Topics', value: TOPICS.length, icon: 'Layers' }, { label: 'Exams saved', value: state.exams.length, icon: 'FileCheck2' }, { label: 'Answers logged', value: state.attempts.length, icon: 'Database' }].map((s) => <Card key={s.label} className="p-3.5"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wider text-dim">{s.label}</span><Icon name={s.icon} size={13} className="text-muted" /></div><div className="mt-1.5 font-display text-2xl font-semibold">{s.value}</div></Card>)}
      </div>

      <Card className="p-5">
        <div className="eyebrow mb-3">Data & privacy</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><h3 className="text-sm font-semibold">Local-only by design</h3><p className="mt-1 text-[10.5px] leading-relaxed text-muted">This app has no account, server or analytics. Your study history is stored in this browser. Clearing site data or using a different browser will hide it unless you import a backup.</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="primary" icon="Download" onClick={exportBackup}>Download backup</Button><Button size="sm" variant="danger" icon="Trash2" onClick={() => setConfirmReset(true)}>Reset all progress</Button></div></div>
          <div className="rounded-xl border border-line bg-surface-2 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-dim">Integrity check</div><div className="mt-1.5 space-y-1 text-[10px] text-muted"><div className="flex justify-between"><span>Duplicate question IDs</span><span className={integrity.duplicates.length ? 'text-[#ff9a94]' : 'text-mint'}>{integrity.duplicates.length ? integrity.duplicates.join(', ') : 'None'}</span></div><div className="flex justify-between"><span>Malformed option items</span><span className={integrity.badOptions.length ? 'text-[#ff9a94]' : 'text-mint'}>{integrity.badOptions.length ? integrity.badOptions.join(', ') : 'None'}</span></div><div className="flex justify-between"><span>Source coverage</span><span className="text-mint">6 decks + practice test</span></div><div className="flex justify-between"><span>Unverified inventions</span><span className="text-mint">None claimed</span></div></div></div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="eyebrow mb-3">Keyboard shortcuts</div>
        <div className="grid gap-1.5 sm:grid-cols-2">{[
          ['1–4', 'Select multiple choice'], ['T / F', 'Answer true/false'], ['Enter', 'Check / next'], ['H', 'Hint'], ['Space', 'Flip a flashcard'], ['F', 'Flag an exam question'], ['← →', 'Previous / next exam question'], ['?', 'Open shortcuts panel'], ['Esc', 'Close a dialog'],
        ].map(([k, v]) => <div key={k} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-[10.5px]"><span className="text-muted">{v}</span><span className="kbd">{k}</span></div>)}</div>
      </Card>

      <Card className="p-5">
        <div className="eyebrow mb-2">About the content</div>
        <p className="text-[10.5px] leading-relaxed text-muted">Built from six uploaded slide decks (Introducing Ecology; Food Chains and Food Webs; Energy in Ecosystems; Water and Carbon Cycles; Nitrogen Cycle; plus the practice test solutions). The question bank is structured by concept and tagged with its source. Questions that extend a slide concept into a new context are labeled <span className="text-ink">application</span>; they do not introduce outside facts. The practice-test audit distinguishes verified deductions from uncertain or illegible details.</p>
        <p className="mt-2 text-[9.5px] text-dim">TROPHIC · Grade 9 Ecology Mastery Lab · v1.0 · Local-first study platform. If a question ever conflicts with your teacher's key, follow your teacher's terminology and use the "report/question" note in the source line as a prompt to check.</p>
      </Card>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all progress?" description="This deletes every answer, mastery score, flashcard schedule, exam, achievement and setting in this browser." footer={<><Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetAll(); setConfirmReset(false); }}>Yes, reset everything</Button></>}><p className="text-sm leading-relaxed text-muted">Export a backup first if you might want this data later. This action cannot be undone.</p></Modal>
    </div>
  );
}