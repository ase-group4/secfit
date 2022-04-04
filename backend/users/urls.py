from django.urls import path
from .views import UserList, UserDetail, OfferList, OfferDetail, AthleteFileList, AthleteFileDetail

USERS_PATH = "api/users/"
OFFERS_PATH = "api/offers/"
FILES_PATH = "api/athlete-files/"

urlpatterns = [
    # Users
    path(USERS_PATH, UserList.as_view(), name="user-list"),
    path(USERS_PATH + "<int:pk>/", UserDetail.as_view(), name="user-detail"),
    path(USERS_PATH + "<str:username>/", UserDetail.as_view(), name="user-detail"),
    # Offers
    path(OFFERS_PATH, OfferList.as_view(), name="offer-list"),
    path(OFFERS_PATH + "<int:pk>/", OfferDetail.as_view(), name="offer-detail"),
    # Athlete-files
    path(FILES_PATH, AthleteFileList.as_view(), name="athlete-file-list"),
    path(FILES_PATH + "<int:pk>/", AthleteFileDetail.as_view(), name="athletefile-detail",),
]
