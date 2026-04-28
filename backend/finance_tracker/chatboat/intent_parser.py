# intent_parser.py

from .gemini_client import ask_gemini
import json
import re


def detect_intent(message):
    """
    Detects user intent and entities using LLM (Gemini)
    Returns structured dict: {intent, entities}
    """

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
        # 🔹 Step 5: Fallback (never break system)
        return {
            "intent": "general_chat",
            "entities": {}
        }