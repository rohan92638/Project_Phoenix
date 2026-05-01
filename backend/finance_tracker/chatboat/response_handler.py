"""
response_handler.py
====================
Main orchestrator — the only function views.py calls.

Pipeline:
  user_message
    1. intent_parser  → what does user want?
    2. date_parser    → what time period?
    3. data_fetcher   → fetch real DB data
    4. prompt_builder → build grounded prompt
    5. gemini_client  → generate AI response
    6. memory_manager → store exchange
    7. return reply
"""

from .intent_parser  import detect_intent
from .date_parser    import parse_date
from .data_fetcher   import (
    get_expenses, get_income, get_savings,
    get_financial_summary, get_highest_spending, get_overall_summary,
    predict_budget
)
from .prompt_builder import build_prompt
from .gemini_client  import ask_gemini
from .memory_manager import get_history, add_exchange
from .vector_store import add_to_vector_db, get_memory_context
from .voice_handler  import text_to_speech_base64



def handle_chat(user, user_message: str, session_id: str = "default",
                voice_output: bool = False) -> dict:
    """
    Full chatbot pipeline. Called by the Django view.

    Args:
        user         : Django User object
        user_message : raw text from the user
        session_id   : unique session string from frontend (for memory)
        voice_output : if True, generate base64 TTS audio of the reply

    Returns:
        dict: { "reply": str, "audio_base64": str|None }
    """

    # ── 1. Retrieve conversation memory ───────────────────────────────────────
    history = get_history(session_id)

    # ── 2. Detect intent + entities ───────────────────────────────────────────
    parsed   = detect_intent(user_message)
    intent   = parsed.get("intent", "general_chat")
    entities = parsed.get("entities", {})

    # ── 3. Resolve date range ─────────────────────────────────────────────────
    date_str = (
        entities.get("date") or
        entities.get("period") or
        entities.get("time_period") or
        ""
    )
    date_range = parse_date(date_str)
    start_date = date_range["start_date"]
    end_date   = date_range["end_date"]

    # Inject readable date range into entities for the prompt
    entities["date_range"] = f"{start_date} → {end_date}"

    # ── 4. Fetch relevant data from DB ────────────────────────────────────────
    data = {}

    if intent == "fetch_expenses":
        data = get_expenses(user, start_date, end_date)

    elif intent == "fetch_income":
        data = get_income(user, start_date, end_date)

    elif intent == "fetch_savings":
        data = get_savings(user, start_date, end_date)

    elif intent == "financial_summary":
        data = get_financial_summary(user, start_date, end_date)

    elif intent == "budget_planning":
        data = get_financial_summary(user, start_date, end_date)
        data["overall"] = get_overall_summary(user)

        # 🔥 Add ML prediction
        prediction = predict_budget(user)
        data["prediction"] = prediction

    elif intent in ("financial_advice", "investment_query",
                    "financial_education", "general_chat"):
        data = get_overall_summary(user)

    else:
        data = get_overall_summary(user)

    # ──  4.5 Retrieve relevant past memory (FAISS) ──────────────────────────
    memory_context = get_memory_context(user.id, user_message)

    # ── 5. Build the grounded prompt ──────────────────────────────────────────
    prompt = build_prompt(user_message, intent, entities, data, history, memory_context)

    # ── 6. Call Gemini ────────────────────────────────────────────────────────
    reply = ask_gemini(prompt, history=history)

    # ── 7. Store exchange in memory ───────────────────────────────────────────
    add_exchange(session_id, user_message, reply)

    # ── 8. Store to Vector DB for permanent semantic search ───────────────────
    exchange_text = f"User asked: '{user_message}' | AI replied: '{reply}'"
    try:
        add_to_vector_db(user.id, exchange_text)
    except Exception as e:
        print(f"Warning: Failed to save to vector DB: {e}")

    # ── 9. Optionally generate voice output (TTS) ─────────────────────────────
    audio_base64 = None
    if voice_output:
        try:
            audio_base64 = text_to_speech_base64(reply)
        except Exception as e:
            print(f"Warning: TTS generation failed: {e}")

    return {
        "reply":        reply,
        "audio_base64": audio_base64,
    }

