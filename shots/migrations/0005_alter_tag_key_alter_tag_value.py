# Generated by Django 5.0.6 on 2024-06-25 09:01

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shots", "0004_photo_tlink"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tag",
            name="key",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="tag",
            name="value",
            field=models.TextField(blank=True, null=True),
        ),
    ]
