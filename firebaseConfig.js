// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyAZS9WJFORTCbXcyn3T2xsv-h_FnEOWn3k",
  authDomain: "fir-assignment-43197.firebaseapp.com",
  projectId: "fir-assignment-43197",
  storageBucket: "fir-assignment-43197.appspot.com",
  messagingSenderId: "477096400707",
  appId: "1:477096400707:web:9f8e54a24df03f900041f6",
  measurementId: "G-VPBW8C6Y8L",
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
