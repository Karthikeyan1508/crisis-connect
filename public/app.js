import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


function checkAuthAndNavigate(event, url) {
  event.preventDefault(); 
  const user = auth.currentUser;

  if (user) {
    
    window.location.href = url;
  } else {
    
    alert("Please login to access this page.");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const forumLink = document.querySelector('a[href="/forum.html"]');
  if (forumLink) {
    forumLink.addEventListener("click", (event) => checkAuthAndNavigate(event, "/forum.html"));
  }
  
  
});


document.getElementById("login-button").addEventListener("click", function () {
  const user = auth.currentUser;
  if (user) {
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
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        document.getElementById("profile-pic").src = user.photoURL;
        console.log(user);
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
