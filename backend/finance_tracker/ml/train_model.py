import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib

# Load dataset
data = pd.read_csv("training_data.csv")

# Input (X) and Output (y)
X = data["description"]
y = data["category"]

# Convert text → numbers
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

# Train model
model = MultinomialNB()
model.fit(X_vec, y)

import json

# Extract unique category mappings
mapping = data.set_index('category')['transaction_type'].to_dict()

with open("category_mapping.json", "w") as f:
    json.dump(mapping, f, indent=4)

# Save model + vectorizer
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model trained and saved with dynamic category mapping!")