# Generated by Django 3.1 on 2021-02-04 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_auto_20201213_2228'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='city',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='user',
            name='country',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='user',
            name='street_address',
            field=models.TextField(blank=True, max_length=50),
        ),
    ]