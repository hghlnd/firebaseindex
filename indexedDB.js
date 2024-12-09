// indexedDB.js
export function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PocketItemsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("items")) {
        const itemStore = db.createObjectStore("items", { keyPath: "id" });
        itemStore.createIndex("synced", "synced", { unique: false });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject("Error opening IndexedDB");
    };
  });
}

export async function saveToIndexedDB(item) {
  const db = await openIndexedDB();
  const tx = db.transaction("items", "readwrite");
  const store = tx.objectStore("items");
  store.put(item);
  return tx.complete;
}

export async function getAllItemsFromIndexedDB() {
  const db = await openIndexedDB();
  const tx = db.transaction("items", "readonly");
  const store = tx.objectStore("items");
  const items = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject("Error fetching items from IndexedDB");
    };
  });
  return items;
}

export async function deleteFromIndexedDB(id) {
  const db = await openIndexedDB();
  const tx = db.transaction("items", "readwrite");
  const store = tx.objectStore("items");
  store.delete(id);
  return tx.complete;
}
