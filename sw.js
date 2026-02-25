const CACHE='tdb-v3';
const ASSETS=['/'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // activate immediately, don't wait
});
self.addEventListener('activate', e => {
  // Delete all old caches
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim(); // take control of all open tabs immediately
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('thecocktaildb') || e.request.url.includes('fonts.g')) return;
  // Network first — always try to get fresh, fall back to cache
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
