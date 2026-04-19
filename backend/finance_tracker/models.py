from django.db import models
from django.conf import settings
from django.utils import timezone

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
        ('SAVING', 'Saving'),
    )
    
    PAYMENT_TYPES = (
        ('Card', 'Card'),
        ('UPI', 'UPI'),
        ('Cash', 'Cash'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField(default=timezone.now)
    
    # Optional logic mapping strictly to Expenses
    category = models.CharField(max_length=50, blank=True, null=True) 
    payment_method = models.CharField(max_length=20, choices=PAYMENT_TYPES, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.transaction_type} | {self.amount} - {self.user}"
