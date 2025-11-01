const CACHE_NAME = 'jsconnect-controls-cache-v2';
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
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // Use a "stale-while-revalidate" strategy.
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If we got a valid response, cache it.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
          // Network failed, and we don't have a cached response.
          // This will propagate the error. For an offline-first app,
          // you might want to return a fallback page here.
          console.error('Fetch failed:', err);
          throw err;
      });

      // Return cached response right away if we have one, otherwise wait for the network.
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
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});