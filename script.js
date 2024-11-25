// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFvIDR7rdC45TBAYVJQZHVSd55yXwlT88",
  authDomain: "indedfirebaseassignment.firebaseapp.com",
  projectId: "indedfirebaseassignment",
  storageBucket: "indedfirebaseassignment.firebasestorage.app",
  messagingSenderId: "297837698432",
  appId: "1:297837698432:web:49e7ede0aa4c474ba87565",
  measurementId: "G-9CG1PL1ZR7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itemsCollection = collection(db, "items");

// Local app state for offline functionality
let items = [];
let reminderIntervalId = null;

// Load items from Firestore
document.addEventListener('DOMContentLoaded', async () => {
  await loadItemsFromFirestore();
  displayItems();
});

// Add item button event listener
document.getElementById('addItemButton').addEventListener('click', async function () {
  let itemInput = document.getElementById('itemInput');
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
  } catch (error) {
    console.error("Error loading items from Firestore:", error);
  }
}

// Set reminder button event listener
document.getElementById('setReminderButton').addEventListener('click', function () {
  let intervalInput = document.getElementById('reminderInterval').value;
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
document.getElementById('clearItemsButton').addEventListener('click', async function () {
  if (confirm('Are you sure you want to clear all items?')) {
    try {
      // Delete from Firestore
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

