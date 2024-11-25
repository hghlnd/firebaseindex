const CACHE_NAME = 'check-your-pockets-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/add_item_icon.png',
    '/set_reminder_icon.png',
    '/clear_items_icon.png',
    '/install_app_icon.png'
];

// Install event: Cache essential resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    console.log('Service Worker installed and resources cached');
});

// Fetch event: Serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/index.html');
            }
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('Service Worker activated and old caches cleaned');
});

// Sync event (optional): Notify when online (basic awareness)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('Sync event triggered: Data syncing placeholder');
        // Placeholder for sync logic, like syncing IndexedDB to Firebase
    }
});
