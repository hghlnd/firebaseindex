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
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    console.log('Service Worker installed and resources cached');
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
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('Service Worker activated and old caches cleaned');
});

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncDataToFirebase());
    }
});

// Utility to show notifications
function showNotification(message, type = 'success') {
    self.registration.showNotification('Check Your Pockets', {
        body: message,
        icon: '/add_item_icon.png',
        badge: '/add_item_icon.png',
        vibrate: [200, 100, 200],
        tag: type,
    });
}

// Sync offline data with Firebase
async function syncDataToFirebase() {
    console.log('Syncing unsynced data to Firebase...');
    try {
        // Open IndexedDB
        const db = await openIndexedDB();
        const transaction = db.transaction('items', 'readonly');
        const store = transaction.objectStore('items');
        const items = await getAllItems(store);

        // Sync unsynced items
        for (const item of items) {
            if (!item.synced) {
                try {
                    // Send item to Firebase
                    const docRef = await addDoc(self.itemsCollection, { name: item.name });
                    console.log('Item synced to Firebase:', docRef.id);

                    // Update item in IndexedDB to mark it as synced
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
        console.error('Error syncing data:', error);
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
