from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def validate(self, data):
        txn_type = data.get('transaction_type')
        
        # Enforce validation rules strictly
        if txn_type == 'EXPENSE':
            if not data.get('category'):
                raise serializers.ValidationError({"category": "Category is required for expenses."})
            if not data.get('payment_method'):
                raise serializers.ValidationError({"payment_method": "Payment method is required for expenses."})
        
        return data

    def create(self, validated_data):
        # Enforce null overrides for Income/Savings structurally
        txn_type = validated_data.get('transaction_type')
        if txn_type in ['INCOME', 'SAVING']:
            validated_data['category'] = None
            validated_data['payment_method'] = None
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        txn_type = validated_data.get('transaction_type', instance.transaction_type)
        if txn_type in ['INCOME', 'SAVING']:
            validated_data['category'] = None
            validated_data['payment_method'] = None
            
        return super().update(instance, validated_data)
