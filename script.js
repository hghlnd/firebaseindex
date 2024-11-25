// Import Firebase functions
import { auth, db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase collections
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
    console.log(`User logged in: ${user.email}`);
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
  notificationBar.className = type;
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
    showNotification(`Sign-up failed: ${error.message}`, "error");
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
    showNotification(`Sign-in failed: ${error.message}`, "error");
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showNotification("Logged out successfully!", "success");
  } catch (error) {
    showNotification(`Logout failed: ${error.message}`, "error");
  }
});

// Add item
document.getElementById("addItemButton").addEventListener("click", async () => {
  const itemInput = document.getElementById("itemInput");
  const itemName = itemInput.value.trim();

  if (itemName !== "") {
    const newItem = { id: Date.now(), name: itemName, synced: navigator.onLine };

    if (navigator.onLine) {
      try {
        const docRef = await addDoc(itemsCollection, { name: itemName });
        newItem.id = docRef.id;
        newItem.synced = true;
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        newItem.synced = false;
      }
    } else {
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

// Load items from Firestore
async function loadItemsFromFirestore() {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, synced: true }));
    displayItems();
  } catch (error) {
    console.error("Error loading items from Firestore:", error);
  }
}

// IndexedDB logic (as is)

window.addEventListener("online", syncDataToFirebase);
