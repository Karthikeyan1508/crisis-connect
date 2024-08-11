import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "../firebaseConfig.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


document.addEventListener('DOMContentLoaded', () => {
    const assistanceTypeSelect = document.getElementById('assistance-type');
    const financialAidSection = document.getElementById('financial-aid-section');
    const donationAmountSection = document.getElementById('donation-amount-section');

    function toggleFinancialAidSection() {
        if (assistanceTypeSelect.value === 'financial') {
            financialAidSection.classList.remove('hidden');
            donationAmountSection.classList.remove('hidden');
        } else {
            financialAidSection.classList.add('hidden');
            donationAmountSection.classList.add('hidden');
        }
    }

    
    toggleFinancialAidSection();

    
    assistanceTypeSelect.addEventListener('change', toggleFinancialAidSection);
});


const loc_btn = document.getElementById("loc-btn");
const RAPIDAPI_KEY = "67ad76fbb9msh66ac2bd2a0c8148p193f12jsn0d94efd42d97"; 

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

    const url = `https://map-geocoding.p.rapidapi.com/json?latlng=${latitude}%2C${longitude}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'map-geocoding.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();

        let data;
        try {
            data = JSON.parse(result);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
        }

        if (data && data.results && data.results.length > 0) {
            let locationDetails = data.results[0];
            let { formatted_address } = locationDetails;

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
    loc_btn.removeAttribute("disabled"); 
}


document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const contact = document.getElementById("contact").value;
    const email = document.getElementById("email").value;
    const location = document.getElementById("location").value;
    const assistanceType = document.getElementById("assistance-type").value;
    const donationAmount = assistanceType === 'financial' ? document.getElementById("donation-amount").value : null;

    
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
        
        document.getElementById("financial-aid-section").classList.add('hidden');
        document.getElementById("donation-amount-section").classList.add('hidden');
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to register.");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const assistanceTypeDropdown = document.getElementById("assistance-type");
    const financialAidSection = document.getElementById("financial-aid-section");

    
    financialAidSection.style.display = "none";

    
    assistanceTypeDropdown.addEventListener("change", function () {
      if (assistanceTypeDropdown.value === "Financial Aid") {
        financialAidSection.style.display = "block";
      } else {
        financialAidSection.style.display = "none";
      }
    });
  });