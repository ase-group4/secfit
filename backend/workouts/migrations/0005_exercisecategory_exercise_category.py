from django.db import migrations, models
import django.db.models.deletion


DEFAULT_CATEGORIES = ["Legs", "Back", "Chest", "Shoulders", "Arms", "Core"]


class Migration(migrations.Migration):
    def create_exercise_categories(apps, schema_editor):
        ExerciseCategory = apps.get_model("workouts", "ExerciseCategory")

        for default in DEFAULT_CATEGORIES:
            ExerciseCategory.objects.create(name=default)

    dependencies = [
        ("workouts", "0004_auto_20211020_0950"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExerciseCategory",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100)),
            ],
        ),
        migrations.RunPython(create_exercise_categories),
        migrations.AddField(
            model_name="exercise",
            name="category",
            field=models.ForeignKey(
                default=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="workouts.exercisecategory",
            ),
        ),
    ]
