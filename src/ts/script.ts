interface WeightEntry {
    date: string; // Formatted as DD-MM-YY
    weight: number;
}

// Select elements
const dateInput = document.getElementById("dateInput") as HTMLInputElement;
const weightInput = document.getElementById("weightInput") as HTMLInputElement;
const logWeightBtn = document.getElementById("logWeight") as HTMLButtonElement;
const weightTableBody = document.getElementById("weightTableBody") as HTMLTableSectionElement;
const exportPDFBtn = document.getElementById("exportPDF") as HTMLButtonElement;
declare var html2pdf: any;

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
    const entry: WeightEntry = { date: formattedDate, weight: roundedWeight };

    // Fetch existing data
    let weightData: WeightEntry[] = JSON.parse(localStorage.getItem("weights") || "[]");

    // Remove any existing entry for the same date (prevent duplicates)
    weightData = weightData.filter(item => item.date !== formattedDate);

    // Add new entry
    weightData.push(entry);

    // Sort by date (newest first)
    weightData.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

    // Save back to localStorage
    localStorage.setItem("weights", JSON.stringify(weightData));

    // Update UI
    displayWeights();
    weightInput.value = "";
});

// Function to format date as DD-MM-YY
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of year
    return `${day}-${month}-${year}`;
}

// Function to parse date from DD-MM-YY to Date object
function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(2000 + year, month - 1, day); // Convert 2-digit year to 4-digit
}

// Function to display weight history in table
function displayWeights() {
    const weightData: WeightEntry[] = JSON.parse(localStorage.getItem("weights") || "[]");
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

// Load previous data on page load
document.addEventListener("DOMContentLoaded", displayWeights);

// PDF Export Function (Works on iOS Safari & Chrome)
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
        .then((pdfBlob: Blob) => {
            const blobURL = URL.createObjectURL(pdfBlob);

            // Detect iOS (Safari & Chrome)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            if (isIOS) {
                // iOS Fix: Open in new tab
                window.open(blobURL, "_blank");
            } else {
                // Normal download for other devices
                const downloadLink = document.createElement("a");
                downloadLink.href = blobURL;
                downloadLink.download = "weight_history.pdf";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }

            // Cleanup
            URL.revokeObjectURL(blobURL);
        })
        .catch((err: Error) => {
            console.error("Error generating PDF:", err.message);
        });
});
const exportJSONBtn = document.getElementById("exportJSON") as HTMLButtonElement;

exportJSONBtn.addEventListener("click", () => {
    const weightData: WeightEntry[] = JSON.parse(localStorage.getItem("weights") || "[]");

    if (weightData.length === 0) {
        alert("No data to export.");
        return;
    }

    const jsonString = JSON.stringify(weightData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const blobURL = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = blobURL;
    downloadLink.download = "weight_history.json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(blobURL);
});

// Load previous data on page load
document.addEventListener("DOMContentLoaded", displayWeights);

