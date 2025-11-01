const CACHE_NAME = 'jsconnect-controls-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './vite.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Note: Only the app shell is pre-cached.
        // Other assets (like built JS/CSS files) will be cached dynamically by the fetch handler.
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // Use a "stale-while-revalidate" strategy for all GET requests.
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If we got a valid response, open the cache and put the new response in it.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
          // Network failed, and we don't have a cached response.
          // This will propagate the error.
          console.error('Fetch failed; returning offline fallback if available.', err);
          throw err;
      });

      // Return the cached response immediately if it exists, otherwise wait for the network.
      // This makes the app load fast ("stale") and updates in the background ("revalidate").
      return cachedResponse || fetchPromise;
    })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that are not in the whitelist.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});