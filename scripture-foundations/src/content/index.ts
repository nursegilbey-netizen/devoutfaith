import { overlaps, parseReference, type Passage } from '../bible/reference';
import { TOPICS, topicById } from './curriculum';
import { LESSONS, lessonById } from './lessons';
import type { AuthoredLesson, CrossRef, Question, Topic } from './types';

export * from './curriculum';
export * from './lessons';
export * from './doctrines';

/** Lesson keys: authored lesson id, or "topic-<id>" for a guided lesson generated from a topic. */
export const lessonKeyForTopic = (t: Topic) => t.lessonId ?? `topic-${t.id}`;

export function resolveLesson(key: string): { authored?: AuthoredLesson; topic?: Topic; memorize: string[]; title: string } | null {
  const authored = lessonById(key);
  if (authored) return { authored, topic: topicById(authored.topicIds[0]), memorize: authored.memorize, title: authored.title };
  if (key.startsWith('topic-')) {
    const topic = topicById(key.slice(6));
    if (topic) return { topic, memorize: topic.memorize, title: topic.title };
  }
  return null;
}

/** All canonical memorization passages across the curriculum (deduplicated by passage id). */
export function memorizationPassages(): Passage[] {
  const map = new Map<string, Passage>();
  for (const ref of [...TOPICS.flatMap((t) => t.memorize), ...LESSONS.flatMap((l) => l.memorize)]) {
    const p = parseReference(ref);
    map.set(p.id, p);
  }
  return [...map.values()];
}

export const allQuestions = (): Question[] => LESSONS.flatMap((l) => [l.contextQuestion, ...l.questions]);
export const questionById = (id: string) => allQuestions().find((q) => q.id === id);
export const lessonForQuestion = (id: string) => LESSONS.find((l) => l.contextQuestion.id === id || l.questions.some((q) => q.id === id));

export interface Link {
  from: Passage;
  to: Passage;
  xref: CrossRef;
  topicId: string;
  /** 'out' = explanation written from `from` to `to`; 'in' = viewed from the target side. */
  direction: 'out' | 'in';
}

let edges: { from: Passage; to: Passage; xref: CrossRef; topicId: string }[] | null = null;
function allEdges() {
  if (edges) return edges;
  edges = [];
  for (const t of TOPICS) {
    const sources = t.memorize.map((r) => parseReference(r));
    const xrefs = [...t.crossRefs];
    const lesson = t.lessonId ? lessonById(t.lessonId) : undefined;
    if (lesson && lesson.topicIds[0] === t.id) xrefs.push(...lesson.connect.sequence);
    for (const x of xrefs) {
      const to = parseReference(x.ref);
      for (const from of sources) edges.push({ from, to, xref: x, topicId: t.id });
    }
  }
  return edges;
}

/** Bidirectional navigation: every link touching this passage, from either end. */
export function linksFor(p: Passage): Link[] {
  const seen = new Set<string>();
  const out: Link[] = [];
  for (const e of allEdges()) {
    let link: Link | null = null;
    if (overlaps(e.from, p) && !overlaps(e.to, p)) link = { ...e, direction: 'out' };
    else if (overlaps(e.to, p) && !overlaps(e.from, p)) link = { from: e.from, to: e.to, xref: e.xref, topicId: e.topicId, direction: 'in' };
    if (!link) continue;
    const other = link.direction === 'out' ? link.to.id : link.from.id;
    const key = `${other}|${link.xref.type}|${link.direction}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
  }
  return out;
}

export function topicsForPassage(p: Passage): Topic[] {
  return TOPICS.filter(
    (t) => t.memorize.some((r) => overlaps(parseReference(r), p)) || t.crossRefs.some((x) => overlaps(parseReference(x.ref), p)),
  );
}
