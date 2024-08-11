import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

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
    forumLink.addEventListener("click", (event) =>
      checkAuthAndNavigate(event, "/forum.html")
    );
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
        // Clear form fields in the modal
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("age").value = "";
        document.getElementById("location").value = "";
        document.getElementById("sex").value = "";
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

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("name").value = user.displayName || "";
    document.getElementById("email").value = user.email || "";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        document.getElementById(
          "location"
        ).value = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  } else {
    alert("No user is signed in.");
  }
});

document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = auth.currentUser.uid;
  const phone = document.getElementById("phone").value;
  const age = document.getElementById("age").value;
  const location = document.getElementById("location").value;
  const sex = document.getElementById("sex").value;

  try {
    await setDoc(doc(db, "profile-info", userId), {
      name: auth.currentUser.displayName,
      email: auth.currentUser.email,
      phone: phone,
      age: age,
      location: location,
      sex: sex,
    });
    alert("User information saved successfully in profile-info.");
  } catch (error) {
    console.error("Error saving user information: ", error);
  }
});
