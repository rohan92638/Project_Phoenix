from django.contrib import admin
from .models import DailyTask

@admin.register(DailyTask)
class DailyTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'date', 'status', 'is_recurring')
    list_filter = ('status', 'date', 'is_recurring')
    search_fields = ('title', 'description', 'notes')
