import { BOOKS } from './books';
import type { Passage, Segment } from './reference';
import kjvManifest from './kjv-manifest.json';
import bsbManifest from './bsb-manifest.json';

/** Runtime format written by the importers: b[book][chapter-1][verse-1] = text ('' = verse omitted in this translation). */
export interface BibleData {
  v: string;
  b: string[][][];
}

export interface Verse {
  book: number;
  chapter: number;
  verse: number;
  text: string;
  /** True when this translation leaves the verse out (e.g. BSB Acts 8:37). */
  omitted?: boolean;
}

export type TranslationId = 'KJV' | 'BSB';

export interface TranslationInfo {
  id: TranslationId;
  abbreviation: string;
  name: string;
  license: string;
  file: string;
  description: string;
  manifest: typeof kjvManifest | typeof bsbManifest;
}

export const TRANSLATIONS: Record<TranslationId, TranslationInfo> = {
  KJV: {
    id: 'KJV', abbreviation: 'KJV', name: kjvManifest.name, license: kjvManifest.license, file: 'kjv.json', manifest: kjvManifest,
    description: 'Classic 1611/1769 English. The wording quoted in lesson questions.',
  },
  BSB: {
    id: 'BSB', abbreviation: 'BSB', name: bsbManifest.name, license: bsbManifest.license, file: 'bsb.json', manifest: bsbManifest,
    description: 'Modern English (2020s), translated from the earliest manuscripts.',
  },
};

const cache: Partial<Record<TranslationId, BibleData>> = {};
const loading: Partial<Record<TranslationId, Promise<BibleData>>> = {};
let current: TranslationId = 'KJV';

export const currentTranslation = () => TRANSLATIONS[current];

/** Used by tests and by the loader. */
export function setBibleData(d: BibleData, id: TranslationId = (d.v as TranslationId) ?? 'KJV') {
  cache[id] = d;
  current = id;
}

export function loadBible(id: TranslationId = current): Promise<BibleData> {
  if (cache[id]) { current = id; return Promise.resolve(cache[id]!); }
  if (!loading[id]) {
    loading[id] = fetch(`${import.meta.env?.BASE_URL ?? './'}data/${TRANSLATIONS[id].file}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load Scripture data (${r.status})`);
        return r.json();
      })
      .then((d: BibleData) => { cache[id] = d; return d; })
      .catch((e) => { delete loading[id]; throw e; });
  }
  return loading[id]!.then((d) => { current = id; return d; });
}

function need(): BibleData {
  const d = cache[current];
  if (!d) throw new Error('Bible not loaded');
  return d;
}

export function segmentVerses(s: Segment): Verse[] {
  const ch = need().b[s.book]?.[s.chapter - 1] ?? [];
  const out: Verse[] = [];
  for (let v = s.start; v <= s.end; v++) {
    const t = ch[v - 1];
    if (t !== undefined) out.push({ book: s.book, chapter: s.chapter, verse: v, text: t, omitted: t === '' || undefined });
  }
  return out;
}

/** All verses in the passage, including any this translation omits (flagged). Use for display. */
export const passageVerses = (p: Passage): Verse[] => p.segments.flatMap(segmentVerses);

/** Only verses that have text in the current translation. Use for memorization and grading. */
export const textVerses = (p: Passage): Verse[] => passageVerses(p).filter((v) => !v.omitted);

export const passageText = (p: Passage) => textVerses(p).map((v) => v.text).join(' ');

export function chapterVerses(book: number, chapter: number): Verse[] {
  const ch = need().b[book]?.[chapter - 1] ?? [];
  return ch.map((text, i) => ({ book, chapter, verse: i + 1, text, omitted: text === '' || undefined }));
}

export function searchText(query: string, limit = 60, testament?: 'OT' | 'NT'): Verse[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const out: Verse[] = [];
  const d = need();
  for (let b = 0; b < d.b.length && out.length < limit; b++) {
    if (testament && BOOKS[b].testament !== testament) continue;
    const book = d.b[b];
    for (let c = 0; c < book.length && out.length < limit; c++) {
      for (let v = 0; v < book[c].length && out.length < limit; v++) {
        const t = book[c][v].toLowerCase();
        if (t && words.every((w) => t.includes(w))) out.push({ book: b, chapter: c + 1, verse: v + 1, text: book[c][v] });
      }
    }
  }
  return out;
}

export const OMITTED_NOTE = 'Not included in this translation — absent from the earliest manuscripts. Switch to the KJV in Settings to read it.';
