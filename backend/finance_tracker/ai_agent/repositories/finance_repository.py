from datetime import date
from django.db.models import Sum
from finance_tracker.models import Transaction

def _base_qs(user_id: int, start_date=None, end_date=None, txn_type=None):
    qs = Transaction.objects.filter(user_id=user_id)
    if txn_type:
        qs = qs.filter(transaction_type=txn_type.upper())
    if start_date and end_date:
        qs = qs.filter(date__range=[start_date, end_date])
    return qs

def get_transactions_by_user(user_id: int, start_date=None, end_date=None, txn_type=None, category=None, limit=50):
    qs = _base_qs(user_id, start_date, end_date, txn_type)
    if category:
        qs = qs.filter(category__iexact=category)
    return list(qs.order_by('-date', '-created_at').values('id', 'transaction_type', 'amount', 'description', 'date', 'category', 'payment_method')[:limit])

def get_total(user_id: int, txn_type: str, start_date=None, end_date=None):
    qs = _base_qs(user_id, start_date, end_date, txn_type=txn_type)
    return float(qs.aggregate(t=Sum('amount'))['t'] or 0)
