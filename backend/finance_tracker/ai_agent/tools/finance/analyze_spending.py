import json
from finance_tracker.ai_agent.services.analytics_service import analyze_spending_patterns

def analyze_spending(user_id: int, start_date: str = None, end_date: str = None) -> str:
    """
    Analyze the user's spending patterns and return top categories.
    """
    try:
        analysis = analyze_spending_patterns(user_id, start_date, end_date)
        return json.dumps(analysis)
    except Exception as e:
        return json.dumps({"error": str(e)})

analyze_spending_schema = {
    "type": "function",
    "function": {
        "name": "analyze_spending",
        "description": "Analyze the user's spending patterns and return top categories and percentages.",
        "parameters": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Start date YYYY-MM-DD"},
                "end_date": {"type": "string", "description": "End date YYYY-MM-DD"}
            }
        }
    }
}
