from django.urls import path, include
from meals import views
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# This is messy and should be refactored
urlpatterns = format_suffix_patterns(
    [
        path("", views.api_root),
        path("api/meals/", views.MealList.as_view(), name="meal-list"),
        path(
            "api/meals/<int:pk>/",
            views.MealDetail.as_view(),
            name="meal-detail",
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
        path("", include("users.urls")),
    ]
)
