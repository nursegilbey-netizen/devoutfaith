import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

export { Rating, State };
export type { Grade };

/** Serialized FSRS card (dates as ISO strings) — persisted per review card. */
export interface StoredCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: string;
}

export type CardKind = 'text' | 'ref' | 'q';

/** Card ids: text:<passageId>, ref:<passageId>, q:<questionId>. A passage shared by several topics has ONE text card and ONE ref card. */
export const cardId = (kind: CardKind, key: string) => `${kind}:${key}`;
export const cardKind = (id: string) => id.split(':')[0] as CardKind;
export const cardKey = (id: string) => id.slice(id.indexOf(':') + 1);

const scheduler = fsrs(generatorParameters({ enable_fuzz: false, request_retention: 0.9, maximum_interval: 3650 }));

const toStored = (c: Card): StoredCard => ({
  due: new Date(c.due).toISOString(),
  stability: c.stability,
  difficulty: c.difficulty,
  elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  last_review: c.last_review ? new Date(c.last_review).toISOString() : undefined,
});

const fromStored = (s: StoredCard): Card => ({
  ...s,
  due: new Date(s.due),
  last_review: s.last_review ? new Date(s.last_review) : undefined,
});

export const newCard = (now = new Date()): StoredCard => toStored(createEmptyCard(now));

export function rateCard(card: StoredCard, rating: Grade, now = new Date()): StoredCard {
  return toStored(scheduler.next(fromStored(card), now, rating).card);
}

/** Preview next due date for each rating (for button labels). */
export function previewIntervals(card: StoredCard, now = new Date()): Record<Grade, Date> {
  const p = scheduler.repeat(fromStored(card), now);
  return {
    [Rating.Again]: p[Rating.Again].card.due,
    [Rating.Hard]: p[Rating.Hard].card.due,
    [Rating.Good]: p[Rating.Good].card.due,
    [Rating.Easy]: p[Rating.Easy].card.due,
  } as Record<Grade, Date>;
}

/** Map an objective score (0..1) to a suggested FSRS rating. */
export function suggestRating(score: number): Grade {
  if (score >= 0.98) return Rating.Easy;
  if (score >= 0.85) return Rating.Good;
  if (score >= 0.6) return Rating.Hard;
  return Rating.Again;
}

export function humanInterval(due: Date, now = new Date()): string {
  const mins = Math.max(1, Math.round((due.getTime() - now.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${(days / 365).toFixed(1)}y`;
}
