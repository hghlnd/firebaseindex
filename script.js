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

// Add item button event listener
document.getElementById("addItemButton").addEventListener("click", async function () {
  let itemInput = document.getElementById("itemInput");
  let itemName = itemInput.value.trim();
  if (itemName !== "") {
    const newItem = { name: itemName };
    try {
      const docRef = await addDoc(itemsCollection, newItem);
      items.push({ id: docRef.id, ...newItem });
      displayItems();
      itemInput.value = "";
    } catch (error) {
      console.error("Error adding item to Firestore:", error);
      alert("Failed to add item. Please try again.");
    }
  } else {
    alert('Please enter an item name');
  }
});

// Display items in the UI
function displayItems() {
  let itemList = document.getElementById('itemList');
  itemList.innerHTML = '';
  items.forEach((item, index) => {
    let listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${item.name}`;
    itemList.appendChild(listItem);
  });
}

// Load items from Firestore
async function loadItemsFromFirestore() {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayItems();
  } catch (error) {
    console.error("Error loading items from Firestore:", error);
  }
}

// Set reminder button event listener
document.getElementById("setReminderButton").addEventListener("click", function () {
  let intervalInput = document.getElementById("reminderInterval").value;
  let interval = parseInt(intervalInput) * 60 * 1000;
  if (interval > 0) {
    if (reminderIntervalId) clearInterval(reminderIntervalId);
    reminderIntervalId = setInterval(function () {
      alert(`Check your pockets! Make sure you have your: ${items.map(item => item.name).join(', ')}`);
    }, interval);
    alert(`Reminder set for every ${intervalInput} minutes.`);
  } else {
    alert('Please enter a valid time interval.');
  }
});

// Install button event listener
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installButton').style.display = 'block';
});

document.getElementById('installButton').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installButton').style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// Clear items button event listener
document.getElementById("clearItemsButton").addEventListener("click", async function () {
  if (confirm("Are you sure you want to clear all items?")) {
    try {
      const promises = items.map(item => deleteDoc(doc(db, "items", item.id)));
      await Promise.all(promises);
      items = [];
      displayItems();
    } catch (error) {
      console.error("Error clearing items from Firestore:", error);
      alert("Failed to clear items. Please try again.");
    }
  }
});


