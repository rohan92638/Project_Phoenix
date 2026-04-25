import os
import sys

# Setup Django environment
sys.path.append('c:\\Users\\rohan\\OneDrive\\Desktop\\Phoenix\\Project_Phoenix\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from finance_tracker.models import Transaction

txns = Transaction.objects.all()
print(f"Total transactions in DB: {txns.count()}")
for t in txns:
    print(f"ID: {t.id} | User: {str(t.user)} | Type: {t.transaction_type} | Category: {t.category} | Amount: {t.amount} | Desc: {t.description}")
