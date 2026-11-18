import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useStudy } from '../state/StudyContext';
import { ACHIEVEMENT_MAP } from '../data/achievements';
import { TOPICS } from '../data/concepts';
import { Button, Icon, LinkButton, Modal, ProgressBar, cn } from './ui';
import { sound } from '../lib/sound';
import { useCloud } from '../state/CloudContext';

const NAV = [
  {
    label: 'Study',
    items: [
      { to: '/', label: 'Basecamp', icon: 'LayoutDashboard', end: true },
      { to: '/learn', label: 'Learning Hub', icon: 'BookOpen' },
      { to: '/arcade', label: 'Arcade', icon: 'Gamepad2' },
      { to: '/practice', label: 'Practice', icon: 'Dumbbell' },
    ],
  },
  {
    label: 'Train',
    items: [
      { to: '/exam', label: 'Mock Exam', icon: 'FileCheck2' },
      { to: '/lockin', label: 'Lock-In Mode', icon: 'TimerReset', badge: 'FOCUS' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/progress', label: 'Progress', icon: 'ChartNoAxesCombined' },
      { to: '/autopsy', label: 'Test Autopsy', icon: 'ScanSearch' },
      { to: '/achievements', label: 'Achievements', icon: 'Trophy' },
      { to: '/leaderboard', label: 'Leaderboard', icon: 'Medal' },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Basecamp',
  '/learn': 'Learning Hub',
  '/arcade': 'Arcade',
  '/practice': 'Practice',
  '/exam': 'Mock Exam',
  '/lockin': 'Lock-In Mode',
  '/progress': 'Progress',
  '/autopsy': 'Test Autopsy',
  '/achievements': 'Achievements',
  '/leaderboard': 'Leaderboard',
  '/account': 'Account',
  '/settings': 'Settings',
};

function pageTitle(pathname: string) {
  if (pathname.startsWith('/learn/')) return 'Lesson';
  if (pathname.startsWith('/arcade/')) return 'Game';
  if (pathname.startsWith('/exam/results')) return 'Exam Results';
  if (pathname.startsWith('/exam/session')) return 'Mock Exam';
  return PAGE_TITLES[pathname] ?? 'TROPHIC';
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <span className="logo-mark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7.2c-2.7 0-4.3 1.9-4.3 4.4 0 2.4 1.7 4.2 4.3 4.2 2.3 0 3.9-1.4 4.2-3.4h-4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
      <span>
        <span className="block font-display text-[19px] font-bold leading-none tracking-[0.08em]">TROPHIC</span>
        <span className="mt-1 block text-[8.5px] font-bold uppercase tracking-[0.2em] text-muted">Ecology Mastery Lab</span>
      </span>
    </Link>
  );
}

function Sidebar({ onOpenHelp }: { onOpenHelp: () => void }) {
  const { state, analytics, setSettings } = useStudy();
  return (
    <aside className="sidebar">
      <div className="px-1">
        <Brand />
      </div>
      <nav className="mt-7 flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {NAV.map((group) => (
          <div key={group.label}>
            <div className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-dim">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : false} className={({ isActive }) => cn('nav-item', isActive && 'active')} onClick={() => sound.play('click')}>
                  <Icon name={item.icon} size={16} />
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className={cn('rounded px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider', item.badge === 'FOCUS' ? 'bg-[rgba(183,243,74,0.12)] text-acid' : 'bg-[rgba(255,194,75,0.12)] text-amber')}>{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-dim">System</div>
          <NavLink to="/account" className={({ isActive }) => cn('nav-item', isActive && 'active')} onClick={() => sound.play('click')}>
            <Icon name="UserRound" size={16} />
            <span className="flex-1">Account</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => cn('nav-item', isActive && 'active')} onClick={() => sound.play('click')}>
            <Icon name="Settings2" size={16} />
            <span className="flex-1">Settings & data</span>
          </NavLink>
          <button className="nav-item w-full" onClick={onOpenHelp}>
            <Icon name="Keyboard" size={16} />
            <span className="flex-1 text-left">Shortcuts</span>
            <span className="kbd">?</span>
          </button>
        </div>
      </nav>

      <div className="mt-4 rounded-2xl border border-line bg-surface-2/80 p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-dim">Level {analytics.level}</div>
            <div className="mt-0.5 text-xs font-semibold">{analytics.levelTitle}</div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-3 text-[10px] font-bold text-acid">{state.xp}</span>
        </div>
        <ProgressBar value={analytics.xpIntoLevel} max={analytics.xpForNext} height={4} className="mt-2.5" />
        <div className="mt-1.5 flex justify-between text-[9px] text-dim">
          <span>{analytics.xpIntoLevel} XP</span>
          <span>{analytics.xpForNext} to Lv {analytics.level + 1}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <button className="btn btn-icon btn-ghost h-8 w-8" onClick={() => { setSettings({ sound: !state.settings.sound }); sound.play('click'); }} aria-label={state.settings.sound ? 'Mute sound' : 'Enable sound'} title={state.settings.sound ? 'Mute' : 'Sound on'}>
            <Icon name={state.settings.sound ? 'Volume2' : 'VolumeX'} size={15} />
          </button>
          <button className="btn btn-icon btn-ghost h-8 w-8" onClick={() => setSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' })} aria-label="Toggle theme" title="Toggle theme">
            <Icon name={state.settings.theme === 'dark' ? 'Sun' : 'Moon'} size={15} />
          </button>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-semibold text-dim"><span className="h-1.5 w-1.5 rounded-full bg-mint" />Saved locally</span>
      </div>
    </aside>
  );
}

function Topbar({ onOpenHelp }: { onOpenHelp: () => void }) {
  const { state, analytics, setSettings } = useStudy();
  const { profile } = useCloud();
  const location = useLocation();
  return (
    <header className="topbar">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold text-dim">GRADE 9 ECOLOGY</span>
        <span className="text-dim">/</span>
        <span className="font-display text-sm font-semibold">{pageTitle(location.pathname)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-[rgba(255,194,75,0.18)] bg-[rgba(255,194,75,0.06)] px-3 py-1.5 text-xs font-bold text-amber sm:flex" title="Daily study streak">
          <Icon name="Flame" size={14} />
          {state.streak.current} <span className="font-medium text-[#c8a45a]">day{state.streak.current === 1 ? '' : 's'}</span>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-2 pr-3 sm:flex" title="Experience and level">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acid text-[9px] font-extrabold text-[#0a1408]">{analytics.level}</span>
          <span className="text-[11px] font-bold tabular-nums">{state.xp.toLocaleString()} XP</span>
        </div>
        <button className="btn btn-icon" onClick={onOpenHelp} aria-label="Keyboard shortcuts" title="Keyboard shortcuts"><Icon name="Keyboard" size={16} /></button>
        <button className="btn btn-icon" onClick={() => { setSettings({ sound: !state.settings.sound }); sound.play('click'); }} aria-label="Toggle sound" title="Toggle sound"><Icon name={state.settings.sound ? 'Volume2' : 'VolumeX'} size={16} /></button>
        <button className="btn btn-icon" onClick={() => setSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' })} aria-label="Toggle theme" title="Toggle theme"><Icon name={state.settings.theme === 'dark' ? 'Sun' : 'Moon'} size={16} /></button>
        <Link to="/account" className="ml-1 hidden h-9 items-center gap-1.5 rounded-full border border-[rgba(183,243,74,0.25)] bg-[rgba(183,243,74,0.08)] px-2.5 text-[10px] font-semibold text-acid sm:flex" aria-label="Cloud account">
          <Icon name={profile ? 'CloudCheck' : 'UserRound'} size={14} />
          {profile ? profile.name.slice(0, 12) : 'Sign in'}
        </Link>
      </div>
    </header>
  );
}

function MobileTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { state } = useStudy();
  return (
    <header className="mobile-topbar">
      <Brand />
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full border border-[rgba(255,194,75,0.18)] bg-[rgba(255,194,75,0.06)] px-2.5 py-1 text-[11px] font-bold text-amber">
          <Icon name="Flame" size={12} />{state.streak.current}
        </span>
        <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10px] font-bold">{state.xp} XP</span>
        <button onClick={onOpenMenu} className="btn btn-icon h-9 w-9" aria-label="Open menu"><Icon name="Menu" size={18} /></button>
      </div>
    </header>
  );
}

function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const location = useLocation();
  const items = [
    { to: '/', label: 'Base', icon: 'LayoutDashboard' },
    { to: '/learn', label: 'Learn', icon: 'BookOpen' },
    { to: '/arcade', label: 'Arcade', icon: 'Gamepad2' },
    { to: '/practice', label: 'Practice', icon: 'Dumbbell' },
  ];
  return (
    <nav className="mobile-nav" aria-label="Primary navigation">
      {items.map((i) => {
        const active = i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to);
        return <Link key={i.to} to={i.to} className={active ? 'active' : ''}><Icon name={i.icon} size={18} /><span>{i.label}</span></Link>;
      })}
      <button onClick={onOpenMenu}><Icon name="Menu" size={18} /><span>More</span></button>
    </nav>
  );
}

function Drawer({ open, onClose, onOpenHelp }: { open: boolean; onClose: () => void; onOpenHelp: () => void }) {
  const { state, analytics, setSettings } = useStudy();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-label="Close menu" />
          <motion.aside className="fixed inset-y-0 right-0 z-[70] w-[320px] max-w-[88vw] overflow-y-auto border-l border-line bg-surface p-5 shadow-2xl" initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
            <div className="flex items-center justify-between">
              <Brand />
              <button className="btn btn-icon" onClick={onClose} aria-label="Close menu"><Icon name="X" size={18} /></button>
            </div>
            <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-dim">Level {analytics.level}</div>
                  <div className="mt-1 font-display text-base font-semibold">{analytics.levelTitle}</div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(183,243,74,0.3)] bg-[rgba(183,243,74,0.08)] font-display text-sm font-bold text-acid">{state.xp}</span>
              </div>
              <ProgressBar value={analytics.xpIntoLevel} max={analytics.xpForNext} className="mt-3" height={5} />
            </div>
            <div className="mt-5 space-y-5">
              {NAV.map((group) => (
                <div key={group.label}>
                  <div className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-wider text-dim">{group.label}</div>
                  {group.items.map((item) => (
                    <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : false} onClick={() => { onClose(); sound.play('click'); }} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
                      <Icon name={item.icon} size={16} /><span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
              <div>
                <NavLink to="/account" onClick={onClose} className={({ isActive }) => cn('nav-item', isActive && 'active')}><Icon name="UserRound" size={16} /><span>Account</span></NavLink>
                <NavLink to="/settings" onClick={onClose} className={({ isActive }) => cn('nav-item', isActive && 'active')}><Icon name="Settings2" size={16} /><span>Settings & data</span></NavLink>
                <button className="nav-item w-full" onClick={() => { onClose(); onOpenHelp(); }}><Icon name="Keyboard" size={16} /><span className="flex-1 text-left">Shortcuts</span></button>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
              <Button size="sm" onClick={() => setSettings({ sound: !state.settings.sound })} icon={state.settings.sound ? 'Volume2' : 'VolumeX'}>{state.settings.sound ? 'Sound on' : 'Muted'}</Button>
              <Button size="sm" onClick={() => setSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' })} icon={state.settings.theme === 'dark' ? 'Sun' : 'Moon'}>{state.settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}</Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useStudy();
  return (
    <div className="fixed bottom-4 right-4 z-[95] flex w-[340px] max-w-[calc(100vw-24px)] flex-col gap-2.5 sm:bottom-6 sm:right-6" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const ach = t.kind === 'achievement' ? ACHIEVEMENT_MAP[t.title] : null;
          const tierColor = ach ? { bronze: '#d9a26a', silver: '#c6d3d0', gold: '#ffc24b', platinum: '#a78bfa' }[ach.tier] : 'var(--acid)';
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="rounded-2xl border border-line bg-surface p-3.5 shadow-2xl backdrop-blur-xl"
              style={t.kind === 'achievement' ? { borderColor: `${tierColor}55` } : undefined}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${tierColor}18`, color: tierColor }}>
                  <Icon name={ach?.icon ?? (t.kind === 'level' ? 'TrendingUp' : t.kind === 'xp' ? 'Zap' : 'Info')} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold leading-snug">
                    {ach ? `Achievement: ${ach.name}` : t.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    {ach ? ach.description : t.description}
                  </div>
                  {ach && <div className="mt-1 text-[10px] font-bold" style={{ color: tierColor }}>+{ach.xp} XP</div>}
                </div>
                <button onClick={() => dismissToast(t.id)} className="text-dim hover:text-ink" aria-label="Dismiss notification"><Icon name="X" size={13} /></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Celebration() {
  const { celebration } = useStudy();
  useEffect(() => {
    if (!celebration) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#b7f34a', '#4de1c1', '#ffc24b', '#a78bfa', '#f472b6'];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors, disableForReducedMotion: true, zIndex: 90 });
    const t = window.setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors, zIndex: 90 }), 180);
    const t2 = window.setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors, zIndex: 90 }), 260);
    return () => { window.clearTimeout(t); window.clearTimeout(t2); };
  }, [celebration]);
  return null;
}

function IntroModal({ onOpenHelp }: { onOpenHelp: () => void }) {
  const { state, markIntroSeen } = useStudy();
  const [open, setOpen] = useState(!state.seenIntro);
  const close = () => { setOpen(false); markIntroSeen(); };
  return (
    <Modal open={open} onClose={close} wide title={<span className="flex items-center gap-2.5"><span className="logo-mark h-8 w-8 rounded-lg"><Icon name="Sprout" size={17} /></span>Welcome to TROPHIC</span>} description="A mastery lab built from your Grade 9 ecology slides and marked practice test." footer={<><Button variant="ghost" onClick={close}>Explore first</Button><LinkButton to="/autopsy" variant="primary" icon="ScanSearch" onClick={close}>See my test autopsy</LinkButton></>}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-surface-2 p-4">
          <div className="eyebrow mb-2">Your materials, analyzed</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="font-display text-2xl font-semibold text-acid">6</div><div className="text-[10px] text-muted">slide decks</div></div>
            <div><div className="font-display text-2xl font-semibold text-mint">{TOPICS.length}</div><div className="text-[10px] text-muted">topic areas</div></div>
            <div><div className="font-display text-2xl font-semibold text-amber">33</div><div className="text-[10px] text-muted">practice-test items</div></div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { icon: 'ScanSearch', title: 'Your marked paper is the starting point', text: 'The only visible deductions are in Part B Q16/Q18 (missing and incorrect process letters). Your written answers show strong reasoning; precision is the priority.' },
            { icon: 'Target', title: 'Mastery is earned with evidence', text: 'Repeating easy multiple choice cannot reach 100%. You need distinct questions, harder application and multiple question formats.' },
            { icon: 'Gamepad2', title: '16 games, one learning engine', text: 'Every game feeds the same adaptive model: XP, achievements, spaced repetition and a readiness score with a transparent formula.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-acid"><Icon name={item.icon} size={15} /></span>
              <div><div className="text-sm font-semibold">{item.title}</div><p className="mt-0.5 text-xs leading-relaxed text-muted">{item.text}</p></div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-[rgba(255,194,75,0.18)] bg-[rgba(255,194,75,0.05)] p-3 text-[11px] leading-relaxed text-[#d9b876]">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          <span>Your progress is stored only in this browser. Export a backup from Settings before clearing browser data. All exam questions are fresh parallel items, not copies of the uploaded test.</span>
        </div>
        <button className="text-left text-[11px] font-semibold text-dim underline underline-offset-2 hover:text-muted" onClick={() => { onOpenHelp(); }}>Keyboard shortcuts</button>
      </div>
    </Modal>
  );
}

const SHORTCUTS = [
  ['1–4', 'Select a multiple-choice option'],
  ['T / F', 'Answer true or false'],
  ['Enter', 'Check answer / next question'],
  ['H', 'Show hint'],
  ['Space', 'Flip a flashcard'],
  ['1–4 (flashcards)', 'Rate recall: again, hard, good, easy'],
  ['?', 'Open this shortcut panel'],
  ['Esc', 'Close a dialog'],
];

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" description="Useful when you want to move fast without losing accuracy.">
      <div className="space-y-1.5">
        {SHORTCUTS.map(([key, desc]) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
            <span className="text-xs text-muted">{desc}</span>
            <span className="kbd">{key}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10.5px] leading-relaxed text-dim">Shortcuts are ignored while typing in an input or textarea. On mobile, all actions have tappable controls.</p>
    </Modal>
  );
}

export function Layout() {
  const [drawer, setDrawer] = useState(false);
  const [help, setHelp] = useState(false);
  const { recordStudyTime, state } = useStudy();
  const location = useLocation();
  const lastActive = useRef(Date.now());

  useEffect(() => {
    const bump = () => { lastActive.current = Date.now(); };
    window.addEventListener('pointerdown', bump, { passive: true });
    window.addEventListener('keydown', bump);
    window.addEventListener('scroll', bump, { passive: true });
    return () => { window.removeEventListener('pointerdown', bump); window.removeEventListener('keydown', bump); window.removeEventListener('scroll', bump); };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastActive.current < 5 * 60_000) {
        recordStudyTime(30_000);
      }
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [recordStudyTime]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setDrawer(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (e.key === '?') { e.preventDefault(); setHelp(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = state.settings.reduceMotion ? 'true' : 'false';
  }, [state.settings.reduceMotion]);

  return (
    <div className="shell">
      <Sidebar onOpenHelp={() => setHelp(true)} />
      <div className="main">
        <Topbar onOpenHelp={() => setHelp(true)} />
        <MobileTopbar onOpenMenu={() => setDrawer(true)} />
        <main className="page">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav onOpenMenu={() => setDrawer(true)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} onOpenHelp={() => setHelp(true)} />
      <Toasts />
      <Celebration />
      <IntroModal onOpenHelp={() => setHelp(true)} />
      <ShortcutsModal open={help} onClose={() => setHelp(false)} />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}