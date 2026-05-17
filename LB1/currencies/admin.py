from django.contrib import admin
from .models import Currency, DailySnapshot


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    """
    Рівень 3: Додавання нових валют через вбудовану адмін-панель.
    Адмін доступний за адресою /admin/
    """
    list_display = ("code", "name", "buy_rate", "sell_rate", "updated_at")
    list_editable = ("buy_rate", "sell_rate")
    search_fields = ("code", "name")
    ordering = ("code",)


@admin.register(DailySnapshot)
class DailySnapshotAdmin(admin.ModelAdmin):
    list_display = ("currency", "date", "buy_rate", "sell_rate", "saved_at")
    list_filter = ("date", "currency")
    ordering = ("-date",)