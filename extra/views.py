from django.shortcuts import render
from django.http import Http404
from post.models import Category,WhatPeopleSay,Article,BlogUser
from django.db.models import Count
from django.contrib.auth.models import User
from random import choices


def homepage(request):
    # PRESENTER LES CATEGORIES
    # SUR LA PAGE D'ACCUEIL
    categories = Category.objects.all()

    # LES SIX ARTICLES LES PLUS DE RECENTS
    someArticles = Article.objects.all().filter(online=True).order_by("-updateDate")[:6]

    # RECUPERER LES UTILISATEURS
    # l'utilisateur peut lire un article
    # s'il est déjà abonné
    allUsers = User.objects.all()

    # LES AVIS DES GENS
    avis = WhatPeopleSay.objects.all().order_by('saveDate').filter(postIt=True)[:3]

    # LE CONTEXTE
    context = {
        'categories':categories,
        'whatPeopleSay': avis,
        'someArticles':someArticles,
        'allUsers':allUsers
    }
    
    return render(request,'extra/homepage.html',context)

def error_404(request):
    return render(request,'extra/404_page.html')


def accessDenied(request):
    return render(request,'extra/accessDenied.html')
