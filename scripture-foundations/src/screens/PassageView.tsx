import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { chapterVerses, currentTranslation, OMITTED_NOTE } from '../bible/bible';
import { BOOKS, chapterCount } from '../bible/books';
import { formatPassage, passageFromId, validatePassage, type Passage } from '../bible/reference';
import { linksFor, topicsForPassage } from '../content';
import { REL_LABELS, type RelType } from '../content/types';
import { cardId } from '../study/scheduler';
import { useStudy } from '../study/store';
import { Badge, Button, Chip, cx, Header, Page, SectionTitle } from '../components/ui';
import { CrossRefItem, VerseBlock } from '../components/Scripture';

export default function PassageView() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const passage = useMemo<Passage | null>(() => {
    try {
      const p = passageFromId(decodeURIComponent(id));
      return validatePassage(p).length ? null : p;
    } catch { return null; }
  }, [id]);
  const [full, setFull] = useState(false);
  const [typeFilter, setTypeFilter] = useState<RelType | 'all'>('all');
  const [testament, setTestament] = useState<'all' | 'OT' | 'NT'>('all');
  const st = useStudy();

  if (!passage) return <><Header title="Passage" back /><Page><p>That reference could not be found.</p></Page></>;

  const seg = passage.segments[0];
  const links = linksFor(passage);
  const types = [...new Set(links.map((l) => l.xref.type))];
  const filtered = links.filter((l) => {
    const other = l.direction === 'out' ? l.to : l.from;
    return (typeFilter === 'all' || l.xref.type === typeFilter) && (testament === 'all' || BOOKS[other.segments[0].book].testament === testament);
  });
  const topics = topicsForPassage(passage);
  const inReview = !!st.cards[cardId('text', passage.id)];
  const chapters = [...new Set(passage.segments.map((s) => `${s.book}:${s.chapter}`))];

  const goChapter = (delta: number) => {
    let b = seg.book, c = seg.chapter + delta;
    if (c < 1) { b = Math.max(0, b - 1); c = chapterCount(b); }
    if (c > chapterCount(b)) { b = Math.min(65, b + 1); c = 1; }
    nav(`/passage/${encodeURIComponent(`${BOOKS[b].code}.${c}.1-${chapterVerses(b, c).length}`)}`, { replace: true });
  };

  return (
    <>
      <Header title={formatPassage(passage)} subtitle={currentTranslation().name} back
        right={<Badge tone="scripture">{currentTranslation().abbreviation}</Badge>} />
      <Page>
        <div className="mb-3 flex items-center gap-2">
          <Chip active={!full} onClick={() => setFull(false)}>Passage</Chip>
          <Chip active={full} onClick={() => setFull(true)}>Full chapter</Chip>
          <div className="flex-1" />
          <button onClick={() => goChapter(-1)} aria-label="Previous chapter" className="grid h-9 w-9 place-items-center rounded-full border border-line">‹</button>
          <button onClick={() => goChapter(1)} aria-label="Next chapter" className="grid h-9 w-9 place-items-center rounded-full border border-line">›</button>
        </div>

        {!full ? (
          <div className="rounded-2xl border border-line bg-surface p-4"><VerseBlock passage={passage} /></div>
        ) : (
          chapters.map((k) => {
            const [b, c] = k.split(':').map(Number);
            return (
              <div key={k} className="mb-3 rounded-2xl border border-line bg-surface p-4">
                <p className="mb-2 font-serif font-semibold">{BOOKS[b].name === 'Psalms' ? 'Psalm' : BOOKS[b].name} {c}</p>
                <p className="scripture">
                  {chapterVerses(b, c).map((v) => {
                    const hit = passage.segments.some((s) => s.book === b && s.chapter === c && v.verse >= s.start && v.verse <= s.end);
                    return (
                      <span key={v.verse} className={cx(hit && 'rounded bg-gold/15 box-decoration-clone px-0.5')}>
                        <sup>{v.verse}</sup>{v.omitted ? <i className="font-sans text-sm text-muted" title={OMITTED_NOTE}>[not in the {currentTranslation().abbreviation}] </i> : <>{v.text}{' '}</>}
                      </span>
                    );
                  })}
                </p>
              </div>
            );
          })
        )}

        <div className="mt-3 flex gap-2">
          <Button variant={inReview ? 'secondary' : 'primary'} small disabled={inReview}
            onClick={() => st.ensureCards([cardId('text', passage.id), cardId('ref', passage.id)])}>
            {inReview ? '✓ In your review queue' : 'Add to my reviews'}
          </Button>
        </div>

        {topics.length > 0 && (
          <>
            <SectionTitle>Appears in topics</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => <Link key={t.id} to={`/topic/${t.id}`}><Badge>{t.id} · {t.title}</Badge></Link>)}
            </div>
          </>
        )}

        <SectionTitle>Cross-references ({links.length})</SectionTitle>
        {links.length === 0 ? (
          <p className="text-sm text-muted">No curated cross-references touch this passage yet.</p>
        ) : (
          <>
            <div className="-mx-4 mb-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
              <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All types</Chip>
              {types.map((t) => <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{REL_LABELS[t]}</Chip>)}
            </div>
            <div className="mb-3 flex gap-1.5">
              {(['all', 'OT', 'NT'] as const).map((t) => <Chip key={t} active={testament === t} onClick={() => setTestament(t)}>{t === 'all' ? 'Both Testaments' : t === 'OT' ? 'Old Testament' : 'New Testament'}</Chip>)}
            </div>
            <div className="space-y-2">
              {filtered.map((l, i) => {
                const other = l.direction === 'out' ? l.to : l.from;
                return (
                  <div key={i}>
                    <CrossRefItem x={{ ...l.xref, ref: formatPassage(other) }} direction={l.direction} />
                    <p className="mt-0.5 px-1 text-[0.7rem] text-muted">via topic {l.topicId}{l.direction === 'in' ? ` · explanation written from ${formatPassage(l.from)}` : ''}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Page>
    </>
  );
}
