import { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { loadBible } from './bible/bible';
import { dueCardIds, useStudy } from './study/store';
import Home from './screens/Home';
import { CategoryView, Library, TopicView } from './screens/Library';
import Lesson from './screens/Lesson';
import PassageView from './screens/PassageView';
import Review from './screens/Review';
import { DoctrineList, DoctrineView } from './screens/Doctrine';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import Search from './screens/Search';
import { cx } from './components/ui';

function useTheme() {
  const { theme, fontScale } = useStudy((s) => s.settings);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121318' : '#f5efe3');
      if (Capacitor.isNativePlatform()) {
        StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {});
        StatusBar.setBackgroundColor({ color: dark ? '#121318' : '#f5efe3' }).catch(() => {});
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => { document.documentElement.style.setProperty('--scale', String(fontScale)); }, [fontScale]);
}

/** Android hardware back button: go back in history, or exit from the dashboard. */
function BackButton() {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const h = CapApp.addListener('backButton', () => {
      if (loc.pathname === '/' || loc.pathname === '') CapApp.exitApp();
      else nav(-1);
    });
    return () => { h.then((x) => x.remove()); };
  }, [loc.pathname]);
  return null;
}

const NAV = [
  { to: '/', label: 'Home', icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { to: '/library', label: 'Library', icon: <><path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h7" /></> },
  { to: '/review', label: 'Review', icon: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></> },
  { to: '/doctrines', label: 'Doctrine', icon: <><path d="M12 3v18" /><path d="M5 8h14" /><path d="M5 8l-2 6h4zM19 8l-2 6h4z" /></> },
  { to: '/progress', label: 'Progress', icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
];

function BottomNav() {
  const due = useStudy((s) => dueCardIds(s).length);
  const loc = useLocation();
  if (loc.pathname.startsWith('/lesson/')) return null;
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur" aria-label="Main">
      <div className="mx-auto grid max-w-2xl grid-cols-5">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => cx('relative flex flex-col items-center gap-0.5 py-2 text-[0.68rem] font-semibold', isActive ? 'text-accent' : 'text-muted')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
            {n.label}
            {n.to === '/review' && due > 0 && (
              <span className="absolute right-[calc(50%-20px)] top-1 min-w-4 rounded-full bg-accent px-1 text-[0.6rem] leading-4 text-surface dark:text-paper">{due}</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  useTheme();
  const translation = useStudy((s) => s.settings.translation);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    loadBible(translation).then(() => { setLoaded(translation); setError(''); }).catch((e) => setError(String(e.message ?? e)));
  }, [translation]);

  if (!loaded) {
    return (
      <div className="grid min-h-screen place-items-center p-8 text-center">
        <div>
          <p className="font-serif text-3xl font-semibold">Scripture Foundations</p>
          <p className="mt-2 text-sm text-muted">{error || 'Opening the Scriptures…'}</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <BackButton />
      {/* Re-key on translation so every screen re-renders with the newly loaded text. */}
      <Routes key={loaded}>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/category/:id" element={<CategoryView />} />
        <Route path="/topic/:id" element={<TopicView />} />
        <Route path="/lesson/:key" element={<Lesson />} />
        <Route path="/passage/:id" element={<PassageView />} />
        <Route path="/review" element={<Review />} />
        <Route path="/doctrines" element={<DoctrineList />} />
        <Route path="/doctrine/:id" element={<DoctrineView />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  );
}
