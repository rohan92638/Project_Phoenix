"""
gemini_client.py
=================
AI communication layer using the current google-genai SDK.
Loaded once at module level — efficient and fast.
"""

from google import genai
from google.genai import types
from decouple import config

# ── Load API key from .env ────────────────────────────────────────────────────
GEMINI_API_KEY = config("GEMINI_API_KEY")

# ── Initialize client (load once) ────────────────────────────────────────────
_client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_ID = "gemini-2.0-flash"   # fast + capable


def ask_gemini(prompt: str, history: list = None) -> str:
    """
    Send a prompt to Gemini and return the response text.

    Args:
        prompt  : full assembled prompt string
        history : Gemini-format history list (not used in non-chat mode below)

    Returns:
        str: AI response text, stripped of extra whitespace
    """
    try:
        # Build contents: history messages + current prompt
        contents = []

        if history:
            for msg in history[-10:]:   # last 5 exchanges max
                role = msg.get("role", "user")
                text = msg.get("parts", [""])[0]
                contents.append(
                    types.Content(role=role, parts=[types.Part(text=text)])
                )

        # Add the current prompt as a user message
        contents.append(
            types.Content(role="user", parts=[types.Part(text=prompt)])
        )

        response = _client.models.generate_content(
            model=MODEL_ID,
            contents=contents,
        )

        return response.text.strip()

    except Exception as e:
        return f"I'm having trouble responding right now. Error: {str(e)}"

def get_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for the given text using Gemini.
    Returns a 3072-dimensional float list.
    """
    try:
        response = _client.models.embed_content(
            model="gemini-embedding-2",
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Failed to generate embedding: {e}")
        # Return a zero vector as fallback
        return None