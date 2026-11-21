import { BOOKS, bookDisplayName, matchBookPrefix, verseCount, chapterCount } from './books';

/** A contiguous run of verses inside one chapter. */
export interface Segment {
  book: number;
  chapter: number;
  start: number;
  end: number;
}

/** A canonical passage: one or more segments. Its id is stable and shared across categories. */
export interface Passage {
  id: string;
  segments: Segment[];
}

export class ReferenceError extends Error {}

const normalize = (s: string) =>
  s
    .replace(/\([^)]*\)/g, ' ') // strip editorial parentheticals
    .replace(/[‒-―−]/g, '-')
    .replace(/\s+and\s+/gi, '; ')
    .replace(/\s+/g, ' ')
    .trim();

/** Parse a conventional reference such as "Ephesians 2:8–10", "John 11:11–14, 25–26", "Genesis 15:6 and 22:1–18". */
export function parseReference(input: string): Passage {
  const s = normalize(input);
  const segments: Segment[] = [];
  let book = -1;
  let chapter = -1;

  for (const rawGroup of s.split(';')) {
    let group = rawGroup.trim();
    if (!group) continue;
    const bm = matchBookPrefix(group);
    if (bm) {
      book = bm[0];
      group = bm[1];
      chapter = -1;
    }
    if (book < 0) throw new ReferenceError(`No book in "${input}"`);
    if (!group) {
      throw new ReferenceError(`Missing chapter in "${input}"`);
    }
    // Single-chapter books (Obadiah, Philemon, 2–3 John, Jude): "Jude 3" means verse 3.
    if (chapterCount(book) === 1 && !group.includes(':')) group = group.replace(/^(\d+(?:-\d+)?)/, '1:$1');
    const parts = group.split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((part, i) => {
      const hasColon = part.includes(':');
      if (hasColon || i === 0) {
        // chapter-based: "3", "3:16", "3:16-18", "3:16-4:2", "3-4"
        let m = part.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
        if (m) {
          const [c1, v1, c2, v2] = m.slice(1).map(Number);
          for (let c = c1; c <= c2; c++) {
            segments.push({ book, chapter: c, start: c === c1 ? v1 : 1, end: c === c2 ? v2 : verseCount(book, c) });
          }
          chapter = c2;
          return;
        }
        m = part.match(/^(\d+):(\d+)(?:-(\d+))?$/);
        if (m) {
          chapter = Number(m[1]);
          const a = Number(m[2]);
          segments.push({ book, chapter, start: a, end: m[3] ? Number(m[3]) : a });
          return;
        }
        m = part.match(/^(\d+)(?:-(\d+))?$/);
        if (m && (!hasColon && (i === 0 || chapter < 0))) {
          const c1 = Number(m[1]);
          const c2 = m[2] ? Number(m[2]) : c1;
          for (let c = c1; c <= c2; c++) segments.push({ book, chapter: c, start: 1, end: verseCount(book, c) });
          chapter = c2;
          return;
        }
        throw new ReferenceError(`Cannot read "${part}" in "${input}"`);
      }
      // verse-only continuation in current chapter: "25-26" or "26"
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m || chapter < 0) throw new ReferenceError(`Cannot read "${part}" in "${input}"`);
      segments.push({ book, chapter, start: Number(m[1]), end: m[2] ? Number(m[2]) : Number(m[1]) });
    });
  }
  if (!segments.length) throw new ReferenceError(`Empty reference "${input}"`);
  return { id: passageId(segments), segments };
}

export function tryParseReference(input: string): Passage | null {
  try {
    const p = parseReference(input);
    return validatePassage(p).length ? null : p;
  } catch {
    return null;
  }
}

/** Return a list of problems (empty = valid against the verified KJV verse counts). */
export function validatePassage(p: Passage): string[] {
  const errs: string[] = [];
  for (const s of p.segments) {
    if (s.book < 0 || s.book >= BOOKS.length) errs.push(`bad book ${s.book}`);
    else if (s.chapter < 1 || s.chapter > chapterCount(s.book)) errs.push(`${BOOKS[s.book].name} has no chapter ${s.chapter}`);
    else {
      const max = verseCount(s.book, s.chapter);
      if (s.start < 1 || s.end > max || s.start > s.end)
        errs.push(`${BOOKS[s.book].name} ${s.chapter} has verses 1–${max}; got ${s.start}–${s.end}`);
    }
  }
  return errs;
}

export function passageId(segments: Segment[]): string {
  return segments
    .map((s) => `${BOOKS[s.book].code}.${s.chapter}.${s.start}${s.end !== s.start ? '-' + s.end : ''}`)
    .join('+');
}

export function passageFromId(id: string): Passage {
  const segments = id.split('+').map((part) => {
    const [code, c, v] = part.split('.');
    const book = BOOKS.findIndex((b) => b.code === code);
    const [a, b] = v.split('-').map(Number);
    return { book, chapter: Number(c), start: a, end: b ?? a };
  });
  return { id, segments };
}

/** Standard display: "Ephesians 2:8–10", "John 11:11–14, 25–26", "Genesis 15:6; 22:1–18". */
export function formatPassage(p: Passage | Segment[]): string {
  const segs = Array.isArray(p) ? p : p.segments;
  let out = '';
  let prevBook = -1;
  let prevChapter = -1;
  const multiChapterSameBook = (b: number) => new Set(segs.filter((s) => s.book === b).map((s) => s.chapter)).size > 1;
  segs.forEach((s, i) => {
    const range = s.end !== s.start ? `${s.start}–${s.end}` : `${s.start}`;
    if (s.book !== prevBook) {
      if (i) out += '; ';
      out += `${bookDisplayName(s.book, !multiChapterSameBook(s.book))} ${s.chapter}:${range}`;
    } else if (s.chapter !== prevChapter) {
      out += `; ${s.chapter}:${range}`;
    } else {
      out += `, ${range}`;
    }
    prevBook = s.book;
    prevChapter = s.chapter;
  });
  return out;
}

export const formatRef = (ref: string) => formatPassage(parseReference(ref));

export function verseTotal(p: Passage) {
  return p.segments.reduce((n, s) => n + s.end - s.start + 1, 0);
}

/** True if any verse of b lies in a. */
export function overlaps(a: Passage, b: Passage) {
  return a.segments.some((x) =>
    b.segments.some((y) => x.book === y.book && x.chapter === y.chapter && x.start <= y.end && y.start <= x.end),
  );
}
