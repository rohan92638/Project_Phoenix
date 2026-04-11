from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


# ── REGISTER SERIALIZER ───────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ["first_name", "last_name", "email", "mobile", "password", "confirm_password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"error": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)   # 🔐 Uses Django's PBKDF2 + salt hashing
        user.save()
        return user


# ── LOGIN SERIALIZER ──────────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)