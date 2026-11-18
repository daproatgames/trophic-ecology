import { useEffect, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { MEMORY_DECKS } from '../data/labs';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

interface Card { key: string; pairId: string; text: string; kind: 'term' | 'match' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Memory() {
  const { state, recordGameResult } = useStudy();
  const [deckIndex, setDeckIndex] = useState(0);
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [lock, setLock] = useState(false);
  const deck = MEMORY_DECKS[deckIndex];
  const complete = matched.length === deck.pairs.length;

  useEffect(() => {
    if (phase !== 'playing' || complete) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase, complete]);

  const start = () => {
    const deckCards: Card[] = deck.pairs.flatMap((p) => [
      { key: `${p.id}-term`, pairId: p.id, text: p.term, kind: 'term' },
      { key: `${p.id}-match`, pairId: p.id, text: p.match, kind: 'match' },
    ]);
    setCards(shuffle(deckCards));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setMistakes(0);
    setSeconds(0);
    setLock(false);
    setPhase('playing');
  };

  const flip = (index: number) => {
    if (lock || phase !== 'playing' || flipped.includes(index) || matched.includes(cards[index].pairId)) return;
    sound.play('flip');
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].pairId === cards[b].pairId) {
        setMatched((m) => [...m, cards[a].pairId]);
        setFlipped([]);
        sound.play('correct');
        if (matched.length + 1 === deck.pairs.length) {
          window.setTimeout(() => finish(matched.length + 1, seconds), 400);
        }
      } else {
        setMistakes((m) => m + 1);
        setLock(true);
        sound.play('wrong');
        window.setTimeout(() => { setFlipped([]); setLock(false); }, 850);
      }
    }
  };

  const finish = (matchedCount = matched.length, elapsed = seconds) => {
    setPhase('end');
    fireConfetti();
    sound.play('win');
    const accuracy = Math.round((matchedCount / Math.max(1, matchedCount + mistakes)) * 100);
    recordGameResult('memory', Math.max(0, 1200 - (moves + 1) * 20 - elapsed * 5 + matchedCount * 50), accuracy, { pairs: matchedCount, seconds: elapsed, deck: deck.name }, 15 + matchedCount * 3);
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="memory">
        <GameStart gameId="memory" onStart={start} best={state.gameBests.memory ? { score: state.gameBests.memory.score, accuracy: state.gameBests.memory.accuracy } : null}
          rules={[
            'Flip two cards at a time and match each term to its definition, role or example.',
            'A correct pair stays face-up; a mismatch flips back and costs accuracy.',
            'Fewer moves and a faster time earn a higher score.',
            'The recap at the end repeats every pair — use it as a mini review.',
          ]}
          side={<div className="mt-4 grid gap-2 sm:grid-cols-2">{MEMORY_DECKS.map((d, i) => <button key={d.id} onClick={() => setDeckIndex(i)} className={cn('rounded-xl border p-3 text-left transition-all', deckIndex === i ? 'border-[rgba(183,243,74,0.5)] bg-[rgba(183,243,74,0.07)]' : 'border-line bg-surface-2')}><div className="text-xs font-semibold">{d.name}</div><div className="mt-0.5 text-[10px] text-muted">{d.description}</div></button>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const accuracy = Math.round((deck.pairs.length / Math.max(1, deck.pairs.length + mistakes)) * 100);
    return (
      <GameShell gameId="memory">
        <GameEnd gameId="memory" score={Math.max(0, 1200 - moves * 20 - seconds * 5 + deck.pairs.length * 50)} accuracy={accuracy} xp={15 + deck.pairs.length * 3} onReplay={start} message="Every pair recalled."
          stats={[{ label: 'Pairs', value: `${deck.pairs.length}/${deck.pairs.length}` }, { label: 'Moves', value: moves }, { label: 'Mistakes', value: mistakes }, { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-dim">Concept recap</div><div className="grid gap-1.5 sm:grid-cols-2">{deck.pairs.map((p) => <div key={p.id} className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[10px] leading-relaxed"><span className="font-semibold text-ink">{p.term}</span> <span className="text-dim">→</span> {p.match}</div>)}</div></div>
        </GameEnd>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="memory" hud={<><HudStat icon="Copy" label="Pairs" value={`${matched.length}/${deck.pairs.length}`} color="var(--sky)" /><HudStat icon="MousePointerClick" label="Moves" value={moves} /><HudStat icon="Clock3" label="Time" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`} /></>}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center justify-between"><div><div className="eyebrow">{deck.name}</div><h2 className="font-display text-lg font-semibold">Match the terms to their meaning</h2></div><span className="chip chip-amber">{mistakes} misses</span></div>
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i) || matched.includes(card.pairId);
            const isMatched = matched.includes(card.pairId);
            return (
              <button key={card.key} onClick={() => flip(i)} disabled={isMatched} className="relative aspect-[3/4] [perspective:800px]" aria-label={isFlipped ? card.text : 'Face-down card'}>
                <div className={cn('absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]', isFlipped && '[transform:rotateY(180deg)]')}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-line bg-surface-2 [backface-visibility:hidden]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: 'rgba(183,243,74,0.25)', background: 'rgba(183,243,74,0.06)', color: 'var(--acid)' }}><Icon name="Leaf" size={15} /></div>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-dim">flip</span>
                  </div>
                  <div className={cn('absolute inset-0 flex items-center justify-center rounded-xl border p-1.5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]', isMatched ? 'border-[rgba(126,231,135,0.4)] bg-[rgba(126,231,135,0.07)]' : 'border-[rgba(183,243,74,0.35)] bg-[#0d1a14]')}>
                    <span className={cn('text-[9px] font-semibold leading-[1.3] sm:text-[10.5px]', card.kind === 'term' ? 'text-acid' : 'text-ink')}>{card.text}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-dim"><span>Click a card to flip. Matched pairs stay visible.</span><span>{matched.length * 2}/{cards.length} cards matched</span></div>
      </div>
    </GameShell>
  );
}