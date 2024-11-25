// Import Firebase functions
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js"; // Import from firebaseConfig.js

// Collection for items
const itemsCollection = collection(db, "items");

// Local app state for offline functionality
let items = [];
let reminderIntervalId = null;

// DOM Elements
const signInForm = document.getElementById("sign-in-form");
const signUpForm = document.getElementById("sign-up-form");
const logoutBtn = document.getElementById("logout-btn");
const appContainer = document.querySelector(".container");

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
    items.push(newItem);
    displayItems();
    itemInput.value = "";
  } else {
    showNotification("Please enter an item name.", "error");
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
  try {
    const unsyncedItems = await getFromIndexedDB();

    for (const item of unsyncedItems) {
      if (!item.synced) {
        const docRef = await addDoc(itemsCollection, { name: item.name });
        console.log("Item synced to Firebase:", docRef.id);
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
