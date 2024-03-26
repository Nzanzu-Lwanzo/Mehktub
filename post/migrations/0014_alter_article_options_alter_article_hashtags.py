# Generated by Django 5.0.1 on 2024-01-26 20:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post', '0013_alter_article_content'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='article',
            options={'verbose_name': 'article', 'verbose_name_plural': 'Articles'},
        ),
        migrations.AlterField(
            model_name='article',
            name='hashtags',
            field=models.ManyToManyField(related_name='articleHashtags', to='post.hashtags', verbose_name='Les hashtags'),
        ),
    ]
