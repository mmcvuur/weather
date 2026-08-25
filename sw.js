// --- SERVICE WORKER VERSIONING & CACHE SYSTEM ---
const SW_VERSION = '2026.08.25.075112';
const CACHE_NAME = `ios-weather-${SW_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './favicon.ico',
  './favicon.svg',
  './favicon.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// Install Event: Skip waiting immediately & cache fresh assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Delete ALL older cache buckets and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[Service Worker] Clearing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first policy with Cache fallback for fresh data
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache static assets locally on successful fetches
        if (
          networkResponse &&
          (networkResponse.status === 200 || networkResponse.type === 'opaque') &&
          !event.request.url.includes('api.') &&
          !event.request.url.includes('open-meteo')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
