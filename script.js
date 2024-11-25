// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFvIDR7rdC45TBAYVJQZHVSd55yXwlT88",
  authDomain: "indedfirebaseassignment.firebaseapp.com",
  projectId: "indedfirebaseassignment",
  storageBucket: "indedfirebaseassignment.appspot.com",
  messagingSenderId: "297837698432",
  appId: "1:297837698432:web:49e7ede0aa4c474ba87565",
  measurementId: "G-9CG1PL1ZR7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const itemsCollection = collection(db, "items");

// Local app state for offline functionality
let items = [];
let reminderIntervalId = null;

// DOM Elements
const signInForm = document.getElementById("sign-in-form");
const signUpForm = document.getElementById("sign-up-form");
const logoutBtn = document.getElementById("logout-btn");
const appContainer = document.querySelector(".container");

// Show or hide app based on authentication status
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
    appContainer.style.display = "block";
    signInForm.style.display = "none";
    signUpForm.style.display = "none";
    logoutBtn.style.display = "block";
    loadItemsFromFirestore();
  } else {
    console.log("User logged out");
    appContainer.style.display = "none";
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
    logoutBtn.style.display = "none";
  }
});

// Show Notifications
function showNotification(message, type = "success", duration = 3000) {
  const notificationBar = document.getElementById("notification-bar");
  notificationBar.textContent = message;
  notificationBar.className = type; // Add 'success' or 'error' class
  notificationBar.style.display = "block";

  setTimeout(() => {
    notificationBar.style.display = "none";
  }, duration);
}

// Sign-up
document.getElementById("sign-up-btn").addEventListener("click", async () => {
  const email = document.getElementById("sign-up-email").value.trim();
  const password = document.getElementById("sign-up-password").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showNotification("Sign-up successful! Please log in.", "success");
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
  } catch (error) {
    showNotification(Sign-up failed: ${error.message}, "error");
  }
});

// Sign-in
document.getElementById("sign-in-btn").addEventListener("click", async () => {
  const email = document.getElementById("sign-in-email").value.trim();
  const password = document.getElementById("sign-in-password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification("Sign-in successful!", "success");
  } catch (error) {
    showNotification(Sign-in failed: ${error.message}, "error");
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showNotification("Logged out successfully!", "success");
  } catch (error) {
    showNotification(Logout failed: ${error.message}, "error");
  }
});

// IndexedDB Setup
const dbName = "CheckYourPocketsDB";
let db;

// Initialize IndexedDB
const initIndexedDB = () => {
  const request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("items")) {
      db.createObjectStore("items", { keyPath: "id" });
    }
  };
  request.onsuccess = (event) => {
    db = event.target.result;
  };
  request.onerror = (event) => console.error("IndexedDB Error:", event.target.errorCode);
};
initIndexedDB();

// IndexedDB CRUD Functions
const saveToIndexedDB = (item) => {
  const transaction = db.transaction("items", "readwrite");
  const store = transaction.objectStore("items");
  store.put(item);
};

const getFromIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("items", "readonly");
    const store = transaction.objectStore("items");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Add item
document.getElementById("addItemButton").addEventListener("click", async function () {
  const itemInput = document.getElementById("itemInput");
  const itemName = itemInput.value.trim();
  console.log("Attempting to add item:", itemName); // Log item name

  if (itemName !== "") {
    const newItem = { id: Date.now(), name: itemName, synced: navigator.onLine };
    console.log("Created new item object:", newItem); // Log new item

    if (navigator.onLine) {
      try {
        const docRef = await addDoc(itemsCollection, { name: itemName });
        console.log("Item saved to Firebase with ID:", docRef.id);
        newItem.id = docRef.id;
        newItem.synced = true;
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        newItem.synced = false;
      }
    } else {
      console.log("App is offline. Saving item locally.");
      newItem.synced = false;
    }

    saveToIndexedDB(newItem);
    console.log("Saved to IndexedDB:", newItem); // Confirm IndexedDB save
    items.push(newItem);
    console.log("Updated items array:", items); // Verify items array update
    displayItems();
    itemInput.value = "";
  } else {
    showNotification("Please enter an item name.", "error");
  }
});

// Display items in the UI
function displayItems() {
  console.log("Displaying items:", items); // Log items before rendering
  const itemList = document.getElementById("itemList");
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    console.log(Rendering item: ${item.name}); // Log each item
    const listItem = document.createElement("li");
    listItem.textContent = ${index + 1}. ${item.name};
    itemList.appendChild(listItem);
  });
}

// Synchronize IndexedDB Data with Firebase
async function syncDataToFirebase() {
  try {
    const unsyncedItems = await getFromIndexedDB();
    console.log("Unsynced items from IndexedDB:", unsyncedItems); // Log unsynced items

    for (const item of unsyncedItems) {
      if (!item.synced) {
        const docRef = await addDoc(itemsCollection, { name: item.name });
        console.log("Synced item to Firebase:", { id: docRef.id, ...item });

        item.synced = true;
        item.id = docRef.id;
        saveToIndexedDB(item);
      }
    }

    showNotification("Offline data synced successfully!", "success");
  } catch (error) {
    console.error("Error syncing data to Firebase:", error);
    showNotification("Failed to sync offline data.", "error");
  }
}

// Load items from Firestore
async function loadItemsFromFirestore() {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, synced: true }));
    console.log("Items loaded from Firestore:", items); // Log Firestore data
    displayItems();

    for (const item of items) {
      saveToIndexedDB(item);
      console.log("Saved Firestore item to IndexedDB:", item); // Log IndexedDB save
    }
  } catch (error) {
    console.error("Error loading items from Firestore:", error);
  }
}

// Detect Online/Offline Status
window.addEventListener("online", syncDataToFirebase);
window.addEventListener("offline", () => {
  console.log("App is offline. Any new data will be saved locally.");
});

function updateOnlineStatus() {
  const statusIndicator = document.getElementById("status-indicator");
  if (navigator.onLine) {
    statusIndicator.classList.remove("offline");
    statusIndicator.classList.add("online");
    showNotification("You are online", "success", 2000);
  } else {
    statusIndicator.classList.remove("online");
    statusIndicator.classList.add("offline");
    showNotification("You are offline. Data will sync when reconnected.", "error", 3000);
  }
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus(); // Initial check
