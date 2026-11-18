import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { useStudy } from '../state/StudyContext';
import { selectQuestions } from '../lib/learning';
import { QUESTION_MAP } from '../data/questions';
import type { Question } from '../types';
import { KartScene, type KartView } from '../components/KartScene';
import { GameEnd, GameShell, HudStat, fireConfetti } from '../components/game';
import { Button, Icon, cn } from '../components/ui';
import { sound } from '../lib/sound';
import { useCloud } from '../state/CloudContext';

type Role = 'host' | 'guest';
type ConnStatus = 'idle' | 'creating' | 'joining' | 'waiting' | 'connected' | 'disconnected' | 'error';
type RacePhase = 'lobby' | 'countdown' | 'racing' | 'finished';

interface Racer {
  progress: number;
  lateral: number;
  speed: number;
  steer: number;
  fuel: number;
  answers: number;
  correct: number;
  boostUntil: number;
}

interface PublicState {
  p1: Racer;
  p2: Racer;
  qi1: number;
  qi2: number;
  phase: RacePhase;
  countdown: number;
  winner: 1 | 2 | null;
  seconds: number;
}

interface InputState { throttle: boolean; brake: boolean; steer: number }

const COLORS = { p1: '#b7f34a', p2: '#4de1c1' };
const ROOM_PREFIX = 'trophic-kart-';
const PEER_OPTIONS = {
  debug: 0 as const,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
    ],
  },
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const makeRacer = (lateral: number): Racer => ({ progress: 0, lateral, speed: 0, steer: 0, fuel: 70, answers: 0, correct: 0, boostUntil: 0 });
const initialPublic = (): PublicState => ({ p1: makeRacer(1.2), p2: makeRacer(-1.2), qi1: 0, qi2: 0, phase: 'lobby', countdown: 0, winner: null, seconds: 0 });
const accuracy = (r: Racer) => r.answers ? Math.round((r.correct / r.answers) * 100) : 0;
const scoreOf = (r: Racer) => Math.round(r.progress * 1000 + r.correct * 120 + r.fuel * 4);
const viewOf = (r: Racer, color: string): KartView => ({ progress: r.progress, lateral: r.lateral, speed: r.speed, steer: r.steer, fuel: r.fuel, boost: performance.now() < r.boostUntil, color });

function roomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function step(r: Racer, input: InputState, dt: number, laps: number, now: number): Racer {
  const boost = now < r.boostUntil;
  const engine = r.fuel > 0;
  const throttle = engine ? (input.throttle ? 1 : 0.55) : 0;
  const target = engine ? (input.brake ? 0 : (8.2 + (boost ? 2.5 : 0)) * throttle) : 0;
  const speed = Math.max(0, r.speed + (target - r.speed) * Math.min(1, dt * 2.2));
  let lateral = r.lateral + input.steer * (1.0 + speed * 0.15) * dt;
  let slowed = speed;
  if (Math.abs(lateral) > 3.1) { lateral = clamp(lateral, -3.1, 3.1); slowed = speed * 0.72; }
  const fuel = Math.max(0, r.fuel - (0.9 + (input.throttle ? 2.15 : 0.75) + (boost ? 0.7 : 0)) * dt);
  return { ...r, lateral, speed: slowed, steer: input.steer, fuel, progress: Math.min(laps, r.progress + slowed * dt / 180) };
}

function OnlineQuestion({ q, onAnswer, feedback, disabled, color }: { q?: Question; onAnswer: (i: number) => void; feedback: { selected: number; correct: boolean } | null; disabled: boolean; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color }}>Your retrieval console</span><span className="text-[8px] text-white/30">KEYS 1–4 · DRIVE W/A/S/D</span></div>
      {q ? <>
        <div className="min-h-[44px] text-[13px] font-semibold leading-snug text-white">{q.prompt}</div>
        <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">{q.options?.map((o, i) => {
          const chosen = feedback?.selected === i; const good = feedback && i === q.answer;
          return <button key={i} onClick={() => onAnswer(i)} disabled={disabled || !!feedback} className={cn('flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[10px] leading-snug', good ? 'border-[rgba(126,231,135,0.6)] bg-[rgba(126,231,135,0.1)] text-[#c6f8ca]' : chosen ? 'border-[rgba(255,107,107,0.6)] bg-[rgba(255,107,107,0.08)] text-[#ffb4ad]' : 'border-white/10 bg-white/[0.025] text-white/60 hover:border-white/25 hover:text-white')}><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/10 text-[7px] font-bold text-white/40">{i + 1}</span><span className="flex-1">{o}</span></button>;
        })}</div>
      </> : <div className="flex min-h-[96px] items-center justify-center text-xs text-white/35">Waiting for the race question…</div>}
    </div>
  );
}

export function KartingOnline({ onExit }: { onExit: () => void }) {
  const { state, recordGameResult } = useStudy();
  const { submitKarting } = useCloud();
  const [role, setRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('Player');
  const [opponent, setOpponent] = useState('Rival');
  const [error, setError] = useState('');
  const [laps, setLaps] = useState(2);
  const [pub, setPub] = useState<PublicState>(initialPublic);
  const pubRef = useRef(pub);
  pubRef.current = pub;
  const [feedback, setFeedback] = useState<{ selected: number; correct: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const startIdRef = useRef('');
  const startRetryRef = useRef<number | null>(null);
  const helloRetryRef = useRef<number | null>(null);
  const welcomedRef = useRef(false);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const roleRef = useRef<Role | null>(null);
  roleRef.current = role;
  const questionsRef = useRef<{ p1: Question[]; p2: Question[] }>({ p1: [], p2: [] });
  const inputs = useRef<InputState>({ throttle: false, brake: false, steer: 0 });
  const hostInputs = useRef<{ p1: InputState; p2: InputState }>({ p1: { throttle: false, brake: false, steer: 0 }, p2: { throttle: false, brake: false, steer: 0 } });
  const hostTick = useRef(0);
  const answerLock = useRef(false);
  const recorded = useRef(false);
  const guestHandler = useRef<(d: unknown) => void>(() => {});
  const hostHandler = useRef<(d: unknown) => void>(() => {});

  const send = (msg: unknown) => { try { connRef.current?.send(msg); } catch { /* ignore */ } };
  const setPublic = (next: PublicState) => { pubRef.current = next; setPub(next); send({ type: 'state', state: next }); };

  const cleanup = () => {
    if (startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; }
    if (helloRetryRef.current) { window.clearInterval(helloRetryRef.current); helloRetryRef.current = null; }
    welcomedRef.current = false;
    try { connRef.current?.close(); } catch { /* ignore */ }
    try { peerRef.current?.destroy(); } catch { /* ignore */ }
    connRef.current = null; peerRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const createRoom = () => {
    cleanup(); setError(''); setRole('host'); roleRef.current = 'host'; setStatus('creating'); recorded.current = false;
    const c = roomCode();
    setCode(c);
    const peer = new Peer(ROOM_PREFIX + c, PEER_OPTIONS);
    peerRef.current = peer;
    peer.on('open', () => setStatus('waiting'));
    peer.on('connection', (conn) => {
      if (connRef.current) { try { conn.close(); } catch { /* ignore */ } return; }
      connRef.current = conn;
      setOpponentReady(false);
      conn.on('data', (d) => hostHandler.current(d));
      const announceHost = () => {
        setStatus('connected');
        try { conn.send({ type: 'welcome', name, code: c }); } catch { /* the guest will retry hello */ }
      };
      conn.on('open', announceHost);
      if (conn.open) announceHost();
      conn.on('close', () => { if (startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; } setStatus('disconnected'); setError('Your opponent left the room.'); });
      conn.on('error', () => { if (startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; } setError('Connection error. Try a new room code.'); });
    });
    peer.on('error', (e) => { setError(e.type === 'unavailable-id' ? 'That room code was taken. Create a new room.' : `Room error: ${e.type}`); setStatus('error'); });
  };

  const joinRoom = () => {
    const clean = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 4) { setError('Enter the room code from your opponent.'); return; }
    cleanup(); setError(''); setRole('guest'); roleRef.current = 'guest'; setCode(clean); setStatus('joining'); recorded.current = false;
    const peer = new Peer(PEER_OPTIONS);
    peerRef.current = peer;
    peer.on('open', () => {
      const conn = peer.connect(ROOM_PREFIX + clean, { reliable: true });
      connRef.current = conn;
      conn.on('data', (d) => guestHandler.current(d));
      conn.on('open', () => {
        setStatus('connected');
        welcomedRef.current = false;
        const hello = () => { try { conn.send({ type: 'hello', name }); } catch { /* host may still be opening */ } };
        hello();
        if (helloRetryRef.current) window.clearInterval(helloRetryRef.current);
        helloRetryRef.current = window.setInterval(() => {
          if (welcomedRef.current) { if (helloRetryRef.current) { window.clearInterval(helloRetryRef.current); helloRetryRef.current = null; } return; }
          hello();
        }, 1200);
      });
      const stopHello = () => { if (helloRetryRef.current) { window.clearInterval(helloRetryRef.current); helloRetryRef.current = null; } };
      conn.on('close', () => { stopHello(); setStatus('disconnected'); setError('The host left the room.'); });
      conn.on('error', () => { stopHello(); setError('Could not reach that room.'); });
    });
    peer.on('error', (e) => { setError(e.type === 'peer-unavailable' ? 'Room not found. Check the code and try again.' : `Connection error: ${e.type}`); setStatus('error'); });
  };

  const resetRace = () => {
    const fresh = initialPublic();
    recorded.current = false;
    if (roleRef.current === 'host') setPublic(fresh);
    else { setPub(fresh); pubRef.current = fresh; }
    setFeedback(null);
    answerLock.current = false;
    recorded.current = false;
    if (startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; }
    startIdRef.current = '';
    inputs.current = { throttle: false, brake: false, steer: 0 };
    hostInputs.current = { p1: { throttle: false, brake: false, steer: 0 }, p2: { throttle: false, brake: false, steer: 0 } };
  };

  const startHostRace = () => {
    if (roleRef.current !== 'host') return;
    const pool = selectQuestions(state, { count: 32, types: ['mcq'], avoidRecent: false });
    const q1 = pool.slice(0, Math.max(12, Math.floor(pool.length / 2)));
    const q2 = pool.slice(Math.max(12, Math.floor(pool.length / 2)));
    questionsRef.current = { p1: q1, p2: q2.length >= 10 ? q2 : [...pool].reverse() };
    const fresh = initialPublic();
    fresh.phase = 'countdown'; fresh.countdown = 3;
    setPublic(fresh);
    const startId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    startIdRef.current = startId;
    const payload = { type: 'start', startId, q1: q1.map((q) => q.id), q2: questionsRef.current.p2.map((q) => q.id), laps };
    send(payload);
    if (startRetryRef.current) window.clearInterval(startRetryRef.current);
    startRetryRef.current = window.setInterval(() => {
      if (startIdRef.current !== startId) { if (startRetryRef.current) window.clearInterval(startRetryRef.current); return; }
      send(payload);
      send({ type: 'state', state: pubRef.current });
    }, 700);
    window.setTimeout(() => { if (startIdRef.current === startId && startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; } }, 10000);
    sound.play('level');
  };

  const advanceHostQuestion = (player: 1 | 2) => {
    const s = pubRef.current;
    const next = player === 1 ? { ...s, qi1: s.qi1 + 1 } : { ...s, qi2: s.qi2 + 1 };
    setPublic(next);
  };

  const processHostAnswer = (player: 1 | 2, choice: number) => {
    const s = pubRef.current;
    if (s.phase !== 'racing' || s.winner) return;
    if (player === 1 && answerLock.current) return;
    const q = player === 1 ? questionsRef.current.p1[s.qi1 % questionsRef.current.p1.length] : questionsRef.current.p2[s.qi2 % questionsRef.current.p2.length];
    if (!q) return;
    const correct = choice === q.answer;
    const now = performance.now();
    const update = (r: Racer): Racer => ({ ...r, fuel: Math.min(100, r.fuel + (correct ? 28 : -9)), boostUntil: correct ? now + 2600 : r.boostUntil, answers: r.answers + 1, correct: r.correct + (correct ? 1 : 0) });
    const next = player === 1 ? { ...s, p1: update(s.p1) } : { ...s, p2: update(s.p2) };
    setPublic(next);
    if (player === 1) {
      answerLock.current = true;
      setFeedback({ selected: choice, correct });
      sound.play(correct ? 'correct' : 'wrong');
      window.setTimeout(() => { answerLock.current = false; setFeedback(null); advanceHostQuestion(1); }, 700);
    } else {
      window.setTimeout(() => advanceHostQuestion(2), 650);
    }
  };

  hostHandler.current = (raw: unknown) => {
    const d = raw as { type?: string; name?: string; input?: InputState; choice?: number };
    if (!d || typeof d !== 'object') return;
    if (d.type === 'hello') { setOpponent(d.name || 'Rival'); setOpponentReady(true); send({ type: 'welcome', name, code }); setStatus('connected'); }
    if (d.type === 'start-ack') { if (startRetryRef.current) { window.clearInterval(startRetryRef.current); startRetryRef.current = null; } }
    if (d.type === 'input' && d.input) hostInputs.current.p2 = d.input;
    if (d.type === 'answer' && typeof d.choice === 'number') processHostAnswer(2, d.choice);
    if (d.type === 'reset') resetRace();
  };

  guestHandler.current = (raw: unknown) => {
    const d = raw as { type?: string; name?: string; state?: PublicState; q1?: string[]; q2?: string[]; laps?: number; winner?: number; startId?: string };
    if (!d || typeof d !== 'object') return;
    if (d.type === 'welcome') { setOpponent(d.name || 'Host'); setStatus('connected'); welcomedRef.current = true; if (helloRetryRef.current) { window.clearInterval(helloRetryRef.current); helloRetryRef.current = null; } }
    if (d.type === 'start') {
      send({ type: 'start-ack', startId: d.startId });
      if (d.startId && startIdRef.current === d.startId && pubRef.current.phase !== 'lobby') return;
      startIdRef.current = d.startId || '';
      welcomedRef.current = true;
      if (helloRetryRef.current) { window.clearInterval(helloRetryRef.current); helloRetryRef.current = null; }
      const qs = (d.q2 || []).map((id) => QUESTION_MAP[id]).filter(Boolean) as Question[];
      questionsRef.current = { p1: [], p2: qs };
      setLaps(d.laps || 2);
      const fresh = initialPublic(); fresh.phase = 'countdown'; fresh.countdown = 3;
      setPub(fresh); pubRef.current = fresh; setFeedback(null); answerLock.current = false;
    }
    if (d.type === 'state' && d.state) { setPub(d.state); pubRef.current = d.state; if (d.state.phase === 'lobby') { recorded.current = false; setFeedback(null); } }
    if (d.type === 'finish' && d.state) { setPub(d.state); pubRef.current = d.state; }
  };

  useEffect(() => {
    if (role !== 'host' || pub.phase !== 'countdown') return;
    if (pub.countdown <= 0) {
      const next = { ...pubRef.current, phase: 'racing' as RacePhase };
      setPublic(next);
      return;
    }
    const t = window.setTimeout(() => { const n = { ...pubRef.current, countdown: pubRef.current.countdown - 1 }; setPublic(n); }, 900);
    return () => window.clearTimeout(t);
  }, [role, pub.phase, pub.countdown]);

  useEffect(() => {
    if (role !== 'host' || pub.phase !== 'racing') return;
    hostTick.current = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.2, (now - hostTick.current) / 1000);
      hostTick.current = now;
      const s = pubRef.current;
      if (s.phase !== 'racing' || s.winner) return;
      const n1 = step(s.p1, hostInputs.current.p1, dt, laps, now);
      const n2 = step(s.p2, hostInputs.current.p2, dt, laps, now);
      const next = { ...s, p1: n1, p2: n2, seconds: s.seconds + dt };
      const raceOver = n1.progress >= laps || n2.progress >= laps || next.seconds >= 120;
      if (raceOver) {
        const w = n1.progress >= laps ? 1 : n2.progress >= laps ? 2 : n1.progress >= n2.progress ? 1 : 2;
        next.phase = 'finished'; next.winner = w;
        setPublic(next);
        send({ type: 'finish', state: next });
        if (!recorded.current) { recorded.current = true; recordGameResult('karting', scoreOf(n1), accuracy(n1), { won: w === 1 ? 1 : 0, mode: 'online' }, 30 + (w === 1 ? 40 : 0)); void submitKarting(scoreOf(n1), accuracy(n1)); }
        if (w === 1) fireConfetti();
        sound.play(w === 1 ? 'win' : 'lose');
        return;
      }
      setPublic(next);
    }, 100);
    return () => window.clearInterval(timer);
  }, [role, pub.phase, laps, recordGameResult]);

  useEffect(() => {
    if (role !== 'guest' || pub.phase !== 'racing') return;
    const t = window.setInterval(() => { send({ type: 'input', input: inputs.current }); }, 100);
    return () => window.clearInterval(t);
  }, [role, pub.phase]);

  useEffect(() => {
    if (role !== 'guest' || pub.phase !== 'finished' || recorded.current) return;
    recorded.current = true;
    const r = pub.p2;
    recordGameResult('karting', scoreOf(r), accuracy(r), { won: pub.winner === 2 ? 1 : 0, mode: 'online' }, 30 + (pub.winner === 2 ? 40 : 0));
    void submitKarting(scoreOf(r), accuracy(r));
    if (pub.winner === 2) fireConfetti();
    sound.play(pub.winner === 2 ? 'win' : 'lose');
  }, [role, pub.phase, pub.winner, pub.p2, recordGameResult]);

  useEffect(() => {
    if (pub.phase !== 'racing') return;
    const down = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (['1', '2', '3', '4'].includes(e.key)) {
        const choice = Number(e.key) - 1;
        if (role === 'host') processHostAnswer(1, choice);
        else {
          if (answerLock.current) return;
          const q = questionsRef.current.p2[pubRef.current.qi2 % Math.max(1, questionsRef.current.p2.length)];
          if (!q) return;
          answerLock.current = true;
          setFeedback({ selected: choice, correct: choice === q.answer });
          sound.play(choice === q.answer ? 'correct' : 'wrong');
          send({ type: 'answer', choice });
          window.setTimeout(() => { answerLock.current = false; setFeedback(null); }, 700);
        }
      }
      if (e.code === 'KeyW') inputs.current.throttle = true;
      if (e.code === 'KeyS') inputs.current.brake = true;
      if (e.code === 'KeyA') inputs.current.steer = -1;
      if (e.code === 'KeyD') inputs.current.steer = 1;
      if (role === 'host') {
        if (e.code === 'KeyW') hostInputs.current.p1.throttle = true;
        if (e.code === 'KeyS') hostInputs.current.p1.brake = true;
        if (e.code === 'KeyA') hostInputs.current.p1.steer = -1;
        if (e.code === 'KeyD') hostInputs.current.p1.steer = 1;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') { inputs.current.throttle = false; hostInputs.current.p1.throttle = false; }
      if (e.code === 'KeyS') { inputs.current.brake = false; hostInputs.current.p1.brake = false; }
      if (e.code === 'KeyA') { inputs.current.steer = 0; hostInputs.current.p1.steer = 0; }
      if (e.code === 'KeyD') { inputs.current.steer = 0; hostInputs.current.p1.steer = 0; }
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [pub.phase, role]);

  const localRacer = role === 'host' ? pub.p1 : pub.p2;
  const otherRacer = role === 'host' ? pub.p2 : pub.p1;
  const localColor = role === 'host' ? COLORS.p1 : COLORS.p2;
  const localQ = role === 'host' ? questionsRef.current.p1[pub.qi1 % Math.max(1, questionsRef.current.p1.length)] : questionsRef.current.p2[pub.qi2 % Math.max(1, questionsRef.current.p2.length)];
  const q = localQ;
  useEffect(() => { if (role === 'guest') setFeedback(null); }, [pub.qi2, role]);

  const submit = (choice: number) => {
    if (pub.phase !== 'racing') return;
    if (role === 'host') processHostAnswer(1, choice);
    else {
      if (answerLock.current || !q) return;
      answerLock.current = true;
      setFeedback({ selected: choice, correct: choice === q.answer });
      sound.play(choice === q.answer ? 'correct' : 'wrong');
      send({ type: 'answer', choice });
      window.setTimeout(() => { answerLock.current = false; setFeedback(null); }, 700);
    }
  };

  const setDrive = (key: keyof InputState, value: boolean | number) => {
    inputs.current = { ...inputs.current, [key]: value } as InputState;
    if (role === 'host') hostInputs.current.p1 = { ...hostInputs.current.p1, [key]: value } as InputState;
  };

  if (pub.phase === 'finished') {
    const won = pub.winner === (role === 'host' ? 1 : 2);
    return (
      <GameShell gameId="karting" hud={<><HudStat icon="Flag" label="Laps" value={`${laps}`} color="var(--mint)" /><HudStat icon="Globe2" label="Online" value={code || 'room'} color="var(--amber)" /></>}>
        <GameEnd gameId="karting" score={scoreOf(localRacer)} accuracy={accuracy(localRacer)} xp={30 + (won ? 40 : 0)} hideReplay onReplay={() => { if (role === 'guest') send({ type: 'reset' }); resetRace(); }} message={won ? 'You win the online race.' : `${opponent} takes the checkered flag.`}
          stats={[{ label: 'Laps', value: `${Math.min(laps, Math.floor(localRacer.progress))}/${laps}` }, { label: 'Correct answers', value: `${localRacer.correct}/${localRacer.answers}` }, { label: 'Race time', value: `${Math.floor(pub.seconds / 60)}:${String(Math.floor(pub.seconds % 60)).padStart(2, '0')}` }, { label: 'Opponent', value: opponent }]}
        >
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{[{ n: 'You', r: localRacer, c: localColor, w: won }, { n: opponent, r: otherRacer, c: role === 'host' ? COLORS.p2 : COLORS.p1, w: !won }].map((x) => <div key={x.n} className={cn('rounded-2xl border p-3', x.w ? 'border-[rgba(183,243,74,0.4)] bg-[rgba(183,243,74,0.06)]' : 'border-white/10 bg-black/25')}><div className="flex justify-between"><span className="text-[11px] font-semibold" style={{ color: x.c }}>{x.n}</span>{x.w && <span className="chip chip-acid">Winner</span>}</div><div className="mt-2 grid grid-cols-3 gap-2 text-[9px]"><div><div className="text-white/30">Laps</div><div className="text-white">{Math.min(laps, Math.floor(x.r.progress))}/{laps}</div></div><div><div className="text-white/30">Correct</div><div className="text-white">{x.r.correct}/{x.r.answers}</div></div><div><div className="text-white/30">Fuel</div><div className="text-white">{Math.round(x.r.fuel)}</div></div></div></div>)}</div>
          <div className="mt-3 flex justify-center gap-2"><Button variant="primary" size="sm" icon="RotateCcw" onClick={() => { if (role === 'guest') send({ type: 'reset' }); resetRace(); }}>Back to room lobby</Button><Button size="sm" variant="ghost" icon="LogOut" onClick={() => { cleanup(); onExit(); }}>Leave room</Button></div>
        </GameEnd>
      </GameShell>
    );
  }

  if (pub.phase === 'countdown' || pub.phase === 'racing') {
    return (
      <GameShell gameId="karting" hud={<><HudStat icon="Globe2" label="Room" value={code || '—'} color="var(--amber)" /><HudStat icon="Flag" label="Lap" value={`${Math.min(laps, Math.floor(localRacer.progress) + 1)}/${laps}`} color="var(--mint)" /><HudStat icon="Users" label="Opponent" value={opponent} /><button onClick={() => { cleanup(); onExit(); }} className="flex h-[38px] items-center gap-1 rounded-lg border border-white/10 bg-black/25 px-2.5 text-[9px] font-semibold text-white/45 hover:text-white" aria-label="Leave online race"><Icon name="LogOut" size={12} />Leave</button></>}>
        <div className="space-y-3">
          <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/10 sm:h-[460px]">
            <KartScene p1={viewOf(pub.p1, COLORS.p1)} p2={viewOf(pub.p2, COLORS.p2)} viewMode="single" viewer={role === 'host' ? 1 : 2} className="h-full w-full" />
            <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: localColor }}>You · {role === 'host' ? 'P1' : 'P2'} · {code || 'online'}</div>
            <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-white/45">{opponent}</div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end gap-2">
              <div className="flex-1 rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5"><div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/35"><span style={{ color: localColor }}>Fuel</span><span>{Math.round(localRacer.fuel)}/100</span></div><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${localRacer.fuel}%`, background: localColor }} /></div></div>
              <div className="w-24 rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5"><div className="text-[8px] font-bold uppercase tracking-wider text-white/35">Speed</div><div className="font-display text-base font-semibold text-white">{Math.round(localRacer.speed * 10)}<span className="text-[8px] text-white/30"> km/h</span></div></div>
              <div className="flex gap-1"><button onPointerDown={() => setDrive('steer', -1)} onPointerUp={() => setDrive('steer', 0)} onPointerLeave={() => setDrive('steer', 0)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-black/55 text-white/70" aria-label="Steer left">←</button><button onPointerDown={() => setDrive('throttle', true)} onPointerUp={() => setDrive('throttle', false)} onPointerLeave={() => setDrive('throttle', false)} className="flex h-9 items-center justify-center rounded-lg border border-[rgba(183,243,74,0.3)] bg-[rgba(183,243,74,0.12)] px-2 text-[8px] font-bold text-acid">GAS</button><button onPointerDown={() => setDrive('brake', true)} onPointerUp={() => setDrive('brake', false)} onPointerLeave={() => setDrive('brake', false)} className="flex h-9 items-center justify-center rounded-lg border border-white/15 bg-black/55 px-2 text-[8px] font-bold text-white/70">BRAKE</button><button onPointerDown={() => setDrive('steer', 1)} onPointerUp={() => setDrive('steer', 0)} onPointerLeave={() => setDrive('steer', 0)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-black/55 text-white/70" aria-label="Steer right">→</button></div>
            </div>
            {pub.phase === 'countdown' && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><div className="font-display text-[92px] font-bold text-acid">{pub.countdown}</div><div className="text-[9px] uppercase tracking-[0.3em] text-white/40">Answer to fuel</div></div></div>}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <OnlineQuestion q={q} onAnswer={submit} feedback={feedback} disabled={pub.phase !== 'racing'} color={localColor} />
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md"><div className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">Opponent telemetry</div><div className="mt-2 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[9px] font-bold" style={{ color: role === 'host' ? COLORS.p2 : COLORS.p1 }}>{opponent.slice(0, 2).toUpperCase()}</span><div><div className="text-xs font-semibold text-white">{opponent}</div><div className="text-[9px] text-white/35">{role === 'host' ? 'P2' : 'Host'} · online</div></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-[9px]"><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-white/30">Lap</div><div className="font-semibold text-white">{Math.min(laps, Math.floor(otherRacer.progress) + 1)}/{laps}</div></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-white/30">Correct</div><div className="font-semibold text-white">{otherRacer.correct}/{otherRacer.answers}</div></div></div><div className="mt-3 text-[9px] leading-relaxed text-white/30">Drive with W/A/S/D or the touch pad. Answer 1–4 to add fuel.</div></div>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId="karting">
      <div className="mx-auto flex min-h-[calc(100vh-170px)] max-w-3xl items-center py-4">
        <div className="w-full rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl sm:p-7">
          <div className="flex items-start justify-between gap-2"><div><div className="mb-1 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.16em] text-acid"><span className="h-1 w-1 rounded-full bg-acid" />Online room · PeerJS</div><h1 className="font-display text-3xl font-semibold tracking-tight text-white">Race someone, anywhere.</h1><p className="mt-1 max-w-xl text-[11px] leading-relaxed text-white/45">Create a private room, send the 5-character code, and race across two devices. Each player answers their own questions to keep the kart fueled.</p></div><Button size="sm" variant="ghost" icon="ArrowLeft" onClick={() => { cleanup(); onExit(); }}>Back</Button></div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><label className="text-[8px] font-bold uppercase tracking-wider text-white/30" htmlFor="kart-name">Your name</label><input id="kart-name" value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} className="input h-8 w-40 text-xs" placeholder="Player" /></div>
          {error && <div className="mt-3 rounded-xl border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.07)] px-3 py-2 text-[10px] text-[#ffb4ad]">{error}</div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white"><Icon name="Crown" size={14} className="text-acid" />Host a room</div>
              <p className="mt-1 text-[10px] text-white/40">Create a code, then wait for a friend to join.</p>
              <div className="mt-3"><div className="mb-1 text-[8px] font-bold uppercase tracking-wider text-white/30">Race length</div><div className="flex gap-1.5">{[1, 2, 3].map((n) => <button key={n} onClick={() => setLaps(n)} className={cn('flex-1 rounded-md border py-1.5 text-[9px] font-semibold', laps === n ? 'border-[rgba(183,243,74,0.4)] bg-[rgba(183,243,74,0.08)] text-acid' : 'border-white/10 text-white/40')}>{n} lap{n > 1 ? 's' : ''}</button>)}</div></div>
              {role === 'host' && (status === 'waiting' || status === 'connected' || status === 'creating') ? <div className="mt-3"><div className="flex items-center justify-between rounded-xl border border-[rgba(183,243,74,0.25)] bg-[rgba(183,243,74,0.06)] px-3 py-2"><span className="font-display text-lg font-bold tracking-[0.3em] text-acid">{code}</span><button className="text-[9px] font-semibold text-white/50 hover:text-white" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? 'Copied' : 'Copy'}</button></div><div className="mt-2 text-[9px] text-white/35">{status === 'waiting' ? 'Waiting for your opponent…' : `Connected to ${opponent}`}</div>{status === 'connected' && <Button variant="primary" size="sm" className="mt-3 w-full" icon="Flag" onClick={startHostRace}>Start the race</Button>}{!opponentReady && <div className="mt-1.5 text-[8.5px] text-white/30">Opponent joined. You can start now.</div>}</div> : <Button variant="primary" size="sm" className="mt-3 w-full" icon="Plus" onClick={createRoom} disabled={status === 'creating' || status === 'joining'}>Create room</Button>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white"><Icon name="LogIn" size={14} className="text-mint" />Join a room</div>
              <p className="mt-1 text-[10px] text-white/40">Enter the code your friend sends you.</p>
              <div className="mt-3 flex gap-2"><input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" className="input h-9 text-center text-sm font-bold uppercase tracking-[0.2em]" maxLength={8} aria-label="Room code" /><Button size="sm" variant="mint" icon="ArrowRight" onClick={joinRoom} disabled={status === 'joining'}>Join</Button></div>
              {role === 'guest' && <div className="mt-2 text-[9px] text-white/35">{status === 'connected' ? `Connected to ${opponent}. Waiting for host…` : status === 'joining' ? 'Connecting…' : status === 'disconnected' ? 'Disconnected.' : 'Not connected.'}</div>}
              {role === 'guest' && status === 'connected' && <div className="mt-2 text-[8px] text-white/25">The host chooses the race length.</div>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[9px] text-white/30"><span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">1–2 players</span><span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">Peer-to-peer</span><span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">No account needed</span><span className="ml-auto">Room codes are private to this session</span></div>
        </div>
      </div>
    </GameShell>
  );
}