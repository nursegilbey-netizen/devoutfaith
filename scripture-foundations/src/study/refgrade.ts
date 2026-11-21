import type { Passage } from '../bible/reference';

export interface RefAnswer {
  book: number;
  chapter: number;
  start: number;
  end: number;
}

export interface RefGrade {
  book: boolean;
  chapter: boolean;
  verses: boolean;
  score: number; // 0..1
}

/** Assess book, chapter, and verse range separately (spec §6). Graded against the first segment. */
export function gradeReference(answer: RefAnswer, target: Passage): RefGrade {
  const first = target.segments[0];
  const last = target.segments.filter((s) => s.book === first.book && s.chapter === first.chapter).at(-1)!;
  const book = answer.book === first.book;
  const chapter = book && answer.chapter === first.chapter;
  const verses = chapter && answer.start === first.start && answer.end === last.end;
  const score = (Number(book) + Number(chapter) + Number(verses)) / 3;
  return { book, chapter, verses, score };
}
