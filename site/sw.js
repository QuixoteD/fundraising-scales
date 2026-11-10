/* Service worker for the DRAFT Corus giving page (v1-20261110).
   Same-origin files: cache first, refreshed in the background. Fonts and CDN images: cached after first use. */
const CACHE = 'corus-give-draft-v1-20261110';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png']; // PRECACHE
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('corus-give-draft-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const runtime = /fonts\.(googleapis|gstatic)\.com$|rackcdn\.com$/.test(url.hostname);
  if (url.origin !== self.location.origin && !runtime) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: req.mode === 'navigate' }).then(function (hit) {
      const net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? cache.match('./') : undefined); });
      return hit || net;
    });
  }));
});
