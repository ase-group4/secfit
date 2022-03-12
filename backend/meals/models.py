"""
Contains the models for the meals Django application. Users
log meals (Meal). The user can also upload files (MealFile).
"""
import os
from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib.auth import get_user_model


class OverwriteStorage(FileSystemStorage):
    """Filesystem storage for overwriting files. Currently unused."""

    def get_available_name(self, name, max_length=None):
        """https://djangosnippets.org/snippets/976/
        Returns a filename that's free on the target storage system, and
        available for new content to be written to.

        Args:
            name (str): Name of the file
            max_length (int, optional): Maximum length of a file name. Defaults to None.
        """
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))


class Meal(models.Model):
    """Django model for a meal that users can log.

    A meal has several attributes, and files uploaded by the user.

    Attributes:
        name:        Name of the meal
        date:        Date and time the meal was consumed
        notes:       Notes about the meal
        ingredients: Ingredients that the meal is made of, with weights.
        is_veg:      Whether the meal was vegetarian or not
        owner:       User that logged the meal
    """

    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    notes = models.TextField()

    ingredients = models.ManyToManyField(
        to="Ingredient",
        through="IngredientInMeal",
    )

    is_veg = models.BooleanField(default=False)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="meals")

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    """
    Django model for ingredients that users can compose meals from.

    Attributes:
        name:           The name of the ingredient.
        protein:        Grams of protein per 100 grams of the ingredient.
        carbohydrates:  Grams of carbohydrates per 100 grams of the ingredient.
        fat:            Grams of fat per 100 grams of the ingredient.
        calories:       Calories in kcal of the ingredient,
                        calculated from the given protein, carbohydrates and fat.
        publisher:      The user that published this ingredient to SecFit.
    """

    name = models.CharField(max_length=100)
    protein = models.FloatField()
    fat = models.FloatField()
    carbohydrates = models.FloatField()

    @property
    def calories(self) -> int:
        return self.protein * 4 + self.carbohydrates * 4 + self.fat * 9

    publisher = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="ingredients"
    )


class IngredientInMeal(models.Model):
    """
    Intermediary model for the many-to-many relation between Meal and Ingredient.

    Attributes:
        meal: Foreign key to the meal.
        ingredient: Foreign key to the ingredient.
        weight: The weight in grams of the ingredient in the meal.
    """

    meal = models.ForeignKey("Meal", on_delete=models.CASCADE, related_name="ingredient_weights")
    ingredient = models.ForeignKey("Ingredient", on_delete=models.CASCADE)

    weight = models.IntegerField()

    class Meta:
        constraints = [
            # Disallows adding the same ingredient twice to the same meal
            # (increase weight instead).
            models.UniqueConstraint(
                fields=["ingredient", "meal"], name="unique_ingredient_in_meal"
            )
        ]


def meal_directory_path(instance, filename):
    """Return path for which meal files should be uploaded on the web server

    Args:
        instance (MealFile): MealFile instance
        filename (str): Name of the file

    Returns:
        str: Path where workout file is stored
    """
    return f"meals/{instance.meal.id}/{filename}"


class MealFile(models.Model):
    """Django model for file associated with a meal. Basically a wrapper.

    Attributes:
        meal:    The meal for which this file has been uploaded
        owner:   The user who uploaded the file
        file:    The actual file that's being uploaded
    """

    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name="files")
    owner = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="meal_files"
    )
    file = models.FileField(upload_to=meal_directory_path)
