import { useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { DIAGRAM_LABS, ORDER_SETS, SORTING_SETS } from '../data/labs';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, ProgressBar } from '../components/ui';
import { DiagramLab, OrderLab, SortingLab } from '../components/labs';
import { sound } from '../lib/sound';

const STAGES = [
  { key: 'sort', title: 'Sort the science', description: 'Classify every item into the correct category.' },
  { key: 'label', title: 'Label the diagram', description: 'Place every label in the correct zone.' },
  { key: 'order', title: 'Order the process', description: 'Sequence the steps from start to finish.' },
];

export function DragLabGame() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<Record<number, { correct: number; total: number }>>({});
  const [indices, setIndices] = useState([0, 0, 0]);
  const recorded = useRef(false);

  const start = () => {
    setIndices([
      Math.floor(Math.random() * SORTING_SETS.length),
      Math.floor(Math.random() * DIAGRAM_LABS.length),
      Math.floor(Math.random() * ORDER_SETS.length),
    ]);
    setStage(0);
    setResults({});
    recorded.current = false;
    setPhase('playing');
  };

  const capture = (correct: number, total: number) => {
    setResults((prev) => (prev[stage] ? prev : { ...prev, [stage]: { correct, total } }));
    sound.play(correct === total ? 'correct' : 'wrong');
  };

  const next = () => {
    if (stage < STAGES.length - 1) {
      setStage((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const totalCorrect = Object.values(results).reduce((s, r) => s + r.correct, 0);
      const totalItems = Object.values(results).reduce((s, r) => s + r.total, 0);
      setPhase('end');
      if (totalCorrect / Math.max(1, totalItems) >= 0.7) fireConfetti();
      sound.play('win');
      if (!recorded.current) {
        recorded.current = true;
        recordGameResult('drag', totalCorrect * 120, totalItems ? Math.round((totalCorrect / totalItems) * 100) : 0, { labs: 3, correct: totalCorrect, total: totalItems }, 20 + totalCorrect * 3);
      }
    }
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="drag">
        <GameStart gameId="drag" onStart={start} best={state.gameBests.drag ? { score: state.gameBests.drag.score, accuracy: state.gameBests.drag.accuracy } : null}
          rules={[
            'A three-lab marathon: sort concepts, label a diagram, and order a process.',
            'Each lab is checked once for score; you can still correct and re-check for learning, but the first check is recorded.',
            'Click-to-place works everywhere; drag-and-drop works on desktop.',
            'Finish all three labs to complete the run. The overall score rewards accuracy across all items.',
          ]}
          side={<div className="mt-4 grid gap-2 sm:grid-cols-3">{STAGES.map((s, i) => <div key={s.key} className="rounded-xl border border-line bg-surface-2 p-3"><div className="text-[9px] font-bold uppercase tracking-wider text-dim">Lab {i + 1}</div><div className="mt-0.5 text-xs font-semibold">{s.title}</div><div className="mt-1 text-[9.5px] text-muted">{s.description}</div></div>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const totalCorrect = Object.values(results).reduce((s, r) => s + r.correct, 0);
    const totalItems = Object.values(results).reduce((s, r) => s + r.total, 0);
    const accuracy = totalItems ? Math.round((totalCorrect / totalItems) * 100) : 0;
    return (
      <GameShell gameId="drag">
        <GameEnd gameId="drag" score={totalCorrect * 120} accuracy={accuracy} xp={20 + totalCorrect * 3} onReplay={start} message={accuracy >= 80 ? 'Lab skills locked in.' : 'Labs complete — review the misses.'}
          stats={[{ label: 'Labs', value: '3/3' }, { label: 'Items correct', value: `${totalCorrect}/${totalItems}` }, { label: 'Accuracy', value: `${accuracy}%` }, { label: 'Mode', value: 'Sort · Label · Order' }]}
        />
      </GameShell>
    );
  }

  const totalCorrect = Object.values(results).reduce((s, r) => s + r.correct, 0);
  const totalItems = Object.values(results).reduce((s, r) => s + r.total, 0);
  const stageDone = !!results[stage];

  return (
    <GameShell gameId="drag" hud={<><HudStat icon="FlaskConical" label="Lab" value={`${stage + 1}/3`} color="var(--coral)" /><HudStat icon="Check" label="Correct" value={`${totalCorrect}/${totalItems}`} color="var(--mint)" /></>}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div><div className="eyebrow">Lab {stage + 1} of 3</div><h2 className="font-display text-xl font-semibold">{STAGES[stage].title}</h2><p className="mt-0.5 text-[11px] text-muted">{STAGES[stage].description}</p></div>
          <div className="flex gap-1">{STAGES.map((_, i) => <span key={i} className="flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold" style={{ borderColor: i === stage ? 'rgba(255,138,101,0.5)' : 'var(--border)', background: results[i] ? 'rgba(126,231,135,0.1)' : i === stage ? 'rgba(255,138,101,0.1)' : 'transparent', color: results[i] ? 'var(--mint)' : i === stage ? 'var(--coral)' : 'var(--muted)' }}>{results[i] ? '✓' : i + 1}</span>)}</div>
        </div>
        <ProgressBar value={stage} max={3} height={4} className="mb-4" />
        {stage === 0 && <SortingLab initialIndex={indices[0]} onCheck={capture} />}
        {stage === 1 && <DiagramLab initialIndex={indices[1]} onCheck={capture} />}
        {stage === 2 && <OrderLab initialIndex={indices[2]} onCheck={capture} />}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[9.5px] text-dim">{stageDone ? `Lab result recorded: ${results[stage].correct}/${results[stage].total}. You can re-check for practice.` : 'Complete every item, then check the lab.'}</span>
          <Button variant="primary" size="sm" disabled={!stageDone} onClick={next} iconRight="ArrowRight">{stage >= 2 ? 'Finish lab marathon' : 'Next lab'}</Button>
        </div>
      </div>
    </GameShell>
  );
}