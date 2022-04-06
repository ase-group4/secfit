from django.urls import path
from workouts import views
from rest_framework.urlpatterns import format_suffix_patterns

WORKOUTS_PATH = "api/workouts/"
EXERCISES_PATH = "api/exercises/"
MUSCLE_GROUPS_PATH = "api/muscle-groups/"
EXERCISE_CATEGORIES_PATH = "api/exercise-categories/"
EXERCISE_INSTANCE_PATH = "api/exercise-instances/"
WORKOUT_FILE_PATH = "api/workout-files/"

urlpatterns = format_suffix_patterns(
    [
        path(
            WORKOUTS_PATH,
            views.WorkoutList.as_view(),
            name="workout-list",
        ),
        path(
            WORKOUTS_PATH + "<int:pk>/",
            views.WorkoutDetail.as_view(),
            name="workout-detail",
        ),
        path(
            EXERCISES_PATH,
            views.ExerciseList.as_view(),
            name="exercise-list",
        ),
        path(
            EXERCISES_PATH + "<int:pk>/",
            views.ExerciseDetail.as_view(),
            name="exercise-detail",
        ),
        path(
            MUSCLE_GROUPS_PATH,
            views.MuscleGroups.as_view(),
            name="muscle-groups",
        ),
        path(
            EXERCISE_CATEGORIES_PATH,
            views.ExerciseCategories.as_view(),
            name="exercise-categories",
        ),
        path(
            EXERCISE_INSTANCE_PATH,
            views.ExerciseInstanceList.as_view(),
            name="exercise-instance-list",
        ),
        path(
            EXERCISE_INSTANCE_PATH + "<int:pk>/",
            views.ExerciseInstanceDetail.as_view(),
            name="exerciseinstance-detail",
        ),
        path(
            WORKOUT_FILE_PATH,
            views.WorkoutFileList.as_view(),
            name="workout-file-list",
        ),
        path(
            WORKOUT_FILE_PATH + "<int:pk>/",
            views.WorkoutFileDetail.as_view(),
            name="workoutfile-detail",
        ),
    ]
)
