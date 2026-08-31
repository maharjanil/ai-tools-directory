const CACHE_NAME = 'ai-tools-v2';
const JSON_URL = 'https://jsonguide.technologychannel.org/ai/aitoolstest.json';

// Files to cache for instant loading
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

// 1. INSTALL - Cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// 2. ACTIVATE - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. FETCH - Smart caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;

  // Special strategy for the external JSON (stale-while-revalidate)
  if (request.url === JSON_URL) {
    event.respondWith(
      caches.open(CACHE_NAME + '-json').then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          // Return cache immediately if available, else wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // For everything else: Cache first, then network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
