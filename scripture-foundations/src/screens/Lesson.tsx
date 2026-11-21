import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoryById, resolveLesson, topicById } from '../content';
import type { CrossRef, Topic } from '../content/types';
import { formatPassage, parseReference, type Passage } from '../bible/reference';
import { verseCount } from '../bible/books';
import { currentTranslation } from '../bible/bible';
import { Badge, Button, Callout, Card, Chip, cx, Header, Page, pct, Prose, SectionTitle } from '../components/ui';
import { CrossRefItem, PassageCard, VerseBlock } from '../components/Scripture';
import { PhraseOrder, ProgressiveHide, ReadChunks, RefRecall, TypedRecall } from '../components/memorize';
import { MatchExercise, MCQuestion, Perspectives, ShortQuestion } from '../components/assess';
import { useStudy } from '../study/store';
import { cardId, humanInterval, previewIntervals, newCard, Rating, suggestRating, type Grade } from '../study/scheduler';

type StepId = 'overview' | 'read' | 'context' | 'memorize' | 'understand' | 'connect' | 'apply' | 'review';
const STEP_LABEL: Record<StepId, string> = {
  overview: 'Overview', read: 'Read', context: 'Context', memorize: 'Memorize', understand: 'Understand', connect: 'Connect', apply: 'Apply', review: 'Review',
};

export default function Lesson() {
  const { key = '' } = useParams();
  const lesson = resolveLesson(key);
  const nav = useNavigate();
  const st = useStudy();
  const saved = st.lessons[key];
  const steps: StepId[] = lesson?.authored
    ? ['overview', 'read', 'context', 'memorize', 'understand', 'connect', 'apply', 'review']
    : ['overview', 'read', 'context', 'memorize', 'connect', 'apply', 'review'];
  const [step, setStep] = useState(Math.min(saved?.step ?? 0, steps.length - 1));
  const passages = useMemo(() => (lesson?.memorize ?? []).map((r) => parseReference(r)), [key]);

  // session scores
  const [typed, setTyped] = useState<Record<string, number>>({});
  const [refs, setRefs] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => { if (lesson) st.setLessonStep(key, step); window.scrollTo(0, 0); }, [step]);

  if (!lesson) return <><Header title="Lesson not found" back /><Page><p>That lesson doesn’t exist.</p></Page></>;
  const { authored, topic } = lesson;
  const cat = topic ? categoryById(topic.categoryId) : undefined;
  const cur = steps[step];

  const recordTyped = (p: Passage, acc: number, whole: boolean) => {
    if (!whole) return;
    setTyped((t) => ({ ...t, [p.id]: Math.max(acc, t[p.id] ?? 0) }));
    st.recordText(p.id, acc);
  };
  const recordRef = (p: Passage, score: number) => {
    setRefs((r) => ({ ...r, [p.id]: Math.max(score, r[p.id] ?? 0) }));
    st.recordRef(p.id, score);
  };
  const answer = (qid: string, correct: boolean) => {
    setAnswers((a) => ({ ...a, [qid]: correct }));
    st.recordQuestion(qid, correct);
  };

  return (
    <>
      <Header title={lesson.title} subtitle={topic ? `${topic.id} · ${cat?.title}` : undefined} back
        right={authored ? <Badge tone="gold">Full lesson</Badge> : <Badge>Guided</Badge>}>
        <div className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-2" role="tablist">
          {steps.map((s, i) => (
            <button key={s} role="tab" aria-selected={i === step} onClick={() => setStep(i)}
              className={cx('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                i === step ? 'bg-ink text-paper' : i < step ? 'bg-sunk text-ink' : 'text-muted')}>
              {i + 1}. {STEP_LABEL[s]}
            </button>
          ))}
        </div>
      </Header>
      <Page key={cur}>
        {authored && currentTranslation().id !== 'KJV' && ['context', 'understand', 'apply'].includes(cur) && (
          <p className="mb-3 rounded-lg bg-gold/10 px-3 py-2 text-xs text-ink/80">Questions in this lesson quote KJV wording (marked <b className="text-gold">KJV</b>). Your passages show the {currentTranslation().abbreviation}.</p>
        )}
        {cur === 'overview' && <Overview lesson={lesson} passages={passages} />}
        {cur === 'read' && (
          <div className="space-y-3">
            <p className="text-sm text-muted">Read the whole passage slowly. Each verse is labeled; the text comes from the verified {currentTranslation().abbreviation} dataset.</p>
            {passages.map((p) => <PassageCard key={p.id} passage={p} />)}
          </div>
        )}
        {cur === 'context' && <ContextStep lesson={lesson} passages={passages} onAnswer={answer} />}
        {cur === 'memorize' && <MemorizeStep passages={passages} onTyped={recordTyped} onRef={recordRef} typed={typed} refs={refs} />}
        {cur === 'understand' && authored && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Each answer explains why, with the supporting passage. Missed questions return in your review queue even when your word recall is strong.</p>
            {authored.questions.map((q) =>
              q.kind === 'mc'
                ? <MCQuestion key={q.id} q={q} onAnswer={(c) => answer(q.id, c)} />
                : <ShortQuestion key={q.id} q={q} storageKey={`${key}:${q.id}`} />,
            )}
          </div>
        )}
        {cur === 'connect' && <ConnectStep lessonKey={key} lesson={lesson} onMatch={(s) => { setMatchScore(s); st.recordCrossRef(key, s); }} />}
        {cur === 'apply' && <ApplyStep lessonKey={key} lesson={lesson} />}
        {cur === 'review' && (
          <ReviewStep lessonKey={key} passages={passages} typed={typed} refs={refs} answers={answers} matchScore={matchScore}
            onFinish={() => { st.completeLesson(key); nav(topic ? `/topic/${topic.id}` : '/'); }} />
        )}

        <div className="mt-8 flex gap-2">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < steps.length - 1 && <Button className="flex-1" onClick={() => setStep(step + 1)}>Next: {STEP_LABEL[steps[step + 1]]}</Button>}
        </div>
      </Page>
    </>
  );
}

type L = NonNullable<ReturnType<typeof resolveLesson>>;

function Overview({ lesson, passages }: { lesson: L; passages: Passage[] }) {
  const { authored, topic } = lesson;
  return (
    <div className="space-y-4">
      {topic && (
        <div className="flex flex-wrap gap-1.5">
          {(authored?.topicIds ?? [topic.id]).map((id) => {
            const t = topicById(id)!;
            return <Link key={id} to={`/topic/${id}`}><Badge>{id} · {t.title}</Badge></Link>;
          })}
        </div>
      )}
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Lesson objective</p>
        <p className="mt-1 text-lg font-semibold leading-snug">{authored?.objective ?? topic?.objective}</p>
        {authored && (
          <>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">You will be able to</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.95rem]">{authored.outcomes.map((o) => <li key={o}><Prose text={o} /></li>)}</ul>
          </>
        )}
      </Card>
      {authored && <Callout tone="gold" title="Why this passage"><Prose text={authored.why} /></Callout>}
      {!authored && topic && <Callout tone="gold" title="Understanding exercise">{topic.exercise}</Callout>}
      <div>
        <SectionTitle>Memorization passages</SectionTitle>
        <div className="flex flex-wrap gap-2">{passages.map((p) => <Badge key={p.id} tone="scripture">{formatPassage(p)}</Badge>)}</div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        <Badge tone="scripture">Scripture</Badge> text is imported from a verified {currentTranslation().abbreviation} dataset and never generated.{' '}
        <Badge tone="interp">Interpretation</Badge> and notes are editorial and labeled. <Badge tone="draft">Draft</Badge> marks content awaiting human theological review.
      </p>
    </div>
  );
}

function expandContext(p: Passage, pad = 4): Passage {
  const s = p.segments[0];
  const e = p.segments[p.segments.length - 1];
  if (s.chapter !== e.chapter) return p;
  const seg = { ...s, start: Math.max(1, s.start - pad), end: Math.min(verseCount(s.book, s.chapter), e.end + pad) };
  return { id: `${p.id}~ctx`, segments: [seg] };
}

function ContextStep({ lesson, passages, onAnswer }: { lesson: L; passages: Passage[]; onAnswer: (q: string, c: boolean) => void }) {
  const { authored, topic } = lesson;
  if (authored) {
    const c = authored.context;
    return (
      <div className="space-y-4">
        <Card className="space-y-3 text-[0.95rem]">
          {[['Author', c.author], ['Audience', c.audience], ['Genre', c.genre], ['Surrounding argument', c.argument]].map(([k, v]) => (
            <div key={k}><p className="text-xs font-bold uppercase tracking-wide text-muted">{k}</p><p className="mt-0.5 leading-relaxed"><Prose text={v} /></p></div>
          ))}
        </Card>
        <div>
          <SectionTitle>Read in sequence</SectionTitle>
          <div className="space-y-2">{c.sequence.map((s) => <SequenceItem key={s.ref} refStr={s.ref} label={s.label} />)}</div>
        </div>
        <SectionTitle>Check your understanding</SectionTitle>
        {authored.contextQuestion.kind === 'mc' && <MCQuestion q={authored.contextQuestion} onAnswer={(ok) => onAnswer(authored.contextQuestion.id, ok)} />}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Study complete literary units, not isolated verses. Here is each passage with the verses around it — open the full chapter for more.</p>
      {passages.map((p) => (
        <Card key={p.id}>
          <p className="mb-1 font-serif font-semibold">{formatPassage(expandContext(p))}</p>
          <ContextVerses passage={p} />
          <Link to={`/passage/${encodeURIComponent(p.id)}`} className="mt-2 inline-block text-sm font-semibold text-accent">Full chapter →</Link>
        </Card>
      ))}
      {topic && <Callout title="Interpretive caution">{topic.caution}</Callout>}
    </div>
  );
}

/** Shows surrounding verses, with the lesson passage emphasized. */
function ContextVerses({ passage }: { passage: Passage }) {
  const ctx = expandContext(passage);
  const s = passage.segments[0];
  const e = passage.segments[passage.segments.length - 1];
  const c = ctx.segments[0];
  const before = { id: 'b', segments: s.start > c.start ? [{ ...c, end: s.start - 1 }] : [] };
  const after = { id: 'a', segments: e.end < c.end && s.chapter === e.chapter ? [{ ...c, start: e.end + 1 }] : [] };
  return (
    <div>
      {before.segments.length > 0 && <VerseBlock passage={before} compact className="text-muted" />}
      <div className="my-1 border-l-4 border-accent pl-3"><VerseBlock passage={passage} /></div>
      {after.segments.length > 0 && <VerseBlock passage={after} compact className="text-muted" />}
    </div>
  );
}

function SequenceItem({ refStr, label }: { refStr: string; label: string }) {
  const [open, setOpen] = useState(false);
  const p = parseReference(refStr);
  return (
    <div className="rounded-xl border border-line bg-surface">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className="font-serif font-semibold">{formatPassage(p)}</span>
        <span className="flex-1 text-sm text-muted">{label}</span>
        <span className="text-muted">{open ? '−' : '+'}</span>
      </button>
      {open && <VerseBlock passage={p} compact className="border-t border-line px-3 pb-3 pt-2" />}
    </div>
  );
}

type Mode = 'read' | 'hide' | 'order' | 'type' | 'ref';
const MODES: { id: Mode; label: string }[] = [
  { id: 'read', label: 'Read & chunk' }, { id: 'hide', label: 'Hide words' }, { id: 'order', label: 'Order phrases' }, { id: 'type', label: 'Type it' }, { id: 'ref', label: 'Reference' },
];

function MemorizeStep({ passages, onTyped, onRef, typed, refs }: {
  passages: Passage[]; onTyped: (p: Passage, a: number, whole: boolean) => void; onRef: (p: Passage, s: number) => void; typed: Record<string, number>; refs: Record<string, number>;
}) {
  const [pi, setPi] = useState(0);
  const [mode, setMode] = useState<Mode>('read');
  const p = passages[pi];
  return (
    <div>
      {passages.length > 1 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          {passages.map((x, i) => <Chip key={x.id} active={i === pi} onClick={() => setPi(i)}>{formatPassage(x)}</Chip>)}
        </div>
      )}
      <div className="mb-4 grid grid-cols-5 gap-1 rounded-xl bg-sunk p-1">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
            className={cx('rounded-lg px-1 py-2 text-[0.7rem] font-semibold leading-tight', mode === m.id ? 'bg-surface text-ink shadow-sm' : 'text-muted')}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2 text-xs">
        <Badge tone={typed[p.id] !== undefined ? (typed[p.id] >= 0.85 ? 'ok' : 'gold') : 'neutral'}>Typed: {pct(typed[p.id])}</Badge>
        <Badge tone={refs[p.id] !== undefined ? (refs[p.id] === 1 ? 'ok' : 'gold') : 'neutral'}>Reference: {pct(refs[p.id])}</Badge>
      </div>
      <div key={`${p.id}-${mode}`}>
        {mode === 'read' && <><p className="mb-2 font-serif text-lg font-semibold">{formatPassage(p)}</p><ReadChunks passage={p} /></>}
        {mode === 'hide' && <><p className="mb-2 font-serif text-lg font-semibold">{formatPassage(p)}</p><ProgressiveHide passage={p} /></>}
        {mode === 'order' && <><p className="mb-2 font-serif text-lg font-semibold">{formatPassage(p)}</p><PhraseOrder passage={p} /></>}
        {mode === 'type' && <TypedRecall passage={p} onResult={(a, whole) => onTyped(p, a, whole)} />}
        {mode === 'ref' && <RefRecall passage={p} onResult={(g) => onRef(p, g.score)} />}
      </div>
    </div>
  );
}

function ConnectStep({ lessonKey, lesson, onMatch }: { lessonKey: string; lesson: L; onMatch: (s: number) => void }) {
  const { authored, topic } = lesson;
  const seqRefs = new Set((authored?.connect.sequence ?? []).map((x) => parseReference(x.ref).id));
  const others: CrossRef[] = (topic?.crossRefs ?? []).filter((x) => !seqRefs.has(parseReference(x.ref).id));
  const main = others.filter((x) => !x.challenge);
  const challenges = others.filter((x) => x.challenge);
  const autoPairs = main.slice(0, 4).map((x) => ({ ref: x.ref, argument: x.label.charAt(0).toUpperCase() + x.label.slice(1) }));
  return (
    <div className="space-y-4">
      {authored ? (
        <>
          <p className="text-sm text-muted">{authored.connect.intro}</p>
          <div className="space-y-2">{authored.connect.sequence.map((x) => <CrossRefItem key={x.ref} x={x} />)}</div>
          {authored.connect.match && <MatchExercise prompt={authored.connect.match.prompt} pairs={authored.connect.match.pairs} seed={lessonKey} onScore={onMatch} />}
        </>
      ) : (
        <>
          <p className="text-sm text-muted">Each link states its relationship type. Connections are reasons to read further, not automatic proof of a doctrine.</p>
          {autoPairs.length >= 3 && <MatchExercise prompt="Match each passage to the theme it connects to." pairs={autoPairs} seed={lessonKey} onScore={onMatch} />}
        </>
      )}
      {main.length > 0 && (
        <div>
          <SectionTitle>{authored ? 'More connections from the topic' : 'Cross-references'}</SectionTitle>
          <div className="space-y-2">{main.map((x) => <CrossRefItem key={x.ref} x={x} />)}</div>
        </div>
      )}
      {topic && (
        <div>
          <SectionTitle>Interpretive comparison / caution</SectionTitle>
          <Callout title="Caution">{topic.caution}</Callout>
          <div className="mt-2 space-y-2">{challenges.map((x) => <CrossRefItem key={x.ref} x={x} />)}</div>
        </div>
      )}
    </div>
  );
}

function ApplyStep({ lessonKey, lesson }: { lessonKey: string; lesson: L }) {
  const { authored, topic } = lesson;
  const st = useStudy();
  const [text, setText] = useState(st.reflections[`${lessonKey}:apply`] ?? '');
  const [synth, setSynth] = useState(st.reflections[`${lessonKey}:synthesis`] ?? '');
  const [showFb, setShowFb] = useState(false);
  const [showSynth, setShowSynth] = useState(false);
  return (
    <div className="space-y-4">
      {authored ? (
        <>
          <Card>
            <Badge>Scenario</Badge>
            <p className="mt-2 font-serif text-lg leading-snug">{authored.apply.scenario}</p>
            <p className="mt-2 font-semibold">{authored.apply.prompt}</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => st.saveReflection(`${lessonKey}:apply`, text)} rows={4}
              className="mt-3 w-full rounded-xl border border-line bg-paper p-3 text-[0.95rem] outline-none focus:border-accent" placeholder="Your response…" />
            {!showFb ? (
              <Button variant="secondary" className="mt-2 w-full" disabled={text.trim().length < 10} onClick={() => { st.saveReflection(`${lessonKey}:apply`, text); setShowFb(true); }}>See feedback</Button>
            ) : (
              <div className="mt-3 grid gap-2">
                <Callout tone="ok" title="Textual support — what the passage says">
                  <ul className="list-disc space-y-1 pl-4">{authored.apply.textual.map((t) => <li key={t}><Prose text={t} /></li>)}</ul>
                </Callout>
                <Callout title="Interpretation — where judgment is involved">
                  <ul className="list-disc space-y-1 pl-4">{authored.apply.interpretive.map((t) => <li key={t}><Prose text={t} /></li>)}</ul>
                </Callout>
                <p className="text-xs text-muted">Personal application is not graded.</p>
              </div>
            )}
          </Card>
          <Card>
            <Badge tone="interp">Synthesis</Badge>
            <p className="mt-2 font-semibold">{authored.synthesis.prompt}</p>
            <textarea value={synth} onChange={(e) => setSynth(e.target.value)} onBlur={() => st.saveReflection(`${lessonKey}:synthesis`, synth)} rows={4}
              className="mt-3 w-full rounded-xl border border-line bg-paper p-3 text-[0.95rem] outline-none focus:border-accent" placeholder="Explain how the passages relate…" />
            {!showSynth ? (
              <Button variant="secondary" className="mt-2 w-full" disabled={synth.trim().length < 10} onClick={() => setShowSynth(true)}>Compare & see perspectives</Button>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-sunk p-3 text-sm"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Sample reasoning</p><Prose text={authored.synthesis.sample} /></div>
                <Perspectives items={authored.synthesis.perspectives} />
              </div>
            )}
          </Card>
          <Callout title="Interpretive note"><Prose text={authored.interpretiveNote} /></Callout>
        </>
      ) : topic && (
        <>
          <Card>
            <Badge>Understanding exercise</Badge>
            <p className="mt-2 font-serif text-lg leading-snug">{topic.exercise}</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => st.saveReflection(`${lessonKey}:apply`, text)} rows={5}
              className="mt-3 w-full rounded-xl border border-line bg-paper p-3 text-[0.95rem] outline-none focus:border-accent" placeholder="Write your response, citing passages…" />
            <p className="mt-2 text-xs text-muted">Saved on this device. Cite references so you can distinguish what the text says from your interpretation.</p>
          </Card>
          <Callout title="Keep in mind">{topic.caution}</Callout>
          {topic.doctrineId && <Link to={`/doctrine/${topic.doctrineId}`}><Card className="mt-2"><p className="font-semibold">Open in Doctrine Explorer →</p><p className="text-sm text-muted">Explicit texts, inferred synthesis, disputed readings, and challenge passages.</p></Card></Link>}
        </>
      )}
    </div>
  );
}

function ReviewStep({ lessonKey, passages, typed, refs, answers, matchScore, onFinish }: {
  lessonKey: string; passages: Passage[]; typed: Record<string, number>; refs: Record<string, number>; answers: Record<string, boolean>; matchScore: number | null; onFinish: () => void;
}) {
  const st = useStudy();
  const [ratings, setRatings] = useState<Record<string, Grade>>({});
  const items = passages.flatMap((p) => [
    { id: cardId('text', p.id), label: `${formatPassage(p)} — words`, score: typed[p.id] ?? st.textMastery[p.id] },
    { id: cardId('ref', p.id), label: `${formatPassage(p)} — reference`, score: refs[p.id] ?? st.refMastery[p.id] },
  ]);
  const qids = Object.keys(answers);
  const correct = qids.filter((q) => answers[q]).length;

  const finish = () => {
    const all = items.map((i) => ({ ...i, rating: ratings[i.id] ?? (i.score !== undefined ? suggestRating(i.score) : Rating.Again) }));
    st.ensureCards([...all.map((a) => a.id), ...qids.map((q) => cardId('q', q))]);
    all.forEach((a) => st.rate(a.id, a.rating, a.score));
    qids.forEach((q) => st.rate(cardId('q', q), answers[q] ? Rating.Good : Rating.Again, answers[q] ? 1 : 0));
    onFinish();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Text recall" value={avg(passages.map((p) => typed[p.id]))} />
        <Stat label="Reference recall" value={avg(passages.map((p) => refs[p.id]))} />
        <Stat label="Understanding" value={qids.length ? correct / qids.length : undefined} />
        <Stat label="Cross-reference" value={matchScore ?? undefined} />
      </div>
      <p className="text-sm text-muted">Rate how well you know each item. The suggestion comes from your scores; choose what feels true. Recall and understanding are scheduled separately.</p>
      {items.map((i) => {
        const card = st.cards[i.id] ?? newCard();
        const prev = previewIntervals(card);
        const suggested = i.score !== undefined ? suggestRating(i.score) : undefined;
        const chosen = ratings[i.id] ?? suggested;
        return (
          <Card key={i.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold">{i.label}</span>
              <span className="text-xs text-muted">{i.score !== undefined ? pct(i.score) : 'not practiced'}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).map((r) => (
                <button key={r} onClick={() => setRatings({ ...ratings, [i.id]: r })} aria-pressed={chosen === r}
                  className={cx('rounded-lg border py-1.5 text-xs font-semibold', chosen === r ? 'border-accent bg-accent text-surface dark:text-paper' : 'border-line bg-paper')}>
                  {['', 'Again', 'Hard', 'Good', 'Easy'][r]}<br /><span className="font-normal opacity-80">{humanInterval(prev[r])}</span>
                </button>
              ))}
            </div>
          </Card>
        );
      })}
      {qids.length > 0 && (
        <p className="text-sm text-muted">{correct}/{qids.length} understanding questions correct — {qids.length - correct ? 'missed ones will come back soon.' : 'they’ll return for spaced review.'}</p>
      )}
      <Button className="w-full" onClick={finish}>Finish lesson & schedule reviews</Button>
    </div>
  );
}

const avg = (xs: (number | undefined)[]) => {
  const v = xs.filter((x): x is number => x !== undefined);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined;
};
function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value === undefined ? '—' : pct(value)}</p>
    </div>
  );
}

export type { Topic };
