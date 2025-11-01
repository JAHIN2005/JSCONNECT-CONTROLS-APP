// A unique name for the cache
const CACHE_NAME = 'jsconnect-cache-v2'; // Incremented cache version

// A list of files to cache for offline use
const URLS_TO_CACHE = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './hooks/useRobotAPI.ts',
  './components/Controller.tsx',
  './components/SettingsModal.tsx',
  './components/ControlButton.tsx',
  './components/ActionButton.tsx'
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event: serves assets from the cache first for performance and offline support.
// If a resource is not in the cache, it fetches it from the network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cache
        if (response) {
          return response;
        }
        // Not in cache - fetch from the network
        return fetch(event.request);
      })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});