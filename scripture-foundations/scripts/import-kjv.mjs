#!/usr/bin/env node
/**
 * Verified KJV importer for Scripture Foundations.
 *
 * Never type or generate Bible text by hand. This script imports the 1769
 * (Blayney) KJV text from a public dataset, validates it, optionally
 * cross-checks it word-by-word against an independent second dataset, and
 * writes the compact runtime file + a manifest with checksums.
 *
 * Usage:
 *   node scripts/import-kjv.mjs <primary verses-1769.json> [secondary en_kjv.json]
 *
 * Primary source:   https://github.com/farskipper/kjv  (json/verses-1769.json)
 * Secondary source: https://github.com/thiagobodruk/bible (json/en_kjv.json)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [primaryPath, secondaryPath] = process.argv.slice(2);
if (!primaryPath) {
  console.error('Usage: node scripts/import-kjv.mjs <verses-1769.json> [en_kjv.json]');
  process.exit(1);
}

const CANON = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel',
  '1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs',
  'Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];
const SOURCE_ALIASES = { "Solomon's Song": 'Song of Solomon' };
const EXPECTED_VERSES = 31102;
const EXPECTED_CHAPTERS = 1189;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const primaryRaw = readFileSync(primaryPath);
const primary = JSON.parse(primaryRaw.toString('utf8').replace(/^﻿/, ''));

/** Clean display text: drop pilcrow markers (#) and italic-supplied-word brackets. Words are kept. */
const clean = (s) => s.replace(/#\s*/g, '').replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();

const books = CANON.map((name) => ({ name, chapters: [] }));
const errors = [];
let verseCount = 0;
let expectedOrderIdx = 0;

for (const [key, text] of Object.entries(primary)) {
  const m = key.match(/^(.+) (\d+):(\d+)$/);
  if (!m) { errors.push(`Bad key ${key}`); continue; }
  const [, rawBook, c, v] = m;
  const book = SOURCE_ALIASES[rawBook] ?? rawBook;
  const bi = CANON.indexOf(book);
  if (bi < 0) { errors.push(`Unknown book ${book}`); continue; }
  if (bi < expectedOrderIdx) errors.push(`Book order violation at ${key}`);
  expectedOrderIdx = bi;
  const ch = Number(c), vs = Number(v);
  const chapters = books[bi].chapters;
  while (chapters.length < ch) chapters.push([]);
  const verses = chapters[ch - 1];
  if (verses.length !== vs - 1) errors.push(`Verse sequence gap at ${key}`);
  const t = clean(text);
  if (!t) errors.push(`Empty verse ${key}`);
  verses.push(t);
  verseCount++;
}

const chapterCount = books.reduce((n, b) => n + b.chapters.length, 0);
if (verseCount !== EXPECTED_VERSES) errors.push(`Verse count ${verseCount} != ${EXPECTED_VERSES}`);
if (chapterCount !== EXPECTED_CHAPTERS) errors.push(`Chapter count ${chapterCount} != ${EXPECTED_CHAPTERS}`);
books.forEach((b) => { if (!b.chapters.length) errors.push(`Missing book ${b.name}`); });

// Optional independent cross-check (word-level, ignoring punctuation, case, apostrophes, hyphens).
let crossCheck = null;
if (secondaryPath) {
  const sec = JSON.parse(readFileSync(secondaryPath, 'utf8').replace(/^﻿/, ''));
  const norm = (s) => s.toLowerCase().replace(/\{[^}]*\}/g, '').replace(/['’\-]/g, '').match(/[a-z]+/g)?.join(' ') ?? '';
  let compared = 0, differing = 0; const samples = [];
  sec.forEach((b, bi) => b.chapters.forEach((c, ci) => c.forEach((v, vi) => {
    const p = books[bi]?.chapters[ci]?.[vi];
    compared++;
    if (p === undefined || norm(p) !== norm(v)) {
      differing++;
      if (samples.length < 25) samples.push({ ref: `${CANON[bi]} ${ci + 1}:${vi + 1}`, primary: p ?? null, secondary: v });
    }
  })));
  crossCheck = { source: 'thiagobodruk/bible en_kjv.json', sha256: sha256(readFileSync(secondaryPath)), compared, differing, samples };
  if (compared !== EXPECTED_VERSES) errors.push(`Secondary verse count ${compared}`);
  // Differences are expected (1769 spellings such as "their's", hyphenated names). Flag only if large.
  if (differing > 400) errors.push(`Cross-check differs on ${differing} verses — investigate source`);
}

if (errors.length) {
  console.error('KJV import FAILED:\n' + errors.slice(0, 50).join('\n'));
  process.exit(2);
}

const runtime = { v: 'KJV', b: books.map((b) => b.chapters) };
const out = JSON.stringify(runtime);
mkdirSync(resolve(root, 'public/data'), { recursive: true });
mkdirSync(resolve(root, 'src/bible'), { recursive: true });
writeFileSync(resolve(root, 'public/data/kjv.json'), out);

const manifest = {
  id: 'kjv',
  abbreviation: 'KJV',
  name: 'King James Version (1769 Oxford standard text)',
  license: 'Public domain in the United States. (Crown rights apply in the United Kingdom.)',
  source: 'https://github.com/farskipper/kjv — json/verses-1769.json',
  edition: '1769 Blayney; italic-word brackets and pilcrow markers removed for display',
  importedAt: new Date().toISOString(),
  sourceSha256: sha256(primaryRaw),
  outputSha256: sha256(Buffer.from(out)),
  books: CANON.length,
  chapters: chapterCount,
  verses: verseCount,
  chapterCounts: books.map((b) => b.chapters.length),
  verseCounts: books.map((b) => b.chapters.map((c) => c.length)),
  crossCheck: crossCheck && { ...crossCheck, samples: crossCheck.samples.slice(0, 10) },
};
writeFileSync(resolve(root, 'src/bible/kjv-manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`KJV import OK: ${manifest.books} books, ${chapterCount} chapters, ${verseCount} verses.`);
console.log(`output sha256 ${manifest.outputSha256}`);
if (crossCheck) console.log(`Cross-check: ${crossCheck.differing}/${crossCheck.compared} verses differ in spelling/wording variants.`);
