# Generated by Django 3.1 on 2020-12-13 21:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_auto_20200910_0222"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="offer",
            name="offer_type",
        ),
        migrations.RemoveField(
            model_name="offer",
            name="stale",
        ),
    ]
