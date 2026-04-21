from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, predict_category_api, spending_insight_api

# Initialize the DefaultRouter natively tied to DRF
router = DefaultRouter()

# Route it safely assigning the specific CRUD paths matching front-end expectations
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    # 🔥 AI endpoint
    path('predict-category/', predict_category_api),
    path('insight/', spending_insight_api),
]
