const CACHE_NAME = 'check-your-pockets-cache-v3';
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
self.addEventListener('install', async (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                await Promise.all(
                    urlsToCache.map(async (url) => {
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${url}: ${response.status}`);
                        }
                        await cache.put(url, response.clone());
                        console.log(`Cached: ${url}`);
                    })
                );
                console.log('All resources cached successfully');
            } catch (error) {
                console.error('Error caching resources:', error);
            }
        })()
    );
});

// Serve cached files or fetch from network
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
        })
    );
    console.log('Service Worker activated and old caches cleaned');
});

// Sync offline data with Firebase
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncDataToFirebase());
    }
});

