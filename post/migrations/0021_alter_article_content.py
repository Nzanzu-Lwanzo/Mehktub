# Generated by Django 5.0.1 on 2024-02-08 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post', '0020_alter_article_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='content',
            field=models.TextField(),
        ),
    ]