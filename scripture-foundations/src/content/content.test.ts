/**
 * Content validation & acceptance tests (spec §9, §10).
 * Run: npm test
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { setBibleData, passageText, passageVerses, textVerses, type BibleData } from '../bible/bible';
import bsbManifest from '../bible/bsb-manifest.json';
import { formatPassage, parseReference, validatePassage } from '../bible/reference';
import manifest from '../bible/kjv-manifest.json';
import { CATEGORIES, TOPICS, LESSONS, DOCTRINES, allQuestions, linksFor, memorizationPassages, resolveLesson, lessonKeyForTopic } from './index';
import { alignWords, chunkVerses, hiddenPositions, normWord } from '../study/text';
import { gradeReference } from '../study/refgrade';
import { newCard, rateCard, Rating } from '../study/scheduler';
import { REL_LABELS } from './types';

const raw = readFileSync(resolve(__dirname, '../../public/data/kjv.json'));
const bible: BibleData = JSON.parse(raw.toString());
beforeAll(() => setBibleData(bible, 'KJV'));

/** Collect every reference string used anywhere in the content. */
function allRefs(): { ref: string; where: string }[] {
  const out: { ref: string; where: string }[] = [];
  for (const t of TOPICS) {
    t.memorize.forEach((r) => out.push({ ref: r, where: `topic ${t.id} memorize` }));
    t.crossRefs.forEach((x) => out.push({ ref: x.ref, where: `topic ${t.id} xref` }));
  }
  for (const l of LESSONS) {
    l.memorize.forEach((r) => out.push({ ref: r, where: `${l.id} memorize` }));
    l.context.sequence.forEach((s) => out.push({ ref: s.ref, where: `${l.id} context` }));
    l.connect.sequence.forEach((s) => out.push({ ref: s.ref, where: `${l.id} connect` }));
    l.connect.match?.pairs.forEach((s) => out.push({ ref: s.ref, where: `${l.id} match` }));
    l.synthesis.perspectives.forEach((p) => p.refs.forEach((r) => out.push({ ref: r, where: `${l.id} perspective` })));
    [l.contextQuestion, ...l.questions].forEach((q) => q.evidence.forEach((r) => out.push({ ref: r, where: `${l.id} ${q.id}` })));
  }
  for (const d of DOCTRINES) {
    d.explicit.forEach((e) => out.push({ ref: e.ref, where: `${d.id} explicit` }));
    d.inferred.forEach((e) => e.refs.forEach((r) => out.push({ ref: r, where: `${d.id} inferred` })));
    d.disputed.forEach((x) => x.perspectives.forEach((p) => p.refs.forEach((r) => out.push({ ref: r, where: `${d.id} disputed` }))));
    d.challenges.forEach((c) => out.push({ ref: c.ref, where: `${d.id} challenge` }));
  }
  return out;
}

describe('Verified KJV dataset', () => {
  it('matches the manifest checksum and counts', () => {
    expect(createHash('sha256').update(raw).digest('hex')).toBe(manifest.outputSha256);
    expect(bible.b.length).toBe(66);
    expect(bible.b.reduce((n, b) => n + b.length, 0)).toBe(1189);
    expect(bible.b.flat().flat().length).toBe(31102);
  });
});

describe('References', () => {
  it('parses conventional forms and formats them back', () => {
    expect(formatPassage(parseReference('Ephesians 2:8–10'))).toBe('Ephesians 2:8–10');
    expect(formatPassage(parseReference('John 11:11–14, 25–26'))).toBe('John 11:11–14, 25–26');
    expect(formatPassage(parseReference('Genesis 15:6 and 22:1–18'))).toBe('Genesis 15:6; 22:1–18');
    expect(formatPassage(parseReference('Psalm 23:1–6'))).toBe('Psalm 23:1–6');
    expect(formatPassage(parseReference('1 Jn 1:9'))).toBe('1 John 1:9');
    expect(formatPassage(parseReference('Exodus 20:1–17 (selected sections or full passage)'))).toBe('Exodus 20:1–17');
    expect(formatPassage(parseReference('Jude 3'))).toBe('Jude 1:3');
  });

  it('every reference in the curriculum exists in the verified KJV', () => {
    const bad = allRefs()
      .map((r) => {
        try {
          const errs = validatePassage(parseReference(r.ref));
          return errs.length ? `${r.where}: ${r.ref} → ${errs.join(', ')}` : null;
        } catch (e) {
          return `${r.where}: ${r.ref} → ${(e as Error).message}`;
        }
      })
      .filter(Boolean);
    expect(bad).toEqual([]);
  });

  it('every passage resolves to non-empty verse text', () => {
    for (const r of allRefs()) expect(passageVerses(parseReference(r.ref)).length, r.ref).toBeGreaterThan(0);
  });
});

describe('Content integrity', () => {
  it('has seven categories and every topic belongs to one', () => {
    expect(CATEGORIES).toHaveLength(7);
    for (const t of TOPICS) expect(CATEGORIES.some((c) => c.id === t.categoryId)).toBe(true);
  });

  it('every cross-reference has a typed relationship', () => {
    for (const t of TOPICS) for (const x of t.crossRefs) expect(REL_LABELS[x.type], `${t.id} ${x.ref}`).toBeTruthy();
    for (const l of LESSONS) for (const x of l.connect.sequence) {
      expect(REL_LABELS[x.type]).toBeTruthy();
      expect(x.note && x.note.length > 20, `${l.id} ${x.ref} needs an explanation`).toBe(true);
    }
  });

  it('includes the three MVP lessons', () => {
    const memo = LESSONS.flatMap((l) => l.memorize.map((r) => parseReference(r).id));
    expect(memo).toContain(parseReference('Ephesians 2:8–10').id);
    expect(memo).toContain(parseReference('Matthew 22:37–40').id);
    expect(memo).toContain(parseReference('Matthew 28:19').id);
    expect(memo).toContain(parseReference('John 1:1–14').id);
  });

  it('every comprehension question has exactly one keyed answer, a rationale per choice, and evidence', () => {
    for (const q of allQuestions()) {
      expect(q.evidence.length, q.id).toBeGreaterThan(0);
      if (q.kind === 'mc') {
        expect(q.options.filter((o) => o.correct).length, q.id).toBe(1);
        for (const o of q.options) expect(o.rationale.length, `${q.id}: ${o.text}`).toBeGreaterThan(10);
      }
    }
  });

  it('every KJV phrase quoted in editorial prose («…») is real KJV wording', () => {
    const corpus = ' ' + bible.b.flat().flat().map((t) => t.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ')).join(' | ') + ' ';
    const prose = JSON.stringify([LESSONS, DOCTRINES, TOPICS]);
    const quotes = [...prose.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
    expect(quotes.length).toBeGreaterThan(10);
    const missing = quotes.filter((q) => {
      const n = q.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
      return !corpus.includes(` ${n} `) && !corpus.includes(` ${n}`);
    });
    expect(missing).toEqual([]);
  });

  it('every doctrine has explicit, inferred, disputed and challenge entries', () => {
    for (const d of DOCTRINES) {
      expect(d.explicit.length).toBeGreaterThan(0);
      expect(d.inferred.length).toBeGreaterThan(0);
      expect(d.disputed.length).toBeGreaterThan(0);
      expect(d.challenges.length, d.id).toBeGreaterThan(0);
    }
  });

  it('every topic opens a lesson', () => {
    for (const t of TOPICS) expect(resolveLesson(lessonKeyForTopic(t)), t.id).not.toBeNull();
  });
});

describe('Cross-reference engine', () => {
  it('links are bidirectional: a target sees the source', () => {
    const eph = parseReference('Ephesians 2:8–10');
    const james = parseReference('James 2:14–26');
    expect(linksFor(eph).some((l) => l.to.id === james.id && l.direction === 'out')).toBe(true);
    expect(linksFor(james).some((l) => l.from.id === eph.id && l.direction === 'in')).toBe(true);
  });
  it('cross-category reuse shares one canonical passage record', () => {
    const ids = memorizationPassages().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Ephesians 2:8–10 appears in topics 1.2, 3.3 (xref) and 7.2 but is one passage
    expect(ids.filter((i) => i === parseReference('Ephesians 2:8–10').id)).toHaveLength(1);
  });
});

describe('Memorization engine', () => {
  it('typed recall: perfect text scores 1, ignores case/punctuation', () => {
    const t = passageText(parseReference('John 11:35'));
    expect(alignWords(t, t.toUpperCase().replace(/[.,]/g, '')).accuracy).toBe(1);
  });
  it('typed recall detects omissions and insertions with a word diff', () => {
    const r = alignWords('For by grace are ye saved', 'For grace are ye truly saved');
    expect(r.ops.filter((o) => o.op === 'missing').map((o) => (o as any).expected)).toEqual(['by']);
    expect(r.ops.filter((o) => o.op === 'extra').map((o) => (o as any).typed)).toEqual(['truly']);
  });
  it('progressive hide is deterministic and nested', () => {
    const a = hiddenPositions(40, 25, 'seed');
    const b = hiddenPositions(40, 25, 'seed');
    const c = hiddenPositions(40, 50, 'seed');
    expect([...a]).toEqual([...b]);
    expect(a.size).toBe(10);
    for (const i of a) expect(c.has(i)).toBe(true);
  });
  it('chunks by clause and preserves every word', () => {
    const verses = passageVerses(parseReference('Ephesians 2:8–10'));
    const chunks = chunkVerses(verses);
    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks.map((c) => c.text).join(' ').split(/\s+/).map(normWord)).toEqual(verses.map((v) => v.text).join(' ').split(/\s+/).map(normWord));
  });
  it('reference recall grades book, chapter and verses separately', () => {
    const p = parseReference('Ephesians 2:8–10');
    expect(gradeReference({ book: p.segments[0].book, chapter: 2, start: 8, end: 10 }, p).score).toBe(1);
    const g = gradeReference({ book: p.segments[0].book, chapter: 2, start: 8, end: 9 }, p);
    expect([g.book, g.chapter, g.verses]).toEqual([true, true, false]);
  });
});

describe('Scheduling', () => {
  it('due dates change after ratings and Easy schedules further than Again', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const c = newCard(now);
    const again = rateCard(c, Rating.Again, now);
    const easy = rateCard(c, Rating.Easy, now);
    expect(new Date(easy.due).getTime()).toBeGreaterThan(new Date(again.due).getTime());
    expect(easy.due).not.toBe(c.due);
    const later = rateCard(easy, Rating.Good, new Date(easy.due));
    expect(new Date(later.due).getTime()).toBeGreaterThan(new Date(easy.due).getTime());
  });
});

describe('Verified BSB dataset', () => {
  const rawB = readFileSync(resolve(__dirname, '../../public/data/bsb.json'));
  const bsb: BibleData = JSON.parse(rawB.toString());
  beforeAll(() => setBibleData(bsb, 'BSB'));
  afterAll(() => setBibleData(bible, 'KJV'));

  it('matches its manifest and shares KJV versification', () => {
    expect(createHash('sha256').update(rawB).digest('hex')).toBe(bsbManifest.outputSha256);
    expect(bsb.b.map((b) => b.length)).toEqual(manifest.chapterCounts);
    bsb.b.forEach((b, i) => b.forEach((c, j) => expect(c.length, `${i}:${j + 1}`).toBe(manifest.verseCounts[i][j])));
  });

  it('marks the verses the BSB omits, and only those', () => {
    const empty = bsb.b.flatMap((b, i) => b.flatMap((c, j) => c.map((t, k) => (t ? null : `${i}.${j + 1}.${k + 1}`)))).filter(Boolean);
    expect(empty.length).toBe(bsbManifest.omittedVerses.length);
    expect(bsbManifest.omittedVerses).toContain('ACT.8.37');
    const acts = passageVerses(parseReference('Acts 8:35–39'));
    expect(acts.find((v) => v.verse === 37)?.omitted).toBe(true);
    expect(textVerses(parseReference('Acts 8:35–39')).map((v) => v.verse)).toEqual([35, 36, 38, 39]);
  });

  it('every curriculum passage has text in the BSB', () => {
    for (const r of allRefs()) expect(textVerses(parseReference(r.ref)).length, `${r.where}: ${r.ref}`).toBeGreaterThan(0);
  });

  it('memorization works on BSB text and never includes an omitted verse', () => {
    const verses = textVerses(parseReference('Acts 8:35–39'));
    const chunks = chunkVerses(verses);
    expect(chunks.every((c) => c.text.length > 0)).toBe(true);
    const t = passageText(parseReference('Ephesians 2:8–10'));
    expect(alignWords(t, t).accuracy).toBe(1);
  });
});
