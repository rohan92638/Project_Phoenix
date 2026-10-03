from finance_tracker.ai_agent.repositories.finance_repository import get_total
from datetime import datetime
import calendar

def project_future_spending(user_id: int):
    now = datetime.now()
    _, days_in_month = calendar.monthrange(now.year, now.month)
    
    start_date = f"{now.year}-{now.month:02d}-01"
    end_date = f"{now.year}-{now.month:02d}-{now.day:02d}"
    
    current_spent = get_total(user_id, 'EXPENSE', start_date, end_date)
    
    if now.day == 0:
        daily_avg = 0
    else:
        daily_avg = current_spent / now.day
        
    projected_total = daily_avg * days_in_month
    
    return {
        "current_month_spent": round(current_spent, 2),
        "days_elapsed": now.day,
        "daily_average": round(daily_avg, 2),
        "projected_month_end_total": round(projected_total, 2)
    }
