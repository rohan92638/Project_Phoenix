from django.contrib import admin
from .models import JournalEntry

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'date', 'user')
    search_fields = ('title', 'type', 'date')
