"""Module for registering models from workouts app to admin page so that they appear
"""
from django.contrib import admin

# Register your models here.
from .models import Exercise, ExerciseInstance, MuscleGroup, Workout, WorkoutFile, ExerciseCategory

admin.site.register(Exercise)
admin.site.register(MuscleGroup)
admin.site.register(ExerciseCategory)
admin.site.register(ExerciseInstance)
admin.site.register(Workout)
admin.site.register(WorkoutFile)
