import { motion } from 'framer-motion';
import type { Analytics, Attempt, TopicId } from '../types';
import { TOPICS } from '../data/concepts';
import { ProgressBar, cn } from './ui';

export function RadarChart({ analytics, size = 320 }: { analytics: Analytics; size?: number }) {
  const center = 190;
  const radius = 92;
  const topics = TOPICS;
  const n = topics.length;
  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r] as const;
  };
  const polygon = topics.map((t, i) => point(i, analytics.topicMastery[t.id]).join(',')).join(' ');
  const gridPoly = (pct: number) =>
    topics.map((_, i) => point(i, pct).join(',')).join(' ');
  return (
    <svg viewBox="0 0 380 320" width="100%" height={size} role="img" aria-label="Topic mastery radar chart">
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--acid)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--mint)" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((p) => (
        <polygon key={p} points={gridPoly(p)} fill="none" stroke="var(--border)" strokeWidth={1} />
      ))}
      {topics.map((t, i) => {
        const [x, y] = point(i, 100);
        return <line key={t.id} x1={center} y1={center} x2={x} y2={y} stroke="var(--border)" strokeWidth={0.7} />;
      })}
      <motion.g initial={{ opacity: 0, scale: 0.65 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: '190px 160px' }}>
        <polygon points={polygon} fill="url(#radar-fill)" stroke="var(--acid)" strokeWidth={2} strokeLinejoin="round" />
        {topics.map((t, i) => {
          const [x, y] = point(i, analytics.topicMastery[t.id]);
          return <circle key={t.id} cx={x} cy={y} r={3.4} fill="var(--acid)" stroke="var(--bg)" strokeWidth={1.5} />;
        })}
      </motion.g>
      {topics.map((t, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = center + Math.cos(angle) * (radius + 28);
        const y = center + Math.sin(angle) * (radius + 24);
        const anchor = x > center + 18 ? 'start' : x < center - 18 ? 'end' : 'middle';
        return (
          <g key={t.id}>
            <text x={x} y={y - 4} textAnchor={anchor} fontSize="9.5" fontWeight="700" fill="var(--muted)" style={{ letterSpacing: '0.04em' }}>
              {t.shortName.toUpperCase()}
            </text>
            <text x={x} y={y + 8} textAnchor={anchor} fontSize="10" fontWeight="700" fill={t.color}>
              {analytics.topicMastery[t.id]}%
            </text>
          </g>
        );
      })}
      <circle cx={center} cy={center} r={2} fill="var(--muted-2)" />
    </svg>
  );
}

export function TopicBars({ analytics, compact }: { analytics: Analytics; compact?: boolean }) {
  return (
    <div className="space-y-3">
      {TOPICS.map((t) => (
        <div key={t.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="topic-dot" style={{ background: t.color }} />
              <span className="truncate text-xs font-semibold text-ink">{compact ? t.shortName : t.name}</span>
            </div>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: t.color }}>{analytics.topicMastery[t.id]}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${analytics.topicMastery[t.id]}%`, background: t.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReadinessBreakdown({ analytics }: { analytics: Analytics }) {
  const parts = [
    { label: 'Demonstrated mastery', value: analytics.readinessParts.mastery, weight: '50%', color: 'var(--acid)', tip: 'Weighted mastery across every concept, requiring breadth, harder questions and varied formats.' },
    { label: 'Unit coverage', value: analytics.readinessParts.coverage, weight: '15%', color: 'var(--mint)', tip: 'How many distinct questions you have attempted across the whole unit.' },
    { label: 'Rigor', value: analytics.readinessParts.rigor, weight: '15%', color: 'var(--amber)', tip: 'The difficulty of questions you answer correctly. Harder evidence raises this part.' },
    { label: 'Recent accuracy', value: analytics.readinessParts.recent, weight: '20%', color: 'var(--sky)', tip: 'Your accuracy over the last 30 answers. This rewards current performance, not old history.' },
  ];
  return (
    <div className="space-y-3.5">
      {parts.map((p) => (
        <div key={p.label}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted" title={p.tip}>{p.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-dim">{p.weight}</span>
              <span className="w-8 text-right text-xs font-bold tabular-nums" style={{ color: p.color }}>{p.value}%</span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p.value}%`, background: p.color }} />
          </div>
        </div>
      ))}
      {analytics.readinessParts.penalty > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.05)] px-3 py-2">
          <span className="text-[11px] font-medium text-[#ff9a94]">Unresolved weakness penalty</span>
          <span className="text-[11px] font-bold text-[#ff9a94]">−{analytics.readinessParts.penalty}%</span>
        </div>
      )}
    </div>
  );
}

export function ActivityBars({ attempts, days = 7 }: { attempts: Attempt[]; days?: number }) {
  const today = new Date();
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayAttempts = attempts.filter((a) => {
      const ad = new Date(a.at);
      return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, '0')}-${String(ad.getDate()).padStart(2, '0')}` === key;
    });
    const correct = dayAttempts.filter((a) => a.correct >= 0.7).length;
    return {
      key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      count: dayAttempts.length,
      accuracy: dayAttempts.length ? Math.round((correct / dayAttempts.length) * 100) : 0,
    };
  });
  const max = Math.max(10, ...data.map((d) => d.count));
  return (
    <div className="flex h-[150px] items-end gap-2">
      {data.map((d) => (
        <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div className="relative flex w-full flex-1 items-end justify-center">
            <div
              className={cn('w-full max-w-[34px] rounded-t-md transition-all duration-700', d.count === 0 && 'bg-surface-3')}
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, background: d.count ? `linear-gradient(180deg, var(--acid), rgba(77,225,193,0.4))` : undefined }}
              title={`${d.full}: ${d.count} questions, ${d.accuracy}% correct`}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface-3 px-2.5 py-1.5 text-[10px] font-semibold shadow-xl group-hover:block">
              {d.count}Q · {d.count ? `${d.accuracy}%` : 'rest'}
            </div>
          </div>
          <span className="text-[10px] font-bold text-dim">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniSpark({ values, color = 'var(--acid)' }: { values: number[]; color?: string }) {
  const w = 120;
  const h = 34;
  if (values.length < 2) return <div className="h-[34px] w-[120px] rounded bg-surface-3" />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MasteryDonut({ value, color = 'var(--acid)', size = 46 }: { value: number; color?: string; size?: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{Math.round(value)}</span>
    </div>
  );
}

export function TopicProgressCard({ topicId, analytics }: { topicId: TopicId; analytics: Analytics }) {
  const topic = TOPICS.find((t) => t.id === topicId)!;
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold"><span className="topic-dot" style={{ background: topic.color }} />{topic.shortName}</span>
        <span className="text-xs font-bold" style={{ color: topic.color }}>{analytics.topicMastery[topicId]}%</span>
      </div>
      <ProgressBar value={analytics.topicMastery[topicId]} color={topic.color} className="mt-2" height={4} />
    </div>
  );
}