# intent_parser.py

from .gemini_client import ask_gemini, _is_quota_blocked
import json
import re


# ─────────────────────────────────────────────────────────────────────────────
# LOCAL FALLBACK: keyword-based intent detection (no API call needed)
# ─────────────────────────────────────────────────────────────────────────────

# HIGH PRIORITY — checked FIRST (override data-fetch intents)
_HIGH_PRIORITY_INTENTS = {
    "financial_advice": [
        "advice", "advise", "suggest", "suggestion", "recommendation",
        "recommend", "tip", "tips", "help me", "should i", "how to",
        "how should", "how do i", "how can i", "guide", "guide me",
        "what should", "can you suggest", "ways to"
    ],
    "budget_planning": [
        "budget", "plan", "planning", "forecast", "next week",
        "next month", "next year", "upcoming", "prepare"
    ],
    "financial_education": [
        "what is", "explain", "meaning", "define", "learn",
        "teach me", "tell me about", "difference between"
    ],
    "investment_query": [
        "invest", "investment", "stock", "mutual fund", "sip", "fd",
        "fixed deposit", "portfolio", "returns"
    ],
}

# LOW PRIORITY — only matched if no high-priority intent is found
_LOW_PRIORITY_INTENTS = {
    "fetch_expenses": [
        "expense", "expenses", "spent", "spend", "spending", "cost",
        "bought", "purchase", "paid", "bill", "show my expense",
        "show expense", "show me expense"
    ],
    "fetch_income": [
        "income", "earned", "salary", "earning", "revenue", "received"
    ],
    "fetch_savings": [
        "saving", "savings", "saved", "save"
    ],
    "financial_summary": [
        "summary", "overview", "overall", "total", "report"
    ],
}

_DATE_KEYWORDS = {
    "today": "today",
    "yesterday": "yesterday",
    "this week": "this week",
    "last week": "last week",
    "this month": "this month",
    "last month": "last month",
    "this year": "this year",
    "last year": "last year",
    "next week": "this week",       # future → use current week as context
    "next month": "this month",     # future → use current month as context
}


def _local_detect_intent(message: str) -> dict:
    """
    Priority-based keyword intent detection — zero API calls.
    High-priority intents (advice, planning, education) are checked FIRST
    so "guide me how to spend" → financial_advice, NOT fetch_expenses.
    """
    msg = message.lower().strip()

    detected_intent = "general_chat"

    # ── PASS 1: Check HIGH-priority intents first ─────────────────────────────
    for intent, keywords in _HIGH_PRIORITY_INTENTS.items():
        for kw in keywords:
            if kw in msg:
                detected_intent = intent
                break
        if detected_intent != "general_chat":
            break

    # ── PASS 2: If no high-priority match, check LOW-priority ─────────────────
    if detected_intent == "general_chat":
        for intent, keywords in _LOW_PRIORITY_INTENTS.items():
            for kw in keywords:
                if kw in msg:
                    detected_intent = intent
                    break
            if detected_intent != "general_chat":
                break

    # ── PASS 3: If both income AND expense mentioned → financial_summary ──────
    has_expense = any(kw in msg for kw in _LOW_PRIORITY_INTENTS["fetch_expenses"])
    has_income = any(kw in msg for kw in _LOW_PRIORITY_INTENTS["fetch_income"])
    if has_expense and has_income and detected_intent in ("fetch_expenses", "fetch_income"):
        detected_intent = "financial_summary"

    # ── Extract date entity ───────────────────────────────────────────────────
    entities = {}

    _MONTH_NAMES = (
        "january|february|march|april|may|june|"
        "july|august|september|october|november|december"
    )

    # 1. Check for specific dates FIRST (most precise wins)
    #    "30 April 2026", "30 april", "30th april 2026"
    m = re.search(
        rf'(\d{{1,2}})(?:st|nd|rd|th)?\s+({_MONTH_NAMES})(?:\s+(\d{{4}}))?',
        msg
    )
    if m:
        entities["date"] = m.group(0)  # pass raw match to date_parser
    else:
        #    "April 30 2026", "april 30, 2026", "april 30"
        m = re.search(
            rf'({_MONTH_NAMES})\s+(\d{{1,2}})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{{4}}))?',
            msg
        )
        if m:
            entities["date"] = m.group(0)
        else:
            #    "30/04/2026", "30-04-2026"
            m = re.search(r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})', msg)
            if m:
                entities["date"] = m.group(0)
            else:
                #    "2026-04-30" (ISO format)
                m = re.search(r'(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})', msg)
                if m:
                    entities["date"] = m.group(0)

    # 2. If no specific date found, check keyword phrases
    if "date" not in entities:
        for phrase, value in _DATE_KEYWORDS.items():
            if phrase in msg:
                entities["date"] = value
                break

    # 3. "last N days" / "past N days"
    m = re.search(r'(?:last|past)\s+(\d+)\s+days?', msg)
    if m:
        entities["date"] = f"last {m.group(1)} days"

    # 4. "last N weeks" / "next N weeks"
    m = re.search(r'(?:last|past|next)\s+(\d+)\s+weeks?', msg)
    if m:
        entities["date"] = f"last {m.group(1)} weeks"

    return {
        "intent": detected_intent,
        "entities": entities
    }


# ─────────────────────────────────────────────────────────────────────────────
# MAIN FUNCTION: uses Gemini if available, falls back to local
# ─────────────────────────────────────────────────────────────────────────────

def detect_intent(message):
    """
    Detects user intent and entities using LLM (Gemini)
    Falls back to local keyword matching if API quota is exhausted.
    Returns structured dict: {intent, entities}
    """

    # ── FAST PATH: Use local parser if Gemini is down ─────────────────────────
    if _is_quota_blocked():
        print("[IntentParser] Quota exhausted — using local keyword fallback")
        return _local_detect_intent(message)

    prompt = f"""
You are an expert AI finance assistant.

Analyze the user's message and return ONLY valid JSON.

The JSON must contain:
- intent → short snake_case (what user wants)
- entities → extracted details (date, category, etc.)

Supported intents:
- fetch_expenses
- fetch_income
- fetch_savings
- financial_summary
- investment_query
- financial_advice
- budget_planning
- financial_education
- general_chat

IMPORTANT RULES:
- If user asks about BOTH income AND expenses → return "financial_summary"
- Always return ONLY JSON
- Do NOT explain anything
- Do NOT add extra text

User message:
"{message}"

Example:
{{
  "intent": "fetch_expenses",
  "entities": {{
    "date": "today"
  }}
}}
"""

    try:
        # 🔹 Step 1: Call Gemini
        response = ask_gemini(prompt)

        # 🔹 Check if Gemini returned a quota error message
        if "quota" in response.lower() and "exhausted" in response.lower():
            return _local_detect_intent(message)

        # 🔹 Step 2: Extract JSON safely (handles extra text)
        json_match = re.search(r'\{.*\}', response, re.DOTALL)

        if not json_match:
            raise ValueError("Invalid JSON response")

        json_str = json_match.group(0)

        # 🔹 Step 3: Convert to Python dict
        data = json.loads(json_str)

        # 🔹 Step 4: Normalize output
        intent = data.get("intent", "general_chat").lower()
        entities = data.get("entities", {})

        return {
            "intent": intent,
            "entities": entities
        }

    except Exception:
        # 🔹 Step 5: Fallback to local detection (never break system)
        return _local_detect_intent(message)