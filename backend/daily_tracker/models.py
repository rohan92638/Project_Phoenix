from django.db import models
from django.utils import timezone
from django.conf import settings


class DailyTask(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('DONE', 'Done'),
        ('MISSED', 'Missed'),
        ('PARTIAL', 'Partial'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    date = models.DateField(default=timezone.now)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # 🔥 Optional features
    is_recurring = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'title', 'date']  # 🚫 prevent duplicate tasks

    def __str__(self):
        return f"{self.title} - {self.date}"