from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.contrib.auth.models import User
import django.utils.timezone as dut
from datetime import date 
from froala_editor.fields import FroalaField



# Les Utilisateurs
class BlogUser(User):
 
    # Si l'utilisateur veut qu'on le garde authentifié
    # ou s'il veut avoir à rentrer ses données
    # à chaque connexion
    keepChecked = models.BooleanField('Garder connecté',default=True,blank=True)

    # Si l'utilisateur souhaite s'abonner à la NewsLetter
    joinNewsletter = models.BooleanField('Abonner à la NewsLetter',default=True,blank=True)
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name="Utilisateur"
        verbose_name_plural="Utilisateurs"
        db_table="blogUser"

# Les catégories
class Category(models.Model):
    # Le titre de la catégorie
    title = models.CharField('Nom de la catégorie',max_length=16,unique=True)

    # Le slug
    slug = models.SlugField('Slug',null=False,unique=True,editable=False)

    # Une courte description de la catégorie
    description = models.TextField('Description de la catégorie',max_length=470)

    # Une image de la catégorie
    image = models.ImageField('Image de la catégorie',upload_to='images/')

    # L'alt de l'image
    imageAlt = models.CharField('Description de l\'image',max_length=100,default="Auteur Anonyme")

    # Auteur de l'image
    imageAuthor = models.CharField('Auteur de l\'image', max_length=32, blank=True,null=True)

    def __str__(self):
        return self.title 
    
    @property
    def get_absolute_url(self):
        return reverse('post:category-articles',args=(
            self.slug,
            self.id
        ))
    
     # LA GENERATION AUTOMATIQUE DU SLUG
    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        self.slug = slugify(self.title)
        
        if update_fields is not None and "title" in update_fields:
            update_fields = {"title"}.union(update_fields)

        super().save(
            force_update=force_update,
            force_insert=force_insert,
            update_fields=update_fields,
            using=using
        )
    
    class Meta:
        verbose_name="catégorie"
        verbose_name_plural="Catégories"
        db_table="category"


# La table des hastags
class Hashtags(models.Model):
    # Le Hashtag
    hashtag = models.CharField(max_length=16)

    # La date de sauvegarde du hashtag
    saveDate = models.DateField(auto_now_add=True,editable=False)

    def __str__(self):
        return self.hashtag 
    
    class Meta:
        verbose_name="hashtag"
        verbose_name_plural="Hashtags"
        db_table="hashtag"

# Les articles
class Article(models.Model):
    # Le titre de l'article
    title = models.CharField('Titre de l\'article',max_length=78,blank=False,null=False)

    # Le slug
    slug = models.SlugField('Slug',max_length=130,blank=True,null=False,unique=True,editable=False)

    # Une courte introduction à l'article
    # mais aussi une présentation, une accroche
    # c'est elle qui ira dans la description de l'élément head
    sumItUp = models.TextField('Une courte introduction',max_length=320,blank=False,null=False)

    # Le Contenu de l'article
    # content = models.TextField()
    content = FroalaField()

    # L'image principale de l'article
    # c'est elle qui viendra juste après la synthèse 
    # et qui sera présentée sur les cartes
    image = models.ImageField('Image Principale',blank=False,null=False,upload_to="images/")

    # L'alt de l'image
    imageAlt = models.CharField('Description de l\'image',max_length=100)

    # Auteur de l'image
    imageAuthor = models.CharField('Auteur de l\'image', max_length=64, blank=True,null=True,default="Auteur Anonyme")

    # La date de sauvegarde de l'article
    saveDate = models.DateTimeField(auto_now_add=True,editable=False)

    # La date de mise-à-jour de l'article
    updateDate = models.DateTimeField(auto_now=True,editable=False)

    # La catégorie à laquelle l'article appartient
    category = models.ForeignKey(Category,verbose_name="Les Catégories",default="1", on_delete=models.CASCADE,related_name="categoryArticles")

    # Les hashtags (On n'en autra que trois par article)
    # ils permettront de restreindre la catégorie des articles,
    # vu que celles-ci seront trop générales, et faciliter la recherche.
    hashtags = models.ManyToManyField(Hashtags,blank=False,verbose_name="Les hashtags",related_name="articleHashtags")

    # Les likes de l'article (ils permettront de proposer les articles
    # les plus lus et donc les plus intéressants aux utilisateurs)
    # Un article peut être aimé par plusieurs utilisateurs
    # et plusieurs utilisateurs peuvent aimer un blog.
    # Chaque fois qu'un utilisateur like un billet de blog
    # on l'enregistre ici. Le nombre total des likes
    # ce sera le nombre total d'utilisateurs distincts contenus dans cette colonne 
    # pour chaque article.
    # Voir Vidéo du cours de John Elder sur Codemy.com
    # Building A Blog with Django
    likes = models.ManyToManyField(BlogUser,verbose_name="Nombre de Likes",blank=True,related_name="articleLikes")
    # L'auteur de l'article
    author = models.ForeignKey(BlogUser,on_delete=models.SET_NULL,blank=True,null=True,related_name="articleAuthor")

    # L'article est-il mis en ligne 
    online = models.BooleanField(default=True,null=False,blank=True)

    def __str__(self):
        return self.title 

    # LE LIEN DE LECTURE DE CHAQUE ARTICLE
    @property
    def get_absolute_url(self):
        return reverse('post:read-article',args=(
            self.slug,
            self.id
        ))

    # LE LIEN DE SUPPRESSION DE CHAQUE ARTICLE
    @property
    def deleteArticle(self):
       return reverse('management:delete-article',args=(
           self.slug,
           self.id
        ))

    # LA GENERATION AUTOMATIQUE DU SLUG
    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        self.slug = slugify(self.title)
        
        if update_fields is not None and "title" in update_fields:
            update_fields = {"title"}.union(update_fields)

        super().save(
            force_update=force_update,
            force_insert=force_insert,
            update_fields=update_fields,
            using=using
        )



    class Meta:
        verbose_name="article"
        verbose_name_plural="Articles"
        db_table="article"


# Les commentaires
class Comment(models.Model):
    # Le contenu du commentaire
    content = models.TextField('Commentaire',max_length=216,blank=True,null=True)

    # La date de sauvegarde du commentaire
    postDate = models.DateTimeField(auto_now_add=True,editable=False)

    # Celui qui a posté le commentaire
    whoPost = models.ForeignKey(BlogUser,on_delete=models.CASCADE,verbose_name="Commentateur",null=True)

    # L'article sur lequel on a posté le commentaire
    whichArticle = models.ForeignKey(Article,on_delete=models.CASCADE,verbose_name="Article",related_name="articleComments")

    
    def __str__(self):
        return self.content[:20]

    @property
    def delete_comment(self):
        return reverse('post:delete-comment',args=[self.id])

    class Meta:
        verbose_name="commentaire"
        verbose_name_plural="Commentaires"
        db_table="comment"


# Ce que les gens disent du blog
class WhatPeopleSay(models.Model):
    # Le message
    content = models.TextField('Avis',max_length=246)
    # L'auteur
    whoSaid = models.CharField('Auteur',max_length=64)

    # Date de sauvegarde 
    saveDate = models.DateField(editable=False,auto_now_add=True)

    # Si on peut le poster
    postIt = models.BooleanField('A poster',default=False)

    def __str__(self):
        return self.whoSaid
    
    class Meta:
        verbose_name="avis"
        verbose_name_plural="Avis"
        db_table="opinion_on_blog"