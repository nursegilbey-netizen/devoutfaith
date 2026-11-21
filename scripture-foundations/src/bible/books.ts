import manifest from './kjv-manifest.json';

export interface Book {
  index: number;
  name: string;
  code: string;
  testament: 'OT' | 'NT';
  aliases: string[];
}

// [name, code, extra aliases]
const RAW: [string, string, string[]][] = [
  ['Genesis', 'GEN', ['gen', 'ge', 'gn']], ['Exodus', 'EXO', ['exod', 'ex', 'exo']], ['Leviticus', 'LEV', ['lev', 'lv']],
  ['Numbers', 'NUM', ['num', 'nm', 'nu']], ['Deuteronomy', 'DEU', ['deut', 'dt', 'deu']], ['Joshua', 'JOS', ['josh', 'jos']],
  ['Judges', 'JDG', ['judg', 'jdg', 'jg']], ['Ruth', 'RUT', ['ru', 'rth']], ['1 Samuel', '1SA', ['1 sam', '1sam', '1 sa', '1sa']],
  ['2 Samuel', '2SA', ['2 sam', '2sam', '2 sa', '2sa']], ['1 Kings', '1KI', ['1 kgs', '1kgs', '1 ki', '1ki']],
  ['2 Kings', '2KI', ['2 kgs', '2kgs', '2 ki', '2ki']], ['1 Chronicles', '1CH', ['1 chron', '1 chr', '1chr', '1ch']],
  ['2 Chronicles', '2CH', ['2 chron', '2 chr', '2chr', '2ch']], ['Ezra', 'EZR', ['ezr']], ['Nehemiah', 'NEH', ['neh', 'ne']],
  ['Esther', 'EST', ['esth', 'est']], ['Job', 'JOB', ['jb']], ['Psalms', 'PSA', ['psalm', 'ps', 'psa', 'pss']],
  ['Proverbs', 'PRO', ['prov', 'pr', 'prv']], ['Ecclesiastes', 'ECC', ['eccl', 'eccles', 'ecc', 'qoh']],
  ['Song of Solomon', 'SNG', ['song of songs', 'song', 'sos', 'canticles']], ['Isaiah', 'ISA', ['isa', 'is']],
  ['Jeremiah', 'JER', ['jer', 'je']], ['Lamentations', 'LAM', ['lam', 'la']], ['Ezekiel', 'EZK', ['ezek', 'eze', 'ezk']],
  ['Daniel', 'DAN', ['dan', 'dn', 'da']], ['Hosea', 'HOS', ['hos', 'ho']], ['Joel', 'JOL', ['jl', 'joe']], ['Amos', 'AMO', ['am', 'amo']],
  ['Obadiah', 'OBA', ['obad', 'ob']], ['Jonah', 'JON', ['jon', 'jnh']], ['Micah', 'MIC', ['mic', 'mi']], ['Nahum', 'NAM', ['nah', 'na']],
  ['Habakkuk', 'HAB', ['hab', 'hb']], ['Zephaniah', 'ZEP', ['zeph', 'zep']], ['Haggai', 'HAG', ['hag', 'hg']],
  ['Zechariah', 'ZEC', ['zech', 'zec']], ['Malachi', 'MAL', ['mal', 'ml']],
  ['Matthew', 'MAT', ['matt', 'mt', 'mat']], ['Mark', 'MRK', ['mk', 'mrk', 'mar']], ['Luke', 'LUK', ['lk', 'luk']],
  ['John', 'JHN', ['jn', 'jhn', 'joh']], ['Acts', 'ACT', ['ac', 'act']], ['Romans', 'ROM', ['rom', 'ro', 'rm']],
  ['1 Corinthians', '1CO', ['1 cor', '1cor', '1 co', '1co']], ['2 Corinthians', '2CO', ['2 cor', '2cor', '2 co', '2co']],
  ['Galatians', 'GAL', ['gal', 'ga']], ['Ephesians', 'EPH', ['eph', 'ephes']], ['Philippians', 'PHP', ['phil', 'php', 'pp']],
  ['Colossians', 'COL', ['col']], ['1 Thessalonians', '1TH', ['1 thess', '1thess', '1 th', '1th']],
  ['2 Thessalonians', '2TH', ['2 thess', '2thess', '2 th', '2th']], ['1 Timothy', '1TI', ['1 tim', '1tim', '1 ti', '1ti']],
  ['2 Timothy', '2TI', ['2 tim', '2tim', '2 ti', '2ti']], ['Titus', 'TIT', ['tit']], ['Philemon', 'PHM', ['philem', 'phm', 'phlm']],
  ['Hebrews', 'HEB', ['heb']], ['James', 'JAS', ['jas', 'jm']], ['1 Peter', '1PE', ['1 pet', '1pet', '1 pe', '1pe', '1pt']],
  ['2 Peter', '2PE', ['2 pet', '2pet', '2 pe', '2pe', '2pt']], ['1 John', '1JN', ['1 jn', '1jn', '1 jo', '1john']],
  ['2 John', '2JN', ['2 jn', '2jn', '2john']], ['3 John', '3JN', ['3 jn', '3jn', '3john']], ['Jude', 'JUD', ['jud', 'jd']],
  ['Revelation', 'REV', ['rev', 're', 'rv', 'revelations', 'apocalypse']],
];

export const BOOKS: Book[] = RAW.map(([name, code, aliases], index) => ({
  index,
  name,
  code,
  testament: index < 39 ? 'OT' : 'NT',
  aliases: Array.from(new Set([name.toLowerCase(), code.toLowerCase(), ...aliases])),
}));

/** Verified verse counts from the import manifest: verseCounts[book][chapter-1]. */
export const VERSE_COUNTS: number[][] = manifest.verseCounts;
export const chapterCount = (book: number) => VERSE_COUNTS[book]?.length ?? 0;
export const verseCount = (book: number, chapter: number) => VERSE_COUNTS[book]?.[chapter - 1] ?? 0;

// alias -> book index, longest first for prefix matching
const ALIASES: [string, number][] = BOOKS.flatMap((b) => b.aliases.map((a) => [a, b.index] as [string, number])).sort(
  (a, b) => b[0].length - a[0].length,
);

/** Match a book name at the start of the string. Returns [bookIndex, rest] or null. */
export function matchBookPrefix(input: string): [number, string] | null {
  const s = input.trim().toLowerCase().replace(/\./g, '').replace(/^(i{1,3})\s+/, (m, r: string) => `${r.length} `);
  for (const [alias, idx] of ALIASES) {
    if (s.startsWith(alias)) {
      const rest = s.slice(alias.length);
      if (rest === '' || /^[\s\d:]/.test(rest)) return [idx, rest.trim()];
    }
  }
  return null;
}

export function bookDisplayName(book: number, singleChapter = true): string {
  const name = BOOKS[book].name;
  return name === 'Psalms' && singleChapter ? 'Psalm' : name;
}
