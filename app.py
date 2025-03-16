from flask import Flask, request, jsonify, send_from_directory
import joblib
import pandas as pd
import numpy as np  # Import NumPy to handle data types
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

# Load the trained ML model
model = joblib.load("xgb_heart_disease_model_2.pkl")

@app.route("/")
def home():
    return send_from_directory("", "index.html")  # Serve index.html from home directory

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.json

        # Convert input values to correct data types
        age = int(data["age"])
        height = float(data["height"])
        weight = float(data["weight"])
        gender = int(data["gender"])
        ap_hi = float(data["ap_hi"])
        ap_lo = float(data["ap_lo"])
        cholesterol = int(data["cholesterol"])
        gluc = int(data["gluc"])
        smoke = int(data["smoke"])
        alco = int(data["alco"])
        active = int(data["active"])

        # Create DataFrame
        input_data = pd.DataFrame([[age, height, weight, gender, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active]],
                                  columns=["age", "height", "weight", "gender", "ap_hi", "ap_lo", "cholesterol", "gluc", "smoke", "alco", "active"])

        # Standardize numerical features
        scaler = StandardScaler()
        input_data[["age", "height", "weight", "ap_hi", "ap_lo"]] = scaler.fit_transform(
            input_data[["age", "height", "weight", "ap_hi", "ap_lo"]])

        # Make prediction
        prediction = int(model.predict(input_data)[0])  # Convert NumPy int to Python int
        probability = float(model.predict_proba(input_data)[0][1])  # Convert NumPy float to Python float

        # Format response
        result = "Has Cardiovascular Disease" if prediction == 1 else "No Cardiovascular Disease"
        response = {
            "prediction": result,
            "probability": round(probability, 2)  # Ensure Python float type
        }

        print(f"Prediction: {result} (Probability: {probability:.2f})")  # Output to terminal
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return error with status code 400

if __name__ == '__main__':
    app.run(debug=True)
