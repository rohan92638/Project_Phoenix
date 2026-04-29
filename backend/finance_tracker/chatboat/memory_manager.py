"""
memory_manager.py
=================
Simple in-memory session store for chatbot conversation history.
NO Redis / NO FAISS required — works out of the box.

Each session is identified by a session_id string (UUID sent from frontend).
History is stored in Gemini-compatible format:
  [{"role": "user", "parts": ["message"]}, {"role": "model", "parts": ["reply"]}]

Limits each session to the last 10 message pairs (20 entries) to keep
prompts short and fast.
"""

from collections import defaultdict

# In-memory store: { session_id: [gemini_message, ...] }
_SESSIONS: dict = defaultdict(list)

MAX_HISTORY = 20   # max messages stored per session (10 exchanges)


def get_history(session_id: str) -> list:
    """Return the full Gemini-format history for this session."""
    return list(_SESSIONS[session_id])


def add_exchange(session_id: str, user_message: str, ai_reply: str):
    """
    Append one user↔AI exchange to the session history.
    Trims to MAX_HISTORY automatically.
    """
    history = _SESSIONS[session_id]
    history.append({"role": "user",  "parts": [user_message]})
    history.append({"role": "model", "parts": [ai_reply]})

    # Keep only the most recent MAX_HISTORY entries
    if len(history) > MAX_HISTORY:
        _SESSIONS[session_id] = history[-MAX_HISTORY:]


def clear_session(session_id: str):
    """Wipe all memory for a session (user clicked 'New Chat')."""
    _SESSIONS.pop(session_id, None)