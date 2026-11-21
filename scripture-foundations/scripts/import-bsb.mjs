#!/usr/bin/env node
/**
 * Verified BSB importer for Scripture Foundations.
 *
 * Primary source:   official BSB USFM release from BSB Publishing
 *                   https://github.com/BSB-publishing/bsb2usfm/releases (BSB_usfm.zip, unzipped)
 * Secondary source: scrollmapper/bible_databases formats/json/BSB.json (independent cross-check)
 *
 * The BSB uses the same English versification as the KJV, but leaves some verses out
 * because they are absent from the earliest manuscripts (e.g. Matthew 17:21, Acts 8:37).
 * Those verses are stored as empty strings and listed in the manifest so the app can
 * show a clear note instead of silently skipping them.
 *
 * Usage: node scripts/import-bsb.mjs <usfm folder> [BSB.json]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [usfmDir, secondaryPath] = process.argv.slice(2);
if (!usfmDir) { console.error('Usage: node scripts/import-bsb.mjs <usfm folder> [BSB.json]'); process.exit(1); }

const CODES = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
const kjvManifest = JSON.parse(readFileSync(resolve(root, 'src/bible/kjv-manifest.json'), 'utf8'));
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const errors = [];
const sourceHash = createHash('sha256');

// Lines whose whole content is a heading / apparatus, not Bible text.
const DROP_LINE = /^\\(id|h|toc\d|mt\d?|ms\d?|s\d?|r|qa|rem|ide|sp)\b/;

function parseBook(text) {
  const chapters = [];
  let ch = 0, v = 0;
  for (let line of text.split(/\r?\n/)) {
    if (DROP_LINE.test(line)) continue;
    // Strip notes, cross-refs, character markers. Keep words inside \add (supplied words).
    line = line
      .replace(/\\f\s.*?\\f\*/g, '')
      .replace(/\\x\s.*?\\x\*/g, '')
      .replace(/\\ref\s.*?\\ref\*/g, '');
    // \d = Psalm superscription. Treated as a heading (as in the KJV data): keep any \v marker, drop its words.
    if (/^\\d\b/.test(line)) {
      const vm = line.match(/\\v\s+(\d+)/);
      line = vm ? `\\v ${vm[1]} ` : '';
    }
    const tokens = line.split(/(\\c\s+\d+|\\v\s+\d+)/);
    for (const tok of tokens) {
      let m;
      if ((m = tok.match(/^\\c\s+(\d+)$/))) { ch = Number(m[1]); chapters[ch - 1] = []; v = 0; continue; }
      if ((m = tok.match(/^\\v\s+(\d+)$/))) {
        const nv = Number(m[1]);
        const verses = chapters[ch - 1];
        for (let k = v + 1; k < nv; k++) verses[k - 1] = ''; // omitted verse(s)
        v = nv; verses[v - 1] = verses[v - 1] ?? ''; continue;
      }
      if (!ch || !v) continue;
      const clean = tok.replace(/\\[a-z]+\d*\*?/g, ' ');
      chapters[ch - 1][v - 1] += ' ' + clean;
    }
  }
  return chapters.map((c) => (c ?? []).map((t) => (t ?? '').replace(/\s+/g, ' ').replace(/\s([,.;:!?’”)])/g, '$1').replace(/([“‘(])\s/g, '$1').trim()));
}

const files = readdirSync(usfmDir);
const books = CODES.map((code) => {
  const f = files.find((x) => x.toUpperCase().startsWith(code) && x.toLowerCase().endsWith('.usfm'));
  if (!f) { errors.push(`Missing ${code}`); return []; }
  const raw = readFileSync(join(usfmDir, f));
  sourceHash.update(raw);
  return parseBook(raw.toString('utf8'));
});

// Align to KJV versification (verified counts). Pad with empty strings where the BSB ends a chapter early.
const omitted = [];
const extra = [];
books.forEach((chs, b) => {
  if (chs.length !== kjvManifest.chapterCounts[b]) errors.push(`${CODES[b]}: ${chs.length} chapters vs KJV ${kjvManifest.chapterCounts[b]}`);
  chs.forEach((vs, c) => {
    const want = kjvManifest.verseCounts[b][c] ?? 0;
    while (vs.length < want) vs.push('');
    if (vs.length > want) extra.push(`${CODES[b]} ${c + 1}:${want + 1}-${vs.length}`);
    vs.forEach((t, i) => { if (!t) omitted.push(`${CODES[b]}.${c + 1}.${i + 1}`); });
  });
});
const verseCount = books.flat().flat().length;
const textVerses = books.flat().flat().filter(Boolean).length;
if (omitted.length > 40) errors.push(`${omitted.length} empty verses — parser problem?`);

let crossCheck = null;
if (secondaryPath) {
  const sec = JSON.parse(readFileSync(secondaryPath, 'utf8'));
  const norm = (s) => s.toLowerCase().replace(/['’\-—]/g, ' ').match(/[a-z0-9]+/g)?.join(' ') ?? '';
  let compared = 0, differing = 0; const samples = [];
  sec.books.forEach((bk, b) => bk.chapters.forEach((c) => c.verses.forEach((v) => {
    const p = books[b]?.[c.chapter - 1]?.[v.verse - 1];
    if (!p) return; // omitted in primary
    compared++;
    if (norm(p) !== norm(v.text)) { differing++; if (samples.length < 60) samples.push({ ref: `${CODES[b]} ${c.chapter}:${v.verse}`, primary: p, secondary: v.text }); }
  })));
  crossCheck = { source: 'scrollmapper/bible_databases BSB.json', sha256: sha256(readFileSync(secondaryPath)), compared, differing, samples: samples.slice(0, 60) };
  // Expected ~3.6%: the official 2025 release revises wording (e.g. "food offering") and moves some
  // verse boundaries in list passages (Numbers 1–2). Fail only if differences suggest a parser fault.
  if (differing / compared > 0.05) errors.push(`Cross-check differs on ${differing}/${compared} verses — investigate`);
}

if (errors.length) { console.error('BSB import FAILED:\n' + errors.join('\n')); process.exit(2); }

const out = JSON.stringify({ v: 'BSB', b: books });
writeFileSync(resolve(root, 'public/data/bsb.json'), out);
const manifest = {
  id: 'bsb',
  abbreviation: 'BSB',
  name: 'Berean Standard Bible',
  license: 'Public domain (dedicated by BSB Publishing, April 30, 2023).',
  source: 'https://github.com/BSB-publishing/bsb2usfm — BSB_usfm.zip (official release)',
  edition: 'USFM release; headings, footnotes and cross-references removed; Psalm superscriptions treated as headings',
  importedAt: new Date().toISOString(),
  sourceSha256: sourceHash.digest('hex'),
  outputSha256: sha256(Buffer.from(out)),
  books: books.length,
  chapters: books.reduce((n, b) => n + b.length, 0),
  verses: verseCount,
  textVerses,
  omittedVerses: omitted,
  versificationNotes: extra,
  crossCheck,
};
writeFileSync(resolve(root, 'src/bible/bsb-manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`BSB import OK: ${manifest.chapters} chapters, ${textVerses} verses with text, ${omitted.length} omitted: ${omitted.join(', ')}`);
if (extra.length) console.log('Versification notes:', extra.join('; '));
if (crossCheck) console.log(`Cross-check: ${crossCheck.differing}/${crossCheck.compared} verses differ.`);
