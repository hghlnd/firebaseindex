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
      const email = document.getElementById("sign-up-email").value.trim();
      const password = document.getElementById("sign-up-password").value.trim();

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with the user's name
        await updateProfile(user, {
          displayName: name,
        });

        // Add user to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
        });

        alert("User signed up successfully!");
        signUpForm.reset();
        signUpForm.style.display = "none";
        signInForm.style.display = "block";
      } catch (error) {
        console.error("Error signing up:", error);
        alert("Error signing up: " + error.message);
      }
    });
  }

  // Sign-In
  if (signInBtn) {
    signInBtn.addEventListener("click", async () => {
      const email = document.getElementById("sign-in-email").value.trim();
      const password = document.getElementById("sign-in-password").value.trim();

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        alert("User signed in successfully!");
        signInForm.reset();
        signInForm.style.display = "none";
        document.getElementById("app-content").style.display = "block";
        logoutBtn.style.display = "block";
      } catch (error) {
        console.error("Error signing in:", error);
        alert("Error signing in: " + error.message);
      }
    });
  }

  // Sign-Out
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("User signed out successfully!");
        document.getElementById("app-content").style.display = "none";
        logoutBtn.style.display = "none";
        signInForm.style.display = "block";
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Error signing out: " + error.message);
      }
    });
  }

  // Check auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("app-content").style.display = "block";
      logoutBtn.style.display = "block";
      signInForm.style.display = "none";
      signUpForm.style.display = "none";
    } else {
      document.getElementById("app-content").style.display = "none";
      logoutBtn.style.display = "none";
      signInForm.style.display = "block";
    }
  });
});
