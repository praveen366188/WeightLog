"use strict";
// Select elements
const dateInput = document.getElementById("dateInput");
const weightInput = document.getElementById("weightInput");
const logWeightBtn = document.getElementById("logWeight");
const weightTableBody = document.getElementById("weightTableBody");
// Set default date to today and restrict future dates
const today = new Date();
dateInput.valueAsDate = today;
dateInput.setAttribute("max", today.toISOString().split("T")[0]); // Prevent future dates
logWeightBtn.addEventListener("click", () => {
    const weight = parseFloat(weightInput.value);
    const selectedDate = new Date(dateInput.value);
    if (!weight || weight <= 0) {
        alert("Please enter a valid weight.");
        return;
    }
    if (selectedDate > today) {
        alert("Future dates are not allowed.");
        return;
    }
    // Round weight to two decimal places
    const roundedWeight = parseFloat(weight.toFixed(2));
    // Format date as DD-MM-YY
    const formattedDate = formatDate(selectedDate);
    // Create a new entry with the rounded weight
    const entry = { date: formattedDate, weight: roundedWeight };
    // Fetch existing data
    let weightData = JSON.parse(localStorage.getItem("weights") || "[]");
    // Remove any existing entry for the same date (prevent duplicates)
    weightData = weightData.filter(item => item.date !== formattedDate);
    // Add new entry
    weightData.push(entry);
    // Sort by date (newest first)
    weightData.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    // // Keep only the last 42 entries
    // if (weightData.length > 42) {
    //     weightData.shift();
    // }
    // Save back to localStorage
    localStorage.setItem("weights", JSON.stringify(weightData));
    // Update UI
    displayWeights();
    weightInput.value = "";
});
// Function to format date as DD-MM-YY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of year
    return `${day}-${month}-${year}`;
}
// Function to parse date from DD-MM-YY to Date object
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(2000 + year, month - 1, day); // Convert 2-digit year to 4-digit
}
// Function to display weight history in table
function displayWeights() {
    const weightData = JSON.parse(localStorage.getItem("weights") || "[]");
    weightTableBody.innerHTML = "";
    weightData.forEach((entry) => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        dateCell.textContent = entry.date;
        const weightCell = document.createElement("td");
        // Use toFixed(2) to always display two decimals
        weightCell.textContent = `${Number(entry.weight).toFixed(2)} kg`;
        row.appendChild(dateCell);
        row.appendChild(weightCell);
        weightTableBody.appendChild(row);
    });
}
// Load previous data on page load
document.addEventListener("DOMContentLoaded", displayWeights);
