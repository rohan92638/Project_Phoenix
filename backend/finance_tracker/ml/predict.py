import joblib
import os

BASE_DIR = os.path.dirname(__file__)

# Load model and vectorizer
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))

# THIS FUNCTION MUST EXIST
def predict_category(text):
    text_vec = vectorizer.transform([text.lower()])
    prediction = model.predict(text_vec)[0]
    return prediction

# Retrained to recognize Snacks