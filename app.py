from flask import Flask, request, jsonify, render_template
import joblib
from flask_mail import Mail
import numpy as np
import pandas as pd
from flask_cors import CORS
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

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))  # Convert to integer
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'  # Convert to boolean
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
mail = Mail(app)  # Initialize Flask-Mail


# Load the trained ML model
model = joblib.load("xgboost2.0_model.pkl")

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
        gender = int(data["gender"])
        bmi = float(data["bmi"])
        smoking = int(data["smoking"])
        alcohol_intake = int(data["alcohol_intake"])
        physical_activity = int(data["physical_activity"])
        sleep_level = int(data["sleep_level"])
        cholesterol_level = int(data["cholesterol_level"])
        hypertension = int(data["hypertension"])
        diabetes = int(data["diabetes"])
        family_history = int(data["family_history"])

        # Create DataFrame
        input_data = np.array([[age, gender, bmi, smoking, alcohol_intake, physical_activity, sleep_level, 
                                cholesterol_level, hypertension, diabetes, family_history]])
        
        # Make prediction
        prediction = int(model.predict(input_data)[0])
        probability = float(max(model.predict_proba(input_data)[0]))  # 🔥 Convert NumPy float32 to Python float
        
        # Categorizing risk levels
        if prediction == 0:
            risk_level = "No Risk"
        elif probability < 0.40:
            risk_level = "Low Risk"
        elif 0.40 <= probability < 0.75:
            risk_level = "Moderate Risk"
        else:
            risk_level = "High Risk"
        
        # Format response
        result = "Has Cardiovascular Disease" if prediction == 1 else "No Cardiovascular Disease"
        response = {
            "prediction": result,
            "probability": round(probability, 2),
            "risk_level": risk_level
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
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
