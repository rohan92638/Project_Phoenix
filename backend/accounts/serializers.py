from rest_framework import serializers
from .models import User
import hashlib  # simple hashing (for now)

# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'mobile', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"error": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # remove it
        
        # 🔐 hash password
        password = validated_data.get('password')
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        validated_data['password'] = hashed_password
        return User.objects.create(**validated_data)
    

# LOGIN SERIALIZER
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)