# study/models.py

from django.db import models

class Category(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class StudyLog(models.Model):
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Revision Required', 'Revision Required'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='logs')
    subject = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    numericals = models.IntegerField(default=0)
    revision = models.IntegerField(default=0)
    progress = models.IntegerField(default=0)
    weak = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)