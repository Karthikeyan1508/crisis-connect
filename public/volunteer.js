import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle the dropdown to show/hide the financial aid section
document.addEventListener('DOMContentLoaded', () => {
    const assistanceTypeSelect = document.getElementById('assistance-type');
    const financialAidSection = document.getElementById('financial-aid-section');

    function toggleFinancialAidSection() {
        if (assistanceTypeSelect.value === 'financial') {
            financialAidSection.classList.remove('hidden');
        } else {
            financialAidSection.classList.add('hidden');
        }
    }

    // Initial call to set the correct state on page load
    toggleFinancialAidSection();

    // Add event listener to dropdown
    assistanceTypeSelect.addEventListener('change', toggleFinancialAidSection);
});

// Handle location detection
const loc_btn = document.getElementById("loc-btn");
const RAPIDAPI_KEY = "e4bdaf8f0dmsh8eae740b5f8a211p1e3c4cjsnca0099c565df"; // Replace with your RapidAPI key

loc_btn.addEventListener("click", () => {
    if (navigator.geolocation) {
        loc_btn.innerText = "Locating...";
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        loc_btn.innerText = "Geolocation not supported or permission denied";
    }
});

async function onSuccess(position) {
    loc_btn.innerText = "Detecting your location...";
    let { latitude, longitude } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Debugging

    const url = `https://map-geocoding.p.rapidapi.com/json?latlng=${latitude}%2C${longitude}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'map-geocoding.p.rapidapi.com'
        }
    };

    try {
        console.log("Making API request..."); // Debugging
        const response = await fetch(url, options);
        const result = await response.text();
        console.log("API response text:", result); // Debugging

        let data;
        try {
            data = JSON.parse(result); // Attempt to parse JSON
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
        }

        if (data && data.results && data.results.length > 0) {
            let locationDetails = data.results[0]; // Assuming results is an array
            let { formatted_address } = locationDetails; // Example field

            document.getElementById("location").value = formatted_address || 'Unknown Location';
            loc_btn.innerText = "Location detected";
        } else {
            loc_btn.innerText = "Location not found";
            document.getElementById("location").value = "Location not found";
        }
    } catch (error) {
        console.error('Error:', error);
        loc_btn.innerText = "Something went wrong";
    }
}

function onError(error) {
    if (error.code === 1) {
        loc_btn.innerText = "You denied the request";
    } else if (error.code === 2) {
        loc_btn.innerText = "Location is unavailable";
    } else {
        loc_btn.innerText = "Something went wrong";
    }
    loc_btn.removeAttribute("disabled"); // Re-enable the button
}

// Handle form submission
document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const contact = document.getElementById("contact").value;
    const email = document.getElementById("email").value;
    const location = document.getElementById("location").value;
    const assistanceType = document.getElementById("assistance-type").value;
    const donationAmount = assistanceType === 'Financial Aid' ? document.getElementById("donation-amount").value : null;

    // Firestore collection reference
    const volunteersCollection = collection(db, "volunteers");

    try {
        await addDoc(volunteersCollection, {
            name,
            contact,
            email,
            location,
            assistanceType,
            donationAmount: donationAmount || null
        });
        alert("Registration successful!");
        document.getElementById("registrationForm").reset();
        // Hide financial aid section after submission
        document.getElementById("financial-aid-section").classList.add('hidden');
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to register.");
    }
});
