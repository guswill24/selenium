// Offline support for the deck. Registered from /presentacion/, so its scope never covers the Mi Ruta app or /api.
// - Pages and scripts: network first (with a timeout), cached copy when offline or on slow Wi-Fi.
// - Media (audio): served from cache when present, including byte-range requests.
// - Everything else under /presentacion/: cache first, refreshed in the background.
// The full deck is cached by index.html when opened with ?offline.
const CACHE = 'mi-ruta-deck-v7';
const CORE = ['./', 'index.html', 'slides.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'et_douloureux.ogg'];
const PAGE_TIMEOUT = 4000;
const SCOPE = new URL('./', self.location).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // Only this deck's old caches: other caches on the origin belong to someone else
    for (const k of await caches.keys()) if (k.startsWith('mi-ruta-deck-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return;
  // Pages and scripts: network first, so a new deploy is never hidden behind an older cached copy
  if (req.mode === 'navigate' || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith('/')) e.respondWith(networkFirst(req));
  else if (/\.(ogg|mp3)$/i.test(url.pathname)) e.respondWith(media(req));
  else e.respondWith(cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
  net.catch(() => {}); // a late network failure after a cached answer is expected offline
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), PAGE_TIMEOUT))]);
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || net;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
  if (hit) { net.catch(() => {}); return hit; }
  return net;
}

// Media elements ask for byte ranges; answer them from the cached full file so playback works offline
async function media(req) {
  const hit = await caches.match(req.url);
  if (!hit) return fetch(req);
  const range = req.headers.get('range');
  if (!range) return hit;
  const blob = await hit.blob(), size = blob.size;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return hit;
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}
