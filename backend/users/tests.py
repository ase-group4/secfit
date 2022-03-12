"""
Tests for the users application.
"""
from workouts.models import Workout
from users.serializers import UserSerializer
from users.models import User
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request


class TestUserSerializer(TestCase):
    """
    Class for statement coverage of User Serializer.
    """

    def setUp(self):
        self.user_attributes = {
            "email": "user@mail.us",
            "password": "password",
            "phone_number": "12345678",
            "country": "Norway",
            "city": "Trondheim",
            "street_address": "Street",
        }
        self.coach = User.objects.create(**self.user_attributes, username="coach")
        self.athlete = User.objects.create(**self.user_attributes, username="athlete")

        self.user = User.objects.create(**self.user_attributes, username="user", coach=self.coach)
        self.user.athletes.set([self.athlete])

        self.workout = Workout.objects.create(
            name="workout",
            owner=self.user,
            date="2022-03-03T18:14:00Z",
            notes="note",
            visibility="PU",
        )

        factory = APIRequestFactory()
        request = factory.get("/")
        self.context = {"request": Request(request)}
        self.serializer = UserSerializer(instance=self.user, context=self.context)

    def test_contains_expected_fields(self):
        """
        Tests that all expected data fields are present
        after using the UserSerializer() function.
        """

        data = self.serializer.data
        self.assertEqual(
            set(data.keys()),
            set(
                [
                    "url",
                    "id",
                    "email",
                    "username",
                    "athletes",
                    "phone_number",
                    "country",
                    "city",
                    "street_address",
                    "coach",
                    "workouts",
                    "coach_files",
                    "athlete_files",
                ]
            ),
        )

    def test_url_field_content(self):
        """Tests that url field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["url"], "http://testserver/api/users/3/")

    def test_id_field_content(self):
        """Tests that id field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["id"], 3)

    def test_email_field_content(self):
        """Tests that email field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["email"], self.user_attributes["email"])

    def test_username_field_content(self):
        """Tests that username field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["username"], "user")

    def test_phone_number_field_content(self):
        """Tests that phone_number field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["phone_number"], self.user_attributes["phone_number"])

    def test_country_field_content(self):
        """Tests that country field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["country"], self.user_attributes["country"])

    def test_city_field_content(self):
        """Tests that city field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["city"], self.user_attributes["city"])

    def test_street_address_field_content(self):
        """Tests that street_adress field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["street_address"], self.user_attributes["street_address"])

    def test_athletes_field_content(self):
        """Tests that athletes field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["athletes"], ["http://testserver/api/users/2/"])

    def test_coach_field_content(self):
        """Tests that coach field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["coach"], "http://testserver/api/users/1/")

    def test_workouts_field_content(self):
        """Tests that workouts field has expected content."""
        data = self.serializer.data
        self.assertEqual(data["workouts"], ["http://testserver/api/workouts/1/"])

    def test_validate_password(self):
        """UserSerializer.validate_password() validates and returns new password"""
        new_password = "new_password"
        self.user.set_password(new_password)
        user_serializer = UserSerializer(self.user, context=self.context)
        self.assertEqual(user_serializer.validate_password(new_password), new_password)
