import { useRef, useState } from 'react';
import { TRANSLATIONS, currentTranslation } from '../bible/bible';
import { LENSES } from '../content/types';
import { useStudy, type Theme } from '../study/store';
import { Badge, Button, Card, Chip, Header, Page, SectionTitle } from '../components/ui';
import { VerseBlock } from '../components/Scripture';
import { parseReference } from '../bible/reference';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function Settings() {
  const st = useStudy();
  const s = st.settings;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const exportData = async () => {
    const { settings, cards, events, textMastery, refMastery, questions, crossRef, lessons, reflections, activityDays } = useStudy.getState();
    const json = JSON.stringify({ app: 'scripture-foundations', exportedAt: new Date().toISOString(), settings, cards, events, textMastery, refMastery, questions, crossRef, lessons, reflections, activityDays }, null, 1);
    const name = `scripture-foundations-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      if (Capacitor.isNativePlatform()) {
        // Android WebView can't download blobs: write to cache, then open the system share sheet.
        const res = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: 'Scripture Foundations backup', url: res.uri, dialogTitle: 'Save or send your backup' });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        a.download = name;
        a.click();
      }
      setMsg('Export ready.');
    } catch (e) { setMsg(`Export cancelled or failed: ${(e as Error).message}`); }
  };
  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== 'scripture-foundations') throw new Error('Not a Scripture Foundations export');
      st.importData(data);
      setMsg('Progress imported.');
    } catch (e) { setMsg(`Import failed: ${(e as Error).message}`); }
  };

  return (
    <>
      <Header title="Settings" back />
      <Page>
        <SectionTitle>Translation</SectionTitle>
        <Card>
          <div className="space-y-1">
            {Object.values(TRANSLATIONS).map((t) => (
              <label key={t.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-sunk">
                <input type="radio" name="translation" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={s.translation === t.id} onChange={() => st.updateSettings({ translation: t.id })} />
                <span>
                  <span className="font-semibold">{t.name}</span> <Badge tone="scripture">{t.abbreviation}</Badge><br />
                  <span className="text-sm text-muted">{t.description}</span><br />
                  <span className="text-xs text-muted">{t.license}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Memorization, typed recall and reviews use the translation you choose. Your review history is shared, so if you switch, expect to relearn the new wording. Lesson questions quote KJV phrases (marked <b className="text-gold">KJV</b>). The BSB leaves out {(TRANSLATIONS.BSB.manifest as { omittedVerses: string[] }).omittedVerses.length} verses that are missing from the earliest manuscripts (for example Acts 8:37); these are marked where they occur.</p>
        </Card>

        <SectionTitle>Study lens</SectionTitle>
        <Card>
          <p className="mb-2 text-sm text-muted">A lens highlights one tradition’s reading first. It never changes the Scripture text and never hides other views.</p>
          <div className="space-y-1">
            {LENSES.map((l) => (
              <label key={l.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-sunk">
                <input type="radio" name="lens" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={s.lens === l.id} onChange={() => st.updateSettings({ lens: l.id })} />
                <span><span className="font-semibold">{l.label}</span><br /><span className="text-sm text-muted">{l.description}</span></span>
              </label>
            ))}
          </div>
        </Card>

        <SectionTitle>Daily goals</SectionTitle>
        <Card className="space-y-4">
          <div>
            <div className="flex justify-between text-sm"><span>Review cap per day</span><b className="tabular-nums">{s.dailyReviewCap}</b></div>
            <input type="range" min={5} max={100} step={5} value={s.dailyReviewCap} onChange={(e) => st.updateSettings({ dailyReviewCap: Number(e.target.value) })} className="w-full accent-[var(--accent)]" aria-label="Review cap per day" />
            <p className="text-xs text-muted">Prevents overload — extra due cards wait until tomorrow.</p>
          </div>
          <div>
            <div className="flex justify-between text-sm"><span>Lessons per day</span><b className="tabular-nums">{s.dailyLessonGoal}</b></div>
            <input type="range" min={1} max={5} value={s.dailyLessonGoal} onChange={(e) => st.updateSettings({ dailyLessonGoal: Number(e.target.value) })} className="w-full accent-[var(--accent)]" aria-label="Lessons per day" />
          </div>
        </Card>

        <SectionTitle>Display & accessibility</SectionTitle>
        <Card className="space-y-4">
          <div>
            <p className="mb-2 text-sm">Theme</p>
            <div className="flex gap-1.5">
              {(['system', 'light', 'dark'] as Theme[]).map((t) => <Chip key={t} active={s.theme === t} onClick={() => st.updateSettings({ theme: t })}>{t[0].toUpperCase() + t.slice(1)}</Chip>)}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm"><span>Text size</span><b className="tabular-nums">{Math.round(s.fontScale * 100)}%</b></div>
            <input type="range" min={0.9} max={1.5} step={0.05} value={s.fontScale} onChange={(e) => st.updateSettings({ fontScale: Number(e.target.value) })} className="w-full accent-[var(--accent)]" aria-label="Text size" />
            <VerseBlock passage={parseReference('John 1:1')} className="mt-1" />
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>Show verse numbers</span>
            <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={s.showVerseNumbers} onChange={(e) => st.updateSettings({ showVerseNumbers: e.target.checked })} />
          </label>
        </Card>

        <SectionTitle>Privacy & data</SectionTitle>
        <Card className="space-y-3">
          <p className="text-sm text-muted">All progress stays on this device. No account, no tracking, no data sold. Export to back up or move to another device.</p>
          <div className="flex flex-wrap gap-2">
            <Button small variant="secondary" onClick={exportData}>Export progress</Button>
            <Button small variant="secondary" onClick={() => file.current?.click()}>Import</Button>
            <Button small variant="danger" onClick={() => { if (confirm('Erase all progress on this device?')) { st.reset(); setMsg('All progress erased.'); } }}>Delete all data</Button>
          </div>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          {msg && <p className="text-sm font-semibold text-accent">{msg}</p>}
        </Card>

        <SectionTitle>About the text</SectionTitle>
        <Card className="space-y-1 text-xs text-muted">
          {(() => { const manifest = currentTranslation().manifest as any; return (<>
          <p><b className="text-ink">{manifest.name}</b></p>
          <p>{manifest.books} books · {manifest.chapters.toLocaleString()} chapters · {manifest.verses.toLocaleString()} verses</p>
          <p>Source: {manifest.source}</p>
          <p className="break-all">Checksum: {manifest.outputSha256}</p>
          {manifest.crossCheck && <p>Cross-checked word-by-word against an independent dataset ({manifest.crossCheck.differing} verses differ: {manifest.id === 'kjv' ? '1769 spellings or name hyphenation' : 'wording revisions in the newer official edition and verse-boundary placement in list passages'}).</p>}
          </>); })()}
          <p className="pt-2">Explanatory notes, cross-reference explanations, and doctrinal summaries are editorial drafts awaiting human theological review. Scripture text is never generated.</p>
        </Card>
      </Page>
    </>
  );
}
