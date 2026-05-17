from rest_framework import serializers
from .models import Currency, DailySnapshot


class CurrencySerializer(serializers.ModelSerializer):
    """Серіалізатор для Рівня 4 — API курсу валют"""
    class Meta:
        model = Currency
        fields = ["id", "code", "name", "buy_rate", "sell_rate", "updated_at"]


class DailySnapshotSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    currency_name = serializers.CharField(source="currency.name", read_only=True)

    class Meta:
        model = DailySnapshot
        fields = ["id", "currency_code", "currency_name", "date", "buy_rate", "sell_rate", "saved_at"]