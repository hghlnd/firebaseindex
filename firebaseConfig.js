// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debugging initialization
if (app) {
  console.log("Firebase initialized successfully.");
} else {
  console.error("Firebase initialization failed.");
}
