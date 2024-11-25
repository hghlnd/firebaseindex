// Import Firebase and Firestore functions
import { db, auth } from "./firebaseConfig.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Define Firestore collection
const itemsCollection = collection(db, "items");

// Local app state for offline functionality
let items = [];
let reminderIntervalId = null;

// DOM Elements
const appContainer = document.querySelector(".container");
const signInForm = document.getElementById("sign-in-form");
const signUpForm = document.getElementById("sign-up-form");
const logoutBtn = document.getElementById("logout-btn");

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

// Add item
document.getElementById("addItemButton").addEventListener("click", async function () {
  const itemInput = document.getElementById("itemInput");
  const itemName = itemInput.value.trim();
  console.log("Attempting to add item:", itemName);

  if (itemName !== "") {
    const newItem = { id: Date.now(), name: itemName, synced: navigator.onLine };

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

    items.push(newItem);
    displayItems();
    itemInput.value = "";
  } else {
    showNotification("Please enter an item name.", "error");
  }
});

// Display items in the UI
function displayItems() {
  console.log("Displaying items:", items);
  const itemList = document.getElementById("itemList");
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${item.name}`;
    itemList.appendChild(listItem);
  });
}

// Load items from Firestore
async function loadItemsFromFirestore() {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, synced: true }));
    console.log("Items loaded from Firestore:", items);
    displayItems();
  } catch (error) {
    console.error("Error loading items from Firestore:", error);
    showNotification("Failed to load items from the database.", "error");
  }
}

// Detect Online/Offline Status
window.addEventListener("online", () => {
  console.log("App is back online.");
  showNotification("You are online. Data will sync automatically.", "success");
  loadItemsFromFirestore();
});
window.addEventListener("offline", () => {
  console.log("App is offline. Any new data will be saved locally.");
  showNotification("You are offline. Changes will sync when reconnected.", "error");
});

// Initial status check
if (navigator.onLine) {
  console.log("App is online.");
} else {
  console.log("App is offline.");
}
