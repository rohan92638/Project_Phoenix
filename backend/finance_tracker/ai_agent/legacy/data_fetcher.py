"""
data_fetcher.py
================
DB query layer for the AI chatbot.
Uses the REAL Transaction model (single unified model for all txn types).
Zero external dependencies.
"""

from django.db.models import Sum, Count, Avg
from finance_tracker.models import Transaction
from datetime import date


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: shared queryset builder
# ─────────────────────────────────────────────────────────────────────────────

def _base_qs(user, start_date=None, end_date=None, txn_type=None):
    """Build base queryset filtered by user, date range, and optional type."""
    qs = Transaction.objects.filter(user=user)
    if txn_type:
        qs = qs.filter(transaction_type=txn_type.upper())
    if start_date and end_date:
        qs = qs.filter(date__range=[start_date, end_date])
    return qs


# ─────────────────────────────────────────────────────────────────────────────
# 1. FETCH EXPENSES
# ─────────────────────────────────────────────────────────────────────────────

def get_expenses(user, start_date=None, end_date=None):
    """Returns total expense and category breakdown for the period."""
    qs = _base_qs(user, start_date, end_date, txn_type='EXPENSE')

    total = float(qs.aggregate(t=Sum('amount'))['t'] or 0)

    by_category = list(
        qs.values('category')
          .annotate(total=Sum('amount'), count=Count('id'))
          .order_by('-total')
    )

    top_items = list(
        qs.order_by('-amount')
          .values('description', 'amount', 'category', 'date')[:5]
    )

    return {
        "total_expense": total,
        "by_category":   by_category,
        "top_items":     top_items,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. FETCH INCOME
# ─────────────────────────────────────────────────────────────────────────────

def get_income(user, start_date=None, end_date=None):
    """Returns total income and per-category breakdown for the period."""
    qs = _base_qs(user, start_date, end_date, txn_type='INCOME')

    total = float(qs.aggregate(t=Sum('amount'))['t'] or 0)

    by_category = list(
        qs.values('category')
          .annotate(total=Sum('amount'), count=Count('id'))
          .order_by('-total')
    )

    return {
        "total_income": total,
        "by_category":  by_category,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. FETCH SAVINGS (manual saving entries)
# ─────────────────────────────────────────────────────────────────────────────

def get_savings(user, start_date=None, end_date=None):
    """Returns manually recorded savings total for the period."""
    qs = _base_qs(user, start_date, end_date, txn_type='SAVING')
    total = float(qs.aggregate(t=Sum('amount'))['t'] or 0)
    return {"total_savings": total}


# ─────────────────────────────────────────────────────────────────────────────
# 4. FULL FINANCIAL SUMMARY  ← most used by chatbot
# ─────────────────────────────────────────────────────────────────────────────

def get_financial_summary(user, start_date=None, end_date=None):
    """
    Returns a unified financial picture:
      income, expenses, manual_savings, net_savings, saving_ratio,
      expense_breakdown (by category), income_breakdown (by category)
    """
    income_data  = get_income(user, start_date, end_date)
    expense_data = get_expenses(user, start_date, end_date)
    saving_data  = get_savings(user, start_date, end_date)

    total_income   = income_data["total_income"]
    total_expense  = expense_data["total_expense"]
    manual_savings = saving_data["total_savings"]
    net_savings    = round(total_income - total_expense - manual_savings, 2)
    saving_ratio   = round((net_savings / total_income * 100), 1) if total_income > 0 else 0

    return {
        "total_income":       total_income,
        "total_expense":      total_expense,
        "manual_savings":     manual_savings,
        "net_savings":        net_savings,
        "saving_ratio":       saving_ratio,
        "expense_breakdown":  expense_data["by_category"],
        "income_breakdown":   income_data["by_category"],
        "top_expenses":       expense_data["top_items"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. HIGHEST SPENDING CATEGORY
# ─────────────────────────────────────────────────────────────────────────────

def get_highest_spending(user, start_date=None, end_date=None):
    """Returns the single category with the highest spending."""
    cats = get_expenses(user, start_date, end_date)["by_category"]
    if not cats:
        return None
    top = cats[0]
    return {"category": top["category"], "amount": float(top["total"])}


# ─────────────────────────────────────────────────────────────────────────────
# 6. ALL-TIME OVERALL SUMMARY  (used when no date specified)
# ─────────────────────────────────────────────────────────────────────────────

def get_overall_summary(user):
    """All-time summary — used as fallback context for advice/education queries."""
    return get_financial_summary(user, date(2000, 1, 1), date.today())


# ==========================================
# ML Wrapper
# ==========================================

def predict_budget(user, default_budget=50000) -> dict:
    from django.db.models import Sum
    from django.db.models.functions import TruncDate
    from finance_tracker.ml.budget_predictor import predict_budget_exceed

    daily_data = (
        Transaction.objects
        .filter(user=user, transaction_type="EXPENSE")
        .annotate(day=TruncDate('date'))
        .values('day')
        .annotate(total=Sum('amount'))
        .order_by('day')
    )
    daily_expenses = [float(d['total']) for d in daily_data]
    return predict_budget_exceed(daily_expenses, default_budget)