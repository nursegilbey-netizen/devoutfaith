import { useMemo, useState } from 'react';
import type { Perspective, Question } from '../content/types';
import { LENSES } from '../content/types';
import { formatRef } from '../bible/reference';
import { shuffle } from '../study/text';
import { useStudy } from '../study/store';
import { RefButton } from './Scripture';
import { Badge, Button, cx, Prose } from './ui';

/** Multiple choice with a rationale for every choice and linked evidence. */
export function MCQuestion({ q, onAnswer }: { q: Extract<Question, { kind: 'mc' }>; onAnswer?: (correct: boolean) => void }) {
  const options = useMemo(() => shuffle(q.options, q.id), [q.id]);
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 font-semibold leading-snug"><Prose text={q.stem} /></p>
      <div className="space-y-2">
        {options.map((o, i) => {
          const state = !answered ? 'idle' : o.correct ? 'ok' : picked === i ? 'bad' : 'dim';
          return (
            <div key={i}>
              <button disabled={answered} onClick={() => { setPicked(i); onAnswer?.(!!o.correct); }}
                className={cx('w-full rounded-xl border px-3 py-2.5 text-left text-[0.95rem] transition',
                  state === 'idle' && 'border-line hover:border-accent/50 hover:bg-sunk',
                  state === 'ok' && 'border-ok bg-ok-soft',
                  state === 'bad' && 'border-bad bg-bad-soft',
                  state === 'dim' && 'border-line opacity-70')}>
                <Prose text={o.text} />
              </button>
              {answered && (o.correct || picked === i) && (
                <p className={cx('mt-1 px-2 text-sm', o.correct ? 'text-ok' : 'text-bad')}>
                  <b>{o.correct ? 'Correct. ' : 'Not quite. '}</b><span className="text-ink/85"><Prose text={o.rationale} /></span>
                </p>
              )}
            </div>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-2 text-sm">
          <span className="text-muted">Evidence:</span>
          {q.evidence.map((r) => <RefButton key={r} refStr={r} />)}
        </div>
      )}
    </div>
  );
}

/** Short answer: learner writes, then compares with a sample and a self-check list. Not auto-graded. */
export function ShortQuestion({ q, storageKey, onDone }: { q: Extract<Question, { kind: 'short' }>; storageKey: string; onDone?: (selfScore: number) => void }) {
  const saved = useStudy((s) => s.reflections[storageKey] ?? '');
  const save = useStudy((s) => s.saveReflection);
  const [text, setText] = useState(saved);
  const [shown, setShown] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(q.checklist.map(() => false));
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-1 flex items-center gap-2"><Badge>Short answer</Badge></div>
      <p className="mb-3 font-semibold leading-snug"><Prose text={q.stem} /></p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => save(storageKey, text)} rows={4}
        className="w-full rounded-xl border border-line bg-paper p-3 text-[0.95rem] outline-none focus:border-accent" placeholder="Write your answer…" />
      {!shown ? (
        <Button variant="secondary" className="mt-2 w-full" onClick={() => { save(storageKey, text); setShown(true); }} disabled={text.trim().length < 10}>
          Compare with sample reasoning
        </Button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-sunk p-3 text-sm">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Sample reasoning</p>
            <Prose text={q.sample} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Did your answer…</p>
            {q.checklist.map((c, i) => (
              <label key={i} className="flex items-start gap-2 py-1 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={checks[i]}
                  onChange={() => { const n = checks.slice(); n[i] = !n[i]; setChecks(n); onDone?.(n.filter(Boolean).length / n.length); }} />
                {c}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Evidence:</span>
            {q.evidence.map((r) => <RefButton key={r} refStr={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/** Match passages to the argument each makes (cross-reference reasoning). */
export function MatchExercise({ prompt, pairs, seed, onScore }: { prompt: string; pairs: { ref: string; argument: string }[]; seed: string; onScore?: (score: number) => void }) {
  const args = useMemo(() => shuffle(pairs.map((p, i) => ({ text: p.argument, i })), seed), [seed]);
  const [sel, setSel] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const score = pairs.filter((_, i) => sel[i] === i).length / pairs.length;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 font-semibold">{prompt}</p>
      <div className="space-y-3">
        {pairs.map((p, i) => (
          <div key={i}>
            <p className="mb-1 font-serif font-semibold">{formatRef(p.ref)}</p>
            <select value={sel[i] ?? -1} disabled={checked}
              onChange={(e) => setSel({ ...sel, [i]: Number(e.target.value) })}
              className={cx('min-h-12 w-full rounded-xl border px-2 text-sm', !checked ? 'border-line bg-paper' : sel[i] === i ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft')}>
              <option value={-1}>Choose…</option>
              {args.map((a) => <option key={a.i} value={a.i}>{a.text}</option>)}
            </select>
            {checked && sel[i] !== i && <p className="mt-1 text-xs text-ok">Answer: {p.argument}</p>}
          </div>
        ))}
      </div>
      {!checked ? (
        <Button className="mt-3 w-full" disabled={Object.keys(sel).length < pairs.length} onClick={() => { setChecked(true); onScore?.(score); }}>Check matches</Button>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <Badge tone={score === 1 ? 'ok' : 'gold'}>{Math.round(score * pairs.length)}/{pairs.length} correct</Badge>
          <Button small variant="ghost" onClick={() => { setChecked(false); setSel({}); }}>Try again</Button>
        </div>
      )}
    </div>
  );
}

/** Labeled interpretive perspectives; the user's study lens is highlighted, never hides other views. */
export function Perspectives({ items }: { items: Perspective[] }) {
  const lens = useStudy((s) => s.settings.lens);
  const sorted = [...items].sort((a, b) => Number(b.lens === lens && lens !== 'broad') - Number(a.lens === lens && lens !== 'broad'));
  return (
    <div className="space-y-2">
      {sorted.map((p, i) => {
        const mine = lens !== 'broad' && p.lens === lens;
        return (
          <div key={i} className={cx('rounded-xl border p-3', mine ? 'border-interp bg-interp-soft' : 'border-line bg-surface')}>
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge tone="interp">Interpretation</Badge>
              <span className="text-sm font-semibold">{p.tradition}</span>
              {mine && <Badge tone="gold">Your lens · {LENSES.find((l) => l.id === lens)?.label}</Badge>}
            </div>
            <p className="text-sm leading-relaxed">{p.summary}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-sm">
              {p.refs.map((r) => <RefButton key={r} refStr={r} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
