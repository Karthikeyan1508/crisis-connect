import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Function to get user display name
async function getUserDisplayName() {
  const user = auth.currentUser;
  if (user) {
    return user.displayName || "Anonymous";
  } else {
    return "Anonymous";
  }
}

document.getElementById('upload-button').addEventListener('click', async () => {
  const imageFile = document.getElementById('post-image').files[0];
  const description = document.getElementById('post-description').value;
  const disasterType = document.getElementById('disaster-type').value;
  const location = document.getElementById('post-location').value;

  if (!imageFile || !description || !disasterType || !location) {
    alert("Please provide all fields.");
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];
      const imageType = imageFile.type.split('/')[1]; 
      const imageMimeType = `image/${imageType}`;

      const displayName = await getUserDisplayName();

      await addDoc(collection(db, "posts"), {
        disasterType,
        location,
        image: `data:${imageMimeType};base64,${base64Image}`, 
        description,
        author: displayName, // Save display name in the post
        timestamp: new Date()
      });

      alert('Post submitted successfully!');
      loadPosts();
    };
    reader.readAsDataURL(imageFile);
  } catch (error) {
    console.error('Error uploading post:', error);
  }
});

const loadPosts = async () => {
  const postsContainer = document.querySelector('.card-container');
  postsContainer.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "posts"));

    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Post Data:', data);

      const card = document.createElement('div');
      card.className = 'card';

      const imageType = data.image.split(';')[0].split(':')[1]; 
      const cardContent = `
        <img src="data:${imageType};base64,${data.image.split(',')[1]}" class="card-image" alt="Post Image">
        <div class="card-content">
          <div class="category">${data.disasterType}</div>
          <h4 class="heading">${data.description}</h4>
          <p class="author">By ${data.author}</p> <!-- Use author from the post data -->
          <p class="timestamp">${new Date(data.timestamp.toDate()).toLocaleDateString()}</p>
          <p class="location">Location: ${data.location}</p>
        </div>
      `;

      card.innerHTML = cardContent;
      postsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

window.addEventListener('load', loadPosts);
