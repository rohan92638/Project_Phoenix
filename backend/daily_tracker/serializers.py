from rest_framework import serializers
from .models import DailyTask


class DailyTaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = DailyTask
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    # ✅ Validate status
    def validate_status(self, value):
        valid_status = ['PENDING', 'DONE', 'MISSED', 'PARTIAL']
        if value not in valid_status:
            raise serializers.ValidationError("Invalid status value")
        return value

    # ✅ Prevent duplicate manually (extra safety)
    def validate(self, data):
        user = self.context['request'].user
        title = data.get('title')
        date = data.get('date')

        if DailyTask.objects.filter(user=user, title=title, date=date).exists():
            raise serializers.ValidationError(
                "Task with this title already exists for this date"
            )
        return data

    # ✅ Auto assign user
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    # ✅ Allow only status update (PATCH safety)
    def update(self, instance, validated_data):
        # Only allow status, notes, description update
        allowed_fields = ['status', 'notes', 'description']

        for field in validated_data:
            if field not in allowed_fields:
                raise serializers.ValidationError(
                    f"You cannot update '{field}' field"
                )

        return super().update(instance, validated_data)