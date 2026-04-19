from rest_framework import serializers
from .models import JournalEntry

class JournalEntrySerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list
    )

    class Meta:
        model = JournalEntry
        fields = ['id', 'title', 'body', 'type', 'tags', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        """Convert comma-separated tags from DB into an array for the frontend."""
        representation = super().to_representation(instance)
        
        # Tags string to list
        if instance.tags:
            # Handle empty spaces if any
            tags_list = [tag.strip() for tag in instance.tags.split(',') if tag.strip()]
            representation['tags'] = tags_list
        else:
            representation['tags'] = []
            
        # Optional: Attach UI styling logic to match what Frontend seed data expects.
        # This keeps the frontend clean even if it derives it itself.
        type_mapping = {
            'Mood Log': {'typeIcon': 'mood', 'typeColor': 'text-primary', 'typeBg': 'bg-primary/10'},
            'Lesson': {'typeIcon': 'history_edu', 'typeColor': 'text-secondary', 'typeBg': 'bg-secondary/10'},
            'Reflection': {'typeIcon': 'edit_note', 'typeColor': 'text-tertiary', 'typeBg': 'bg-tertiary/10'},
            'Failure Analysis': {'typeIcon': 'dangerous', 'typeColor': 'text-tertiary', 'typeBg': 'bg-tertiary/10'},
            'Finance Milestone': {'typeIcon': 'payments', 'typeColor': 'text-secondary-container', 'typeBg': 'bg-secondary-container/10'},
        }
        
        mapping = type_mapping.get(instance.type, type_mapping['Reflection'])
        representation['typeIcon'] = mapping['typeIcon']
        representation['typeColor'] = mapping['typeColor']
        representation['typeBg'] = mapping['typeBg']
        
        return representation

    def to_internal_value(self, data):
        """Let DRF validate the array from frontend, then stringify for DB."""
        # 1. Standard validation (ListField expects a list)
        internal_value = super().to_internal_value(data)
        
        # 2. Convert the validated list into a comma-separated string for our CharField DB
        if 'tags' in internal_value and isinstance(internal_value['tags'], list):
           internal_value['tags'] = ','.join(internal_value['tags'])
           
        return internal_value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
