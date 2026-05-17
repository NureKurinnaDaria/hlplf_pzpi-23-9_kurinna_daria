from django.urls import path
from . import views

urlpatterns = [
    # Рівень 1: головна таблиця курсів
    path("", views.currency_list, name="currency_list"),

    # Рівень 2: знімок курсів поточного дня
    path("daily/", views.daily_snapshot, name="daily_snapshot"),

    # Рівень 4: API endpoints
    path("api/currencies/", views.api_currency_list, name="api_currency_list"),
    path("api/currencies/<str:code>/", views.api_currency_detail, name="api_currency_detail"),
    path("api/today/", views.api_today_rates, name="api_today_rates"),
]