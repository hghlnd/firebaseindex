// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyD6bh0oFDuuhhT6CufKffE8t987qSKbRVw",
  authDomain: "checkyourpocketlist-3638a.firebaseapp.com",
  projectId: "checkyourpocketlist-3638a",
  storageBucket: "checkyourpocketlist-3638a.firebasestorage.app",
  messagingSenderId: "988679035896",
  appId: "1:988679035896:web:326ba0404869ad850d540d",
  measurementId: "G-YK8CK275V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debugging initialization
if (app) {
  console.log("Firebase initialized successfully.");
} else {
  console.error("Firebase initialization failed.");
}
