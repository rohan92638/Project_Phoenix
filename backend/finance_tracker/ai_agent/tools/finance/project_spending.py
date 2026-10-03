import json
from finance_tracker.ai_agent.services.projection_service import project_future_spending

def project_spending(user_id: int) -> str:
    """
    Estimate future spending based on current month spending.
    """
    try:
        projection = project_future_spending(user_id)
        return json.dumps(projection)
    except Exception as e:
        return json.dumps({"error": str(e)})

project_spending_schema = {
    "type": "function",
    "function": {
        "name": "project_spending",
        "description": "Estimate future spending for the current month based on historical data.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
}
