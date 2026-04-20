from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import Transaction
from .serializers import TransactionSerializer
from .ml.predict import predict_category

class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet handling all CRUD operations for the unified Finance Tracker Transaction protocol.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Extremely secure isolated querying logic
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-bind the transaction exclusively against the active token
        serializer.save(user=self.request.user)

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

    category = predict_category(desc)

    return Response({
        "predicted_category": category
    })
