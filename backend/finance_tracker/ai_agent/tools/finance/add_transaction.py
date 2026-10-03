import json
from datetime import date
from finance_tracker.models import Transaction

def add_transaction(user_id: int, amount: float, category: str, description: str, transaction_type: str = "EXPENSE", transaction_date: str = None) -> str:
    """
    Add a new transaction for the user.
    """
    try:
        if amount <= 0:
            return json.dumps({"error": "Amount must be positive."})
            
        t_type = transaction_type.upper()
        if t_type not in ["EXPENSE", "INCOME", "SAVING"]:
            return json.dumps({"error": "Invalid transaction_type. Must be EXPENSE, INCOME, or SAVING."})
            
        txn_date = date.today()
        if transaction_date:
            from datetime import datetime
            txn_date = datetime.strptime(transaction_date, "%Y-%m-%d").date()
            
        Transaction.objects.create(
            user_id=user_id,
            amount=amount,
            category=category,
            description=description,
            transaction_type=t_type,
            date=txn_date
        )
        
        return json.dumps({"success": True, "message": f"Successfully added {t_type} of {amount} for {category}."})
    except Exception as e:
        return json.dumps({"error": str(e)})

add_transaction_schema = {
    "type": "function",
    "function": {
        "name": "add_transaction",
        "description": "Add a new financial transaction (expense, income, or saving).",
        "parameters": {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "description": "Transaction amount"},
                "category": {"type": "string", "description": "Category (e.g. food, rent)"},
                "description": {"type": "string", "description": "Short description"},
                "transaction_type": {"type": "string", "description": "EXPENSE, INCOME, or SAVING (default EXPENSE)"},
                "transaction_date": {"type": "string", "description": "YYYY-MM-DD (optional, defaults to today)"}
            },
            "required": ["amount", "category", "description"]
        }
    }
}
