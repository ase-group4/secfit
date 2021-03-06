from collections import namedtuple
import base64
import pickle
from rest_framework import mixins, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.core.signing import Signer
from django.db.models import Q

from utils.pagination import ExpandedPagination
from workouts.mixins import CreateListModelMixin
from workouts.permissions import IsOwner, IsReadOnly
from .models import Offer, AthleteFile
from .permissions import IsCurrentUser, IsAthlete, IsCoach
from .serializers import (
    UserSerializer,
    OfferSerializer,
    AthleteFileSerializer,
    UserGetSerializer,
    RememberMeSerializer,
)


class UserList(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = UserSerializer
    pagination_class = ExpandedPagination

    def get(self, request, *args, **kwargs):
        self.serializer_class = UserGetSerializer
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def get_queryset(self):
        queryset = get_user_model().objects.all()
        if self.request.user:
            # Return the currently logged in user
            status = self.request.query_params.get("user", None)
            if status == "current":
                queryset = get_user_model().objects.filter(pk=self.request.user.pk)
        return queryset


class UserDetail(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    lookup_field_options = ["pk", "username"]
    serializer_class = UserSerializer
    queryset = get_user_model().objects.all()
    permission_classes = [permissions.IsAuthenticated & (IsCurrentUser | IsReadOnly)]

    def get_object(self):
        for field in self.lookup_field_options:
            if field in self.kwargs:
                self.lookup_field = field
                break

        return super().get_object()

    def get(self, request, *args, **kwargs):
        self.serializer_class = UserGetSerializer
        return self.retrieve(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class OfferList(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = OfferSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Offer.objects.none()

        if self.request.user:
            user = self.request.user
            queryset = Offer.objects.filter(Q(owner=user) | Q(recipient=user)).distinct()

            queryparams = self.request.query_params

            # filtering by status (if provided)
            status = queryparams.get("status", None)
            if status is not None:
                queryset = queryset.filter(status=status)

            # filtering by category (sent or received)
            category = queryparams.get("category", None)
            if category == "sent":
                queryset = queryset.filter(owner=user)
            elif category == "received":
                queryset = queryset.filter(recipient=user)
        return queryset


class OfferDetail(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class AthleteFileList(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    CreateListModelMixin,
    generics.GenericAPIView,
):
    queryset = AthleteFile.objects.all()
    serializer_class = AthleteFileSerializer
    permission_classes = [permissions.IsAuthenticated & (IsAthlete | IsCoach)]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = AthleteFile.objects.none()
        if self.request.user:
            queryset = AthleteFile.objects.filter(
                Q(athlete=self.request.user) | Q(owner=self.request.user)
            ).distinct()
        return queryset


class AthleteFileDetail(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = AthleteFile.objects.all()
    serializer_class = AthleteFileSerializer
    permission_classes = [permissions.IsAuthenticated & (IsAthlete | IsOwner)]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# Allow users to save a persistent session in their browser
class RememberMe(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    serializer_class = RememberMeSerializer

    def get(self, request):
        if request.user.is_authenticated is False:
            raise PermissionDenied
        else:
            return Response({"remember_me": self.rememberme()})

    def post(self, request):
        cookieObject = namedtuple("Cookies", request.COOKIES.keys())(*request.COOKIES.values())
        user = self.get_user(cookieObject)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        )

    def get_user(self, cookieObject):
        decode = base64.b64decode(cookieObject.remember_me)
        user, sign = pickle.loads(decode)

        # Validate signature
        if sign == self.sign_user(user):
            return user

    def rememberme(self):
        creds = [self.request.user, self.sign_user(str(self.request.user))]
        return base64.b64encode(pickle.dumps(creds))

    def sign_user(self, username):
        signer = Signer()
        signed_user = signer.sign(username)
        return signed_user
