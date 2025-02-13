// Define the structure for weight entries
class WeightEntry {
    constructor(date, weight) {
        this.date = date;
        this.weight = weight;
    }
}

// Select elements
const dateInput = document.getElementById("dateInput");
const weightInput = document.getElementById("weightInput");
const logWeightBtn = document.getElementById("logWeight");
const weightTableBody = document.getElementById("weightTableBody");
const exportPDFBtn = document.getElementById("exportPDF");

// Set default date to today and restrict future dates
const today = new Date();
dateInput.valueAsDate = today;
dateInput.setAttribute("max", today.toISOString().split("T")[0]); // Prevent future dates

// Function to format date as DD-MM-YY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

// Function to parse date from DD-MM-YY format
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(2000 + year, month - 1, day);
}

// Function to display weight history in the table
function displayWeights() {
    const weightData = JSON.parse(localStorage.getItem("weights") || "[]");
    weightTableBody.innerHTML = "";

    weightData.forEach((entry) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = entry.date;

        const weightCell = document.createElement("td");
        weightCell.textContent = `${Number(entry.weight).toFixed(2)} kg`;

        row.appendChild(dateCell);
        row.appendChild(weightCell);
        weightTableBody.appendChild(row);
    });
}

// Event listener to log weight
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

    const roundedWeight = parseFloat(weight.toFixed(2));
    const formattedDate = formatDate(selectedDate);

    let weightData = JSON.parse(localStorage.getItem("weights") || "[]");

    // Remove existing entry for the same date (to prevent duplicates)
    weightData = weightData.filter(item => item.date !== formattedDate);

    // Add new entry and sort by date (newest first)
    weightData.push(new WeightEntry(formattedDate, roundedWeight));
    weightData.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Save data to localStorage
    localStorage.setItem("weights", JSON.stringify(weightData));

    // Update the UI
    displayWeights();
    weightInput.value = "";
});

// PDF Export Function (Supports iOS Safari & Chrome)
exportPDFBtn.addEventListener("click", () => {
    const element = document.getElementById("exportContainer");
    if (!element) {
        console.error("exportContainer element not found.");
        return;
    }

    const opt = {
        margin: 0.5,
        filename: 'weight_history.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
        .set(opt)
        .from(element)
        .outputPdf('blob')
        .then((pdfBlob) => {
            const blobURL = URL.createObjectURL(pdfBlob);

            // Create a hidden download link
            const downloadLink = document.createElement("a");
            downloadLink.href = blobURL;
            downloadLink.download = "weight_history.pdf";
            document.body.appendChild(downloadLink);

            // Simulate a user click
            downloadLink.click();

            // Cleanup: remove link after download
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobURL);
        })
        .catch((err) => {
            console.error("Error generating PDF:", err);
        });
});

// Load previous data on page load
document.addEventListener("DOMContentLoaded", displayWeights);
