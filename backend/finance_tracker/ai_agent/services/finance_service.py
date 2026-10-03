from finance_tracker.ai_agent.repositories.finance_repository import get_transactions_by_user, get_total

def get_user_transactions(user_id: int, start_date=None, end_date=None, transaction_type=None, category=None, limit=50):
    return get_transactions_by_user(user_id, start_date, end_date, transaction_type, category, limit)

def get_financial_summary_metrics(user_id: int, start_date=None, end_date=None):
    total_income = get_total(user_id, 'INCOME', start_date, end_date)
    total_expense = get_total(user_id, 'EXPENSE', start_date, end_date)
    manual_savings = get_total(user_id, 'SAVING', start_date, end_date)
    
    net_savings = round(total_income - total_expense - manual_savings, 2)
    saving_ratio = round((net_savings / total_income * 100), 1) if total_income > 0 else 0
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "manual_savings": manual_savings,
        "net_savings": net_savings,
        "saving_ratio": saving_ratio
    }
