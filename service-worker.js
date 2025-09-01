/*
  File: service-worker.js
  Purpose: Provide offline-first caching for the WealthFlow PWA.
  Strategy: Cache on install, serve from cache falling back to network, then update cache.
  Notes:
    - Update CACHE version to bust old caches when assets change.
  Last updated: 2025-08-29 23:29 (local)
*/

const CACHE = 'loan-tracker-cache-v5';
const ASSETS = [
  './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon.svg', './icon-maskable.svg',
  './apple-touch-icon-180.png', './offline.html'
];

// Install: pre-cache core assets and activate the new SW immediately
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Activate: clean up old caches and take control of clients
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Message: allow manual skip waiting from the page
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch: network-first for HTML (navigate) to ensure latest UI; cache-first for same-origin others
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Do not intercept cross-origin requests (e.g., CDN, model files)
  if (url.origin !== self.location.origin) return;
  const accept = e.request.headers.get('accept') || '';
  const isHTML = e.request.mode === 'navigate' || accept.includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html').then(m => m || caches.match('./offline.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./offline.html'))
    )
  );
});