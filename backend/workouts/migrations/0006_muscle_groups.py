from django.db import migrations, models
import django.db.models.deletion


DEFAULT_MUSCLE_GROUPS = ["Legs", "Chest", "Back", "Arms", "Abdominals", "Shoulders"]


class Migration(migrations.Migration):
    def add_muscle_groups(apps, schema_editor):
        """Creates new muscle groups from DEFAULT_MUSCLE_GROUPS.
        Then goes through every exercise, and adds muscle group relations accordingly,
        defaulting to 'Legs' if the exercise had no muscle group from before.
        """
        muscle_group_model: "models.Model" = apps.get_model("workouts", "MuscleGroup")
        muscle_groups = {}

        for muscle_group_name in DEFAULT_MUSCLE_GROUPS:
            muscle_group = muscle_group_model.objects.create(muscle=muscle_group_name)
            muscle_groups[muscle_group_name] = muscle_group

        exercise_model: "models.Model" = apps.get_model("workouts", "Exercise")

        for exercise in exercise_model.objects.all():
            if exercise.muscleGroup:
                muscle_group = muscle_groups.get(exercise.muscleGroup)
                if muscle_group:
                    exercise.muscle_group = muscle_group
                    exercise.save()
                    continue

            exercise.muscle_group = muscle_groups.get("Legs")
            exercise.save()

    dependencies = [
        ("workouts", "0005_exercisecategory_exercise_category"),
    ]

    operations = [
        migrations.CreateModel(
            name="MuscleGroup",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("muscle", models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name="exercise",
            name="muscle_group",
            field=models.ForeignKey(
                default=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="workouts.musclegroup",
            ),
            preserve_default=False,
        ),
        migrations.RunPython(add_muscle_groups),
        migrations.RemoveField(
            model_name="exercise",
            name="muscleGroup",
        ),
    ]
