import re
import json
import joblib
import os

BASE_DIR = os.path.dirname(__file__)

# Load model and vectorizer once at startup (not on every request)
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))

# Load category mapping once at module level (fix: was loaded on every call)
try:
    with open(os.path.join(BASE_DIR, "category_mapping.json"), "r") as f:
        CATEGORY_MAPPING = json.load(f)
except FileNotFoundError:
    CATEGORY_MAPPING = {}


def extract_amount(text):
    """Extract numeric amount from voice text. Handles commas and decimals."""
    match = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?)', text)
    if match:
        return float(match.group().replace(",", ""))
    return None


def parse_voice_text(text):
    text_lower = text.lower()

    # 🔹 Amount
    amount = extract_amount(text_lower)

    # 🔹 ML prediction
    X = vectorizer.transform([text_lower])
    category = model.predict(X)[0]

    try:
        confidence = max(model.predict_proba(X)[0])
    except Exception:
        confidence = 1.0

    # 🔹 Transaction type dynamically resolved
    transaction_type = CATEGORY_MAPPING.get(category, "EXPENSE")

    return {
        "amount": amount,
        "category": category,
        "transaction_type": transaction_type,
        "confidence": round(confidence, 2),
        "description": text
    }