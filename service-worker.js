// Service Worker for offline support
const CACHE_NAME = 'inventory-app-v6';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/worker.js',
    '/manifest.json',
    'https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) return response;
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        
                        return response;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background Sync event listener
self.addEventListener('sync', event => {
    if (event.tag === 'my-background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('Performing background sync...');
    // Here you would add logic to sync data with your server
    // For example, sending pending offline requests
}

// Periodic Sync event listener
self.addEventListener('periodicsync', event => {
    if (event.tag === 'my-periodic-sync') {
        event.waitUntil(doPeriodicSync());
    }
});

async function doPeriodicSync() {
    console.log('Performing periodic sync...');
    // Here you would add logic to periodically update data
    // For example, fetching latest inventory data
}



self.addEventListener('message', (event) => { if (event.data && event.data.type === 'SKIP_WAITING') { self.skipWaiting(); } });
