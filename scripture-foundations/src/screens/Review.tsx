import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPassage, passageFromId } from '../bible/reference';
import { lessonForQuestion, questionById } from '../content';
import { cardKey, cardKind, humanInterval, newCard, previewIntervals, Rating, suggestRating, type Grade } from '../study/scheduler';
import { dueCardIds, kindLabel, useStudy } from '../study/store';
import { Badge, Button, Card, cx, Header, Page, pct } from '../components/ui';
import { RefRecall, TypedRecall, ProgressiveHide } from '../components/memorize';
import { MCQuestion } from '../components/assess';
import { VerseBlock } from '../components/Scripture';

export default function Review() {
  const st = useStudy();
  const nav = useNavigate();
  // Freeze the queue at session start so re-scheduled learning cards don't jump around mid-session.
  const [queue] = useState(() => dueCardIds(useStudy.getState()));
  const [i, setI] = useState(0);
  const [score, setScore] = useState<number | undefined>();
  const [done, setDone] = useState<{ id: string; rating: Grade }[]>([]);
  const id = queue[i];

  const counts = useMemo(() => {
    const c = { text: 0, ref: 0, q: 0 };
    queue.forEach((q) => c[cardKind(q)]++);
    return c;
  }, [queue]);

  if (!queue.length || i >= queue.length) {
    const ok = done.filter((d) => d.rating !== Rating.Again).length;
    return (
      <>
        <Header title="Review" />
        <Page>
          <Card className="text-center">
            <p className="font-serif text-2xl font-semibold">{done.length ? 'Session complete' : 'All caught up'}</p>
            <p className="mt-2 text-muted">
              {done.length ? `${done.length} reviewed · ${ok} recalled · ${done.length - ok} to relearn soon.` : 'Nothing is due right now. Complete a lesson or add passages from the passage viewer.'}
            </p>
            <Button className="mt-4" onClick={() => nav('/')}>Back to dashboard</Button>
          </Card>
          <p className="mt-4 text-center text-xs text-muted">Daily review cap: {st.settings.dailyReviewCap} · change it in <Link className="text-accent" to="/settings">Settings</Link>.</p>
        </Page>
      </>
    );
  }

  const kind = cardKind(id);
  const key = cardKey(id);
  const card = st.cards[id] ?? newCard();
  const prev = previewIntervals(card);
  const suggested = score !== undefined ? suggestRating(score) : undefined;

  const rate = (r: Grade) => {
    st.rate(id, r, score);
    setDone([...done, { id, rating: r }]);
    setScore(undefined);
    setI(i + 1);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Header title="Review" subtitle={`${i + 1} of ${queue.length} · ${counts.text} text · ${counts.ref} reference · ${counts.q} understanding`}>
        <div className="mx-auto h-1 max-w-2xl bg-sunk"><div className="h-full bg-accent transition-all" style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      </Header>
      <Page key={id}>
        <div className="mb-3 flex items-center gap-2">
          <Badge tone={kind === 'q' ? 'interp' : kind === 'ref' ? 'gold' : 'scripture'}>{kindLabel(id)}</Badge>
          {card.lapses > 0 && <Badge tone="bad">Lapsed ×{card.lapses}</Badge>}
        </div>
        {kind === 'text' && <TextCard passageId={key} onScore={setScore} />}
        {kind === 'ref' && <RefRecall passage={passageFromId(key)} onResult={(g) => setScore(g.score)} />}
        {kind === 'q' && <QuestionCard qid={key} onScore={setScore} />}

        <div className="mt-6">
          <p className="mb-2 text-center text-xs text-muted">
            {score !== undefined ? <>Score {pct(score)} — suggested rating highlighted.</> : 'Answer first, or rate from memory.'}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).map((r) => (
              <button key={r} onClick={() => rate(r)}
                className={cx('rounded-xl border py-2.5 text-sm font-semibold transition',
                  suggested === r ? 'border-accent bg-accent text-surface dark:text-paper' : 'border-line bg-surface hover:bg-sunk')}>
                {['', 'Again', 'Hard', 'Good', 'Easy'][r]}
                <span className="block text-xs font-normal opacity-75">{humanInterval(prev[r])}</span>
              </button>
            ))}
          </div>
        </div>
      </Page>
    </>
  );
}

function TextCard({ passageId, onScore }: { passageId: string; onScore: (s: number) => void }) {
  const p = passageFromId(passageId);
  const st = useStudy();
  const [hint, setHint] = useState(false);
  const [peek, setPeek] = useState(false);
  return (
    <div>
      <p className="mb-1 font-serif text-2xl font-semibold">{formatPassage(p)}</p>
      <p className="mb-3 text-sm text-muted">Type the passage from memory.</p>
      <TypedRecall passage={p} hideReference onResult={(a, whole) => { onScore(a); if (whole) st.recordText(p.id, a); }} />
      <div className="mt-3 flex gap-2">
        <Button small variant="ghost" onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Hint (50% hidden)'}</Button>
        <Button small variant="ghost" onClick={() => setPeek(!peek)}>{peek ? 'Hide text' : 'Show text'}</Button>
      </div>
      {hint && <div className="mt-2"><ProgressiveHide passage={p} sessionSeed="review" /></div>}
      {peek && <div className="mt-2 rounded-xl border border-line bg-surface p-3"><VerseBlock passage={p} /></div>}
    </div>
  );
}

function QuestionCard({ qid, onScore }: { qid: string; onScore: (s: number) => void }) {
  const q = questionById(qid);
  const lesson = lessonForQuestion(qid);
  const st = useStudy();
  if (!q) return <p className="text-muted">This question is no longer in the curriculum. Rate it to clear it.</p>;
  return (
    <div>
      {lesson && <p className="mb-2 text-sm text-muted">From: {lesson.title}</p>}
      {q.kind === 'mc' ? (
        <MCQuestion q={q} onAnswer={(c) => { onScore(c ? 1 : 0); st.recordQuestion(qid, c); }} />
      ) : (
        <Card><p>{q.stem}</p></Card>
      )}
    </div>
  );
}
