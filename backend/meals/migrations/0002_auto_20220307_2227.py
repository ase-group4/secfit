# Generated by Django 3.1 on 2022-03-07 22:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("meals", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Ingredient",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("protein", models.FloatField()),
                ("carbohydrates", models.FloatField()),
                ("fat", models.FloatField()),
                (
                    "publisher",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ingredients",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.RemoveField(
            model_name="meal",
            name="calories",
        ),
        migrations.CreateModel(
            name="IngredientInMeal",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("weight", models.IntegerField()),
                (
                    "ingredient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="meals.ingredient"
                    ),
                ),
                (
                    "meal",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ingredient_weights",
                        to="meals.meal",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="meal",
            name="ingredients",
            field=models.ManyToManyField(through="meals.IngredientInMeal", to="meals.Ingredient"),
        ),
        migrations.AddConstraint(
            model_name="ingredientinmeal",
            constraint=models.UniqueConstraint(
                fields=("ingredient", "meal"), name="unique_ingredient_in_meal"
            ),
        ),
    ]
