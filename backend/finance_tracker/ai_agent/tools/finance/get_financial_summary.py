import json
from finance_tracker.ai_agent.services.finance_service import get_financial_summary_metrics

def get_financial_summary(user_id: int, start_date: str = None, end_date: str = None) -> str:
    """
    Return exact financial metrics: total income, total expenses, savings, saving ratio.
    """
    try:
        summary = get_financial_summary_metrics(user_id, start_date, end_date)
        return json.dumps(summary)
    except Exception as e:
        return json.dumps({"error": str(e)})

get_financial_summary_schema = {
    "type": "function",
    "function": {
        "name": "get_financial_summary",
        "description": "Return exact financial metrics: total income, total expenses, savings, saving ratio.",
        "parameters": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Start date YYYY-MM-DD"},
                "end_date": {"type": "string", "description": "End date YYYY-MM-DD"}
            }
        }
    }
}
