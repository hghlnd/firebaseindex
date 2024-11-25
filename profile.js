// profile.js
import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// DOM Elements for Profile
const userNameElement = document.getElementById("user-name");
const userEmailElement = document.getElementById("user-email");
const profileContainer = document.getElementById("profile-container"); // Optional, to show/hide profile UI

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in:", user);

        // Fetch user details from Firestore
        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                userNameElement.textContent = userData.name || "Anonymous";
                userEmailElement.textContent = userData.email;
                profileContainer.style.display = "block"; // Show profile container if hidden
            } else {
                console.error("No user document found in Firestore!");
                userNameElement.textContent = "Unknown User";
                userEmailElement.textContent = "No Email Found";
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            userNameElement.textContent = "Error Loading User";
            userEmailElement.textContent = "Error Loading Email";
        }
    } else {
        console.log("No user logged in.");
        // Optionally hide profile container or redirect to login page
        if (profileContainer) profileContainer.style.display = "none";
        // window.location.href = "/pages/auth.html"; // Uncomment to enforce login redirect
    }
});
