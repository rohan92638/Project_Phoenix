from django.test import TestCase
from finance_tracker.models import Transaction
from finance_tracker.ai_agent.tools.finance.get_transactions import get_transactions
from finance_tracker.ai_agent.tools.finance.get_financial_summary import get_financial_summary
from finance_tracker.ai_agent.tools.finance.analyze_spending import analyze_spending
from finance_tracker.ai_agent.tools.finance.add_transaction import add_transaction
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class AgentToolTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="testuser")
        Transaction.objects.create(user=self.user, amount=500, category="Food", description="Dinner", transaction_type="EXPENSE")
        Transaction.objects.create(user=self.user, amount=10000, category="Salary", description="Work", transaction_type="INCOME")

    def test_get_transactions(self):
        res = json.loads(get_transactions(user_id=self.user.id, transaction_type="EXPENSE"))
        self.assertIn("transactions", res)
        self.assertEqual(len(res["transactions"]), 1)
        self.assertEqual(res["transactions"][0]["amount"], 500.0)

    def test_get_financial_summary(self):
        res = json.loads(get_financial_summary(user_id=self.user.id))
        self.assertEqual(res["total_income"], 10000.0)
        self.assertEqual(res["total_expense"], 500.0)

    def test_analyze_spending(self):
        res = json.loads(analyze_spending(user_id=self.user.id))
        self.assertEqual(res["total_spent"], 500.0)
        self.assertEqual(res["top_categories"][0]["category"], "Food")
        
    def test_add_transaction(self):
        res = json.loads(add_transaction(user_id=self.user.id, amount=200, category="Transport", description="Bus fare", transaction_type="EXPENSE"))
        self.assertTrue(res.get("success"))
        self.assertEqual(Transaction.objects.filter(user=self.user).count(), 3)
