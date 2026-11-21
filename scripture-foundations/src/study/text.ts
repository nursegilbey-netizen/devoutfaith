/** Tokenizing, alignment, chunking and seeded randomness for memorization modes. */

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string) {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], seed: string): T[] {
  const rnd = seededRandom(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Normalize a word for comparison: case, punctuation, apostrophes. */
export const normWord = (w: string) => w.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]/g, '');

export const tokenize = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * Deterministic hidden positions for progressive hiding: same seed + level -> same words.
 * Hidden sets are nested (words hidden at 25% stay hidden at 50%).
 */
export function hiddenPositions(wordCount: number, percent: number, seed: string): Set<number> {
  const order = shuffle(
    Array.from({ length: wordCount }, (_, i) => i),
    seed,
  );
  return new Set(order.slice(0, Math.round((wordCount * percent) / 100)));
}

export type DiffOp =
  | { op: 'match'; expected: string; typed: string }
  | { op: 'wrong'; expected: string; typed: string }
  | { op: 'missing'; expected: string }
  | { op: 'extra'; typed: string };

/** Word-level sequence alignment (Levenshtein over tokens) with a word-level diff. */
export function alignWords(expectedText: string, typedText: string) {
  const E = tokenize(expectedText);
  const T = tokenize(typedText);
  const e = E.map(normWord);
  const t = T.map(normWord);
  const n = e.length;
  const m = t.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = e[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }
  const ops: DiffOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (e[i - 1] === t[j - 1] ? 0 : 1)) {
      ops.push(e[i - 1] === t[j - 1] ? { op: 'match', expected: E[i - 1], typed: T[j - 1] } : { op: 'wrong', expected: E[i - 1], typed: T[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ op: 'missing', expected: E[i - 1] });
      i--;
    } else {
      ops.push({ op: 'extra', typed: T[j - 1] });
      j--;
    }
  }
  ops.reverse();
  const matches = ops.filter((o) => o.op === 'match').length;
  const extras = ops.filter((o) => o.op === 'extra').length;
  const accuracy = n ? Math.max(0, (matches - extras * 0.5) / n) : 0;
  return { ops, accuracy, matches, total: n };
}

/**
 * Segment by clause or thought (not fixed-length): split after clause punctuation,
 * then merge fragments shorter than `minWords` into a neighbor. Never crosses verse boundaries.
 */
export function chunkVerses(verses: { verse: number; text: string }[], minWords = 3, maxWords = 14): { verse: number; text: string }[] {
  const out: { verse: number; text: string }[] = [];
  for (const v of verses) {
    const pieces = v.text.match(/[^,;:.?!]+[,;:.?!]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [v.text];
    const merged: string[] = [];
    for (const p of pieces) {
      const words = tokenize(p).length;
      const last = merged[merged.length - 1];
      if (last !== undefined && (words < minWords || tokenize(last).length < minWords) && tokenize(last).length + words <= maxWords) {
        merged[merged.length - 1] = `${last} ${p}`;
      } else merged.push(p);
    }
    merged.forEach((text) => out.push({ verse: v.verse, text }));
  }
  return out;
}
