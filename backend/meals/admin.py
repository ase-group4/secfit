"""Module for registering models from meals app so they appear on the admin page."""
from django.contrib import admin
from .models import Meal, MealFile

admin.site.register(Meal)
admin.site.register(MealFile)