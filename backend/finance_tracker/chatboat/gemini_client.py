"""
gemini_client.py
=================
AI communication layer using the current google-genai SDK.
Loaded once at module level — efficient and fast.

QUOTA PROTECTION: Tracks daily quota exhaustion and skips API calls
until the key is replaced or the quota resets, so the chatbot can
still function with a local fallback.
"""

from google import genai
from google.genai import types
from decouple import config
import time

# ── Load API key from .env ────────────────────────────────────────────────────
GEMINI_API_KEY = config("GEMINI_API_KEY")

# ── Initialize client (load once) ────────────────────────────────────────────
_client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_ID = "gemini-2.0-flash"   # fast + capable

# ── Quota tracking ────────────────────────────────────────────────────────────
_quota_exhausted = False
_quota_exhausted_at = 0      # timestamp when quota was detected as exhausted
QUOTA_COOLDOWN = 3600        # re-check after 1 hour (in seconds)


def _is_quota_blocked() -> bool:
    """Check if we're in a known quota-exhausted state."""
    global _quota_exhausted, _quota_exhausted_at
    if not _quota_exhausted:
        return False
    # Allow retry after cooldown period
    if time.time() - _quota_exhausted_at > QUOTA_COOLDOWN:
        _quota_exhausted = False
        return False
    return True


def _mark_quota_exhausted():
    """Mark the API as quota-exhausted."""
    global _quota_exhausted, _quota_exhausted_at
    _quota_exhausted = True
    _quota_exhausted_at = time.time()


QUOTA_MESSAGE = (
    "🚫 The Gemini API daily quota has been exhausted for this key.\n\n"
    "**How to fix (takes 2 minutes):**\n"
    "1. Go to https://aistudio.google.com/apikey\n"
    "2. Click 'Create API Key' → copy the new key\n"
    "3. Open `backend/.env` and replace the old key:\n"
    "   `GEMINI_API_KEY=your_new_key_here`\n"
    "4. Restart the Django server (`Ctrl+C` → `python manage.py runserver`)\n\n"
    "The free tier allows ~1,500 requests/day. "
    "The quota resets at midnight Pacific Time."
)


def ask_gemini(prompt: str, history: list = None) -> str:
    """
    Send a prompt to Gemini and return the response text.

    Args:
        prompt  : full assembled prompt string
        history : Gemini-format history list (not used in non-chat mode below)

    Returns:
        str: AI response text, stripped of extra whitespace
    """
    # ── Fast exit if quota is known to be exhausted ───────────────────────────
    if _is_quota_blocked():
        return QUOTA_MESSAGE

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
                _mark_quota_exhausted()
                return QUOTA_MESSAGE

            # Check if it's a per-minute rate limit (retry possible)
            if "GenerateRequestsPerMinutePerProjectPerModel" in error_str or "retry in" in error_str.lower():
                return (
                    "⏳ I'm receiving too many requests right now. "
                    "Please wait about 30–60 seconds and try again."
                )
            
            # Generic 429 — treat as daily quota
            _mark_quota_exhausted()
            return QUOTA_MESSAGE

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
    # Skip embedding calls too when quota is exhausted
    if _is_quota_blocked():
        return None

    try:
        response = _client.models.embed_content(
            model="gemini-embedding-2",
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            _mark_quota_exhausted()
        print(f"Failed to generate embedding: {e}")
        # Return a zero vector as fallback
        return None