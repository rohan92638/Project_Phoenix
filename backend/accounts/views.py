from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer

User = get_user_model()


# ── REGISTER ──────────────────────────────────────────────────────────────────
@api_view(["POST"])
@authentication_classes([])   # Skip JWT auth — this is a public endpoint
@permission_classes([AllowAny])
def register_user(request):

    # Duplicate email check
    if User.objects.filter(email=request.data.get("email")).exists():
        return Response(
            {"error": "An account with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Account created successfully"},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── LOGIN ─────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@authentication_classes([])   # Skip JWT auth — this is a public endpoint
@permission_classes([AllowAny])
def login_user(request):

    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        email    = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # Single generic error message prevents email enumeration
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Uses Django's check_password (PBKDF2) — NOT SHA-256
        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been disabled"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "user": {
                    "email":      user.email,
                    "first_name": user.first_name,
                    "last_name":  user.last_name,
                },
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
