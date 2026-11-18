import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GAME_MAP } from '../data/gamesContent';
import { Icon, LinkButton } from '../components/ui';

const Showdown = lazy(() => import('../games/Showdown').then((m) => ({ default: m.Showdown })));
const Tower = lazy(() => import('../games/Tower').then((m) => ({ default: m.Tower })));
const Boss = lazy(() => import('../games/Boss').then((m) => ({ default: m.Boss })));
const SpeedRun = lazy(() => import('../games/SpeedRun').then((m) => ({ default: m.SpeedRun })));
const Memory = lazy(() => import('../games/Memory').then((m) => ({ default: m.Memory })));
const Jeopardy = lazy(() => import('../games/Jeopardy').then((m) => ({ default: m.Jeopardy })));
const Escape = lazy(() => import('../games/Escape').then((m) => ({ default: m.Escape })));
const Detective = lazy(() => import('../games/Detective').then((m) => ({ default: m.Detective })));
const Flashcards = lazy(() => import('../games/Flashcards').then((m) => ({ default: m.Flashcards })));
const FillGame = lazy(() => import('../games/FillGame').then((m) => ({ default: m.FillGame })));
const DragLabGame = lazy(() => import('../games/DragLabGame').then((m) => ({ default: m.DragLabGame })));
const Survival = lazy(() => import('../games/Survival').then((m) => ({ default: m.Survival })));
const TrueFalseBlitz = lazy(() => import('../games/TrueFalseBlitz').then((m) => ({ default: m.TrueFalseBlitz })));
const Wordle = lazy(() => import('../games/Wordle').then((m) => ({ default: m.Wordle })));
const Gauntlet = lazy(() => import('../games/Gauntlet').then((m) => ({ default: m.Gauntlet })));
const Karting = lazy(() => import('../games/Karting').then((m) => ({ default: m.Karting })));

function Loading() {
  return <div className="flex min-h-screen items-center justify-center bg-[#060a0f]"><div className="flex flex-col items-center gap-3"><span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[var(--acid)]" /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Loading arena</span></div></div>;
}

export function GamePage() {
  const { gameId } = useParams();
  const game = gameId ? GAME_MAP[gameId] : undefined;
  if (!game) {
    return <div className="empty-state mx-auto mt-20 max-w-lg"><Icon name="Gamepad2" size={26} className="mb-2 text-muted" /><h1 className="font-display text-xl font-semibold">Game not found</h1><p className="mt-1 text-sm text-muted">That arcade cabinet does not exist.</p><LinkButton to="/arcade" variant="primary" className="mt-4" icon="ArrowLeft">Back to arcade</LinkButton></div>;
  }
  return <Suspense fallback={<Loading />}><GameSwitch gameId={game.id} /></Suspense>;
}

function GameSwitch({ gameId }: { gameId: string }) {
  switch (gameId) {
    case 'showdown': return <Showdown />;
    case 'tower': return <Tower />;
    case 'boss': return <Boss />;
    case 'speed': return <SpeedRun />;
    case 'memory': return <Memory />;
    case 'jeopardy': return <Jeopardy />;
    case 'escape': return <Escape />;
    case 'detective': return <Detective />;
    case 'flashcards': return <Flashcards />;
    case 'fill': return <FillGame />;
    case 'drag': return <DragLabGame />;
    case 'survival': return <Survival />;
    case 'truefalse': return <TrueFalseBlitz />;
    case 'wordle': return <Wordle />;
    case 'gauntlet': return <Gauntlet />;
    case 'karting': return <Karting />;
    default: return <div className="empty-state">Game unavailable. <Link to="/arcade" className="text-acid">Back to arcade</Link></div>;
  }
}