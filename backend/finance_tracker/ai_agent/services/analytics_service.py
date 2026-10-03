from django.db.models import Sum, Count
from finance_tracker.ai_agent.repositories.finance_repository import get_transactions_by_user

def analyze_spending_patterns(user_id: int, start_date=None, end_date=None):
    txns = get_transactions_by_user(user_id, start_date, end_date, 'EXPENSE', limit=1000)
    if not txns:
        return {"error": "No expenses found for the specified period."}
        
    categories = {}
    total_spent = 0
    for txn in txns:
        cat = txn['category'] or 'Uncategorized'
        amt = float(txn['amount'])
        total_spent += amt
        categories[cat] = categories.get(cat, 0) + amt
        
    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    
    analysis = {
        "total_spent": round(total_spent, 2),
        "top_categories": [],
    }
    
    for cat, amt in sorted_cats[:5]:
        percentage = round((amt / total_spent) * 100, 1) if total_spent > 0 else 0
        analysis["top_categories"].append({
            "category": cat,
            "amount": round(amt, 2),
            "percentage": percentage
        })
        
    return analysis
