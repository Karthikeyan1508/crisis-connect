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

// Function to handle SMS sending to selected rows
document.getElementById("sms-button").addEventListener("click", () => {
  const selectedContacts = [];
  const rows = document.querySelectorAll("#volunteer-table tbody tr");

  rows.forEach((row) => {
    const checkbox = row.querySelector(".row-checkbox");
    if (checkbox.checked) {
      const contact = row.children[2].textContent; // Get the contact number
      selectedContacts.push(contact);
    }
  });

  if (selectedContacts.length > 0) {
    console.log("Sending SMS to:", selectedContacts);
    // Here you can integrate your SMS sending API
    // e.g., sendSMS(selectedContacts);
  } else {
    alert("No volunteers selected for SMS.");
  }
});
