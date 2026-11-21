import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DOCTRINES, doctrineById, topicById, lessonKeyForTopic } from '../content';
import type { Certainty } from '../content/types';
import { useStudy } from '../study/store';
import { Badge, Callout, Card, Header, Page, SectionTitle } from '../components/ui';
import { RefButton, VerseBlock } from '../components/Scripture';
import { Perspectives } from '../components/assess';
import { parseReference } from '../bible/reference';
import { currentTranslation } from '../bible/bible';

const CERTAINTY: Record<Certainty, { label: string; tone: 'scripture' | 'gold' | 'interp'; desc: string }> = {
  explicit: { label: 'Explicit', tone: 'scripture', desc: 'Stated directly in the cited text.' },
  inferred: { label: 'Inferred', tone: 'gold', desc: 'A synthesis drawn from several texts.' },
  disputed: { label: 'Disputed', tone: 'interp', desc: 'Christians reach different conclusions.' },
};

export function DoctrineList() {
  return (
    <>
      <Header title="Doctrine Explorer" subtitle="Central questions · labeled claims · challenge texts" />
      <Page>
        <Callout tone="gold" title="How claims are labeled">
          <div className="mt-1 space-y-1">
            {(Object.keys(CERTAINTY) as Certainty[]).map((c) => (
              <p key={c}><Badge tone={CERTAINTY[c].tone}>{CERTAINTY[c].label}</Badge> <span className="text-sm">{CERTAINTY[c].desc}</span></p>
            ))}
          </div>
        </Callout>
        <div className="mt-4 space-y-2">
          {DOCTRINES.map((d) => (
            <Link key={d.id} to={`/doctrine/${d.id}`} className="block rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-interp">{d.topicId}</span>
                <span className="font-semibold">{d.title}</span>
              </div>
              <p className="mt-1 font-serif text-[0.95rem] italic text-muted">{d.question}</p>
            </Link>
          ))}
        </div>
      </Page>
    </>
  );
}

function ExplicitItem({ refStr, statement }: { refStr: string; statement: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <RefButton refStr={refStr} />
          <p className="mt-0.5 text-sm text-ink/85">{statement}</p>
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs font-semibold text-accent" aria-expanded={open}>{open ? 'Hide' : currentTranslation().abbreviation}</button>
      </div>
      {open && <VerseBlock passage={parseReference(refStr)} compact className="mt-2 border-t border-line pt-2" />}
    </div>
  );
}

export function DoctrineView() {
  const { id = '' } = useParams();
  const d = doctrineById(id);
  const st = useStudy();
  const [text, setText] = useState(st.reflections[`doctrine:${id}`] ?? '');
  if (!d) return null;
  const topic = topicById(d.topicId);
  return (
    <>
      <Header title={d.title} subtitle={`Doctrine Explorer · Topic ${d.topicId}`} back />
      <Page>
        <Card className="border-interp/30 bg-interp-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-interp">Central question</p>
          <p className="mt-1 font-serif text-xl leading-snug">{d.question}</p>
        </Card>
        <p className="mt-2 text-xs text-muted"><Badge tone="draft">Draft</Badge> Editorial summaries await human theological review. Scripture text is from the verified {currentTranslation().abbreviation}.</p>

        <SectionTitle><Badge tone="scripture">Explicit</Badge> What the texts state</SectionTitle>
        <div className="space-y-2">{d.explicit.map((e) => <ExplicitItem key={e.ref} refStr={e.ref} statement={e.statement} />)}</div>

        <SectionTitle><Badge tone="gold">Inferred</Badge> Synthesis across texts</SectionTitle>
        <div className="space-y-2">
          {d.inferred.map((x, i) => (
            <Card key={i}>
              <p className="text-[0.95rem]">{x.statement}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-sm"><span className="text-muted">Built from:</span>{x.refs.map((r) => <RefButton key={r} refStr={r} />)}</div>
            </Card>
          ))}
        </div>

        {d.disputed.map((x, i) => (
          <div key={i}>
            <SectionTitle><Badge tone="interp">Disputed</Badge> {x.issue}</SectionTitle>
            <Perspectives items={x.perspectives} />
          </div>
        ))}

        <SectionTitle>Challenging passages</SectionTitle>
        <div className="space-y-2">
          {d.challenges.map((c) => (
            <div key={c.ref} className="rounded-xl border border-bad/30 bg-surface p-3">
              <RefButton refStr={c.ref} />
              <p className="mt-0.5 text-sm text-ink/85">{c.why}</p>
            </div>
          ))}
        </div>

        <SectionTitle>Written synthesis</SectionTitle>
        <Card>
          <p className="font-semibold">{d.synthesisPrompt}</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => st.saveReflection(`doctrine:${id}`, text)} rows={6}
            className="mt-3 w-full rounded-xl border border-line bg-paper p-3 text-[0.95rem] outline-none focus:border-accent"
            placeholder="Label each claim: explicit, inferred, or disputed — and cite the verse." />
          <p className="mt-1 text-xs text-muted">Saved on this device.</p>
        </Card>

        {topic && (
          <Link to={`/lesson/${lessonKeyForTopic(topic)}`} className="mt-4 block">
            <Card><p className="font-semibold text-accent">Study topic {topic.id} lesson →</p></Card>
          </Link>
        )}
      </Page>
    </>
  );
}
