# Generated by Django 5.0.6 on 2024-06-24 22:22

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shots", "0002_delete_blobs"),
    ]

    operations = [
        migrations.AddField(
            model_name="album",
            name="thumbnail",
            field=models.TextField(blank=True, null=True),
        ),
    ]
