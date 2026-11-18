import { useEffect, useMemo, useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { FLASHCARDS, FLASHCARD_DECKS, cardsForDeck, type Flashcard } from '../data/flashcards';
import { CONCEPTS } from '../data/concepts';
import { GameEnd, GameShell, GameStart, HudStat } from '../components/game';
import { Button, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

type Mode = 'due' | 'weak' | 'all' | 'speed';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function intervalPreview(cardId: string, rating: 1 | 2 | 3 | 4, state: ReturnType<typeof useStudy>['state']) {
  const f = state.flashcards[cardId];
  if (rating === 1) return '10 min';
  if (rating === 2) return '1 day';
  const reps = f?.reps ?? 0;
  if (rating === 3) return reps === 0 ? '2 days' : `${Math.max(2, Math.round((f?.intervalDays ?? 1) * (f?.ease ?? 2.3)))} days`;
  return reps === 0 ? '4 days' : `${Math.max(4, Math.round((f?.intervalDays ?? 1) * (f?.ease ?? 2.3) * 1.3))} days`;
}

export function Flashcards() {
  const { state, analytics, rateFlashcard, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [deckId, setDeckId] = useState('all');
  const [mode, setMode] = useState<Mode>('due');
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timedOut, setTimedOut] = useState(false);
  const recorded = useRef(false);
  const startTime = useRef(0);
  const speedTimer = useRef<number | null>(null);
  const deckCards = useMemo(() => cardsForDeck(deckId), [deckId]);
  const dueCards = deckCards.filter((c) => (state.flashcards[c.id]?.dueAt ?? 0) <= Date.now());
  const weakIds = new Set(CONCEPTS.filter((c) => (analytics.conceptMastery[c.id] ?? 0) < 55).map((c) => c.id));
  const weakCards = deckCards.filter((c) => weakIds.has(c.conceptId));
  const card = queue[index];
  const reviewed = ratings.length;
  const recallGood = ratings.filter((r) => r >= 3).length;
  const accuracy = reviewed ? Math.round((recallGood / reviewed) * 100) : 0;
  const best = state.gameBests.flashcards;

  useEffect(() => {
    if (phase !== 'playing' || mode !== 'speed') return;
    speedTimer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(speedTimer.current!);
          setTimedOut(true);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (speedTimer.current) window.clearInterval(speedTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped((f) => !f); sound.play('flip'); return; }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        rate(Number(e.key) as 1 | 2 | 3 | 4);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, flipped, index]);

  const start = () => {
    let pool: Flashcard[] = [];
    if (mode === 'speed') pool = shuffle(deckCards).slice(0, 25);
    else if (mode === 'due') pool = shuffle(dueCards.length ? dueCards : deckCards.filter((c) => !state.flashcards[c.id]));
    else if (mode === 'weak') pool = shuffle(weakCards.length ? weakCards : deckCards);
    else pool = shuffle(deckCards);
    if (!pool.length) pool = shuffle(deckCards);
    setQueue(pool);
    setIndex(0);
    setFlipped(false);
    setRatings([]);
    setTimeLeft(90);
    setTimedOut(false);
    startTime.current = Date.now();
    recorded.current = false;
    setPhase('playing');
  };

  const finish = () => {
    setPhase('end');
    if (!recorded.current) {
      recorded.current = true;
      const acc = ratings.length ? Math.round((ratings.filter((r) => r >= 3).length / ratings.length) * 100) : 0;
      recordGameResult('flashcards', ratings.length * 10 + ratings.filter((r) => r >= 3).length * 8, acc, { reviewed: ratings.length, deck: deckId, mode }, 10);
    }
    sound.play('win');
  };

  const rate = (rating: 1 | 2 | 3 | 4) => {
    if (!card || !flipped) return;
    rateFlashcard(card.id, rating, true);
    setRatings((r) => [...r, rating]);
    sound.play(rating >= 3 ? 'correct' : 'wrong');
    if (index + 1 >= queue.length) {
      window.setTimeout(finish, 250);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="flashcards">
        <GameStart gameId="flashcards" onStart={start} best={best ? { score: best.score, accuracy: best.accuracy } : null}
          rules={[
            'Flip each card, then rate your recall honestly: Again, Hard, Good or Easy.',
            'Ratings schedule the next review: Again returns in 10 minutes, Easy pushes the card furthest out.',
            'Due mode prioritizes cards your schedule says are ready now.',
            'Speed Frenzy gives you 90 seconds to review as many cards as possible.',
            'Self-ratings do not inflate concept mastery; they schedule practice, while graded questions build mastery.',
          ]}
          side={
            <div className="mt-4 space-y-3">
              <div><div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-dim">Deck</div><div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">{FLASHCARD_DECKS.map((d) => <button key={d.id} onClick={() => setDeckId(d.id)} className={cn('rounded-lg border px-2 py-1.5 text-[10px] font-semibold', deckId === d.id ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.07)] text-acid' : 'border-line bg-surface-2 text-muted')}>{d.name}</button>)}</div></div>
              <div><div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-dim">Mode</div><div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">{([{ id: 'due', label: `Due (${dueCards.length})` }, { id: 'weak', label: 'Weak concepts' }, { id: 'all', label: 'All cards' }, { id: 'speed', label: 'Speed 90s' }] as { id: Mode; label: string }[]).map((m) => <button key={m.id} onClick={() => setMode(m.id)} className={cn('rounded-lg border px-2 py-1.5 text-[10px] font-semibold', mode === m.id ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.07)] text-acid' : 'border-line bg-surface-2 text-muted')}>{m.label}</button>)}</div></div>
              <div className="text-center text-[10px] text-dim">{deckId === 'all' ? FLASHCARDS.length : cardsForDeck(deckId).length} cards in this deck · {state.flashcards ? Object.keys(state.flashcards).length : 0} scheduled</div>
            </div>
          }
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="flashcards">
        <GameEnd gameId="flashcards" score={reviewed * 10 + recallGood * 8} accuracy={accuracy} xp={10} onReplay={start} message={timedOut ? 'Time. Your schedule is updated.' : 'Review session complete.'}
          stats={[{ label: 'Reviewed', value: reviewed }, { label: 'Good/Easy', value: `${recallGood}/${reviewed}` }, { label: 'Again', value: ratings.filter((r) => r === 1).length }, { label: 'Next due', value: queue.length > index + 1 ? 'scheduled' : 'see cards' }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 text-center"><p className="text-xs leading-relaxed text-muted">Spaced repetition works because the interval expands after successful recall and shrinks after a lapse. Return when cards are due; cramming the same cards now will not raise mastery.</p><div className="mt-2 flex justify-center gap-2"><Button size="sm" variant="ghost" onClick={() => { setMode('due'); start(); }} icon="RotateCcw">Review due cards</Button><Button size="sm" variant="ghost" onClick={() => setPhase('start')} icon="Settings2">Change deck</Button></div></div>
          <div className="mt-4 grid gap-1.5 sm:grid-cols-2">{queue.slice(0, 8).map((c) => <div key={c.id} className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[10px]"><span className="font-semibold text-acid">{c.term}</span> <span className="text-dim">·</span> <span className="text-muted">{c.definition}</span></div>)}</div>
        </GameEnd>
      </GameShell>
    );
  }

  if (!card) return null;

  return (
    <GameShell gameId="flashcards" hud={<><HudStat icon="Layers" label="Card" value={`${index + 1}/${queue.length}`} color="var(--acid)" /><HudStat icon="ThumbsUp" label="Good/Easy" value={recallGood} color="var(--mint)" /><HudStat icon="Clock3" label={mode === 'speed' ? 'Time' : 'Reviewed'} value={mode === 'speed' ? `${timeLeft}s` : reviewed} color={mode === 'speed' && timeLeft < 20 ? 'var(--coral)' : undefined} /></>}>
      <div className="mx-auto max-w-2xl">
        <ProgressBar value={index} max={queue.length} height={4} className="mb-4" />
        <div className="relative min-h-[310px] [perspective:1200px]">
          <button onClick={() => { setFlipped((f) => !f); sound.play('flip'); }} className="w-full text-left" aria-label={flipped ? 'Hide definition' : 'Show definition'}>
            <div className={cn('relative min-h-[310px] w-full transition-transform duration-500 [transform-style:preserve-3d]', flipped && '[transform:rotateY(180deg)]')}>
              <div className="absolute inset-0 flex min-h-[310px] flex-col items-center justify-center rounded-3xl border border-line bg-surface p-8 [backface-visibility:hidden]">
                <span className="chip mb-4">{card.topic}</span>
                <div className="text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl">{card.term}</div>
                <p className="mt-3 text-[11px] text-dim">Tap the card or press Space to reveal</p>
              </div>
              <div className="absolute inset-0 flex min-h-[310px] flex-col justify-center rounded-3xl border border-[rgba(183,243,74,0.3)] bg-[#0b1710] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
                <span className="mb-3 text-[9px] font-bold uppercase tracking-wider text-acid">Definition</span>
                <p className="text-base leading-relaxed text-ink sm:text-lg">{card.definition}</p>
                {card.example && <p className="mt-3 text-[11px] leading-relaxed text-muted">Example: {card.example}</p>}
                <p className="mt-4 text-[10px] text-dim">Rate your recall below. Be honest: this is scheduling data.</p>
              </div>
            </div>
          </button>
        </div>
        {flipped ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              { rating: 1 as const, label: 'Again', sub: intervalPreview(card.id, 1, state), cls: 'border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]' },
              { rating: 2 as const, label: 'Hard', sub: intervalPreview(card.id, 2, state), cls: 'border-[rgba(255,194,75,0.25)] bg-[rgba(255,194,75,0.05)] text-[#d9b876]' },
              { rating: 3 as const, label: 'Good', sub: intervalPreview(card.id, 3, state), cls: 'border-[rgba(77,225,193,0.25)] bg-[rgba(77,225,193,0.05)] text-mint' },
              { rating: 4 as const, label: 'Easy', sub: intervalPreview(card.id, 4, state), cls: 'border-[rgba(183,243,74,0.3)] bg-[rgba(183,243,74,0.06)] text-acid' },
            ]).map((b) => (
              <button key={b.rating} onClick={() => rate(b.rating)} className={cn('rounded-xl border px-2 py-2.5 text-center transition-transform hover:-translate-y-0.5', b.cls)}><div className="text-xs font-bold">{b.label}</div><div className="mt-0.5 text-[9px] opacity-70">{b.sub}</div><div className="mt-1 text-[8px] opacity-50">{b.rating}</div></button>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex justify-center"><Button variant="primary" icon="FlipHorizontal2" onClick={() => { setFlipped(true); sound.play('flip'); }}>Reveal definition</Button></div>
        )}
        <div className="mt-4 flex items-center justify-between text-[9.5px] text-dim"><span>Space flips · 1–4 rates</span><span>{state.flashcards[card.id] ? `Seen ${state.flashcards[card.id].seen}×` : 'New card'}</span></div>
      </div>
    </GameShell>
  );
}