from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.get_categories),
    path('categories/create/', views.create_category),
    path('logs/<int:category_id>/', views.get_logs),
    path('logs/create/', views.create_log),
]