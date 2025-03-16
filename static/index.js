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

// Generate PDF report
function generatePDF(userData, result) {
  // In a real application, this would use a library like jsPDF
  console.log("Generating PDF report...");
  console.log("User Data:", userData);
  console.log("Result:", result);

  // Simulate download delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("report.pdf");
    }, 1000);
  });
}

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
