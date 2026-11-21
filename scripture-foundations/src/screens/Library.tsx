import { Link, useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, categoryById, lessonKeyForTopic, lessonById, topicById, topicsInCategory } from '../content';
import { formatRef, parseReference } from '../bible/reference';
import { useStudy } from '../study/store';
import { Badge, Button, Callout, Card, Header, Meter, Page, SectionTitle, pct } from '../components/ui';
import { CrossRefItem, PassageCard } from '../components/Scripture';

export function Library() {
  const st = useStudy();
  return (
    <>
      <Header title="Library" subtitle="Seven categories · 30 topics"
        right={<Link to="/search" className="text-sm font-semibold text-accent">Search</Link>} />
      <Page>
        <div className="space-y-3">
          {CATEGORIES.map((c) => {
            const ts = topicsInCategory(c.id);
            const done = ts.filter((t) => st.lessons[lessonKeyForTopic(t)]?.completedAt).length;
            return (
              <Link key={c.id} to={`/category/${c.id}`} className="block rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-serif text-lg font-semibold text-white" style={{ background: c.color }}>{c.id}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{c.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{c.summary}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1"><Meter value={done / ts.length} color={c.color} compact /></div>
                      <span className="text-xs tabular-nums text-muted">{done}/{ts.length}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Page>
    </>
  );
}

export function CategoryView() {
  const { id } = useParams();
  const c = categoryById(Number(id));
  const st = useStudy();
  if (!c) return null;
  return (
    <>
      <Header title={c.title} subtitle={`Category ${c.id}`} back />
      <Page>
        <p className="mb-4 text-muted">{c.summary}</p>
        <div className="space-y-2">
          {topicsInCategory(c.id).map((t) => {
            const key = lessonKeyForTopic(t);
            const prog = st.lessons[key];
            return (
              <Link key={t.id} to={`/topic/${t.id}`} className="block rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tabular-nums" style={{ color: c.color }}>{t.id}</span>
                  <span className="flex-1 font-semibold">{t.title}</span>
                  {prog?.completedAt ? <Badge tone="ok">Done</Badge> : prog ? <Badge tone="gold">In progress</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{t.objective}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.memorize.map((r) => <Badge key={r} tone="scripture">{formatRef(r)}</Badge>)}
                  {t.lessonId && <Badge tone="gold">Full lesson</Badge>}
                  {t.doctrineId && <Badge tone="interp">Doctrine</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      </Page>
    </>
  );
}

export function TopicView() {
  const { id = '' } = useParams();
  const t = topicById(id);
  const nav = useNavigate();
  const st = useStudy();
  if (!t) return null;
  const c = categoryById(t.categoryId);
  const key = lessonKeyForTopic(t);
  const prog = st.lessons[key];
  const lesson = t.lessonId ? lessonById(t.lessonId) : undefined;
  const main = t.crossRefs.filter((x) => !x.challenge);
  const challenges = t.crossRefs.filter((x) => x.challenge);
  return (
    <>
      <Header title={t.title} subtitle={`${t.id} · ${c.title}`} back />
      <Page>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Learning objective</p>
          <p className="mt-1 text-lg font-semibold leading-snug">{t.objective}</p>
          <Button className="mt-3 w-full" onClick={() => nav(`/lesson/${key}`)}>
            {prog?.completedAt ? 'Study again' : prog ? 'Continue lesson' : lesson ? 'Start full lesson' : 'Start guided lesson'}
          </Button>
          {lesson && <p className="mt-2 text-center text-xs text-muted">Shared lesson: {lesson.title}</p>}
        </Card>

        <SectionTitle>Primary memorization passages</SectionTitle>
        <div className="space-y-3">
          {t.memorize.map((r) => {
            const p = parseReference(r);
            return (
              <PassageCard key={r} passage={p}>
                <div className="mt-2 flex gap-2 text-xs">
                  <Badge tone="neutral">Words {pct(st.textMastery[p.id])}</Badge>
                  <Badge tone="neutral">Reference {pct(st.refMastery[p.id])}</Badge>
                </div>
              </PassageCard>
            );
          })}
        </div>

        <SectionTitle>Cross-references and connections</SectionTitle>
        <div className="space-y-2">{main.map((x) => <CrossRefItem key={x.ref} x={x} />)}</div>

        <SectionTitle>Interpretive comparison / caution</SectionTitle>
        <Callout title="Caution">{t.caution}</Callout>
        {challenges.length > 0 && <div className="mt-2 space-y-2">{challenges.map((x) => <CrossRefItem key={x.ref} x={x} />)}</div>}

        <SectionTitle>Understanding exercise</SectionTitle>
        <Card><p>{t.exercise}</p></Card>
        {t.doctrineId && (
          <Link to={`/doctrine/${t.doctrineId}`} className="mt-3 block"><Card><p className="font-semibold text-interp">Open in Doctrine Explorer →</p></Card></Link>
        )}
      </Page>
    </>
  );
}
