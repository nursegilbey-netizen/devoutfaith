import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchText } from '../bible/bible';
import { BOOKS } from '../bible/books';
import { formatPassage, passageId, tryParseReference } from '../bible/reference';
import { DOCTRINES, TOPICS } from '../content';
import { Badge, Chip, Header, Page, SectionTitle } from '../components/ui';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [testament, setTestament] = useState<'OT' | 'NT' | undefined>();
  const nav = useNavigate();
  const term = q.trim();
  const ref = useMemo(() => (/\d/.test(term) ? tryParseReference(term) : null), [term]);
  const topics = term.length > 2 ? TOPICS.filter((t) => `${t.title} ${t.objective} ${t.crossRefs.map((x) => x.label).join(' ')}`.toLowerCase().includes(term.toLowerCase())) : [];
  const doctrines = term.length > 2 ? DOCTRINES.filter((d) => `${d.title} ${d.question}`.toLowerCase().includes(term.toLowerCase())) : [];
  const verses = useMemo(() => (term.length > 2 && !ref ? searchText(term, 80, testament) : []), [term, ref, testament]);

  return (
    <>
      <Header title="Search" back>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setParams({ q: e.target.value }, { replace: true }); }}
            placeholder="Reference (John 3:16), word, or doctrine"
            className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none focus:border-accent"
            onKeyDown={(e) => { if (e.key === 'Enter' && ref) nav(`/passage/${encodeURIComponent(ref.id)}`); }} />
        </div>
      </Header>
      <Page>
        {ref && (
          <Link to={`/passage/${encodeURIComponent(ref.id)}`} className="block rounded-2xl border border-accent/40 bg-accent-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">Open reference</p>
            <p className="font-serif text-xl font-semibold">{formatPassage(ref)}</p>
          </Link>
        )}
        {topics.length > 0 && (
          <>
            <SectionTitle>Topics</SectionTitle>
            <div className="space-y-2">
              {topics.map((t) => (
                <Link key={t.id} to={`/topic/${t.id}`} className="block rounded-xl border border-line bg-surface p-3">
                  <span className="mr-2 text-xs font-bold text-muted">{t.id}</span><span className="font-semibold">{t.title}</span>
                </Link>
              ))}
            </div>
          </>
        )}
        {doctrines.length > 0 && (
          <>
            <SectionTitle>Doctrines</SectionTitle>
            {doctrines.map((d) => <Link key={d.id} to={`/doctrine/${d.id}`} className="mb-2 block rounded-xl border border-line bg-surface p-3 font-semibold">{d.title}</Link>)}
          </>
        )}
        {term.length > 2 && !ref && (
          <>
            <SectionTitle>Verses containing “{term}”</SectionTitle>
            <div className="mb-2 flex gap-1.5">
              <Chip active={!testament} onClick={() => setTestament(undefined)}>All</Chip>
              <Chip active={testament === 'OT'} onClick={() => setTestament('OT')}>Old Testament</Chip>
              <Chip active={testament === 'NT'} onClick={() => setTestament('NT')}>New Testament</Chip>
            </div>
            {verses.length === 0 && <p className="text-sm text-muted">No verses found.</p>}
            <div className="space-y-2">
              {verses.map((v) => {
                const id = passageId([{ book: v.book, chapter: v.chapter, start: v.verse, end: v.verse }]);
                return (
                  <Link key={id} to={`/passage/${encodeURIComponent(id)}`} className="block rounded-xl border border-line bg-surface p-3">
                    <p className="text-sm font-semibold text-accent">{BOOKS[v.book].name === 'Psalms' ? 'Psalm' : BOOKS[v.book].name} {v.chapter}:{v.verse}</p>
                    <p className="font-serif text-[0.95rem] leading-relaxed">{highlight(v.text, term)}</p>
                  </Link>
                );
              })}
              {verses.length === 80 && <p className="text-center text-xs text-muted">Showing first 80 matches — refine your search.</p>}
            </div>
          </>
        )}
        {term.length <= 2 && (
          <div className="space-y-2 text-sm text-muted">
            <p>Try: <button className="text-accent" onClick={() => setQ('Ephesians 2:8-10')}>Ephesians 2:8-10</button>, <button className="text-accent" onClick={() => setQ('sabbath')}>sabbath</button>, <button className="text-accent" onClick={() => setQ('grace')}>grace</button></p>
            <p><Badge>Tip</Badge> Abbreviations work: “1 Jn 1:9”, “Ps 23”, “Rom 6:23”.</p>
          </div>
        )}
      </Page>
    </>
  );
}

function highlight(text: string, term: string) {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(re).map((part, i) => (words.includes(part.toLowerCase()) ? <mark key={i} className="rounded bg-gold/25 px-0.5 text-ink">{part}</mark> : part));
}
