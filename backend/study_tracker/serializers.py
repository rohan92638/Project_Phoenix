from rest_framework import serializers
from .models import Category, StudyLog

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        
class StudyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyLog
        fields = '__all__'