import { useRef, useState } from 'react';
import { useStudy } from '../state/StudyContext';
import { DETECTIVE_CASES } from '../data/gamesContent';
import { GameEnd, GameShell, GameStart, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';

export function Detective() {
  const { state, recordGameResult } = useStudy();
  const [phase, setPhase] = useState<'select' | 'brief' | 'investigate' | 'end'>('select');
  const [caseIndex, setCaseIndex] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [wrongAccusations, setWrongAccusations] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<{ type: 'good' | 'bad'; text: string } | null>(null);
  const [, setSolved] = useState(false);
  const recorded = useRef(false);
  const currentCase = DETECTIVE_CASES[caseIndex];
  const evidenceCorrect = currentCase.evidence.filter((e) => answers[e.id] === e.answer).length;
  const [eliminated, setEliminated] = useState<string[]>([]);

  const startCase = (index: number) => {
    setCaseIndex(index);
    setPhase('brief');
    setUnlocked([]);
    setAnswers({});
    setWrongAccusations(0);
    setAttempts(0);
    setSolved(false);
    setMessage(null);
    setEliminated([]);
    recorded.current = false;
  };

  const answerEvidence = (evidenceId: string, option: number) => {
    if (unlocked.includes(evidenceId)) return;
    const ev = currentCase.evidence.find((e) => e.id === evidenceId)!;
    const isCorrect = option === ev.answer;
    setAnswers((a) => ({ ...a, [evidenceId]: option }));
    setAttempts((a) => a + 1);
    setUnlocked((u) => [...u, evidenceId]);
    setMessage({ type: isCorrect ? 'good' : 'bad', text: isCorrect ? ev.explanation : `Not quite. ${ev.explanation}` });
    sound.play(isCorrect ? 'correct' : 'wrong');
  };

  const accuse = (suspectId: string) => {
    setAttempts((a) => a + 1);
    if (suspectId === currentCase.correctSuspect) {
      setSolved(true);
      setPhase('end');
      fireConfetti();
      sound.play('win');
      const score = evidenceCorrect * 150 + 400 - wrongAccusations * 100 - (unlocked.length - evidenceCorrect) * 20;
      if (!recorded.current) {
        recorded.current = true;
        recordGameResult('detective', Math.max(0, score), Math.round(((evidenceCorrect + 1) / Math.max(1, attempts + 1)) * 100), { solved: 1, case: currentCase.id, evidence: evidenceCorrect }, 30 + evidenceCorrect * 5);
      }
    } else {
      setWrongAccusations((w) => w + 1);
      setEliminated((e) => [...e, suspectId]);
      setMessage({ type: 'bad', text: currentCase.wrongSolution });
      sound.play('wrong');
    }
  };

  if (phase === 'select') {
    return (
      <GameShell gameId="detective">
        <div className="mx-auto flex min-h-[calc(100vh-170px)] max-w-5xl flex-col justify-center py-4">
          <div className="text-center"><div className="eyebrow mb-2">Two cases · evidence-based reasoning</div><h2 className="font-display text-2xl font-semibold">Open a case file</h2><p className="mt-1 text-sm text-muted">The evidence is fictional, but every scientific mechanism is from your unit. Unlock evidence, then name the cause.</p></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {DETECTIVE_CASES.map((c, i) => (
              <button key={c.id} onClick={() => startCase(i)} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(40,20,32,0.9),rgba(10,14,20,0.95))] p-6 text-left transition-all hover:-translate-y-1 hover:border-[rgba(244,114,182,0.35)]">
                <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(244,114,182,0.1)] text-pink"><Icon name="Search" size={18} /></span><span className="chip">{i === 0 ? 'Case 01' : 'Case 02'}</span></div>
                <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{c.brief}</p>
                <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-dim">{c.evidence.length} evidence items · {c.suspects.length} suspects</span><span className="font-semibold text-pink group-hover:underline">Investigate →</span></div>
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'brief') {
    return (
      <GameShell gameId="detective">
        <GameStart gameId="detective" onStart={() => setPhase('investigate')} startLabel="Open the case file" best={state.gameBests.detective ? { score: state.gameBests.detective.score, accuracy: state.gameBests.detective.accuracy } : null}
          rules={[
            'Read the brief and examine all suspects.',
            'Each evidence item unlocks when you answer its science question. A wrong answer still reveals the evidence but reduces accuracy.',
            'You may accuse a suspect at any time. A wrong accusation eliminates that suspect and costs 100 points.',
            'The best investigations unlock all evidence before accusing.',
            'Both cases are fictional scenarios built from the unit’s real mechanisms.',
          ]}
          side={<div className="mt-4 rounded-xl border border-line bg-surface-2 p-4"><div className="text-[9px] font-bold uppercase tracking-wider text-pink">Brief</div><p className="mt-1 text-[11px] leading-relaxed text-muted">{currentCase.brief}</p><div className="mt-2 text-[10px] text-dim">{currentCase.location}</div></div>}
        />
      </GameShell>
    );
  }

  if (phase === 'end') {
    const score = Math.max(0, evidenceCorrect * 150 + 400 - wrongAccusations * 100 - (unlocked.length - evidenceCorrect) * 20);
    return (
      <GameShell gameId="detective">
        <GameEnd gameId="detective" score={score} accuracy={Math.round(((evidenceCorrect + 1) / Math.max(1, attempts)) * 100)} xp={30 + evidenceCorrect * 5} onReplay={() => startCase(caseIndex)} message={`Case closed: ${currentCase.title}`}
          stats={[{ label: 'Evidence', value: `${unlocked.length}/${currentCase.evidence.length}` }, { label: 'Evidence correct', value: `${evidenceCorrect}/${currentCase.evidence.length}` }, { label: 'Wrong accusations', value: wrongAccusations }, { label: 'Cause', value: currentCase.suspects.find((s) => s.id === currentCase.correctSuspect)?.name ?? '' }]}
        >
          <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-mint">Case solution</div><p className="mt-1 text-xs leading-relaxed text-muted">{currentCase.solution}</p></div>
          <div className="mt-3 flex justify-center"><Button variant="ghost" size="sm" onClick={() => setPhase('select')} icon="FolderOpen">Choose another case</Button></div>
        </GameEnd>
      </GameShell>
    );
  }

  const eliminatedSet = new Set(eliminated);
  return (
    <GameShell gameId="detective" hud={<><HudStat icon="Search" label="Evidence" value={`${unlocked.length}/${currentCase.evidence.length}`} color="var(--pink)" /><HudStat icon="Target" label="Correct" value={`${evidenceCorrect}/${currentCase.evidence.length}`} color="var(--mint)" /><HudStat icon="AlertTriangle" label="Wrong accusations" value={wrongAccusations} color="var(--coral)" /></>}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><div className="eyebrow">Case file · {currentCase.location}</div><h2 className="font-display text-xl font-semibold">{currentCase.title}</h2></div><span className="chip chip-violet">{unlocked.length === currentCase.evidence.length ? 'All evidence unlocked' : 'Evidence incomplete'}</span></div>
        <p className="text-[11px] leading-relaxed text-muted">{currentCase.brief}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-dim">Evidence locker</div>
            <div className="space-y-2.5">
              {currentCase.evidence.map((ev, i) => {
                const opened = unlocked.includes(ev.id);
                const chosen = answers[ev.id];
                return (
                  <div key={ev.id} className={cn('rounded-xl border p-3.5', opened ? 'border-line bg-surface-2' : 'border-line bg-surface')}>
                    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={cn('flex h-6 w-6 items-center justify-center rounded-full border text-[8px] font-bold', opened ? 'border-transparent bg-[rgba(126,231,135,0.15)] text-mint' : 'border-line text-dim')}>{opened ? <Icon name="Check" size={11} /> : i + 1}</span><span className="text-[11px] font-semibold">{opened ? ev.title : `Evidence ${i + 1}`}</span></div>{!opened && <Icon name="Lock" size={12} className="text-dim" />}</div>
                    {opened ? (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[10.5px] leading-relaxed text-muted">{ev.text}</p>
                        <div className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[10px] leading-relaxed"><span className="font-semibold text-mint">Finding:</span> {ev.explanation}</div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-[10.5px] font-medium leading-relaxed">{ev.question}</p>
                        <div className="mt-2 grid gap-1.5">
                          {ev.options.map((o, oi) => (
                            <button key={o} onClick={() => answerEvidence(ev.id, oi)} className={cn('rounded-lg border px-2.5 py-1.5 text-left text-[10px] transition-colors', chosen === oi && chosen !== ev.answer ? 'border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.06)]' : 'border-line bg-surface hover:border-[var(--border-strong)]')}>{o}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-dim">Suspects</div>
            <div className="space-y-2">
              {currentCase.suspects.map((s) => (
                <button key={s.id} onClick={() => !eliminatedSet.has(s.id) && accuse(s.id)} disabled={eliminatedSet.has(s.id)} className={cn('flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition-colors', eliminatedSet.has(s.id) ? 'border-line bg-surface-3/20 opacity-45' : 'border-line bg-surface-2 hover:border-[rgba(244,114,182,0.35)]')}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-pink"><Icon name={s.icon} size={14} /></span>
                  <span className="flex-1 text-[11px] font-semibold">{s.name}</span>
                  {eliminatedSet.has(s.id) ? <span className="text-[8px] font-bold uppercase tracking-wider text-dim">Eliminated</span> : <Icon name="Gavel" size={12} className="text-dim" />}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-[rgba(255,194,75,0.2)] bg-[rgba(255,194,75,0.05)] p-3 text-[10px] leading-relaxed text-[#d9b876]">Accuse only when the evidence supports a mechanism. A suspect being present is not enough; connect the cause to the effect.</div>
          </div>
        </div>
        {message && <div className={cn('mt-3 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed', message.type === 'good' ? 'border-[rgba(126,231,135,0.3)] bg-[rgba(126,231,135,0.05)] text-[#b8f3bd]' : 'border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.05)] text-[#ffb4ad]')}>{message.text}</div>}
        <div className="mt-3 flex items-center justify-between text-[9.5px] text-dim"><span>Score potential: {evidenceCorrect * 150 + 400 - wrongAccusations * 100}</span><span>{unlocked.length}/{currentCase.evidence.length} evidence unlocked</span></div>
      </div>
    </GameShell>
  );
}