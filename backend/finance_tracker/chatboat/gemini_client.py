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
        error_str = str(e)

        # ── Quota / Rate-limit errors ─────────────────────────────────────────
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            # Check if daily quota is completely exhausted
            if "limit: 0" in error_str or "GenerateRequestsPerDayPerProjectPerModel" in error_str:
                return (
                    "🚫 The AI service daily quota has been reached. "
                    "This usually resets at midnight Pacific Time. "
                    "Please create a new API key at https://aistudio.google.com "
                    "to continue using the chatbot right now."
                )
            # Check if it's a per-minute rate limit (retry possible)
            if "GenerateRequestsPerMinutePerProjectPerModel" in error_str or "retry in" in error_str.lower():
                return (
                    "⏳ I'm receiving too many requests right now. "
             
                    "Please wait about 30–60 seconds and try again."
                )
            
            return "🚫 The AI service daily quota has been reached."

        # ── Network / connectivity errors ─────────────────────────────────────
        if "ConnectionError" in error_str or "timeout" in error_str.lower():
            return "🌐 I couldn't reach the AI server. Please check your internet connection."

        # ── Generic fallback ─────────────────────────────────────────────────
        print(f"[GeminiClient] Unexpected error: {error_str}")
        return "⚠️ Something went wrong on my end. Please try again in a moment."

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