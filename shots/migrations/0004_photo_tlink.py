# Generated by Django 5.0.6 on 2024-06-24 22:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shots", "0003_album_thumbnail"),
    ]

    operations = [
        migrations.AddField(
            model_name="photo",
            name="tlink",
            field=models.TextField(blank=True, null=True),
        ),
    ]