from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

# Initialize the DefaultRouter natively tied to DRF
router = DefaultRouter()

# Route it safely assigning the specific CRUD paths matching front-end expectations
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
