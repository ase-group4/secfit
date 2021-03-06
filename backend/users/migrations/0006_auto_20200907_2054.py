# Generated by Django 3.1 on 2020-09-07 18:54

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0005_auto_20200907_2039"),
    ]

    operations = [
        migrations.AddField(
            model_name="athleterequest",
            name="timestamp",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="coachrequest",
            name="timestamp",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
