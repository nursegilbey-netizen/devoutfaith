/* Scripture Foundations service worker — offline support for the web version.
   __BUILD_ID__ and __PRECACHE__ are filled in at build time (see vite.config.ts). */
const CACHE = 'sf-__BUILD_ID__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sf-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // Page navigations: network first (so updates arrive), fall back to cached shell offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // Hashed assets, Bible data, fonts, icons: cache first, then store.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && (url.pathname.includes('/assets/') || url.pathname.includes('/data/') || url.pathname.includes('/icons/'))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
