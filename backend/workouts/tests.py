"""
Tests for the workouts application.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from workouts.models import Workout
from comments.models import Comment
from users.models import User

from workouts.permissions import IsOwner, IsOwnerOfWorkout, IsCoachAndVisibleToCoach, IsCoachOfWorkoutAndVisibleToCoach, IsPublic, IsWorkoutPublic, IsReadOnly

def createWorkout(owner, visibility="PU"):
    workout = Workout.objects.create(
        name="workout",
        owner=owner,
        date="2022-03-03T18:14:00Z",
        notes="note",
        visibility=visibility
    )
    workout.save()
    return workout

def createComment(owner, workout):
    comment = Comment.objects.create(
        owner=owner,
        workout=workout,
        timestamp="2022-03-03T18:14:00Z",
        content="content"
    )
    comment.save()
    return comment



class TestOwnerPermissions(TestCase):
    """
    Class that tests owner permissions in workouts/permissions.py.
    """
    def setUp(self):
        self.owner_user = User.objects.create(username="owner")
        self.owner_user.save()
        self.workout = createWorkout(owner = self.owner_user)

    def test_IsOwner_true(self):
        """ 
        IsOwner().has_object_permission returns True for the user that is the owner of the object.
        """
        request = APIRequestFactory().get('/')
        request.user = self.owner_user
        workout = self.workout
        permission = IsOwner().has_object_permission(request, None, workout)
        self.assertTrue(permission)

    def test_IsOwner_false(self):
        """ 
        IsOwner().has_object_permission returns False for a user that is not the of the object.
        """
        request = APIRequestFactory().get('/')
        request.user = User.objects.create( username="not_owner")
        workout = self.workout
        permission = IsOwner().has_object_permission(request, None, workout)
        self.assertFalse(permission)
    
    def test_IsOwnerOfWorkout_true(self):
        """ 
        IsOwnerOfWorkout().has_object_permission returns True for the user that is the owner of the workout.
        """
        request = APIRequestFactory().post('/')
        request.user = self.owner_user
        request.data = {
            "workout": "http://localhost:8000/workouts/1/"
        }
        permission = IsOwnerOfWorkout().has_permission(request, None)
        self.assertTrue(permission)

    def test_IsOwnerOfWorkout_false(self):
        """ 
        IsOwnerOfWorkout().has_permission returns False for a user that is not the owner of the workout.
        """
        request = APIRequestFactory().post('/')
        request.user = User.objects.create( username="not_owner")
        request.data = {
            "workout": "http://localhost:8000/workouts/1/"
        }
        permission = IsOwnerOfWorkout().has_permission(request, None)
        self.assertFalse(permission)
    
    def test_IsOwnerOfWorkout_wrong_method(self):
        """ 
        IsOwnerOfWorkout().has_permission returns True for GET request.
        """
        request = APIRequestFactory().get('/')
        permission = IsOwnerOfWorkout().has_permission(request, None)
        self.assertTrue(permission)

    def test_IsOwnerOfWorkout_no_workout_data(self):
        """
        IsOwnerOfWorkout().has_permission returns False for POST request with non-existing workout.
        """
        request = APIRequestFactory().post('/')
        request.user = self.owner_user
        request.data = {"workout": ""}
        permission = IsOwnerOfWorkout().has_permission(request, None)
        self.assertFalse(permission)

    def test_IsOwnerOfWorkout_no_workout(self):
        """
        IsOwnerOfWorkout().has_permission returns False for POST request with workout without data.
        """
        request = APIRequestFactory().post('/')
        request.user = self.owner_user
        request.data = {}
        permission = IsOwnerOfWorkout().has_permission(request, None)
        self.assertFalse(permission)
    
    def test_IsOwnerOfWorkout_object_true(self):
        """
        IsOwnerOfWorkout().has_object_permission returns True for the user that is the owner of the object's workout.
        """
        comment = createComment(owner = self.owner_user, workout= self.workout)
        request = APIRequestFactory().get('/')
        request.user = self.owner_user
        permission = IsOwnerOfWorkout().has_object_permission(request, None, comment)
        self.assertTrue(permission)
    
    def test_IsOwnerOfWorkout_object_false(self):
        """
        IsOwnerOfWorkout().has_object_permission returns False for a user that is not the owner of the object's workout.
        """
        comment = createComment(owner = self.owner_user, workout= self.workout)
        request = APIRequestFactory().get('/')
        request.user = User.objects.create( username="not_owner")
        permission = IsOwnerOfWorkout().has_object_permission(request, None, comment)
        self.assertFalse(permission)

class TestCoachPermissions(TestCase):
    """
    Class that tests coach permissions in workouts/permissions.py.
    """
    def setUp(self):
        self.coach_user = User.objects.create(username="coach")
        self.coach_user.save()
        self.athlete_user = User.objects.create(username="owner", coach=self.coach_user)
        self.athlete_user.save()
        self.workout = createWorkout(owner=self.athlete_user)
        self.comment = createComment(owner=self.athlete_user, workout=self.workout)

    def test_IsCoachAndVisibleToCoach_true(self):
        """
        IsCoachAndVisibleToCoach().has_object_permission returns True for the user that is the coach of the object's owner.
        """
        request = APIRequestFactory().get('/')
        request.user = self.coach_user
        workout = self.workout
        permission = IsCoachAndVisibleToCoach().has_object_permission(request, None, workout)
        self.assertTrue(permission)
    
    
    def test_IsCoachAndVisibleToCoach_false(self):
        """
        IsCoachAndVisibleToCoach().has_object_permission returns False for a user that is not the coach of the object's owner.
        """
        not_coach_user = User.objects.create(username="not_coach")
        not_coach_user.save()

        request = APIRequestFactory().get('/')
        request.user = not_coach_user
        workout = self.workout
        permission = IsCoachAndVisibleToCoach().has_object_permission(request, None, workout)
        self.assertFalse(permission)

    def test_IsCoachOfWorkoutAndVisibleToCoach_true(self):
        """
        IsCoachOfWorkoutAndVisibleToCoach().has_object_permission returns True for the user that is the coach of the owner of the object's workout.
        """
        request = APIRequestFactory().get('/')
        request.user = self.coach_user
        comment = self.comment
        permission = IsCoachOfWorkoutAndVisibleToCoach().has_object_permission(request, None, comment)
        self.assertTrue(permission)
        
    def test_IsCoachOfWorkoutAndVisibleToCoach_false(self):
        """
        IsCoachOfWorkoutAndVisibleToCoach().has_object_permission returns False for a user that is not the coach of the owner of the object's workout.
        """
        not_coach_user = User.objects.create(username="not_coach")
        not_coach_user.save()

        request = APIRequestFactory().get('/')
        request.user = self.coach_user
        comment = self.comment
        permission = IsCoachOfWorkoutAndVisibleToCoach().has_object_permission(request, None, comment)
        self.assertfalse(permission)

class TestVisibilityLevels(TestCase):
    """
    Class that tests permissions linked to visibilitylevels in workouts/permissions.py
    """
    def setUp(self):
        owner_user = User.objects.create(username="owner")
        owner_user.save()
        self.pu_workout = createWorkout(owner=owner_user)
        self.pu_comment = createComment(owner=owner_user, workout=self.pu_workout)
        self.pr_workout = createWorkout(owner=owner_user, visibility="PR")
        self.pr_comment = createComment(owner=owner_user, workout=self.pr_workout)
    
    def test_IsPublic_true(self):
        """
        IsPublic().has_object_permission returns True for a object that has visibility "PU" (public).
        """
        request = APIRequestFactory().get('/')
        workout = self.pu_workout
        permission = IsPublic().has_object_permission(request, None, workout)
        self.assertTrue(permission)

    def test_IsPublic_false(self):
        """
        IsPublic().has_object_permission returns False for a object that has visibility "PR" (private).
        """
        request = APIRequestFactory().get('/')
        workout = self.pr_workout
        permission = IsPublic().has_object_permission(request, None, workout)
        self.assertFalse(permission)
    
    def test_IsWorkoutPublic_true(self):
        """
        IsWorkoutPublic().has_object_permission returns True for a object with a workout that has visibility "PU" (public).
        """
        request = APIRequestFactory().get('/')
        comment = self.pu_comment
        permission = IsWorkoutPublic().has_object_permission(request, None, comment)
        self.assertTrue(permission)
    
    def test_IsWorkoutPublic_false(self):
        """
        IsWorkoutPublic().has_object_permission returns False for a object with a workout that has visibility "PR" (private).
        """
        request = APIRequestFactory().get('/')
        comment = self.pr_comment
        permission = IsWorkoutPublic().has_object_permission(request, None, comment)
        self.assertFalse(permission)

class TestReadOnly(TestCase):
    def test_IsReadOnly_true(self):
        """
        IsReadOnly().has_object_permission returns True for a object GET request.
        """
        request = APIRequestFactory().get('/')
        permission = IsReadOnly().has_object_permission(request, None, None)
        self.assertTrue(permission)

    def test_IsReadOnly_false(self):
        """
        IsReadOnly().has_object_permission returns Frue for a object POST request.
        """
        request = APIRequestFactory().post('/')
        permission = IsReadOnly().has_object_permission(request, None, None)
        self.assertFalse(permission)


