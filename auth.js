// auth.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("sign-in-form");
  const signUpForm = document.getElementById("sign-up-form");
  const showSignUp = document.getElementById("show-signup");
  const showSignIn = document.getElementById("show-signin");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Toggle between Sign In and Sign Up forms
  if (showSignIn) {
    showSignIn.addEventListener("click", () => {
      signUpForm.style.display = "none";
      signInForm.style.display = "block";
    });
  }

  if (showSignUp) {
    showSignUp.addEventListener("click", () => {
      signInForm.style.display = "none";
      signUpForm.style.display = "block";
    });
  }

  // Sign-Up
  if (signUpBtn) {
    signUpBtn.addEventListener("click", async () => {
      const name = document.getElementById("sign-up-name").value.trim();
