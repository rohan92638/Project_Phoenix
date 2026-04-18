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

    def to_representation(self, instance):
        """
        Dynamically enrich the response to include the full Category object 
        instead of just the Category ID whenever this serializer is read.
        """
        response = super().to_representation(instance)
        response['category'] = CategorySerializer(instance.category).data
        return response