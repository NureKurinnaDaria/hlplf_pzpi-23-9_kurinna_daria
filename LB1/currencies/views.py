from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Currency, DailySnapshot
from .serializers import CurrencySerializer, DailySnapshotSerializer


# ──────────────────────────────────────────────
# РІВЕНЬ 1: Таблиця курсів валют (3 колонки)
# ──────────────────────────────────────────────

def currency_list(request):
    """
    Рівень 1: Відображає таблицю валют з трьома колонками:
    назва, курс купівлі, курс продажу.
    """
    currencies = Currency.objects.all()
    return render(request, "currencies/currency_list.html", {"currencies": currencies})


# ──────────────────────────────────────────────
# РІВЕНЬ 2: Збереження курсів поточного дня
# ──────────────────────────────────────────────

def daily_snapshot(request):
    """
    Рівень 2: Окрема вкладка для збереження та перегляду
    курсів поточного дня.
    """
    today = timezone.now().date()

    if request.method == "POST":
        currencies = Currency.objects.all()
        saved = 0
        for currency in currencies:
            DailySnapshot.objects.update_or_create(
                currency=currency,
                date=today,
                defaults={"buy_rate": currency.buy_rate, "sell_rate": currency.sell_rate},
            )
            saved += 1
        messages.success(request, f"Збережено {saved} курсів на {today}.")
        return redirect("daily_snapshot")

    snapshots = DailySnapshot.objects.filter(date=today).select_related("currency")
    all_snapshots = DailySnapshot.objects.exclude(date=today).select_related("currency").order_by("-date")
    return render(request, "currencies/daily_snapshot.html", {
        "snapshots": snapshots,
        "all_snapshots": all_snapshots,
        "today": today,
    })


# ──────────────────────────────────────────────
# РІВЕНЬ 4: API — актуальний курс валют (JSON)
# ──────────────────────────────────────────────

@api_view(["GET"])
def api_currency_list(request):
    """
    Рівень 4: GET /api/currencies/
    Повертає актуальний курс усіх валют у форматі JSON.
    """
    currencies = Currency.objects.all()
    serializer = CurrencySerializer(currencies, many=True)
    return Response({
        "as_of": timezone.now().isoformat(),
        "base_currency": "UAH",
        "count": currencies.count(),
        "results": serializer.data,
    })


@api_view(["GET"])
def api_currency_detail(request, code):
    """
    Рівень 4: GET /api/currencies/<code>/
    Повертає актуальний курс конкретної валюти.
    """
    currency = get_object_or_404(Currency, code=code.upper())
    serializer = CurrencySerializer(currency)
    return Response({
        "as_of": timezone.now().isoformat(),
        "base_currency": "UAH",
        "data": serializer.data,
    })


@api_view(["GET"])
def api_today_rates(request):
    """
    Рівень 4: GET /api/today/
    Повертає курси валют збережені на сьогодні.
    """
    today = timezone.now().date()
    snapshots = DailySnapshot.objects.filter(date=today).select_related("currency")
    serializer = DailySnapshotSerializer(snapshots, many=True)
    return Response({
        "date": str(today),
        "base_currency": "UAH",
        "count": snapshots.count(),
        "results": serializer.data,
    })