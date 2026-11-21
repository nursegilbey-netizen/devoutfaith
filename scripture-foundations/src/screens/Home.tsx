import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, LESSONS, TOPICS, lessonKeyForTopic, resolveLesson, topicsInCategory } from '../content';
import { formatRef } from '../bible/reference';
import { dueCardIds, masterySummary, streak, todayKey, useStudy } from '../study/store';
import { Badge, Button, Card, Header, Meter, Page, SectionTitle } from '../components/ui';

export default function Home() {
  const st = useStudy();
  const nav = useNavigate();
  const due = dueCardIds(st);
  const s = streak(st.activityDays);
  const m = masterySummary(st);
  const today = todayKey();
  const lessonsToday = Object.values(st.lessons).filter((l) => l.completedAt && todayKey(new Date(l.completedAt)) === today).length;
  const reviewsToday = st.events.filter((e) => todayKey(new Date(e.at)) === today).length;
  const last = st.lastLesson ? resolveLesson(st.lastLesson) : null;
  const lastDone = st.lastLesson ? st.lessons[st.lastLesson]?.completedAt : undefined;
  const nextTopic = TOPICS.find((t) => !st.lessons[lessonKeyForTopic(t)]?.completedAt);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <Header title="Scripture Foundations" subtitle={greet}
        right={
          <div className="flex items-center gap-1">
            <Link to="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sunk">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            </Link>
            <Link to="/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sunk">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
            </Link>
          </div>
        } />
      <Page>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-ink p-3 text-paper">
            <p className="text-[0.7rem] uppercase tracking-wide opacity-70">Streak</p>
            <p className="text-3xl font-semibold tabular-nums">{s}<span className="ml-1 text-sm font-normal opacity-70">day{s === 1 ? '' : 's'}</span></p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3">
            <p className="text-[0.7rem] uppercase tracking-wide text-muted">Reviews today</p>
            <p className="text-3xl font-semibold tabular-nums">{reviewsToday}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3">
            <p className="text-[0.7rem] uppercase tracking-wide text-muted">Lessons</p>
            <p className="text-3xl font-semibold tabular-nums">{lessonsToday}<span className="text-sm font-normal text-muted">/{st.settings.dailyLessonGoal}</span></p>
          </div>
        </div>

        <Card className="mt-3 border-accent/30 bg-accent-soft">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold">{due.length ? `${due.length} review${due.length === 1 ? '' : 's'} due` : 'No reviews due'}</p>
              <p className="text-sm text-muted">{due.length ? 'Text, reference, and understanding — each scheduled on its own.' : 'Finish a lesson to start building your review queue.'}</p>
            </div>
            <Button onClick={() => nav('/review')} disabled={!due.length}>Review</Button>
          </div>
        </Card>

        {last && !lastDone ? (
          <Card className="mt-3" onClick={() => nav(`/lesson/${st.lastLesson}`)}>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Continue</p>
            <p className="mt-0.5 font-semibold">{last.title}</p>
            <p className="text-sm text-muted">{last.memorize.map(formatRef).join(' · ')}</p>
          </Card>
        ) : nextTopic && (
          <Card className="mt-3" onClick={() => nav(`/lesson/${lessonKeyForTopic(nextTopic)}`)}>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Up next · Topic {nextTopic.id}</p>
            <p className="mt-0.5 font-semibold">{nextTopic.title}</p>
            <p className="text-sm text-muted">{nextTopic.memorize.map(formatRef).join(' · ')}</p>
          </Card>
        )}

        <SectionTitle action={<Link to="/progress" className="text-xs font-semibold text-accent">Details</Link>}>Four competencies</SectionTitle>
        <Card className="grid grid-cols-2 gap-x-5 gap-y-3">
          <Meter label="Text recall" value={m.text} />
          <Meter label="Reference recall" value={m.ref} color="var(--gold)" />
          <Meter label="Understanding" value={m.comprehension} color="var(--ok)" />
          <Meter label="Cross-reference" value={m.crossRef} color="var(--interp)" />
        </Card>

        <SectionTitle>Featured lessons</SectionTitle>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {LESSONS.map((l) => (
            <button key={l.id} onClick={() => nav(`/lesson/${l.id}`)}
              className="w-64 shrink-0 snap-start rounded-2xl border border-line bg-surface p-4 text-left">
              <Badge tone="gold">Full lesson</Badge>
              <p className="mt-2 font-serif text-lg font-semibold leading-snug">{l.memorize.map(formatRef).join(' + ')}</p>
              <p className="mt-1 text-sm text-muted">{l.title}</p>
              {st.lessons[l.id]?.completedAt && <p className="mt-2 text-xs font-semibold text-ok">✓ Completed</p>}
            </button>
          ))}
        </div>

        <SectionTitle action={<Link to="/library" className="text-xs font-semibold text-accent">Library</Link>}>Categories</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const ts = topicsInCategory(c.id);
            const done = ts.filter((t) => st.lessons[lessonKeyForTopic(t)]?.completedAt).length;
            return (
              <Link key={c.id} to={`/category/${c.id}`} className="rounded-2xl border border-line bg-surface p-3">
                <div className="mb-2 h-1 w-8 rounded-full" style={{ background: c.color }} />
                <p className="text-sm font-semibold leading-tight">{c.title}</p>
                <p className="mt-1 text-xs text-muted">{done}/{ts.length} topics</p>
                <div className="mt-2"><Meter value={done / ts.length} color={c.color} compact /></div>
              </Link>
            );
          })}
        </div>
      </Page>
    </>
  );
}
