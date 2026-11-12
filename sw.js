// Family-Fin service worker (scoped to its own folder; never touches other apps on the same origin)
const VER = 'v3';
const STATIC = 'family-fin-static-' + VER, RUNTIME = 'family-fin-rt-' + VER;
const SHELL = ['./', './index.html', './style.css', './theme.css', './app.js', './manifest.json', './192.png', './512.png'];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(STATIC).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys
    .filter(k => k.startsWith('family-fin-') && k !== STATIC && k !== RUNTIME)
    .map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('./index.html')));
    return;
  }
  if (u.origin !== location.origin && !CDN.includes(u.hostname)) return; // Firestore/Auth calls pass straight through
  e.respondWith(caches.open(u.origin === location.origin ? STATIC : RUNTIME).then(async c => {
    const hit = await c.match(r);
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
