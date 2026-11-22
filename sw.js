/* Service worker : permet d'installer le site comme une appli et de l'ouvrir sans internet. */
const CACHE = 'mes-objectifs-v4';
const EXT_CACHE = 'mes-objectifs-ext';   // polices et affiches d'animes
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== EXT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Synchro GitHub et infos d'animes : toujours en direct
  if (url.hostname === 'api.github.com' || url.hostname === 'graphql.anilist.co') return;

  // Fichiers du site : internet d'abord (pour avoir les mises à jour), sinon la copie gardée
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
    );
    return;
  }

  // Polices et affiches : la copie gardée d'abord (plus rapide, marche hors ligne)
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || /(^|\.)anilist\.co$/.test(url.hostname)) {
    e.respondWith(
      caches.open(EXT_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      })))
    );
  }
});
