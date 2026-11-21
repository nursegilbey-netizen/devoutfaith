import { useMemo, useState } from 'react';
import { textVerses as passageVerses } from '../bible/bible';
import { BOOKS, chapterCount, verseCount } from '../bible/books';
import { formatPassage, type Passage } from '../bible/reference';
import { alignWords, chunkVerses, hiddenPositions, shuffle, tokenize } from '../study/text';
import { gradeReference, type RefGrade } from '../study/refgrade';
import { todayKey } from '../study/store';
import { Badge, Button, Chip, cx, pct } from './ui';

/* ───────────────────────── Read & chunk ───────────────────────── */
export function ReadChunks({ passage }: { passage: Passage }) {
  const chunks = useMemo(() => chunkVerses(passageVerses(passage)), [passage.id]);
  return (
    <ol className="space-y-2">
      {chunks.map((c, i) => (
        <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface p-3">
          <span className="mt-1 w-8 shrink-0 text-right text-xs font-bold tabular-nums text-gold">v{c.verse}</span>
          <span className="scripture !text-base">{c.text}</span>
        </li>
      ))}
    </ol>
  );
}

/* ───────────────────────── Progressive hide ───────────────────────── */
const LEVELS = [0, 25, 50, 75, 100];
export function ProgressiveHide({ passage, sessionSeed }: { passage: Passage; sessionSeed?: string }) {
  const [level, setLevel] = useState(25);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const verses = passageVerses(passage);
  const words = useMemo(() => verses.flatMap((v) => tokenize(v.text).map((w, i) => ({ w, verse: v.verse, first: i === 0 }))), [passage.id]);
  const seed = `${passage.id}|${sessionSeed ?? todayKey()}`;
  const hidden = useMemo(() => hiddenPositions(words.length, level, seed), [words.length, level, seed]);
  const toggle = (i: number) => setRevealed((r) => { const n = new Set(r); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="Words hidden">
        {LEVELS.map((l) => (
          <Chip key={l} active={l === level} onClick={() => { setLevel(l); setRevealed(new Set()); }}>{l}%</Chip>
        ))}
      </div>
      <p className="scripture rounded-2xl border border-line bg-surface p-4">
        {words.map(({ w, verse, first }, i) => {
          const isHidden = hidden.has(i) && !revealed.has(i);
          return (
            <span key={i}>
              {first && <sup>{verse}</sup>}
              {hidden.has(i) ? (
                <button onClick={() => toggle(i)} aria-label={isHidden ? 'Reveal word' : `Hide ${w}`}
                  className={cx('rounded px-0.5 align-baseline', isHidden ? 'bg-sunk text-transparent' : 'bg-gold/15 text-ink')}>
                  {isHidden ? w.replace(/[A-Za-z’']/g, '·') : w}
                </button>
              ) : w}{' '}
            </span>
          );
        })}
      </p>
      <p className="mt-2 text-xs text-muted">Tap a hidden word to peek. Positions stay the same all session and each level hides the previous level’s words plus more.</p>
    </div>
  );
}

/* ───────────────────────── Phrase ordering ───────────────────────── */
export function PhraseOrder({ passage, onDone }: { passage: Passage; onDone?: (firstTry: boolean) => void }) {
  const chunks = useMemo(() => chunkVerses(passageVerses(passage)).map((c, i) => ({ ...c, id: i })), [passage.id]);
  const [attempt, setAttempt] = useState(0);
  const pool = useMemo(() => shuffle(chunks, `${passage.id}|order|${attempt}`), [chunks, attempt]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const allPlaced = placed.length === chunks.length;
  const correct = allPlaced && placed.every((id, i) => id === i);

  const check = () => {
    setChecked(true);
    if (correct) onDone?.(mistakes === 0);
    else setMistakes((m) => m + 1);
  };
  const reset = () => { setPlaced([]); setChecked(false); setAttempt((a) => a + 1); };

  return (
    <div>
      <div className="min-h-24 space-y-1.5 rounded-2xl border-2 border-dashed border-line p-2" aria-label="Your order">
        {placed.length === 0 && <p className="p-3 text-center text-sm text-muted">Tap phrases below in the original order.</p>}
        {placed.map((id, i) => {
          const c = chunks[id];
          const state = checked ? (id === i ? 'ok' : 'bad') : 'idle';
          return (
            <button key={id} onClick={() => { if (!checked) setPlaced(placed.filter((x) => x !== id)); }}
              className={cx('block w-full rounded-lg px-3 py-2 text-left font-serif text-[0.98rem]',
                state === 'ok' ? 'bg-ok-soft' : state === 'bad' ? 'bg-bad-soft' : 'bg-sunk')}>
              <span className="mr-2 text-xs font-bold text-muted">{i + 1}</span>{c.text}
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5">
        {pool.filter((c) => !placed.includes(c.id)).map((c) => (
          <button key={c.id} onClick={() => { setChecked(false); setPlaced([...placed, c.id]); }}
            className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-left font-serif text-[0.98rem] hover:border-accent/50">
            {c.text}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={check} disabled={!allPlaced} className="flex-1">Check order</Button>
        <Button variant="secondary" onClick={reset}>Reset</Button>
      </div>
      {checked && (
        <p className={cx('mt-2 text-sm font-semibold', correct ? 'text-ok' : 'text-bad')}>
          {correct ? (mistakes === 0 ? 'Perfect on the first try.' : 'Correct order.') : 'Some phrases are out of place (red). Tap them to remove and try again.'}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────── Typed recall ───────────────────────── */
export function TypedRecall({ passage, onResult, hideReference }: { passage: Passage; onResult?: (accuracy: number, whole: boolean) => void; hideReference?: boolean }) {
  const verses = passageVerses(passage);
  const [section, setSection] = useState<'all' | number>('all');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<ReturnType<typeof alignWords> | null>(null);
  const expected = section === 'all' ? verses.map((v) => v.text).join(' ') : verses[section].text;

  const check = () => {
    const r = alignWords(expected, typed);
    setResult(r);
    onResult?.(r.accuracy, section === 'all');
  };

  return (
    <div>
      {!hideReference && <p className="mb-2 font-serif text-lg font-semibold">{formatPassage(passage)}</p>}
      {verses.length > 3 && (
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={section === 'all'} onClick={() => { setSection('all'); setResult(null); setTyped(''); }}>Whole passage</Chip>
          {verses.map((v, i) => (
            <Chip key={i} active={section === i} onClick={() => { setSection(i); setResult(null); setTyped(''); }}>v{v.verse}</Chip>
          ))}
        </div>
      )}
      <textarea value={typed} onChange={(e) => { setTyped(e.target.value); setResult(null); }} rows={6}
        autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Type the passage from memory"
        placeholder="Type the passage from memory…"
        className="w-full rounded-xl border border-line bg-surface p-3 font-serif text-base leading-relaxed outline-none focus:border-accent" />
      <div className="mt-2 flex gap-2">
        <Button onClick={check} disabled={!typed.trim()} className="flex-1">Check</Button>
        {result && <Button variant="secondary" onClick={() => { setTyped(''); setResult(null); }}>Retry</Button>}
      </div>
      {result && (
        <div className="mt-3 rounded-xl border border-line bg-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{result.matches}/{result.total} words</span>
            <Badge tone={result.accuracy >= 0.85 ? 'ok' : result.accuracy >= 0.6 ? 'gold' : 'bad'}>{pct(result.accuracy)} accuracy</Badge>
          </div>
          <p className="font-serif leading-loose">
            {result.ops.map((o, i) => {
              if (o.op === 'match') return <span key={i}>{o.expected} </span>;
              if (o.op === 'wrong') return <span key={i}><s className="text-bad/80">{o.typed}</s> <span className="rounded bg-ok-soft px-0.5 text-ok">{o.expected}</span> </span>;
              if (o.op === 'missing') return <span key={i} className="rounded border border-dashed border-ok px-0.5 text-ok" title="Missing word">{o.expected} </span>;
              return <s key={i} className="text-bad/80" title="Extra word">{o.typed} </s>;
            })}
          </p>
          <p className="mt-2 text-xs text-muted">
            <span className="rounded bg-ok-soft px-1 text-ok">green</span> correct word ·{' '}
            <span className="rounded border border-dashed border-ok px-1 text-ok">dashed</span> missing ·{' '}
            <s>struck</s> extra or wrong. Case and punctuation are ignored.
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Reference recall ───────────────────────── */
export function RefRecall({ passage, onResult, prompt }: { passage: Passage; onResult?: (g: RefGrade) => void; prompt?: React.ReactNode }) {
  const [book, setBook] = useState<number>(-1);
  const [chapter, setChapter] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [grade, setGrade] = useState<RefGrade | null>(null);
  const verses = passageVerses(passage);
  const preview = verses.slice(0, 2).map((v) => v.text).join(' ') + (verses.length > 2 ? ' …' : '');

  const check = () => {
    const s = Number(start);
    const g = gradeReference({ book, chapter: Number(chapter), start: s, end: end ? Number(end) : s }, passage);
    setGrade(g);
    onResult?.(g);
  };
  const mark = (ok: boolean | undefined) => (grade ? (ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft') : 'border-line bg-surface');
  const input = 'h-12 rounded-xl border px-3 text-base outline-none focus:border-accent';
  const maxCh = book >= 0 ? chapterCount(book) : 150;
  const maxV = book >= 0 && Number(chapter) ? verseCount(book, Number(chapter)) : 176;

  return (
    <div>
      {prompt ?? <p className="scripture mb-3 rounded-2xl border border-line bg-surface p-4 !text-base">{preview}</p>}
      <label className="mb-1 block text-xs font-semibold text-muted">Book</label>
      <select value={book} onChange={(e) => { setBook(Number(e.target.value)); setGrade(null); }} className={cx(input, 'w-full', mark(grade?.book))}>
        <option value={-1}>Choose a book…</option>
        <optgroup label="Old Testament">{BOOKS.slice(0, 39).map((b) => <option key={b.index} value={b.index}>{b.name}</option>)}</optgroup>
        <optgroup label="New Testament">{BOOKS.slice(39).map((b) => <option key={b.index} value={b.index}>{b.name}</option>)}</optgroup>
      </select>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Chapter</label>
          <input inputMode="numeric" type="number" min={1} max={maxCh} value={chapter} onChange={(e) => { setChapter(e.target.value); setGrade(null); }} className={cx(input, 'w-full', mark(grade?.chapter))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">From verse</label>
          <input inputMode="numeric" type="number" min={1} max={maxV} value={start} onChange={(e) => { setStart(e.target.value); setGrade(null); }} className={cx(input, 'w-full', mark(grade?.verses))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">To verse</label>
          <input inputMode="numeric" type="number" min={1} max={maxV} value={end} placeholder={start} onChange={(e) => { setEnd(e.target.value); setGrade(null); }} className={cx(input, 'w-full', mark(grade?.verses))} />
        </div>
      </div>
      <Button onClick={check} disabled={book < 0 || !chapter || !start} className="mt-3 w-full">Check reference</Button>
      {grade && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge tone={grade.book ? 'ok' : 'bad'}>Book {grade.book ? '✓' : '✗'}</Badge>
          <Badge tone={grade.chapter ? 'ok' : 'bad'}>Chapter {grade.chapter ? '✓' : '✗'}</Badge>
          <Badge tone={grade.verses ? 'ok' : 'bad'}>Verses {grade.verses ? '✓' : '✗'}</Badge>
          {grade.score < 1 && <span className="text-muted">Answer: <b className="text-ink">{formatPassage(passage)}</b></span>}
        </div>
      )}
    </div>
  );
}
