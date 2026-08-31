// --- SERVICE WORKER VERSIONING & CACHE SYSTEM ---
const SW_VERSION = '2026.08.31.080142';
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
  './icon-512.png',
  './fonts/JetBrainsMono-Thin.woff2',
  './fonts/JetBrainsMono-ThinItalic.woff2',
  './fonts/JetBrainsMono-ExtraLight.woff2',
  './fonts/JetBrainsMono-ExtraLightItalic.woff2',
  './fonts/JetBrainsMono-Light.woff2',
  './fonts/JetBrainsMono-LightItalic.woff2',
  './fonts/JetBrainsMono-Regular.woff2',
  './fonts/JetBrainsMono-Italic.woff2',
  './fonts/JetBrainsMono-Medium.woff2',
  './fonts/JetBrainsMono-MediumItalic.woff2',
  './fonts/JetBrainsMono-SemiBold.woff2',
  './fonts/JetBrainsMono-SemiBoldItalic.woff2',
  './fonts/JetBrainsMono-Bold.woff2',
  './fonts/JetBrainsMono-BoldItalic.woff2',
  './fonts/JetBrainsMono-ExtraBold.woff2',
  './fonts/JetBrainsMono-ExtraBoldItalic.woff2',
  './fonts/JetBrainsMono[wght].woff2',
  './fonts/JetBrainsMono-Italic[wght].woff2'
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
        // Cache static app assets locally on successful fetches
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.url.startsWith(self.location.origin)
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
