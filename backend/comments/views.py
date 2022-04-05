from rest_framework import generics, mixins, permissions
from rest_framework.filters import OrderingFilter
from django.db.models import Q

from workouts.permissions import IsOwner, IsReadOnly

from .models import Comment
from .permissions import IsCommentVisibleToUser
from .serializers import CommentSerializer


class CommentList(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["timestamp"]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Comment.objects.none()

        if self.request.user:
            """A comment should be visible to the requesting user if any of the following hold:
            - The comment is on a public visibility workout
            - The comment was written by the user
            - The comment is on a coach-visible workout and the user is the workout owner's coach
            - The comment is on a workout owned by the user
            """

            queryset = Comment.objects.filter(
                Q(workout__visibility="PU")
                | Q(owner=self.request.user)
                | (Q(workout__visibility="CO") & Q(workout__owner__coach=self.request.user))
                | Q(workout__owner=self.request.user)
            ).distinct()

        return queryset


class CommentDetail(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [
        permissions.IsAuthenticated & IsCommentVisibleToUser & (IsOwner | IsReadOnly)
    ]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
