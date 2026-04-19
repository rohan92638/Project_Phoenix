from django.contrib import admin
from .models import Category, StudyLog

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title',)

@admin.register(StudyLog)
class StudyLogAdmin(admin.ModelAdmin):
    list_display = ('subject', 'topic', 'category', 'status', 'progress', 'weak')
    list_filter = ('status', 'weak', 'category')
    search_fields = ('subject', 'topic')
