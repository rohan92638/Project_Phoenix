import numpy as np

def predict_budget_exceed(daily_expenses, monthly_budget):
    """
    daily_expenses: list of daily totals [100, 200, 300...]
    monthly_budget: int
    """

    if len(daily_expenses) < 5:
        return {
            "status": "Need at least 5 days of data"
        }

    # Convert to numpy
    days = np.arange(len(daily_expenses))
    expenses = np.array(daily_expenses)

    # Fit line (y = mx + c)
    slope, intercept = np.polyfit(days, expenses, 1)

    # Predict next 30 days total
    future_days = np.arange(30)
    predictions = slope * future_days + intercept

    total_predicted = np.sum(predictions)

    if total_predicted > monthly_budget:
        return {
            "alert": f"⚠️ You may exceed your budget (₹{int(total_predicted)})"
        }
    else:
        return {
            "alert": f"✅ You are within budget (₹{int(total_predicted)})"
        }