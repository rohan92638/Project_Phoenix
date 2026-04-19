from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer

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
