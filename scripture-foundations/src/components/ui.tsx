import { Fragment, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentTranslation } from '../bible/bible';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Header({ title, subtitle, back, right, children }: { title: string; subtitle?: string; back?: boolean | string; right?: ReactNode; children?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 pb-3 pt-2">
        {back && (
          <button
            aria-label="Back"
            onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}
            className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-sunk"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </header>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx('rise mx-auto max-w-2xl px-4 pb-28 pt-4', className)}>{children}</main>;
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={cx('block w-full rounded-2xl border border-line bg-surface p-4 text-left', onClick && 'transition active:scale-[0.99] hover:border-muted/40', className)}>
      {children}
    </Tag>
  );
}

export function Button({
  children, onClick, variant = 'primary', disabled, className, type = 'button', small,
}: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; disabled?: boolean; className?: string; type?: 'button' | 'submit'; small?: boolean }) {
  const v = {
    primary: 'bg-accent text-surface dark:text-paper hover:opacity-90',
    secondary: 'bg-sunk text-ink hover:bg-line',
    ghost: 'text-accent hover:bg-accent-soft',
    danger: 'bg-bad-soft text-bad hover:opacity-90',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={cx('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-40', small ? 'min-h-9 px-3 text-sm' : 'min-h-12 px-5', v, className)}>
      {children}
    </button>
  );
}

export function Chip({ children, active, onClick, color }: { children: ReactNode; active?: boolean; onClick?: () => void; color?: string }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      style={active && color ? { background: color, borderColor: color } : undefined}
      className={cx('min-h-9 shrink-0 rounded-full border px-3 text-sm font-medium transition', active ? 'border-accent bg-accent text-surface dark:text-paper' : 'border-line bg-surface text-ink hover:bg-sunk')}>
      {children}
    </button>
  );
}

type Tone = 'scripture' | 'interp' | 'draft' | 'ok' | 'bad' | 'neutral' | 'gold';
export function Badge({ children, tone = 'neutral', title }: { children: ReactNode; tone?: Tone; title?: string }) {
  const t: Record<Tone, string> = {
    scripture: 'bg-accent-soft text-accent',
    interp: 'bg-interp-soft text-interp',
    draft: 'border border-dashed border-gold/60 text-gold',
    ok: 'bg-ok-soft text-ok',
    bad: 'bg-bad-soft text-bad',
    neutral: 'bg-sunk text-muted',
    gold: 'bg-gold/15 text-gold',
  };
  return <span title={title} className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide', t[tone])}>{children}</span>;
}

export function Meter({ value, label, color = 'var(--accent)', compact }: { value: number | null; label?: string; color?: string; compact?: boolean }) {
  const pct = value === null ? 0 : Math.round(value * 100);
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="font-semibold tabular-nums">{value === null ? '—' : `${pct}%`}</span>
        </div>
      )}
      <div className={cx('overflow-hidden rounded-full bg-sunk', compact ? 'h-1.5' : 'h-2')} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{children}</h2>
      {action}
    </div>
  );
}

/** Render editorial prose; «…» marks verified KJV wording and is set in the Scripture face. */
export function Prose({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(«[^»]+»)/g);
  const tag = currentTranslation().id !== 'KJV';
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith('«') ? <span key={i} className="kjv-q">“{p.slice(1, -1)}”{tag && <sup className="ml-0.5 font-sans text-[0.6em] font-bold not-italic text-gold">KJV</sup>}</span> : <Fragment key={i}>{p}</Fragment>,
      )}
    </span>
  );
}

export function Callout({ tone = 'interp', title, children }: { tone?: 'interp' | 'gold' | 'ok' | 'bad'; title: string; children: ReactNode }) {
  const t = { interp: 'border-interp/40 bg-interp-soft', gold: 'border-gold/40 bg-gold/10', ok: 'border-ok/40 bg-ok-soft', bad: 'border-bad/40 bg-bad-soft' }[tone];
  return (
    <div className={cx('rounded-xl border-l-4 p-3 text-sm', t)}>
      <p className="mb-1 font-semibold">{title}</p>
      <div className="text-ink/90">{children}</div>
    </div>
  );
}

export const pct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${Math.round(v * 100)}%`);
