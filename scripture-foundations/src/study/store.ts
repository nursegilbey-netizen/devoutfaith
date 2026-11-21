import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LensId } from '../content/types';
import type { TranslationId } from '../bible/bible';
import { newCard, rateCard, cardKind, type Grade, type StoredCard, Rating } from './scheduler';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  translation: TranslationId;
  lens: LensId;
  dailyReviewCap: number;
  dailyLessonGoal: number;
  fontScale: number; // 0.9 – 1.5
  theme: Theme;
  showVerseNumbers: boolean;
}

export interface ReviewEvent {
  cardId: string;
  rating: Grade;
  at: string;
  score?: number;
  due: string;
}

export interface QuestionResult {
  correct: boolean;
  attempts: number;
  last: string;
}

export interface LessonProgress {
  step: number;
  startedAt: string;
  completedAt?: string;
}

export interface StudyState {
  settings: Settings;
  cards: Record<string, StoredCard>;
  events: ReviewEvent[];
  /** Best accuracy (0..1) per dimension, keyed by canonical passage id. */
  textMastery: Record<string, number>;
  refMastery: Record<string, number>;
  /** Comprehension answers, keyed by question id. */
  questions: Record<string, QuestionResult>;
  /** Cross-reference reasoning (match exercises) score per lesson key. */
  crossRef: Record<string, number>;
  lessons: Record<string, LessonProgress>;
  reflections: Record<string, string>;
  activityDays: string[];
  lastLesson?: string;

  updateSettings: (s: Partial<Settings>) => void;
  ensureCards: (ids: string[]) => void;
  rate: (id: string, rating: Grade, score?: number) => void;
  recordText: (passageId: string, accuracy: number) => void;
  recordRef: (passageId: string, score: number) => void;
  recordQuestion: (qid: string, correct: boolean) => void;
  recordCrossRef: (lessonKey: string, score: number) => void;
  setLessonStep: (key: string, step: number) => void;
  completeLesson: (key: string) => void;
  saveReflection: (key: string, text: string) => void;
  markActive: () => void;
  importData: (data: Partial<StudyState>) => void;
  reset: () => void;
}

export const todayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const DEFAULT_SETTINGS: Settings = {
  translation: 'KJV',
  lens: 'broad',
  dailyReviewCap: 30,
  dailyLessonGoal: 1,
  fontScale: 1,
  theme: 'system',
  showVerseNumbers: true,
};

const initial = () => ({
  settings: { ...DEFAULT_SETTINGS },
  cards: {} as Record<string, StoredCard>,
  events: [] as ReviewEvent[],
  textMastery: {} as Record<string, number>,
  refMastery: {} as Record<string, number>,
  questions: {} as Record<string, QuestionResult>,
  crossRef: {} as Record<string, number>,
  lessons: {} as Record<string, LessonProgress>,
  reflections: {} as Record<string, string>,
  activityDays: [] as string[],
  lastLesson: undefined as string | undefined,
});

const addDay = (days: string[]) => {
  const t = todayKey();
  return days.includes(t) ? days : [...days, t].slice(-400);
};

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      ...initial(),
      updateSettings: (s) => set({ settings: { ...get().settings, ...s } }),
      ensureCards: (ids) => {
        const cards = { ...get().cards };
        let changed = false;
        for (const id of ids) if (!cards[id]) { cards[id] = newCard(); changed = true; }
        if (changed) set({ cards });
      },
      rate: (id, rating, score) => {
        const card = get().cards[id] ?? newCard();
        const next = rateCard(card, rating);
        set({
          cards: { ...get().cards, [id]: next },
          events: [...get().events, { cardId: id, rating, at: new Date().toISOString(), score, due: next.due }].slice(-5000),
          activityDays: addDay(get().activityDays),
        });
      },
      recordText: (pid, acc) =>
        set({ textMastery: { ...get().textMastery, [pid]: Math.max(acc, get().textMastery[pid] ?? 0) }, activityDays: addDay(get().activityDays) }),
      recordRef: (pid, score) =>
        set({ refMastery: { ...get().refMastery, [pid]: Math.max(score, get().refMastery[pid] ?? 0) }, activityDays: addDay(get().activityDays) }),
      recordQuestion: (qid, correct) => {
        const prev = get().questions[qid];
        set({
          questions: { ...get().questions, [qid]: { correct, attempts: (prev?.attempts ?? 0) + 1, last: new Date().toISOString() } },
          activityDays: addDay(get().activityDays),
        });
      },
      recordCrossRef: (key, score) => set({ crossRef: { ...get().crossRef, [key]: Math.max(score, get().crossRef[key] ?? 0) } }),
      setLessonStep: (key, step) => {
        const prev = get().lessons[key];
        set({ lessons: { ...get().lessons, [key]: { ...prev, startedAt: prev?.startedAt ?? new Date().toISOString(), step } }, lastLesson: key });
      },
      completeLesson: (key) => {
        const prev = get().lessons[key];
        set({
          lessons: { ...get().lessons, [key]: { step: prev?.step ?? 0, startedAt: prev?.startedAt ?? new Date().toISOString(), completedAt: new Date().toISOString() } },
          activityDays: addDay(get().activityDays),
        });
      },
      saveReflection: (key, text) => set({ reflections: { ...get().reflections, [key]: text } }),
      markActive: () => set({ activityDays: addDay(get().activityDays) }),
      importData: (data) => set({ ...initial(), ...data, settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) } }),
      reset: () => set(initial()),
    }),
    { name: 'scripture-foundations', version: 1 },
  ),
);

/** Cards due now, ordered: failed/learning first, then by due date, capped by today's remaining allowance. */
export function dueCardIds(state: Pick<StudyState, 'cards' | 'events' | 'settings'>, now = new Date()): string[] {
  const today = todayKey(now);
  const reviewedToday = new Set(state.events.filter((e) => todayKey(new Date(e.at)) === today).map((e) => e.cardId)).size;
  const remaining = Math.max(0, state.settings.dailyReviewCap - reviewedToday);
  return Object.entries(state.cards)
    .filter(([, c]) => new Date(c.due) <= now)
    .sort(([, a], [, b]) => a.state - b.state || +new Date(a.due) - +new Date(b.due))
    .map(([id]) => id)
    .slice(0, remaining);
}

export function streak(days: string[], now = new Date()): number {
  const set = new Set(days);
  let n = 0;
  const d = new Date(now);
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1); // today not yet done doesn't break streak
  while (set.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function masterySummary(s: Pick<StudyState, 'textMastery' | 'refMastery' | 'questions' | 'crossRef'>) {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const q = Object.values(s.questions);
  return {
    text: avg(Object.values(s.textMastery)),
    ref: avg(Object.values(s.refMastery)),
    comprehension: q.length ? q.filter((x) => x.correct).length / q.length : null,
    crossRef: avg(Object.values(s.crossRef)),
  };
}

export const isSuccess = (r: Grade) => r !== Rating.Again;
export const kindLabel = (id: string) => ({ text: 'Text recall', ref: 'Reference recall', q: 'Understanding' })[cardKind(id)];
