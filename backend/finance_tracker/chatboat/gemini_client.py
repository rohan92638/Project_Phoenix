# gemini_client.py

import google.generativeai as genai
from decouple import config

# Step 1: Load API Key from .env
GEMINI_API_KEY = config("GEMINI_API_KEY")

# Step 2: Configure Gemini with API Key
genai.configure(api_key=GEMINI_API_KEY)

# Step 3: Initialize the model (LOAD ONCE)
model = genai.GenerativeModel("gemini-1.5-flash")


def ask_gemini(prompt, history=None):
    """
    Sends prompt + history to Gemini and returns response text
    """

    try:
        # Step 4: Start chat session with history
        chat = model.start_chat(history=history or [])

        # Step 5: Send message (prompt)
        response = chat.send_message(prompt)

        # Step 6: Return clean text response
        return response.text.strip()

    except Exception as e:
        # Step 7: Handle errors safely
        return f"Error: {str(e)}"