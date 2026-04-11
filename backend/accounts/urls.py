from django.urls import path
from .views import register_user, login_user

# JWT IMPORT
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    
    # JWT APIs (ADD THESE)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]