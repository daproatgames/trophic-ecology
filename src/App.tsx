import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Learn } from './pages/Learn';
import { Lesson } from './pages/Lesson';
import { Arcade } from './pages/Arcade';
import { GamePage } from './pages/GamePage';
import { Practice } from './pages/Practice';
import { Exam } from './pages/Exam';
import { ExamSession } from './pages/ExamSession';
import { ExamResults } from './pages/ExamResults';
import { LockIn } from './pages/LockIn';
import { ProgressPage } from './pages/ProgressPage';
import { Autopsy } from './pages/Autopsy';
import { Achievements } from './pages/Achievements';
import { Account } from './pages/Account';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { Button, Icon, LinkButton } from './components/ui';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
          <div className="empty-state max-w-lg">
            <Icon name="TriangleAlert" size={28} className="mb-3 text-coral" />
            <h1 className="font-display text-xl font-semibold">Something broke in the lab</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">Your saved progress is still in local storage. Reload to recover. If the problem repeats, export a backup from Settings after reloading.</p>
            <div className="mt-4 flex gap-2"><Button variant="primary" onClick={() => window.location.reload()} icon="RotateCcw">Reload</Button><Button onClick={() => { this.setState({ error: null }); window.location.hash = '#/'; }}>Go to basecamp</Button></div>
            <p className="mt-3 text-[9px] text-dim">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="empty-state mx-auto mt-20 max-w-lg">
      <Icon name="Compass" size={28} className="mb-3 text-muted" />
      <h1 className="font-display text-xl font-semibold">Lost in the ecosystem</h1>
      <p className="mt-1 text-sm text-muted">This route does not exist. Head back to basecamp.</p>
      <LinkButton to="/" variant="primary" className="mt-4" icon="ArrowLeft">Basecamp</LinkButton>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/exam/session" element={<ExamSession />} />
          <Route path="/arcade/:gameId" element={<GamePage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:lessonId" element={<Lesson />} />
            <Route path="/arcade" element={<Arcade />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/exam/results/:examId" element={<ExamResults />} />
            <Route path="/lockin" element={<LockIn />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/autopsy" element={<Autopsy />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}