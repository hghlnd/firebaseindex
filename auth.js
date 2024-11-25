// auth.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("sign-in-form");
  const signUpForm = document.getElementById("sign-up-form");
  const showSignUp = document.getElementById("show-signup");
  const showSignIn = document.getElementById("show-signin");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Toggle between Sign In and Sign Up forms
  showSignIn.addEventListener("click", () => {
    signUpForm.style.display = "none";
    signInForm.style.display = "block";
  });

  showSignUp.addEventListener("click", () => {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
  });

  // Sign-Up
  signUpBtn.addEventListener("click", async () => {
    const name = document.getElementById("sign-up-name").value.trim();
    const email = document.getElementById("sign-up-email").value.trim();
    const password = document.getElementById("sign-up-password").value.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Save user info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
      });

      alert("Sign-up successful! Please log in.");
      signUpForm.style.display = "none";
      signInForm.style.display = "block";
    } catch (error) {
      console.error("Sign-up error: ", error);
      alert(error.message);
    }
  });

  // Sign-In
  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("sign-in-email").value.trim();
    const password = document.getElementById("sign-in-password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sign-in successful!");
      window.location.href = "/"; // Redirect to home page
    } catch (error) {
      console.error("Sign-in error: ", error);
      alert(error.message);
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      window.location.href = "/pages/auth.html"; // Redirect to auth page
    } catch (error) {
      console.error("Logout error: ", error);
      alert(error.message);
    }
  });

  // Handle user state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user);
      logoutBtn.style.display = "block";
    } else {
      console.log("No user logged in.");
      logoutBtn.style.display = "none";
    }
  });
});
