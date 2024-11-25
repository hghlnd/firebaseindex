const CACHE_NAME = 'check-your-pockets-cache-v4';
const urlsToCache = [
    './', // Correct path to the root for GitHub Pages
    './index.html',
    './style.css',
    './script.js',
    './auth.js',
    './firebaseConfig.js',
    './manifest.json',
    './add_item_icon.png',
    './set_reminder_icon.png',
    './clear_items_icon.png',
    './install_app_icon.png'
];

// Cache essential resources with error logging
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                urlsToCache.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        await cache.put(url, response.clone());
                        console.log(`Cached successfully: ${url}`);
                    } catch (error) {
                        console.error(`Failed to cache ${url}:`, error.message);
                    }
                })
            );
        }).catch((error) => {
            console.error('Error opening cache during installation:', error);
        })
    );
    console.log('Service Worker installed and resources caching initiated.');
});

// Serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log(`Serving from cache: ${event.request.url}`);
                return response;
            }
            console.log(`Fetching from network: ${event.request.url}`);
            return fetch(event.request);
        }).catch((error) => {
            console.error(`Error during fetch for ${event.request.url}:`, error.message);
            if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('./index.html');
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
        }).catch((error) => {
            console.error('Error during cache cleanup:', error);
        })
    );
    console.log('Service Worker activated and old caches cleaned.');
});

// Sync offline data with Firebase
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncDataToFirebase());
    }
});

// Utility to show notifications
function showNotification(message, type = 'success') {
    self.registration.showNotification('Check Your Pockets', {
        body: message,
        icon: './add_item_icon.png',
        badge: './add_item_icon.png',
        vibrate: [200, 100, 200],
        tag: type,
    });
}

// Sync offline data with Firebase
async function syncDataToFirebase() {
    console.log('Syncing unsynced data to Firebase...');
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction('items', 'readonly');
        const store = transaction.objectStore('items');
        const items = await getAllItems(store);

        for (const item of items) {
            if (!item.synced) {
                try {
                    const docRef = await addDoc(self.itemsCollection, { name: item.name });
                    console.log('Item synced to Firebase:', docRef.id);

                    const updateTransaction = db.transaction('items', 'readwrite');
                    const updateStore = updateTransaction.objectStore('items');
                    item.id = docRef.id;
                    item.synced = true;
                    updateStore.put(item);
                } catch (error) {
                    console.error('Error syncing item to Firebase:', error);
                }
            }
        }
        showNotification('Offline data synced successfully!', 'success');
    } catch (error) {
        console.error('Error syncing data to Firebase:', error);
        showNotification('Failed to sync offline data.', 'error');
    }
}

// Utility to open IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CheckYourPocketsDB', 1);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.errorCode);
    });
}

// Utility to get all items from IndexedDB
function getAllItems(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.errorCode);
    });
}
