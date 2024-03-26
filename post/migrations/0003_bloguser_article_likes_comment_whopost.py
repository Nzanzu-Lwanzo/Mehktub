# Generated by Django 4.2.3 on 2024-01-16 17:17

from django.conf import settings
import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('post', '0002_remove_article_likes_remove_comment_whopost_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogUser',
            fields=[
                ('user_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('keepChecked', models.BooleanField(blank=True, default=True, verbose_name='Garder connecté')),
                ('joinNewsletter', models.BooleanField(blank=True, default=True, verbose_name='Abonner à la NewsLetter')),
            ],
            options={
                'verbose_name': 'Utilisateur',
                'verbose_name_plural': 'Utilisateurs',
                'db_table': 'blogUser',
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.AddField(
            model_name='article',
            name='likes',
            field=models.ManyToManyField(blank=True, to='post.bloguser', verbose_name='Nombre de Likes'),
        ),
        migrations.AddField(
            model_name='comment',
            name='whoPost',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='post.bloguser', verbose_name='Commentateur'),
        ),
    ]