from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from datetime import datetime
import numpy as np

from .models import Transaction
from .serializers import TransactionSerializer
from .ml.predict import predict_category



# =========================
# 🔥 ANOMALY DETECTION LOGIC
# =========================
def detect_anomaly(user, new_amount):
    amounts = list(
        Transaction.objects.filter(user=user)
        .values_list('amount', flat=True)
    )

    # Need minimum data
    if len(amounts) < 5:
        return False

    amounts = [float(a) for a in amounts]

    mean = np.mean(amounts)
    std = np.std(amounts)

    return float(new_amount) > mean + 2 * std


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet handling all CRUD operations for the unified Finance Tracker Transaction protocol.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Extremely secure isolated querying logic
        return Transaction.objects.filter(user=self.request.user)

    # def perform_create(self, serializer):
    #     # Auto-bind the transaction exclusively against the active token
    #     serializer.save(user=self.request.user)

    def perform_create(self, serializer):
        amount = self.request.data.get("amount")

        # Detect anomaly before saving
        is_anomaly = detect_anomaly(self.request.user, amount)

        serializer.save(user=self.request.user)

        # Store flag temporarily
        self._anomaly_flag = is_anomaly

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        # Attach alert if anomaly detected
        if hasattr(self, "_anomaly_flag") and self._anomaly_flag:
            response.data["alert"] = "⚠️ Unusual expense detected"

        return response

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        
        income = qs.filter(transaction_type='INCOME').aggregate(total=Sum('amount'))['total'] or 0
        expenses = qs.filter(transaction_type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
        manual_savings = qs.filter(transaction_type='SAVING').aggregate(total=Sum('amount'))['total'] or 0
        
        income = float(income)
        expenses = float(expenses)
        manual_savings = float(manual_savings)
        
        savings = income - expenses + manual_savings
        
        saving_ratio = 0
        if income > 0:
            saving_ratio = round((savings / income) * 100, 1)
            
        return Response({
            "income": income,
            "expenses": expenses,
            "savings": savings,
            "saving_ratio": saving_ratio
        })

# =========================
# 🔥 AI API (ADD HERE)
# =========================

@api_view(['GET'])
def predict_category_api(request):
    desc = request.GET.get('desc', '')

    if not desc:
        return Response({"error": "Description required"})

    result = predict_category(desc)

    return Response({
        "predicted_category": result["category"],
        "confidence": result["confidence"]
    })




# =========================
# 🔥 SPENDING INSIGHT API
# =========================
@api_view(['GET'])
def spending_insight_api(request):
    user = request.user
    now = datetime.now()

    qs = Transaction.objects.filter(user=user)

    this_month = qs.filter(date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
    last_month = qs.filter(date__month=now.month - 1).aggregate(total=Sum('amount'))['total'] or 0

    this_month = float(this_month)
    last_month = float(last_month)

    change = this_month - last_month

    if change > 0:
        msg = f"Spending increased by ₹{round(change, 2)}"
    elif change < 0:
        msg = f"Spending decreased by ₹{abs(round(change, 2))}"
    else:
        msg = "No major change in spending"

    return Response({"insight": msg})
