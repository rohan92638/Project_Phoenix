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
    5. gemini_client  → generate AI response (or local fallback)
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
from .gemini_client  import ask_gemini, _is_quota_blocked
from .memory_manager import get_history, add_exchange
from .vector_store import add_to_vector_db, get_memory_context
from .voice_handler  import text_to_speech_base64


# ─────────────────────────────────────────────────────────────────────────────
# LOCAL RESPONSE FORMATTER — works without any Gemini API call
# ─────────────────────────────────────────────────────────────────────────────

def _fmt(amount) -> str:
    """Format a number as ₹X,XXX"""
    try:
        return f"₹{float(amount):,.0f}"
    except Exception:
        return "₹0"


def _format_local_reply(intent: str, data: dict, date_range: str, user_message: str = "") -> str:
    """
    Generate a human-readable reply from raw DB data WITHOUT calling Gemini.
    This is the offline fallback when the API quota is exhausted.
    """
    lines = []

    if intent == "fetch_expenses":
        total = data.get("total_expense", 0)
        lines.append(f"📊 **Your Expenses** ({date_range})")
        lines.append(f"**Total Spent:** {_fmt(total)}")

        cats = data.get("by_category", [])
        if cats:
            lines.append("")
            lines.append("📂 **By Category:**")
            for item in cats[:6]:
                cat = item.get("category") or "Uncategorized"
                amt = _fmt(item.get("total", 0))
                cnt = item.get("count", "")
                lines.append(f"  • {cat}: {amt} ({cnt} txns)" if cnt else f"  • {cat}: {amt}")

        top = data.get("top_items", [])
        if top:
            lines.append("")
            lines.append("🔝 **Top Expenses:**")
            for item in top[:5]:
                lines.append(
                    f"  • [{item.get('date', '?')}] {item.get('description', '?')} "
                    f"— {_fmt(item.get('amount', 0))} ({item.get('category', '—')})"
                )

        if total == 0:
            lines.append("\nNo expenses found for this period.")

    elif intent == "fetch_income":
        total = data.get("total_income", 0)
        lines.append(f"💰 **Your Income** ({date_range})")
        lines.append(f"**Total Income:** {_fmt(total)}")

        cats = data.get("by_category", [])
        if cats:
            lines.append("")
            lines.append("📂 **By Source:**")
            for item in cats[:6]:
                cat = item.get("category") or "General"
                amt = _fmt(item.get("total", 0))
                lines.append(f"  • {cat}: {amt}")

        if total == 0:
            lines.append("\nNo income found for this period.")

    elif intent == "fetch_savings":
        total = data.get("total_savings", 0)
        lines.append(f"🏦 **Your Savings** ({date_range})")
        lines.append(f"**Total Savings:** {_fmt(total)}")

        if total == 0:
            lines.append("\nNo savings entries found for this period.")

    elif intent in ("financial_summary", "budget_planning"):
        lines.append(f"📊 **Financial Summary** ({date_range})")
        lines.append(f"  💰 Income:   {_fmt(data.get('total_income', 0))}")
        lines.append(f"  💸 Expenses: {_fmt(data.get('total_expense', 0))}")
        lines.append(f"  🏦 Savings:  {_fmt(data.get('manual_savings', 0))}")
        lines.append(f"  📈 Net:      {_fmt(data.get('net_savings', 0))}")

        ratio = data.get("saving_ratio", 0)
        lines.append(f"  📊 Saving Ratio: {ratio}%")

        cats = data.get("expense_breakdown", [])
        if cats:
            lines.append("")
            lines.append("📂 **Expense Breakdown:**")
            for item in cats[:5]:
                cat = item.get("category") or "Uncategorized"
                lines.append(f"  • {cat}: {_fmt(item.get('total', 0))}")

        pred = data.get("prediction")
        if pred and isinstance(pred, dict):
            alert = pred.get("alert", "")
            if alert:
                lines.append(f"\n🔮 **Budget Prediction:** {alert}")

    elif intent == "financial_advice":
        import re
        msg = user_message.lower()

        total_income = data.get("total_income", 0)
        total_expense = data.get("total_expense", 0)
        net_savings = data.get("net_savings", 0)
        ratio = data.get("saving_ratio", 0)

        # ── Extract salary/amount from user message ───────────────────────────
        mentioned_salary = None
        salary_match = re.search(
            r'(?:salary|income|earn|earning|making|have|get|getting)\s*'
            r'(?:is|of|about|around|approximately)?\s*'
            r'(?:rs\.?|₹|inr)?\s*(\d[\d,]*)',
            msg
        )
        if not salary_match:
            # Try plain amount: "12000 rupees", "₹15000", "rs 20000"
            salary_match = re.search(
                r'(?:rs\.?|₹|inr)\s*(\d[\d,]*)|(\d[\d,]*)\s*(?:rupees?|rs\.?|₹|inr|salary)',
                msg
            )
        if salary_match:
            amt_str = salary_match.group(1) or salary_match.group(2)
            if amt_str:
                mentioned_salary = int(amt_str.replace(",", ""))

        # ── Check if user asked about a specific future timeframe ─────────────
        has_time_query = bool(re.search(r'(?:next|upcoming)\s+\d+\s+(?:days?|weeks?|months?)', msg))

        if mentioned_salary:
            # ── PERSONALIZED BUDGET PLAN based on stated salary ────────────────
            s = mentioned_salary
            lines.append(f"💰 **Budget Plan for ₹{s:,}/month salary:**")
            lines.append("")
            lines.append("📐 **50/30/20 Rule Breakdown:**")
            lines.append(f"  🏠 Needs (50%):  {_fmt(s * 0.50)}  — rent, food, bills, transport")
            lines.append(f"  🎯 Wants (30%):  {_fmt(s * 0.30)}  — shopping, entertainment, dining out")
            lines.append(f"  💰 Savings (20%): {_fmt(s * 0.20)}  — emergency fund, investments")
            lines.append("")
            lines.append("📊 **Daily Budget:**")
            lines.append(f"  • Daily needs:  {_fmt(s * 0.50 / 30)}/day")
            lines.append(f"  • Daily wants:  {_fmt(s * 0.30 / 30)}/day")
            lines.append(f"  • Daily saving: {_fmt(s * 0.20 / 30)}/day")
            lines.append("")
            lines.append("💡 **Tips for ₹{:,} salary:**".format(s))
            if s <= 15000:
                lines.append("  • Cook at home — saves ₹3,000-5,000/month vs eating out")
                lines.append("  • Use public transport over cabs")
                lines.append("  • Start with ₹500/month SIP in an index fund")
                lines.append("  • Build an emergency fund of ₹36,000 (3 months expenses)")
            elif s <= 30000:
                lines.append("  • Automate savings — transfer 20% on salary day")
                lines.append("  • Start SIP of ₹2,000-3,000/month in mutual funds")
                lines.append("  • Emergency fund target: ₹90,000 (3 months)")
                lines.append("  • Avoid EMIs on depreciating items")
            else:
                lines.append("  • Invest 20-30% in diversified mutual funds")
                lines.append("  • Consider PPF/ELSS for tax savings under 80C")
                lines.append("  • Emergency fund target: 6 months of expenses")
                lines.append("  • Health insurance is essential — don't skip it")

            # Also show actual position for context
            if total_income > 0 or total_expense > 0:
                lines.append("")
                lines.append(f"📊 **Your Actual Data** ({date_range}):")
                lines.append(f"  💰 Recorded Income:  {_fmt(total_income)}")
                lines.append(f"  💸 Recorded Expenses: {_fmt(total_expense)}")

        elif has_time_query:
            # ── TIME-BASED PROJECTION (user asked "next N days/weeks") ─────────
            lines.append(f"📊 **Your Financial Position** ({date_range})")
            lines.append(f"  💰 Income:   {_fmt(total_income)}")
            lines.append(f"  💸 Expenses: {_fmt(total_expense)}")
            lines.append(f"  📈 Net:      {_fmt(net_savings)}")
            lines.append(f"  📊 Saving Ratio: {ratio}%")
            lines.append("")

            target_days = 7
            duration_label = "7 days"
            m_days = re.search(r'(?:next|upcoming)\s+(\d+)\s+days?', msg)
            m_weeks = re.search(r'(?:next|upcoming)\s+(\d+)\s+weeks?', msg)
            m_months = re.search(r'(?:next|upcoming)\s+(\d+)\s+months?', msg)
            if m_days:
                target_days = int(m_days.group(1))
                duration_label = f"{target_days} day(s)"
            elif m_weeks:
                target_days = int(m_weeks.group(1)) * 7
                duration_label = f"{int(m_weeks.group(1))} week(s)"
            elif m_months:
                target_days = int(m_months.group(1)) * 30
                duration_label = f"{int(m_months.group(1))} month(s)"

            if total_expense > 0:
                baseline_days = max(target_days, 1)
                daily_avg = total_expense / 30  # use 30-day baseline
                projected = daily_avg * target_days
                lines.append(f"💡 **Spending Guidance (next {duration_label}):**")
                lines.append(f"  • Your avg daily spend: {_fmt(daily_avg)}/day")
                lines.append(f"  • Projected {duration_label} spend: {_fmt(projected)}")

                cats = data.get("expense_breakdown", [])
                if cats:
                    top_cat = cats[0]
                    lines.append(f"  • Biggest category: **{top_cat.get('category', '?')}** ({_fmt(top_cat.get('total', 0))})")
                    lines.append(f"  • 💡 Try reducing {top_cat.get('category', 'this')} by 20%")
        else:
            # ── GENERAL ADVICE (no salary, no time) ───────────────────────────
            lines.append(f"📊 **Your Financial Position** ({date_range})")
            lines.append(f"  💰 Income:   {_fmt(total_income)}")
            lines.append(f"  💸 Expenses: {_fmt(total_expense)}")
            lines.append(f"  📈 Net:      {_fmt(net_savings)}")
            lines.append(f"  📊 Saving Ratio: {ratio}%")
            lines.append("")

            lines.append("💡 **General Financial Tips:**")
            if ratio < 0:
                lines.append("  ⚠️ You're spending MORE than you earn!")
                lines.append("  • Track every expense for 1 week")
                lines.append("  • Cut non-essential subscriptions")
                lines.append("  • Try a no-spend day once a week")
            elif ratio < 20:
                lines.append(f"  ⚠️ Saving ratio is {ratio}% — target is 20%+")
                lines.append("  • Use the 50/30/20 rule: needs/wants/savings")
                lines.append("  • Automate savings on salary day")
            else:
                lines.append(f"  ✅ Great! You're saving {ratio}% of your income")
                lines.append("  • Consider investing savings in SIPs or FDs")

            lines.append("")
            lines.append("💬 _For a personalized plan, tell me your salary:_")
            lines.append('  _Example: "I have 12000 rupees salary, guide me"_')

    elif intent in ("investment_query", "financial_education"):
        lines.append(f"📊 **Your Overall Financial Position:**")
        lines.append(f"  💰 Total Income:   {_fmt(data.get('total_income', 0))}")
        lines.append(f"  💸 Total Expenses: {_fmt(data.get('total_expense', 0))}")
        lines.append(f"  📈 Net Savings:    {_fmt(data.get('net_savings', 0))}")
        lines.append("")
        lines.append("⚠️ _Detailed AI advice is unavailable right now (API quota exhausted)._")
        lines.append("_Replace your API key in `backend/.env` for AI-powered insights._")

    else:
        lines.append("👋 Hi! I'm Phoenix AI, your finance assistant.")
        lines.append("")
        lines.append("⚠️ _The AI service is temporarily unavailable (quota exhausted)._")
        lines.append("_But I can still show your real data! Try asking:_")
        lines.append("  • \"Show my expenses today\"")
        lines.append("  • \"Show my income this month\"")
        lines.append("  • \"Show my financial summary\"")

    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

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

    # ── 5. Check if Gemini is available ───────────────────────────────────────
    quota_blocked = _is_quota_blocked()

    if not quota_blocked:
        # ── 5a. FULL AI PATH — Gemini is available ────────────────────────────

        # Retrieve relevant past memory (FAISS)
        memory_context = get_memory_context(user.id, user_message)

        # Build the grounded prompt
        prompt = build_prompt(user_message, intent, entities, data, history, memory_context)

        # Call Gemini
        reply = ask_gemini(prompt, history=history)

        # Check if Gemini just NOW returned a quota error
        if "quota" in reply.lower() and ("exhausted" in reply.lower() or "reached" in reply.lower()):
            # Gemini just died — use local fallback for THIS request
            reply = _format_local_reply(intent, data, entities["date_range"], user_message)
    else:
        # ── 5b. LOCAL FALLBACK — format data directly (no API calls) ──────────
        reply = _format_local_reply(intent, data, entities["date_range"], user_message)

    # ── 6. Store exchange in memory ───────────────────────────────────────────
    add_exchange(session_id, user_message, reply)

    # ── 7. Store to Vector DB for permanent semantic search ───────────────────
    if not quota_blocked:
        exchange_text = f"User asked: '{user_message}' | AI replied: '{reply}'"
        try:
            add_to_vector_db(user.id, exchange_text)
        except Exception as e:
            print(f"Warning: Failed to save to vector DB: {e}")

    # ── 8. Optionally generate voice output (TTS) ─────────────────────────────
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
