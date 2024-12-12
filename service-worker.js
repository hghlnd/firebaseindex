const CACHE_NAME = 'check-your-pockets-cache-v3'; // Updated cache version
const urlsToCache = [
  './',
  './index.html',
  './auth.html',
  './profile.html',
  './about.html',
  './contact.html',
  './style.css',
  './script.js',
  './auth.js',
  './firebaseConfig.js',
  './manifest.json',
];

// Install event: Cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching files...');
      return cache.addAll(urlsToCache);
    }).catch((error) => console.error('Failed to cache resources:', error))
  );
});

// Fetch event: Serve cached files or fetch from the network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Sync event: Sync offline data with Firebase
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Utility to sync offline data with Firebase
async function syncOfflineData() {
  console.log('Service Worker: Syncing offline data...');
  try {
    // Open IndexedDB and fetch unsynced data
    const db = await openIndexedDB();
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const unsyncedItems = await getUnsyncedItems(store);

    for (const item of unsyncedItems) {
      try {
        // Save item to Firebase (you need a Firebase function here)
        const docRef = await addDocToFirebase(item); // Replace with your Firebase add function
        console.log('Item synced to Firebase:', docRef.id);

        // Mark the item as synced in IndexedDB
        const updateTransaction = db.transaction('items', 'readwrite');
        const updateStore = updateTransaction.objectStore('items');
        item.synced = true;
        updateStore.put(item);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
    console.log('All offline data synced successfully.');
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
}

// Helper functions for IndexedDB
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CheckYourPocketsDB', 1);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.errorCode);
  });
}

async function getUnsyncedItems(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result.filter((item) => !item.synced);
      resolve(items);
    };
    request.onerror = (event) => reject(event.target.errorCode);
  });
}
