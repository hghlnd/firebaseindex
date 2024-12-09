// auth.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
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
  }

  // Sign-In
  if (signInBtn) {
    signInBtn.addEventListener("click", async () => {
      const email = document.getElementById("sign-in-email").value.trim();
      const password = document.getElementById("sign-in-password").value.trim();

      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Sign-in successful!");
        window.location.reload(); // Reload to update UI
      } catch (error) {
        console.error("Sign-in error: ", error);
        alert(error.message);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("Logged out successfully!");
        window.location.reload(); // Reload to update UI
      } catch (error) {
        console.error("Logout error: ", error);
        alert(error.message);
      }
    });
  }

  // Handle user state changes
  onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById("auth-container");
    const appContent = document.getElementById("app-content");
    if (user) {
      console.log("User logged in:", user);
      if (logoutBtn) logoutBtn.style.display = "block";
      if (authContainer) authContainer.style.display = "none";
      if (appContent) appContent.style.display = "block";
    } else {
      console.log("No user logged in.");
      if (logoutBtn) logoutBtn.style.display = "none";
      if (authContainer) authContainer.style.display = "block";
      if (appContent) appContent.style.display = "none";
    }
  });
});
