<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

  // Your web app's Firebase configuration
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
  const analytics = getAnalytics(app);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
</script>
