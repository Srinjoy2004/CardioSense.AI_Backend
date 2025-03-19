from flask import Flask, request, jsonify, send_from_directory
import joblib
import pandas as pd
import numpy as np  # Import NumPy to handle data types
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS
from flask_mail import Mail, Message  # Import Flask-Mail components
import os  # Import the 'os' module
from dotenv import load_dotenv  # Import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend
# @app.route('/static/images/istockphoto-1126458889-612x612-removebg-preview.png')
# def uploaded_file(filename):
#     return send_from_directory('static', filename)

# Load the trained ML model
model = joblib.load("xgb_heart_disease_model_2.pkl")
from flask import Flask, render_template

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))  # Convert to integer
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'  # Convert to boolean
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)


@app.route("/")
def home():
    return render_template("index.html")  # ✅ Correct way to serve index.html from templates


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

# Newsletter Signup Route
@app.route('/newsletter/subscribe', methods=['POST'])
def newsletter_subscribe():
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email address is required'}), 400

        # Send Confirmation Email
        send_confirmation_email(email)

        return jsonify({'message': 'Successfully subscribed to the newsletter!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def send_confirmation_email(email):
    """Sends a confirmation email to the user."""
    with app.app_context():  # Needed to access Flask app context
        subject = "Welcome to CardioSense.AI!"
        html_message = render_template('confirmation_email.html', email=email)  # Pass email to template
        text_message = "Thank you for subscribing to our newsletter!" 
        # Plain text fallback
        msg = Message(subject, recipients=[email], sender=app.config['MAIL_DEFAULT_SENDER'], html=html_message, body=text_message)
        mail.send(msg)

# Weekly Newsletter Sending (Separate Function - Enable/Disable as needed)
def send_weekly_newsletter(emails):
    """Sends the weekly newsletter to a list of email addresses."""
    with app.app_context():
        msg = Message("Weekly Heart Health Update",
                      recipients=emails,
                      sender=app.config['MAIL_DEFAULT_SENDER'],
                      body="""
                      Here's your weekly update on heart health and our AI technology:

                      [Content of the newsletter goes here]

                      Stay healthy!
                      The [Your Company Name] Team
                      """)
        mail.send(msg)

# Example Usage (You'll need to schedule this - see below)
# send_weekly_newsletter(['user1@example.com', 'user2@example.com'])



if __name__ == '__main__':
    app.run(debug=True)