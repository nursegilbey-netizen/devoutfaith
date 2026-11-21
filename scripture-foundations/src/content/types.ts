/** Relationship types required by the spec (§5). */
export type RelType =
  | 'quotation'
  | 'parallel'
  | 'allusion'
  | 'background'
  | 'fulfillment'
  | 'support'
  | 'tension'
  | 'alternate';

export const REL_LABELS: Record<RelType, string> = {
  quotation: 'Quotation',
  parallel: 'Parallel account',
  allusion: 'Allusion',
  background: 'Background',
  fulfillment: 'Fulfillment claim',
  support: 'Theological support',
  tension: 'Apparent tension',
  alternate: 'Alternate interpretation',
};

export type ReviewStatus = 'draft' | 'reviewed';

export interface CrossRef {
  ref: string;
  /** Short label from the curriculum, e.g. "fall". */
  label: string;
  type: RelType;
  /** 1–3 sentence editorial explanation (directional: from the topic's primary passage to this one). */
  note?: string;
  tradition?: string;
  /** Marked true when listed under "Interpretive comparison / caution". */
  challenge?: boolean;
  status?: ReviewStatus;
}

export interface Topic {
  id: string; // "1.2"
  categoryId: number;
  title: string;
  objective: string;
  memorize: string[];
  crossRefs: CrossRef[];
  caution: string;
  exercise: string;
  lessonId?: string;
  doctrineId?: string;
}

export interface Category {
  id: number;
  title: string;
  short: string;
  summary: string;
  color: string;
}

export type Option = { text: string; correct?: boolean; rationale: string };

export type Question =
  | { id: string; kind: 'mc'; stem: string; options: Option[]; evidence: string[] }
  | { id: string; kind: 'short'; stem: string; sample: string; checklist: string[]; evidence: string[] };

export interface Perspective {
  tradition: string;
  /** Lens id used to highlight this view when the user picks a study lens. */
  lens?: LensId;
  summary: string;
  refs: string[];
}

export interface AuthoredLesson {
  id: string;
  title: string;
  topicIds: string[];
  /** Passages memorized in this lesson (each becomes one canonical review card set). */
  memorize: string[];
  objective: string;
  outcomes: string[];
  why: string;
  context: {
    author: string;
    audience: string;
    genre: string;
    argument: string;
    sequence: { ref: string; label: string }[];
  };
  contextQuestion: Question;
  questions: Question[];
  connect: {
    intro: string;
    sequence: CrossRef[];
    match?: { prompt: string; pairs: { ref: string; argument: string }[] };
  };
  synthesis: { prompt: string; sample: string; perspectives: Perspective[] };
  apply: { scenario: string; prompt: string; textual: string[]; interpretive: string[] };
  interpretiveNote: string;
}

export type LensId = 'broad' | 'adventist' | 'evangelical' | 'reformed' | 'catholic' | 'orthodox';

export const LENSES: { id: LensId; label: string; description: string }[] = [
  { id: 'broad', label: 'Broad Christian', description: 'No tradition highlighted. All views presented side by side.' },
  { id: 'adventist', label: 'Seventh-day Adventist', description: 'Highlights Adventist readings where they are labeled.' },
  { id: 'evangelical', label: 'Evangelical Protestant', description: 'Highlights broadly evangelical readings.' },
  { id: 'reformed', label: 'Reformed', description: 'Highlights Reformed / Calvinist readings.' },
  { id: 'catholic', label: 'Roman Catholic', description: 'Highlights Catholic readings.' },
  { id: 'orthodox', label: 'Eastern Orthodox', description: 'Highlights Orthodox readings.' },
];

export type Certainty = 'explicit' | 'inferred' | 'disputed';

export interface Doctrine {
  id: string;
  topicId: string;
  title: string;
  question: string;
  explicit: { ref: string; statement: string }[];
  inferred: { statement: string; refs: string[] }[];
  disputed: { issue: string; perspectives: Perspective[] }[];
  challenges: { ref: string; why: string }[];
  synthesisPrompt: string;
}
