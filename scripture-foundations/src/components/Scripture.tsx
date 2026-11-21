import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentTranslation, OMITTED_NOTE, passageVerses } from '../bible/bible';
import { formatPassage, parseReference, type Passage } from '../bible/reference';
import { useStudy } from '../study/store';
import { Badge, cx } from './ui';
import { REL_LABELS, type CrossRef, type RelType } from '../content/types';

export function VerseBlock({ passage, className, compact }: { passage: Passage; className?: string; compact?: boolean }) {
  const showNums = useStudy((s) => s.settings.showVerseNumbers);
  const verses = passageVerses(passage);
  let lastChapter = -1;
  return (
    <p className={cx('scripture', compact && '!text-base !leading-relaxed', className)}>
      {verses.map((v, i) => {
        const showChapter = passage.segments.length > 1 && v.chapter !== lastChapter;
        lastChapter = v.chapter;
        const gap = i > 0 && verses[i - 1].verse + 1 !== v.verse;
        return (
          <span key={`${v.chapter}:${v.verse}`}>
            {gap && <span className="text-muted"> … </span>}
            {showNums && <sup>{showChapter ? `${v.chapter}:${v.verse}` : v.verse}</sup>}
            {v.omitted ? <span className="font-sans text-sm italic text-muted" title={OMITTED_NOTE}>[verse {v.verse} not in the {currentTranslation().abbreviation}] </span> : <>{v.text}{' '}</>}
          </span>
        );
      })}
    </p>
  );
}

/** Canonical passage display: reference + translation + verse-labelled text. */
export function PassageCard({ ref_, passage, children, onOpen }: { ref_?: string; passage?: Passage; children?: React.ReactNode; onOpen?: boolean }) {
  const p = passage ?? parseReference(ref_!);
  const nav = useNavigate();
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex-1 font-serif text-lg font-semibold">{formatPassage(p)}</h3>
        <Badge tone="scripture" title={currentTranslation().name}>{currentTranslation().abbreviation}</Badge>
      </div>
      <VerseBlock passage={p} />
      {children}
      {onOpen !== false && (
        <button onClick={() => nav(`/passage/${encodeURIComponent(p.id)}`)} className="mt-2 text-sm font-semibold text-accent">
          Open in chapter context →
        </button>
      )}
    </div>
  );
}

export function RefButton({ refStr, passage, className }: { refStr?: string; passage?: Passage; className?: string }) {
  const nav = useNavigate();
  const p = passage ?? parseReference(refStr!);
  return (
    <button onClick={() => nav(`/passage/${encodeURIComponent(p.id)}`)} className={cx('font-semibold text-accent underline decoration-accent/30 underline-offset-2', className)}>
      {formatPassage(p)}
    </button>
  );
}

export const REL_TONE: Record<RelType, string> = {
  quotation: '#8a2c20', parallel: '#2f6b5a', allusion: '#6b4a8a', background: '#6d6556',
  fulfillment: '#a8741a', support: '#3d5f8f', tension: '#b0442f', alternate: '#4b5b8a',
};

export function RelBadge({ type }: { type: RelType }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide"
      style={{ color: REL_TONE[type], background: `color-mix(in srgb, ${REL_TONE[type]} 13%, transparent)` }}>
      {REL_LABELS[type]}
    </span>
  );
}

/** One cross-reference: typed relationship, label, explanation, and the actual cited verses on demand. */
export function CrossRefItem({ x, defaultOpen, direction }: { x: CrossRef; defaultOpen?: boolean; direction?: 'in' | 'out' }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const p = parseReference(x.ref);
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <RefButton passage={p} />
        <span className="text-sm text-muted">— {x.label}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <RelBadge type={x.type} />
        {x.challenge && <Badge tone="bad">Challenge text</Badge>}
        {x.tradition && <Badge tone="interp">{x.tradition}</Badge>}
        {direction === 'in' && <Badge>Linked from</Badge>}
        {x.status !== 'reviewed' && <Badge tone="draft" title="Editorial link awaiting human review">Draft</Badge>}
      </div>
      {x.note && <p className="mt-2 text-sm leading-relaxed text-ink/85">{x.note}</p>}
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-2 text-sm font-semibold text-accent">
        {open ? 'Hide verses' : 'Show verses'}
      </button>
      {open && <VerseBlock passage={p} compact className="mt-2 border-t border-line pt-2" />}
    </div>
  );
}
