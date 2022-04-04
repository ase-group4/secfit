from django.urls import path
from meals import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = format_suffix_patterns(
    [
        path(
            "api/meals/",
            views.MealList.as_view(),
            name="meal-list",
        ),
        path(
            "api/meals/<int:pk>/",
            views.MealDetail.as_view(),
            name="meal-detail",
        ),
        path(
            "api/ingredients/",
            views.Ingredients.as_view(),
            name="ingredients",
        ),
        path(
            "api/meal-files/",
            views.MealFileList.as_view(),
            name="meal-file-list",
        ),
        path(
            "api/meal-files/<int:pk>/",
            views.MealFileDetail.as_view(),
            name="mealfile-detail",
        ),
    ]
)
