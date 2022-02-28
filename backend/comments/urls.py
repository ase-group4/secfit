from django.urls import path
from comments.views import CommentList, CommentDetail, LikeList, LikeDetail

urlpatterns = [
    path("api/comments/", CommentList.as_view(), name="comment-list"),
    path("api/comments/<int:pk>/", CommentDetail.as_view(), name="comment-detail"),
    path("api/likes/", LikeList.as_view(), name="like-list"),
    path("api/likes/<int:pk>/", LikeDetail.as_view(), name="like-detail"),
]
