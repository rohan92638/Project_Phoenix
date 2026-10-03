import json
from finance_tracker.ai_agent.services.finance_service import get_user_transactions

def get_transactions(user_id: int, category: str = None, start_date: str = None, end_date: str = None, transaction_type: str = None, limit: int = 50) -> str:
    """
    Retrieve exact financial transactions from PostgreSQL.
    Use when user asks for specific transactions.
    """
    try:
        transactions = get_user_transactions(user_id, start_date, end_date, transaction_type, category, limit)
        for txn in transactions:
            txn['amount'] = float(txn['amount'])
            if txn['date']:
                txn['date'] = str(txn['date'])
        return json.dumps({"transactions": transactions})
    except Exception as e:
        return json.dumps({"error": str(e)})

get_transactions_schema = {
    "type": "function",
    "function": {
        "name": "get_transactions",
        "description": "Retrieve exact financial transactions from PostgreSQL.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Filter by category (e.g. food)"},
                "start_date": {"type": "string", "description": "Start date YYYY-MM-DD"},
                "end_date": {"type": "string", "description": "End date YYYY-MM-DD"},
                "transaction_type": {"type": "string", "description": "EXPENSE, INCOME, or SAVING"},
                "limit": {"type": "integer", "description": "Number of records to return"}
            }
        }
    }
}
