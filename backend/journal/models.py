from django.db import models
from django.conf import settings
from django.utils import timezone

class JournalEntry(models.Model):
    ENTRY_TYPES = [
        ('Mood Log', 'Mood Log'),
        ('Lesson', 'Lesson'),
        ('Reflection', 'Reflection'),
        ('Failure Analysis', 'Failure Analysis'),
        ('Finance Milestone', 'Finance Milestone'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journal_entries')
    title = models.CharField(max_length=255)
    body = models.TextField()
    type = models.CharField(max_length=50, choices=ENTRY_TYPES)
    
    # Store comma-separated tags as a simple CharField for SQLite/PostgreSQL compatibility
    tags = models.CharField(max_length=255, blank=True, null=True)
    
    date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.date}"
