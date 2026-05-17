from django.db import models
from django.utils import timezone


class Currency(models.Model):
    """Модель валюти (Рівень 1 + Рівень 3: додавання через адмін-панель)"""
    name = models.CharField(max_length=100, verbose_name="Назва валюти")
    code = models.CharField(max_length=10, unique=True, verbose_name="Код валюти (напр. USD)")
    buy_rate = models.DecimalField(
        max_digits=10, decimal_places=4, verbose_name="Курс купівлі"
    )
    sell_rate = models.DecimalField(
        max_digits=10, decimal_places=4, verbose_name="Курс продажу"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Останнє оновлення")

    class Meta:
        verbose_name = "Валюта"
        verbose_name_plural = "Валюти"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class DailySnapshot(models.Model):
    """Модель для збереження курсів поточного дня (Рівень 2)"""
    currency = models.ForeignKey(
        Currency, on_delete=models.CASCADE,
        related_name="snapshots", verbose_name="Валюта"
    )
    date = models.DateField(default=timezone.now, verbose_name="Дата")
    buy_rate = models.DecimalField(
        max_digits=10, decimal_places=4, verbose_name="Курс купівлі"
    )
    sell_rate = models.DecimalField(
        max_digits=10, decimal_places=4, verbose_name="Курс продажу"
    )
    saved_at = models.DateTimeField(auto_now_add=True, verbose_name="Час збереження")

    class Meta:
        verbose_name = "Знімок курсу дня"
        verbose_name_plural = "Знімки курсів дня"
        ordering = ["-date", "currency__code"]
        unique_together = ["currency", "date"]

    def __str__(self):
        return f"{self.currency.code} на {self.date}"