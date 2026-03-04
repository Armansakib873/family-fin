const CACHE_NAME = 'family-fin-v2';

const urlsToCache = [
  '.',                  // Caches the root URL
  './index.html',       // Caches the main file
  './manifest.json',  // Use relative path   // We need to cache the manifest itself
  './192.png',
  './512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('Service Worker: Serving cached index.html for navigation');
        return caches.match('/Mealcal/index.html');
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          console.log('Service Worker: Fetch failed for', event.request.url);
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'clear-cache') {
    console.log('Service Worker: Received clear-cache message');
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Service Worker: Cache cleared');
        // Re-cache assets to maintain offline support
        return caches.open(CACHE_NAME).then((cache) => {
          console.log('Service Worker: Re-caching files');
          return cache.addAll(urlsToCache);
        });
      }).then(() => {
        // Notify clients (app) that cache is cleared
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ action: 'cache-cleared' });
          });
        });
      }).catch((error) => {
        console.error('Service Worker: Error clearing cache', error);
      })
    );
  }
});