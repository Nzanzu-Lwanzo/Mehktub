# Generated by Django 5.0.1 on 2024-01-31 11:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('post', '0018_alter_comment_whicharticle'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='canBePosted',
        ),
    ]
