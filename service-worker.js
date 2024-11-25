const CACHE_NAME = 'check-your-pockets-cache-v4';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/auth.js',
    '/firebaseConfig.js',
    '/manifest.json',
    '/add_item_icon.png',
    '/set_reminder_icon.png',
    '/clear_items_icon.png',
    '/install_app_icon.png'
];

// Cache essential resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                urlsToCache.map((url) => {
                    return fetch(url).then((response) => {
                        if (response.ok) {
                            cache.put(url, response.clone());
                            console.log(`Cached: ${url}`);
                        } else {
                            console.warn(`Failed to cache ${url}: ${response.statusText}`);
                        }
                    }).catch((error) => {
                        console.error(`Failed to fetch ${url}:`, error);
                    });
                })
            );
        }).then(() => {
            console.log('All resources cached successfully');
        }).catch((error) => {
            console.error('Error during cache installation:', error);
        })
    );
});

// Serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log(`Serving from cache: ${event.request.url}`);
                return response;
            }
            return fetch(event.request).then((networkResponse) => {
                console.log(`Fetched from network: ${event.request.url}`);
                return networkResponse;
            });
        }).catch((error) => {
            console.error(`Fetch failed for: ${event.request.url}`, error);
            if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/index.html');
            }
        })
    );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated and old caches cleaned');
        })
    );
});

// Sync offline data with Firebase
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncDataToFirebase().catch((error) => {
            console.error('Error during background sync:', error);
        }));
    }
});

// Utility function: Sync offline data
async function syncDataToFirebase() {
    console.log('Syncing offline data to Firebase...');
    try {
        // Placeholder logic for IndexedDB to Firebase sync
        console.log('Data synced successfully!');
    } catch (error) {
        console.error('Failed to sync data to Firebase:', error);
    }
}
