/* ═══════════════════════════════════════════
   ENIGMA ALPHA — SERVICE WORKER
   PWA offline support & caching
═══════════════════════════════════════════ */

const CACHE_NAME    = 'enigma-alpha-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/nav.css',
  '/css/hero.css',
  '/css/styles-grid.css',
  '/css/cart.css',
  '/css/chat.css',
  '/css/owner.css',
  '/css/about.css',
  '/css/footer.css',
  '/css/responsive.css',
  '/js/data.js',
  '/js/app.js',
  '/js/cart.js',
  '/js/chat.js',
  '/js/owner.js',
  '/js/otp.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

/* ── Install: cache static assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clear old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for static, network-first for API ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin API calls (EmailJS)
  if (request.method !== 'GET') return;
  if (url.hostname === 'api.emailjs.com') return;

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          // Cache valid responses
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for HTML pages
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});
