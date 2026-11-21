import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Fills public/sw.js with a build id and the app-shell file list so the web version works offline. */
function serviceWorker(): Plugin {
  return {
    name: 'sf-service-worker',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const assets = readdirSync(resolve(dist, 'assets'))
        .filter((f) => /\.(js|css)$/.test(f) || /latin-(400|600)/.test(f) && !/ext/.test(f) && f.endsWith('.woff2') || /figtree.*latin-wght/.test(f) && !/ext/.test(f))
        .map((f) => `./assets/${f}`);
      const precache = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', ...assets];
      const sw = resolve(dist, 'sw.js');
      writeFileSync(sw, readFileSync(sw, 'utf8').replace('__BUILD_ID__', Date.now().toString(36)).replace('__PRECACHE__', JSON.stringify(precache)));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
} as any);
