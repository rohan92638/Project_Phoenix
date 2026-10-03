def calculate_budget_plan(monthly_income: float):
    """50/30/20 rule budget."""
    needs = monthly_income * 0.50
    wants = monthly_income * 0.30
    savings = monthly_income * 0.20
    return {
        "monthly_income": monthly_income,
        "needs": needs,
        "wants": wants,
        "savings": savings,
        "daily_needs": round(needs / 30, 2),
        "daily_wants": round(wants / 30, 2),
        "daily_savings": round(savings / 30, 2)
    }
