# Generated by Django 5.0.1 on 2024-01-26 21:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post', '0015_alter_article_updatedate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='content',
            field=models.TextField(),
        ),
    ]