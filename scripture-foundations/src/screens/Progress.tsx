import { Link } from 'react-router-dom';
import { CATEGORIES, lessonKeyForTopic, memorizationPassages, topicsInCategory } from '../content';
import { formatPassage } from '../bible/reference';
import { cardId, State } from '../study/scheduler';
import { masterySummary, todayKey, useStudy } from '../study/store';
import { Card, Header, Meter, Page, SectionTitle, pct } from '../components/ui';

export default function Progress() {
  const st = useStudy();
  const m = masterySummary(st);
  const cards = Object.values(st.cards);
  const now = new Date();
  const due = cards.filter((c) => new Date(c.due) <= now).length;
  const mature = cards.filter((c) => c.state === State.Review && c.stability >= 21).length;

  // 14-day retention trend
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = todayKey(d);
    const ev = st.events.filter((e) => todayKey(new Date(e.at)) === k);
    return { k, n: ev.length, ok: ev.filter((e) => e.rating !== 1).length, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });
  const maxN = Math.max(1, ...days.map((d) => d.n));
  const studied = memorizationPassages().filter((p) => st.textMastery[p.id] !== undefined || st.refMastery[p.id] !== undefined || st.cards[cardId('text', p.id)]);

  return (
    <>
      <Header title="Progress" subtitle="Each competency is tracked independently" />
      <Page>
        <Card className="grid gap-3">
          <Meter label="Text recall — exact wording" value={m.text} />
          <Meter label="Reference recall — book, chapter, verses" value={m.ref} color="var(--gold)" />
          <Meter label="Context comprehension" value={m.comprehension} color="var(--ok)" />
          <Meter label="Cross-reference reasoning" value={m.crossRef} color="var(--interp)" />
          <p className="text-xs text-muted">You can master one dimension without the others — that’s by design.</p>
        </Card>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Card><p className="text-2xl font-semibold tabular-nums">{cards.length}</p><p className="text-xs text-muted">review cards</p></Card>
          <Card><p className="text-2xl font-semibold tabular-nums">{due}</p><p className="text-xs text-muted">due now</p></Card>
          <Card><p className="text-2xl font-semibold tabular-nums">{mature}</p><p className="text-xs text-muted">mature (21d+)</p></Card>
        </div>

        <SectionTitle>Retention — last 14 days</SectionTitle>
        <Card>
          <svg viewBox="0 0 280 110" className="w-full" role="img" aria-label="Reviews per day, recalled versus forgotten">
            {days.map((d, i) => {
              const x = i * 20 + 4;
              const h = (d.n / maxN) * 80;
              const hOk = (d.ok / maxN) * 80;
              return (
                <g key={d.k}>
                  <rect x={x} y={90 - h} width={12} height={h} rx={2} fill="var(--bad)" opacity={0.35} />
                  <rect x={x} y={90 - hOk} width={12} height={hOk} rx={2} fill="var(--ok)" />
                  <text x={x + 6} y={104} textAnchor="middle" fontSize="8" fill="var(--muted)">{d.label}</text>
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-xs text-muted"><span className="text-ok">■</span> recalled · <span className="text-bad opacity-60">■</span> forgot (Again)</p>
        </Card>

        <SectionTitle>Category coverage</SectionTitle>
        <Card className="grid gap-3">
          {CATEGORIES.map((c) => {
            const ts = topicsInCategory(c.id);
            const done = ts.filter((t) => st.lessons[lessonKeyForTopic(t)]?.completedAt).length;
            return <Link key={c.id} to={`/category/${c.id}`}><Meter label={c.title} value={done / ts.length} color={c.color} /></Link>;
          })}
        </Card>

        <SectionTitle>Passages</SectionTitle>
        {studied.length === 0 ? <p className="text-sm text-muted">No passages practiced yet.</p> : (
          <Card className="divide-y divide-line !p-0">
            {studied.map((p) => {
              const c = st.cards[cardId('text', p.id)];
              return (
                <Link key={p.id} to={`/passage/${encodeURIComponent(p.id)}`} className="flex items-center gap-2 px-4 py-3">
                  <span className="flex-1 font-serif font-semibold">{formatPassage(p)}</span>
                  <span className="w-14 text-right text-xs tabular-nums text-muted">W {pct(st.textMastery[p.id])}</span>
                  <span className="w-14 text-right text-xs tabular-nums text-muted">R {pct(st.refMastery[p.id])}</span>
                  <span className="w-16 text-right text-xs text-muted">{c ? new Date(c.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</span>
                </Link>
              );
            })}
          </Card>
        )}
      </Page>
    </>
  );
}
