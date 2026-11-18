import { useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { CLOZE_SETS, type ClozeSet } from '../data/labs';
import { normalizeText } from '../lib/grading';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, ProgressBar, cn } from '../components/ui';
import { sound } from '../lib/sound';

function blankCorrect(value: string, accepted: string[][]) {
  const v = normalizeText(value);
  if (!v) return false;
  return accepted.some((group) => group.some((a) => { const n = normalizeText(a); return v === n || v.includes(n); }));
}

export function FillGame() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [sets, setSets] = useState<ClozeSet[]>([]);
  const [index, setIndex] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correctBlanks, setCorrectBlanks] = useState(0);
  const [totalBlanks, setTotalBlanks] = useState(0);
  const [showBank, setShowBank] = useState(true);
  const recorded = useRef(false);
  const countedRef = useRef(false);
  const set = sets[index];
  const ready = inputs.filter((v) => v.trim()).length === (set?.blanks.length ?? 0);

  const start = (chosen?: ClozeSet) => {
    const list = chosen ? [chosen] : CLOZE_SETS;
    setSets(list);
    setIndex(0);
    setInputs(Array(list[0].blanks.length).fill(''));
    setChecked(false);
    setCorrectBlanks(0);
    setTotalBlanks(0);
    setShowBank(true);
    recorded.current = false;
    countedRef.current = false;
    setPhase('playing');
  };

  const check = () => {
    if (!set) return;
    setChecked(true);
    const score = set.blanks.filter((b, i) => blankCorrect(inputs[i] ?? '', b.accepted)).length;
    if (!countedRef.current) {
      countedRef.current = true;
      setCorrectBlanks((c) => c + score);
      setTotalBlanks((t) => t + set.blanks.length);
    }
    sound.play(score === set.blanks.length ? 'correct' : 'wrong');
  };

  const next = () => {
    if (!set) return;
    if (index + 1 >= sets.length) {
      setPhase('end');
      fireConfetti();
      sound.play('win');
      if (!recorded.current) {
        recorded.current = true;
        recordGameResult('fill', correctBlanks * 40 + (totalBlanks ? Math.round((correctBlanks / totalBlanks) * 100) * 2 : 0), totalBlanks ? Math.round((correctBlanks / totalBlanks) * 100) : 0, { passages: sets.length, blanks: totalBlanks }, 15 + Math.round(correctBlanks / 2));
      }
      return;
    }
    setIndex((i) => i + 1);
    setInputs(Array(sets[index + 1].blanks.length).fill(''));
    setChecked(false);
    setShowBank(true);
    countedRef.current = false;
  };

  const retry = () => {
    setInputs(Array(set.blanks.length).fill(''));
    setChecked(false);
  };

  const fillFromBank = (word: string) => {
    const empty = inputs.findIndex((v) => !v.trim());
    if (empty === -1) return;
    const next = [...inputs];
    next[empty] = word;
    setInputs(next);
    setChecked(false);
    sound.play('select');
  };

  if (phase === 'start') {
    return (
      <GameShell gameId="fill">
        <GameStart gameId="fill" onStart={() => start()} best={state.gameBests.fill ? { score: state.gameBests.fill.score, accuracy: state.gameBests.fill.accuracy } : null}
          rules={[
            'Complete each cloze passage by typing the missing scientific terms.',
            'Use the word bank if needed, or type from memory for stronger retrieval.',
            'Each blank accepts equivalent terms and spelling variants where the science is unambiguous.',
            'Wrong blanks are corrected immediately; retry the passage to fix the exact wording.',
            'A full run covers all eight passages across the unit.',
          ]}
          side={<div className="mt-4 grid gap-1.5 sm:grid-cols-2">{CLOZE_SETS.map((s) => <button key={s.id} onClick={() => start(s)} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-left text-[10px] font-semibold text-muted hover:border-[var(--border-strong)] hover:text-ink">{s.title}<span className="ml-1 text-[9px] text-dim">· {s.blanks.length} blanks</span></button>)}</div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    return (
      <GameShell gameId="fill">
        <GameEnd gameId="fill" score={correctBlanks * 40 + (totalBlanks ? Math.round((correctBlanks / totalBlanks) * 100) * 2 : 0)} accuracy={totalBlanks ? Math.round((correctBlanks / totalBlanks) * 100) : 0} xp={15 + Math.round(correctBlanks / 2)} onReplay={() => start()} message="Every blank checked."
          stats={[{ label: 'Passages', value: `${sets.length}/${sets.length}` }, { label: 'Blanks correct', value: `${correctBlanks}/${totalBlanks}` }, { label: 'Accuracy', value: `${totalBlanks ? Math.round((correctBlanks / totalBlanks) * 100) : 0}%` }, { label: 'Mode', value: showBank ? 'Word bank available' : 'From memory' }]}
        />
      </GameShell>
    );
  }

  if (!set) return null;
  const parts = set.text.split('___');
  const correctNow = checked ? set.blanks.filter((b, i) => blankCorrect(inputs[i] ?? '', b.accepted)).length : 0;

  return (
    <GameShell gameId="fill" hud={<><HudStat icon="TextCursorInput" label="Passage" value={`${index + 1}/${sets.length}`} color="var(--mint)" /><HudStat icon="Check" label="Blanks" value={`${correctBlanks}/${totalBlanks}`} color="var(--acid)" /><HudStat icon="Target" label="This passage" value={checked ? `${correctNow}/${set.blanks.length}` : `${inputs.filter((v) => v.trim()).length}/${set.blanks.length}`} /></>}>
      <div className="mx-auto max-w-3xl">
        <ProgressBar value={index} max={sets.length} height={4} className="mb-4" />
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><div className="eyebrow">Passage {index + 1} · {set.topic}</div><h2 className="font-display text-xl font-semibold">{set.title}</h2></div><Button size="sm" variant="ghost" icon="Eye" onClick={() => setShowBank((v) => !v)}>{showBank ? 'Hide word bank' : 'Show word bank'}</Button></div>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-3 text-[15px] leading-[2.2]">
            {parts.map((part, i, arr) => (
              <span key={i}>
                <span>{part}</span>
                {i < arr.length - 1 && (
                  <span className="inline-flex flex-col items-center">
                    <input className="input mx-1 inline-block h-9 w-[126px] px-2 text-center text-[13px] font-semibold" value={inputs[i] ?? ''} onChange={(e) => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); setChecked(false); }} disabled={checked} aria-label={`Blank ${i + 1}`} placeholder={`blank ${i + 1}`} style={checked ? { borderColor: blankCorrect(inputs[i] ?? '', set.blanks[i].accepted) ? 'rgba(126,231,135,0.6)' : 'rgba(255,107,107,0.6)', background: blankCorrect(inputs[i] ?? '', set.blanks[i].accepted) ? 'rgba(126,231,135,0.06)' : 'rgba(255,107,107,0.06)' } : undefined} />
                    {checked && !blankCorrect(inputs[i] ?? '', set.blanks[i].accepted) && <span className="text-[9px] font-semibold text-[#ffb4ad]">→ {set.blanks[i].accepted[0].join(' / ')}</span>}
                  </span>
                )}
              </span>
            ))}
          </div>
          {showBank && <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3"><div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-dim">Word bank · click to fill the next blank</div><div className="flex flex-wrap gap-1.5">{set.bank.map((word) => <button key={word} onClick={() => fillFromBank(word)} disabled={checked} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10px] font-medium text-muted hover:border-[rgba(183,243,74,0.35)] hover:text-ink">{word}</button>)}</div></div>}
          {checked && <div className={cn('mt-4 rounded-xl border p-3', correctNow === set.blanks.length ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)]' : 'border-[rgba(255,194,75,0.25)] bg-[rgba(255,194,75,0.05)]')}><div className="flex items-center gap-2 text-xs font-semibold"><Icon name={correctNow === set.blanks.length ? 'CheckCircle2' : 'Info'} size={14} className={correctNow === set.blanks.length ? 'text-mint' : 'text-amber'} />{correctNow}/{set.blanks.length} blanks correct</div><p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">{set.explanation}</p></div>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!checked ? <Button variant="primary" size="sm" onClick={check} disabled={!ready} icon="Check">Check blanks</Button> : <><Button variant="primary" size="sm" onClick={next} iconRight="ArrowRight">{index + 1 >= sets.length ? 'See results' : 'Next passage'}</Button><Button size="sm" variant="ghost" onClick={retry} icon="RotateCcw">Retry</Button></>}
            <span className="ml-auto text-[9.5px] text-dim">{set.blanks.filter((_, i) => !inputs[i]?.trim()).length} empty · accepted variants shown after check</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[9.5px] text-dim"><span>This passage tests: {set.topic}</span><span>Total correct: {correctBlanks}/{totalBlanks}</span></div>
      </div>
    </GameShell>
  );
}