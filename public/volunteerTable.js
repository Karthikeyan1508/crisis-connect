import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "../firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch data from Firestore
async function fetchVolunteers() {
  const volunteersCollection = collection(db, "volunteers");
  const snapshot = await getDocs(volunteersCollection);
  const volunteers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return volunteers;
}

async function displayVolunteers() {
  const volunteers = await fetchVolunteers();
  const tableBody = document.getElementById("volunteer-table-body");

  // Clear existing table data
  tableBody.innerHTML = "";

  volunteers.forEach((volunteer) => {
    const formattedContact =
      volunteer.contact.length > 10
        ? "+91"+volunteer.contact.slice(-10)
        : "+91"+volunteer.contact;

    const row = document.createElement("tr");

    row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td>${volunteer.name}</td>
            <td>${formattedContact}</td> <!-- Use formattedContact here -->
            <td>${volunteer.email}</td>
            <td>${volunteer.location}</td>
            <td>${volunteer.assistanceType}</td>
        `;

    tableBody.appendChild(row);
  });

  // Add event listener to "Clear All" button
  document.getElementById("clear-all-button").addEventListener("click", () => {
    const allCheckboxes = document.querySelectorAll(
      "#volunteer-table tbody tr input.row-checkbox"
    );
    allCheckboxes.forEach((checkbox) => (checkbox.checked = false));
  });

  // Toggle select/unselect for filtered rows
  document
    .getElementById("select-all-filtered")
    .addEventListener("click", function () {
      const visibleRows = document.querySelectorAll(
        "#volunteer-table tbody tr:not([style*='display: none']) input.row-checkbox"
      );
      const allChecked = Array.from(visibleRows).every(
        (checkbox) => checkbox.checked
      );

      // Toggle based on current state
      visibleRows.forEach((checkbox) => (checkbox.checked = !allChecked));
    });
}

document.addEventListener("DOMContentLoaded", displayVolunteers);
document.getElementById("filter-name").addEventListener("input", filterTable);
document
  .getElementById("filter-location")
  .addEventListener("input", filterTable);
document
  .getElementById("filter-assistance")
  .addEventListener("change", filterTable);

function filterTable() {
  const nameFilter = document.getElementById("filter-name").value.toLowerCase();
  const locationFilter = document
    .getElementById("filter-location")
    .value.toLowerCase();
  const assistanceFilter = document
    .getElementById("filter-assistance")
    .value.toLowerCase();

  const rows = document.querySelectorAll("#volunteer-table tbody tr");

  rows.forEach((row) => {
    const name = row.children[1].textContent.toLowerCase();
    const location = row.children[4].textContent.toLowerCase();
    const assistanceType = row.children[5].textContent.toLowerCase();

    const nameMatches = name.includes(nameFilter);
    const locationMatches = location.includes(locationFilter);
    const assistanceMatches =
      assistanceType.includes(assistanceFilter) || assistanceFilter === "";

    if (nameMatches && locationMatches && assistanceMatches) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}


document.getElementById("sms-button").addEventListener("click", async () => {
    const selectedContacts = [];
    const rows = document.querySelectorAll("#volunteer-table tbody tr");
  
    rows.forEach((row) => {
      const checkbox = row.querySelector(".row-checkbox");
      if (checkbox.checked) {
        const contact = row.children[2].textContent.trim(); // Get the contact number
        selectedContacts.push(contact);
      }
    });
  console.log(selectedContacts)
    if (selectedContacts.length > 0) {
      // Prepare the data to send
      const message = "Your message here"; // Customize your message
      const data = {
        to: selectedContacts,
        from: 'AcmeInc',
        text: message,
      };
  
      try {
        const response = await axios.post('https://gateway.seven.io/api/sms', new URLSearchParams(data), {
          headers: {
            'X-Api-Key': '97F81283D70d6B7b5C11Bd69d2c30f230590DD083fa73833E4BA900719f9db8f',
            'Accept': 'application/json',
          },
        });
  
        console.log('Response:', response.data);
        alert('SMS sent successfully!');
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        alert('Failed to send SMS.');
      }
    } else {
      alert("No volunteers selected for SMS.");
    }
  });
  