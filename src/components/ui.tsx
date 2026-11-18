import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { ICONS } from './iconMap';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

export const cn = clsx;

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

export function Icon({ name, size = 18, className, strokeWidth = 1.9, style }: IconProps) {
  const Lib = ICONS as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>>;
  const Cmp = Lib[name] ?? Lib.Circle;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}

type ButtonVariant = 'default' | 'primary' | 'mint' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantClass: Record<ButtonVariant, string> = {
  default: '',
  primary: 'btn-primary',
  mint: 'btn-mint',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};
const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  icon: 'btn-icon',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
}

export function Button({ variant = 'default', size = 'md', icon, iconRight, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn('btn', variantClass[variant], sizeClass[size], className)} {...props}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}

export function LinkButton({
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize; icon?: string; iconRight?: string }) {
  return (
    <Link className={cn('btn', variantClass[variant], sizeClass[size], className)} {...props}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </Link>
  );
}

export function Card({ className, children, glow, hover, ...props }: React.HTMLAttributes<HTMLDivElement> & { glow?: string; hover?: boolean }) {
  return (
    <div
      className={cn('card', glow && 'card-glow', hover && 'card-hover', className)}
      style={glow ? ({ '--glow': glow } as React.CSSProperties) : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color, className, height }: { value: number; max?: number; color?: string; className?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={cn('progress-track', className)} style={height ? { height } : undefined} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('progress-fill', color === 'amber' && 'amber', color === 'violet' && 'violet')}
        style={color && !['amber', 'violet'].includes(color) ? { background: color, width: `${pct}%` } : { width: `${pct}%` }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 180,
  stroke = 11,
  children,
  label,
  colorFrom = 'var(--acid)',
  colorTo = 'var(--mint)',
  track = 'var(--surface-3)',
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  label?: string;
  colorFrom?: string;
  colorTo?: string;
  track?: string;
}) {
  const id = useId().replace(/:/g, '');
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <>
            <span className="font-display text-4xl font-semibold tracking-tight">{Math.round(pct)}%</span>
            {label && <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
}

export function CountUp({ value, suffix = '', prefix = '', duration = 900, className }: { value: number; suffix?: string; prefix?: string; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const diff = value - from;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + diff * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{prefix}{Math.round(display).toLocaleString()}{suffix}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { to: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn('mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink">
            <Icon name="ArrowLeft" size={14} /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-[38px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, description, action, className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button, input, textarea')?.focus();
    }, 60);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(timer);
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            ref={panelRef}
            className="modal-panel"
            style={wide ? { maxWidth: 760 } : undefined}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Dialog'}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
              <div>
                {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
                {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
              </div>
              <button onClick={onClose} className="btn btn-icon shrink-0" aria-label="Close dialog"><Icon name="X" size={18} /></button>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line p-5 sm:p-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full border transition-colors', checked ? 'border-transparent bg-acid' : 'border-line bg-surface-3')}
      style={{ background: checked ? 'var(--acid)' : 'var(--surface-3)' }}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} style={{ background: checked ? '#0b1607' : 'var(--muted)' }} />
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className }: { options: { value: T; label: string; icon?: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('scroll-x rounded-xl border border-line bg-surface p-1', className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors', value === o.value ? 'bg-surface-3 text-ink shadow-sm' : 'text-muted hover:text-ink')}
          style={value === o.value ? { background: 'var(--surface-3)', color: 'var(--text)' } : undefined}
        >
          {o.icon && <Icon name={o.icon} size={13} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon = 'Compass', title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted"><Icon name={icon} size={22} /></div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TopicPill({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span className={cn('chip', className)} style={{ borderColor: `${color}33`, background: `${color}14`, color }}>
      <span className="topic-dot" style={{ background: color }} /> {name}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-3', className)} />;
}

export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-muted" tabIndex={0} aria-label={text}>?</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-line bg-surface-3 p-2.5 text-[11px] font-normal leading-relaxed text-muted opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{text}</span>
    </span>
  );
}

export function Avatar({ name, color = 'var(--acid)', size = 34 }: { name: string; color?: string; size?: number }) {
  const initials = useMemo(() => name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(), [name]);
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold" style={{ width: size, height: size, background: `${color}22`, color, border: `1px solid ${color}44`, fontSize: size * 0.34 }}>
      {initials}
    </span>
  );
}