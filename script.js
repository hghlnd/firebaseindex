// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
  measurementId: "G-9CG1PL1ZR7"
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
    alert("Sign-up successful! Please log in.");
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
  } catch (error) {
    alert(`Sign-up failed: ${error.message}`);
  }
});

// Sign-in
document.getElementById("sign-in-btn").addEventListener("click", async () => {
  const email = document.getElementById("sign-in-email").value.trim();
  const password = document.getElementById("sign-in-password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Sign-in successful!");
  } catch (error) {
    alert(`Sign-in failed: ${error.message}`);
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
  } catch (error) {
    alert(`Logout failed: ${error.message}`);
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
  store.put(item); // Add or update item
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
  if (itemName !== "") {
    const newItem = { id: Date.now(), name: itemName, synced: navigator.onLine };

    if (navigator.onLine) {
      try {
        const docRef = await addDoc(itemsCollection, { name: itemName });
        console.log("Item saved to Firebase:", docRef.id);
        newItem.id = docRef.id; // Use Firebase ID
        newItem.synced = true;
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        newItem.synced = false; // Mark as unsynced
      }
    } else {
      console.log("App is offline. Saving item locally.");
      newItem.synced = false; // Mark as unsynced
    }

    saveToIndexedDB(newItem);
    items.push(newItem);
    displayItems();
    itemInput.value = "";
  } else {
    alert("Please enter an item name.");
  }
});

// Display items in the UI
function displayItems() {
  const itemList = document.getElementById("itemList");
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${item.name}`;
    itemList.appendChild(listItem);
  });
}

// Synchronize IndexedDB Data with Firebase
async function syncDataToFirebase() {
  console.log("Syncing unsynced data to Firebase...");
  try {
    const unsyncedItems = await getFromIndexedDB();

    for (const item of unsyncedItems) {
      if (!item.synced) {
        const docRef = await addDoc(itemsCollection, { name: item.name });
        console.log("Item synced to Firebase:", docRef.id);

        // Update the item in IndexedDB to mark it as synced
        item.synced = true;
        item.id = docRef.id; // Use Firebase ID
        saveToIndexedDB(item);
      }
    }

    showNotification("Offline data synced successfully!", "success");
  } catch (error) {
    console.error("Error syncing item to Firebase:", error);
    showNotification("Failed to sync offline data.", "error");
  }
}

// Load items from Firestore
async function loadItemsFromFirestore() {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, synced: true }));
    displayItems();

    // Save items to IndexedDB
    for (const item of items) {
      saveToIndexedDB(item);
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
