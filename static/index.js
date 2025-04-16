// DOM Elements
const predictBtn = document.getElementById("predict-btn");
const downloadBtn = document.getElementById("download-btn");
const resultCard = document.getElementById("result-card");
const riskPercentage = document.getElementById("risk-percentage");
const riskLevel = document.getElementById("risk-level");
const riskMessage = document.getElementById("risk-message");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatMessages = document.getElementById("chat-messages");
const suggestionChips = document.querySelectorAll(".suggestion-chip");
const testimonialTrack = document.getElementById("testimonial-track");
const testimonialDots = document.querySelectorAll(".testimonial-dot");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const bmiInput = document.getElementById("bmi");

// Calculate BMI when height or weight changes
function calculateBMI() {
  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);

  if (height && weight && height > 0 && weight > 0) {
    // BMI formula: weight(kg) / (height(m))²
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    bmiInput.value = bmi.toFixed(1);
  }
}

// Auto-calculate BMI when height or weight changes
heightInput.addEventListener("input", calculateBMI);
weightInput.addEventListener("input", calculateBMI);

// Make BMI field read-only but appear interactive
bmiInput.addEventListener("click", function () {
  // Recalculate BMI when clicked
  calculateBMI();

  // Focus on weight if BMI can't be calculated
  if (!bmiInput.value) {
    alert("Please enter both height and weight to calculate BMI");
    weightInput.focus();
  }
});

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
    bmi: document.getElementById("bmi").value,
    gender: document.getElementById("sex").value,
    cholesterol_level: document.getElementById("ch").value,
    smoking: document.getElementById("smoking").value,
    sleep_level: document.getElementById("sleep").value,
    alcohol_intake: document.getElementById("alcohol").value,
    physical_activity: document.getElementById("physical").value,
    hypertension: document.getElementById("hypertension").value,
    diabetes: document.getElementById("diabetes").value,
    family_history: document.getElementById("family").value,
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
// downloadBtn.addEventListener("click", async function () {
//   alert("Feature coming soon: PDF Report Download!");
// });

// // Generate PDF report
// function generatePDF(userData, result) {
//   // In a real application, this would use a library like jsPDF
//   console.log("Generating PDF report...");
//   console.log("User Data:", userData);
//   console.log("Result:", result);

//   // Simulate download delay
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve("report.pdf");
//     }, 1000);
//   });
// }

const { jsPDF } = window.jspdf;

// Function to call Google Gemini API
async function fetchRecommendations(prediction, probability) {
  const apiKey = "AIzaSyDD8QW1BggDVVMLteDygHCHrD6Ff9Dy0e8"; // ⚠️ NOT SECURE (for testing only)
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `A patient has undergone a cardiovascular disease prediction test.
        Prediction: ${
          prediction === 1
            ? "Has Cardiovascular Disease"
            : "No Cardiovascular Disease"
        }
        Probability of disease: ${probability.toFixed(2)}
        Provide structured lifestyle recommendations including diet, exercise, medical advice and suggest medicines with dosage as per probanility of disease limit it to 600 words & remove bold text & heading stylings if any & provide in a text format.`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0) {
      return result.candidates[0].content.parts[0].text; // Extract recommendations
    } else {
      throw new Error("No response from API");
    }
  } catch (error) {
    console.error("AI API error:", error);
    return "Error retrieving recommendations. Please consult a healthcare professional.";
  }
}

// Handle PDF download
document
  .getElementById("download-btn")
  .addEventListener("click", async function () {
    alert("Your PDF report is being downloaded...");

    const userData = {
      age: document.getElementById("age").value,
      height: document.getElementById("height").value,
      weight: document.getElementById("weight").value,
      bmi: document.getElementById("bmi").value,
      gender: document.getElementById("sex").value,
      cholesterol: document.getElementById("ch").value,
      smoking: document.getElementById("smoking").value,
      sleep: document.getElementById("sleep").value,
      alcohol: document.getElementById("alcohol").value,
      physical: document.getElementById("physical").value,
      hypertension: document.getElementById("hypertension").value,
      diabetes: document.getElementById("diabetes").value,
      family: document.getElementById("family").value,
      riskPercentage: document.getElementById("risk-percentage").innerText,
      riskLevel: document.getElementById("risk-level").innerText,
    };

    const prediction = userData.riskLevel === "High Risk" ? 1 : 0;
    const probability =
      parseFloat(userData.riskPercentage.replace("%", "")) / 100;

    // Fetch AI-generated recommendations
    const recommendations = await fetchRecommendations(prediction, probability);

    // Generate PDF
    const pdfDoc = new jsPDF();
    let yPosition = 20; // Start position for text

    pdfDoc.setFontSize(18);
    pdfDoc.text(
      "CardioSense.AI - Heart Disease Prediction Report",
      10,
      yPosition
    );

    pdfDoc.setFontSize(12);
    yPosition += 20;

    const genderLabel = userData.gender == "1" ? "Male" : "Female";
    const smokingLabel = ["No", "Occasionally", "Regular"][userData.smoking];
    const alcoholLabel = ["No", "Occasionally", "Regular"][userData.alcohol];
    const sleepLabel = ["Poor", "Average", "Good"][userData.sleep];
    const physicalLabel = ["Low", "Medium", "High"][userData.physical];
    const cholesterolLabel = ["Normal", "Borderline", "High"][
      userData.cholesterol
    ];
    const hypertensionLabel = userData.hypertension == "1" ? "Yes" : "No";
    const diabetesLabel = userData.diabetes == "1" ? "Yes" : "No";
    const familyLabel = userData.family == "1" ? "Yes" : "No";

    const userDetails = [
      `Age: ${userData.age} years`,
      `Height: ${userData.height} cm`,
      `Weight: ${userData.weight} kg`,
      `BMI: ${userData.bmi}`,
      `Gender: ${genderLabel}`,
      `Cholesterol Level: ${cholesterolLabel}`,
      `Smoking: ${smokingLabel}`,
      `Sleep Quality: ${sleepLabel}`,
      `Alcohol Consumption: ${alcoholLabel}`,
      `Physical Activity: ${physicalLabel}`,
      `Hypertension: ${hypertensionLabel}`,
      `Diabetes: ${diabetesLabel}`,
      `Family History of Heart Disease: ${familyLabel}`,
      `Risk Percentage: ${userData.riskPercentage}`,
      `Risk Level: ${userData.riskLevel}`,
    ];

    userDetails.forEach((detail) => {
      if (yPosition > 270) {
        // If text reaches near the bottom of the page, add a new page
        pdfDoc.addPage();
        yPosition = 20;
      }
      pdfDoc.text(detail, 10, yPosition);
      yPosition += 10;
    });

    // Add AI Recommendations
    pdfDoc.setFontSize(14);
    if (yPosition > 250) {
      pdfDoc.addPage();
      yPosition = 20;
    }

    pdfDoc.text("Lifestyle Recommendations:", 10, yPosition);
    yPosition += 10;
    pdfDoc.setFontSize(12);

    const recommendationLines = pdfDoc.splitTextToSize(recommendations, 180);
    recommendationLines.forEach((line) => {
      if (yPosition > 270) {
        pdfDoc.addPage();
        yPosition = 20;
      }
      pdfDoc.text(line, 10, yPosition);
      yPosition += 8;
    });

    pdfDoc.save("CardioSense_Heart_Report.pdf");
  });

// Chatbot functionality
function addMessage(message, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "bot"}`;
  messageDiv.textContent = message;

  const timeDiv = document.createElement("div");
  timeDiv.className = "message-time";
  timeDiv.textContent = "Just now";

  messageDiv.appendChild(timeDiv);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
  // Simple chatbot responses
  const lowerMessage = message.toLowerCase();

  // Different response patterns
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you with your heart health today?";
  } else if (lowerMessage.includes("what is heart disease")) {
    return "Heart disease refers to several conditions that affect the heart. The most common is coronary artery disease, which can lead to heart attacks. Other types include arrhythmias, heart valve disease, and heart failure.";
  } else if (lowerMessage.includes("risk") || lowerMessage.includes("lower")) {
    return "To lower your heart disease risk: maintain a healthy diet, exercise regularly, avoid smoking, limit alcohol consumption, manage stress, and get regular check-ups. Small lifestyle changes can make a big difference!";
  } else if (lowerMessage.includes("diet") || lowerMessage.includes("food")) {
    return "A heart-healthy diet includes: plenty of fruits and vegetables, whole grains, lean proteins, limiting saturated fats, reducing sodium, and avoiding processed foods. The Mediterranean diet is often recommended for heart health.";
  } else if (
    lowerMessage.includes("exercise") ||
    lowerMessage.includes("physical")
  ) {
    return "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week. Include strength training exercises at least twice a week. Even short walks can help improve heart health!";
  } else if (
    lowerMessage.includes("symptoms") ||
    lowerMessage.includes("signs")
  ) {
    return "Common heart disease symptoms include chest pain/discomfort, shortness of breath, pain/numbness in legs or arms, pain in neck/jaw/throat/upper abdomen, and fatigue. Women might experience different symptoms like unusual fatigue, sleep disturbances, and shortness of breath.";
  } else if (
    lowerMessage.includes("explain") &&
    lowerMessage.includes("results")
  ) {
    return "Your prediction results are based on key health indicators like age, BMI, smoking status, and other factors. The risk percentage indicates your likelihood of developing heart disease. I recommend discussing these results with a healthcare professional for a comprehensive assessment.";
  } else {
    return "I'm here to help with heart health questions. You can ask about heart disease, risk factors, diet recommendations, or exercise guidelines. If you have specific medical concerns, please consult with a healthcare professional.";
  }
}

sendBtn.addEventListener("click", function () {
  const message = chatInput.value.trim();
  if (message === "") return;

  // Add user message
  addMessage(message, true);

  // Clear input
  chatInput.value = "";

  // Simulate typing
  setTimeout(() => {
    // Get bot response
    const response = getBotResponse(message);

    // Add bot response
    addMessage(response);
  }, 1000);
});

chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Handle suggestion chips
suggestionChips.forEach((chip) => {
  chip.addEventListener("click", function () {
    chatInput.value = this.textContent;
    sendBtn.click();
  });
});

// Testimonial slider
let currentSlide = 0;
const testimonialCards = document.querySelectorAll(".testimonial-card");
const slideWidth = testimonialCards[0].offsetWidth + 30; // card width + gap

function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  testimonialTrack.style.transform = `translateX(-${
    slideIndex * slideWidth
  }px)`;

  // Update dots
  testimonialDots.forEach((dot, index) => {
    if (index === slideIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

testimonialDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    goToSlide(index);
  });
});

// Auto slide
setInterval(() => {
  currentSlide = (currentSlide + 1) % testimonialCards.length;
  goToSlide(currentSlide);
}, 5000);

// Animation on scroll
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".feature-card, .info-card").forEach((card) => {
  observer.observe(card);
});

// Initialize tooltips
document.querySelectorAll(".tooltip").forEach((tooltip) => {
  tooltip.addEventListener("mouseover", () => {
    tooltip.querySelector(".tooltip-text").style.visibility = "visible";
    tooltip.querySelector(".tooltip-text").style.opacity = "1";
  });

  tooltip.addEventListener("mouseout", () => {
    tooltip.querySelector(".tooltip-text").style.visibility = "hidden";
    tooltip.querySelector(".tooltip-text").style.opacity = "0";
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: "smooth",
      });

      // Update active link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
      });
      this.classList.add("active");
    }
  });
});

// Update active navigation link on scroll
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;

  document.querySelectorAll("section").forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      const currentId = section.getAttribute("id");
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentId}`) {
          link.classList.add("active");
        }
      });
    }
  });
});
// Initialize the page
window.addEventListener("load", () => {
  // Simulate initial greeting from chatbot
  setTimeout(() => {
    addMessage(
      "I can answer questions about heart disease, risk factors, and healthy lifestyle choices. What would you like to know?"
    );
  }, 1000);
});

document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default anchor behavior

      const targetId = this.getAttribute("href").substring(1); // Remove the #
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 60, // Adjust offset if needed
          behavior: "smooth",
        });
      }
    });
  });
});


function validateEmail() {
  const emailInput = document.getElementById("email-input");
  const email = emailInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex

  if (email === "") {
      alert("Please enter your email address.");
  } else if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
  } else {
      
        // Send POST request to backend
        fetch('/newsletter/subscribe', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
              alert(data.message); // Show success message
              emailInput.value = "";
          } else if (data.error) {
              alert("Subscription failed: " + data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert("An error occurred while subscribing.");
        });
  }
}
