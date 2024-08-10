import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import '../firebaseConfig.js';
// Firebase configuration

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in on button click
document.getElementById("login-button").addEventListener("click", function () {
  const user = auth.currentUser;
  if (user) {
    // User is signed in, sign them out
    signOut(auth)
      .then(() => {
        document.getElementById("profile-pic").src =
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
        document.getElementById("login-button").innerText = "Login";
        alert("You have been logged out.");
      })
      .catch((error) => {
        console.error("Error during sign-out:", error);
      });
  } else {
    // User is not signed in, sign them in
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        document.getElementById("profile-pic").src = user.photoURL;
        document.getElementById("login-button").innerText = "Logout";
        user.getIdToken().then((idToken) => {
          fetch("/protected", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: idToken,
            },
          })
            .then((response) => response.text())
            .then((data) => {
              document.getElementById("protected-content").innerText = data;
            });
        });
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
      });
  }
});

// Check if user is signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("profile-pic").src = user.photoURL;
    document.getElementById("login-button").innerText = "Logout";
  } else {
    document.getElementById("profile-pic").src =
      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
    document.getElementById("login-button").innerText = "Login";
  }
});

// Redirect or alert if user tries to access protected pages without being logged in
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/protected") {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to access this page.");
      window.location.href = "/"; // Redirect to home or login page
    }
  }
});
