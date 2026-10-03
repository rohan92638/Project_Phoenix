import json
from finance_tracker.ai_agent.services.budget_service import calculate_budget_plan

def calculate_budget(user_id: int, monthly_income: float) -> str:
    """
    Create a practical budget based on monthly income using the 50/30/20 rule.
    """
    try:
        plan = calculate_budget_plan(monthly_income)
        return json.dumps(plan)
    except Exception as e:
        return json.dumps({"error": str(e)})

calculate_budget_schema = {
    "type": "function",
    "function": {
        "name": "calculate_budget",
        "description": "Create a practical budget based on monthly income.",
        "parameters": {
            "type": "object",
            "properties": {
                "monthly_income": {"type": "number", "description": "Monthly income"}
            },
            "required": ["monthly_income"]
        }
    }
}
