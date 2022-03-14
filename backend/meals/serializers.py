"""Serializers for the meals application."""
from rest_framework import serializers
from rest_framework.serializers import HyperlinkedRelatedField, ValidationError
from meals.models import Ingredient, IngredientInMeal, Meal, MealFile


class IngredientSerializer(serializers.ModelSerializer):
    """
    Serializer for Ingredient.

    Serialized fields: id, name, protein, fat, carbohydrates, calories, publisher, publisher_name

    Attributes:
        publisher_name: Name of the user who published the ingredient.
    """

    publisher_name = serializers.ReadOnlyField(source="publisher.username")

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "protein",
            "fat",
            "carbohydrates",
            "calories",
            "publisher",
            "publisher_name",
        ]
        extra_kwargs = {"publisher": {"read_only": True}}


class IngredientInMealSerializer(serializers.ModelSerializer):
    """
    Serializer for IngredientInMeal.
    Meant to show details of an ingredient on a meal.
    Overrides `to_representation` to return full ingredient on GET requests,
    while accepting a bare foreign key for the ingredient on POST.

    Serialized fields: ingredient, weight
    """

    class Meta:
        model = IngredientInMeal
        fields = ["ingredient", "weight"]

    def to_representation(self, instance):
        """
        Overrides `to_representation` to return the full ingredient,
        not just the foreign key, on GET requests.
        """
        serialized = super().to_representation(instance)
        serialized["ingredient"] = IngredientSerializer(instance.ingredient).data
        return serialized


class MealFileSerializer(serializers.HyperlinkedModelSerializer):
    """Serializer for a MealFile. Hyperlinks are used for relationships by default.

    Serialized fields: url, id, owner, file, meal

    Attributes:
        owner:      The owner (User) of the MealFile, represented by a username. ReadOnly
        meal:       The associate meal for this MealFile, represented by a hyperlink
    """

    owner = serializers.ReadOnlyField(source="owner.username")
    meal = HyperlinkedRelatedField(
        queryset=Meal.objects.all(), view_name="meal-detail", required=False
    )

    class Meta:
        model = MealFile
        fields = ["url", "id", "owner", "file", "meal"]

    def create(self, validated_data):
        return MealFile.objects.create(**validated_data)


class MealSerializer(serializers.ModelSerializer):
    """Serializer for a Meal. Hyperlinks are used for relationships by default.

    This serializer specifies nested serialization since a meal consists of MealFiles.

    Serialized fields:
        url, id, name, date, notes, is_veg, owner, owner_username, files, ingredient_weights

    Attributes:
        owner_username:     Username of the owning User
        files:              Serializer for MealFiles
        ingredient_weights: Ingredients in the meal, with corresponding weights.
    """

    owner_username = serializers.SerializerMethodField()
    files = MealFileSerializer(many=True, required=False)
    ingredient_weights = IngredientInMealSerializer(many=True)

    class Meta:
        model = Meal
        fields = [
            "url",
            "id",
            "name",
            "date",
            "notes",
            "is_veg",
            "owner",
            "owner_username",
            "files",
            "ingredient_weights",
        ]
        extra_kwargs = {"owner": {"read_only": True}}

    def validate_ingredient_weights(self, value):
        if type(value) != list:
            raise ValidationError("meal must have list of ingredients")

        if len(value) == 0:
            raise ValidationError("meal must contain at least 1 ingredient")

        for ingredient in value:
            if ingredient.get("weight") is None or ingredient.get("weight") <= 0:
                raise ValidationError("ingredient in meal must have weight")

        return value

    def create(self, validated_data):
        """Custom logic for creating MealFiles, and a Meal.

        This is needed to iterate over the files, since this serializer is nested.

        Args:
            validated_data: Validated files

        Returns:
            Meal: A newly created Meal
        """

        files_data = []
        if "files" in validated_data:
            files_data = validated_data.pop("files")

        # Pops out the ingredient weights, to serialize the nested representation afterwards.
        ingredients_data = validated_data.pop("ingredient_weights")

        meal = Meal.objects.create(**validated_data)

        for ingredient in ingredients_data:
            IngredientInMeal.objects.create(meal=meal, **ingredient)

        for file_data in files_data:
            MealFile.objects.create(meal=meal, owner=meal.owner, file=file_data.get("file"))

        return meal

    def update(self, instance, validated_data):
        """Custom logic for updating a Meal.

        This is needed because each object in files must be iterated
        over and handled individually.

        Args:
            instance (Meal): Current Meal object
            validated_data: Contains data for validated fields

        Returns:
            Meal: Updated Meal instance
        """

        instance.name = validated_data.get("name", instance.name)
        instance.date = validated_data.get("date", instance.date)
        instance.notes = validated_data.get("notes", instance.notes)
        instance.is_veg = validated_data.get("is_veg", instance.is_veg)
        instance.calories = validated_data.get("calories", instance.calories)
        instance.save()

        # Handle MealFiles

        if "files" in validated_data:
            files_data = validated_data.pop("files")
            files = instance.files

            for file, file_data in zip(files.all(), files_data):
                file.file = file_data.get("file", file.file)

            # If new files have been added, creating new MealFiles
            if len(files_data) > len(files.all()):
                for i in range(len(files.all()), len(files_data)):
                    MealFile.objects.create(
                        meal=instance,
                        owner=instance.owner,
                        file=files_data[i].get("file"),
                    )
            # Else if files have been removed, delete MealFiles
            elif len(files_data) < len(files.all()):
                for i in range(len(files_data), len(files.all())):
                    files.all()[i].delete()

        return instance

    def get_owner_username(self, obj):
        """Returns the owning user's username

        Args:
            obj (Meal): Current Meal

        Returns:
            str: Username of owner
        """
        return obj.owner.username
