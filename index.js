// DOM Elements
const predictBtn = document.getElementById("predict-btn");
const downloadBtn = document.getElementById("download-btn");
const resultCard = document.getElementById("result-card");
const riskPercentage = document.getElementById("risk-percentage");
const riskLevel = document.getElementById("risk-level");
const riskMessage = document.getElementById("risk-message");

// Function to call Flask API for ML prediction
async function fetchPrediction(inputData) {
  try {
    let response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    let result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Prediction error:", error);
    return null;
  }
}

// Handle prediction form submission
predictBtn.addEventListener("click", async function () {
  // Collect user input
  const inputData = {
    age: document.getElementById("age").value,
    height: document.getElementById("height").value,
    weight: document.getElementById("weight").value,
    gender: document.getElementById("sex").value,
    ap_hi: document.getElementById("ap_hi").value,
    ap_lo: document.getElementById("ap_lo").value,
    cholesterol: document.getElementById("ch").value,
    gluc: document.getElementById("gl").value,
    smoke: document.getElementById("smoking").value,
    alco: document.getElementById("alcohol").value,
    active: document.getElementById("physical").value,
  };

  // Validate inputs
  for (let key in inputData) {
    if (inputData[key] === "" || inputData[key] === null) {
      alert("Please fill out all fields before submitting.");
      return;
    }
  }

  // Show loading state
  riskPercentage.textContent = "";
  riskLevel.textContent = "Calculating...";
  riskMessage.textContent = "Processing your input...";

  // Get prediction from Flask API
  const predictionResult = await fetchPrediction(inputData);

  if (predictionResult) {
    // Update UI with the model's prediction
    riskPercentage.textContent = `${(
      predictionResult.probability * 100
    ).toFixed(2)}%`;
    riskLevel.textContent = predictionResult.prediction;
    riskMessage.textContent = `Probability of heart disease: ${(
      predictionResult.probability * 100
    ).toFixed(2)}%`;

    // Activate result card
    resultCard.classList.add("active");

    // Enable download button
    downloadBtn.disabled = false;

    // Change risk meter color
    const riskCircle = document.querySelector(".risk-circle");
    if (predictionResult.probability > 0.7) {
      riskCircle.style.background = "var(--danger)";
    } else if (predictionResult.probability > 0.4) {
      riskCircle.style.background = "var(--warning)";
    } else {
      riskCircle.style.background = "var(--primary)";
    }
  } else {
    riskLevel.textContent = "Error";
    riskMessage.textContent =
      "An error occurred during prediction. Please try again.";
  }
});

// Handle PDF download (optional future implementation)
downloadBtn.addEventListener("click", async function () {
  alert("Feature coming soon: PDF Report Download!");
});
