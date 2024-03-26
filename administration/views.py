from django.shortcuts import render,get_object_or_404,redirect
from post.models import Article,BlogUser,WhatPeopleSay,Comment,Category,Hashtags
from management.models import Message
from .forms import CategoryForm,WhatPeopleSayForm,ArticleForm,UpdateArticleForm
import django.utils.timezone as dut
from blog.decorators import isSuperUser
from django.contrib import messages
from django.http import JsonResponse,FileResponse
from post.views import checkAjax
from django.urls import reverse,reverse_lazy
from django.core.paginator import Paginator
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q
from management.views import parseBytesToDict
from os import path
import pickle


# VARIABLES GENERALES
css_success_class = "gen-success"
css_fail_class = "gen-fail"

# FONCTION D'ICI
def isEditor(function):
    def wrapper(request,*args,**kwargs):
        if request.user.groups.filter(name="Editors").exists():
            return function(request,*args,*kwargs)
        else:
            messages.error(request,"Seuls les éditeurs peuvent voir cette page ou réaliser cette action !",css_fail_class)
            return redirect('extra:access-denied')
    return wrapper

def inEditors(request):
    return request.user.groups.filter(name="Editors").exists()

def formatDate(value):
    day = value.day
    month = value.month 
    year = value.year 
    hour = value.hour 
    minutes = value.minute

    formatted = f"{day}-{month}-{str(year).removeprefix('20')} {hour}:{minutes}"
    return formatted

@isSuperUser
def serveDashboard(request):
    # LE DERNIER ARTICLE
    lastArticle  = Article.objects.last()

    # LES 6 ARTICLES LES PLUS LUS
    mostRead = Article.objects.all().distinct().order_by('likes')[:6]
    
    # LES 9 DERNIERS COMMENTAIRES
    someComments = Comment.objects.all().order_by('-postDate')[:9]


    # TOUTES LES CATEGORIES
    allCategories = Category.objects.all()

    # TOUS LES AVIS DU PUBLIC
    publicOpinions = WhatPeopleSay.objects.all()

    # TOUS LES MESSAGES
    messageNotRead = Message.objects.all().filter(read=False)
    verdict = True if messageNotRead else False

    # LES DONNEES A PASSER AU FRONT-END
    context = {
        "now":dut.now(),
        "lastArticle":lastArticle,
        "mostRead":mostRead,
        "allCategories":allCategories,
        "publicOpinions":publicOpinions,
        "someComments":someComments,
        "verdict":verdict

    }
    return render(request,'administration/admin-panel.html',context)

@isSuperUser
def serveDashboardUsers(request):
    # 100 UTILISATEURS (PAGINATION)
    allUsers = BlogUser.objects.all()[:100]

    custom_paginator = Paginator(allUsers,per_page=20)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    # LE DERNIER ARTICLE
    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":allUsers.count(),
        "allData":allData,
        "totalPages":[x for x in range(1,totalPages+1)],

        "now":dut.now(),
        "lastArticle":lastArticle,
        "panel":reverse("site-admin:dashboard-users")
    }

    return render(request,'administration/admin-users.html',context)

@isSuperUser
def serveDashboardComments(request):

    # DIX COMMENTAIRES
    allComments = Comment.objects.all().order_by('-postDate')

    custom_paginator = Paginator(allComments,per_page=24)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    # LE DERNIER ARTICLE
    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":allComments.count(),
        "allData":allData,
        "totalPages":[x for x in range(1,totalPages+1)],
        "now":dut.now(),
        "lastArticle":lastArticle,
    }
    return render(request,'administration/admin-comments.html',context)

@isSuperUser
def serveDashboardHashtags(request):

    # TOUS LES HASHTAGS
    allHashtags = Hashtags.objects.all().order_by('hashtag')

    custom_paginator = Paginator(allHashtags,per_page=20)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":allHashtags.count(),
        "allData":allData,
        "now":dut.now(),
        "lastArticle":lastArticle,
        "totalPages":[x for x in range(1,totalPages+1)],
    }

    return render(request,'administration/admin-hashtags.html',context)

@isSuperUser
def serveDashboardArticles(request):
    allArticles = Article.objects.all().order_by('-saveDate','-updateDate')

    custom_paginator = Paginator(allArticles,per_page=20)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":allArticles.count(),
        "allData":allData,
        "totalPages":[x for x in range(1,totalPages+1)],
        "now":dut.now(),
        "lastArticle":lastArticle   
    }
    return render(request,'administration/admin-articles.html',context)

@isSuperUser
def serveDashboardMessages(request):
    allMessages = Message.objects.all().order_by('-sendDate')
    context = {
        "numberOfRessource":allMessages.count(),
        "allData":allMessages,
        "now":dut.now(),
        "lastArticle":Article.objects.last()   
    }
    return render(request,'administration/admin-messages.html',context)
    

def editorSpace(request,author_id=None):

    # Pour lister les articles d'un rédacteur
    # dans son espace, on se sert de cette vue.
    # Pour lister les articles par auteur,
    # on se sert de cette même vue.
    # La différence sera quand un argument 
    # a été passé à l'URL

    if author_id:
        articles = Article.objects.all().filter(author__id=int(author_id)).order_by("-updateDate","-saveDate")
    else:
        articles = Article.objects.all().filter(author__id=int(request.user.id)).order_by("-updateDate","-saveDate")

    custom_paginator = Paginator(articles,per_page=10)
    current_page = request.GET.get('cp')
    servableArticles = custom_paginator.get_page(current_page)
    totalPages = servableArticles.paginator.num_pages
    numberOfArticles=articles.count()

    context = {
        "articles":servableArticles,
        "now":dut.now(),
        "totalPages":[x for x in range(1,totalPages+1)],
        "numberOfArticles":numberOfArticles,
        "categories":Category.objects.all(),
    }

    if author_id:
        context['author'] = BlogUser.objects.get(pk=author_id)
    else:
        context['author'] = BlogUser.objects.get(pk=int(request.user.id))

    if inEditors(request):
        context['lastArticle'] = Article.objects.all().filter(author__id=int(request.user.id)).exclude(online=False).last()
        return render(request,"administration/editor-space-v.html",context)
    else:
        return render(request,"administration/editor-space.html",context)

def constituteDataResponse(request,inOut):

    query = parseBytesToDict(request)

    if not request.user.is_superuser:
        found = Article.objects.all().filter(
        online=inOut,
        author__id=int(request.user.id),
        title__icontains=query).order_by('-saveDate','-updateDate')
    else:
        found = Article.objects.all().filter(
        online=inOut,
        title__icontains=query).order_by('-saveDate','-updateDate')
            
    articles = [
            {
                "id":article.id,
                "image":article.image.url,
                "imageAlt":article.imageAlt,
                "readLink":article.get_absolute_url,
                "title":article.title,
                "online":article.online,
                "updateLink":reverse_lazy('site-admin:update-article',args=(article.slug,article.id)),
                "deleteLink":article.deleteArticle,
                "sameDate":reverse_lazy("site-admin:same-date-articles",args=(article.id,)),
                "saveDate":formatDate(article.saveDate),
                "comments":reverse_lazy("site-admin:same-article-comments",args=(article.id,)),
                "countComments":article.articleComments.count(),
                "likes":article.likes.count(),
                "updateDate":formatDate(article.updateDate),
                "linkStatus":reverse_lazy("post:put-article-outline",args=(article.slug,article.id)) if inOut else reverse_lazy("post:put-article-online",args=(article.slug,article.id))
            } for article in found
        ]
    
    return articles

@isEditor
def getAllOnline(request):
    articles = constituteDataResponse(request,True)
    return JsonResponse(articles,safe=False)

@isEditor
def getAllOutline(request):
    articles = constituteDataResponse(request,False)
    return JsonResponse(articles,safe=False)

@isEditor
def getAllImages(request):
    articles = Article.objects.all()
    dataToSendBack = [
        {
            "url":article.image.url,
            "name":path.basename(article.image.name),
            "imageAlt":article.imageAlt,
            "id":article.id
        } for article in articles
    ]
    return JsonResponse(dataToSendBack,safe=False)


def sameArticleComments(request,article_id):
    comments = Comment.objects.all().filter(whichArticle__id=int(article_id))

    custom_paginator = Paginator(comments,per_page=24)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    # LE DERNIER ARTICLE
    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":comments.count(),
        "allData":allData,
        "totalPages":[x for x in range(1,totalPages+1)],
        "now":dut.now(),
        "lastArticle":lastArticle,
    }
    return render(request,'administration/admin-comments.html',context)

def sameDateArticles(request,article_id):
    article = get_object_or_404(Article,pk=article_id)
    date = article.saveDate.date()

    allArticles = Article.objects.all().filter(saveDate__date=date)
    custom_paginator = Paginator(allArticles,per_page=20)
    pageInUrl = request.GET.get('page')
    allData = custom_paginator.get_page(pageInUrl)
    totalPages = allData.paginator.num_pages

    lastArticle  = Article.objects.last()

    context = {
        "numberOfRessource":allArticles.count(),
        "allData":allData,
        "totalPages":[x for x in range(1,totalPages+1)],
        "now":dut.now(),
        "lastArticle":lastArticle   
    }
    return render(request,'administration/admin-articles.html',context)
    



# MANAGING USER ACCOUNTS STATUS (active or inactive)

@isSuperUser
def desactivateAccount(request,user_id):
    try:
        theUser = get_object_or_404(BlogUser,id=user_id)

        if theUser:
            theUser.is_active = False 
            theUser.save()

            if checkAjax(request):
                return JsonResponse({
                    "status":200,
                    "message":f"User {theUser.username}'s account disabled !",
                    "URL":reverse("site-admin:reactivate-account",args=(user_id,))
                })
            else:
                # messages.success(request,"User disabled successfully !")
                return redirect(request.headers.get('Referer'))
    except:
        return redirect('extra:error-404')
    

@isSuperUser
def reactivateAccount(request,user_id):
    try:
        theUser = get_object_or_404(BlogUser,id=user_id)

        if theUser:
            theUser.is_active = True 
            theUser.save()

            if checkAjax(request):
                dataToSendBack = {
                    "status":200,
                    "message":f"User {theUser.username}'s account enabled !",
                    "URL":reverse("site-admin:desactivate-account",args=(user_id,))
                }
                return JsonResponse(dataToSendBack,safe=True)
            else:
                # messages.success(request,"User enabled successfully !")
                return redirect(request.headers.get('Referer'))
    except:
        return redirect('extra:error-404')
    

@isSuperUser
def addToEditorsGroup(request,user_id):
    try:
        user = get_object_or_404(BlogUser,id=user_id)
        editors_group = Group.objects.get(name="Editors")
        user.groups.add(editors_group)
        user.save()
        if checkAjax(request):
            return JsonResponse({
                "status":200,
                "message":"Utilisateur ajouté au groupe d'éditeurs d'articles !",
                "URL":reverse_lazy('site-admin:remove-editor',args=(user_id,))
            })
        else:
            return redirect('site-admin:dash-board')
    except:
        return redirect('extra:error-404')
        
@isSuperUser
def removeFromEditorsGroup(request,user_id):
    try:
        user = get_object_or_404(BlogUser,id=user_id)
        editors_group = Group.objects.get(name="Editors")
        user.groups.remove(editors_group)
        user.save()
        if checkAjax(request):
            return JsonResponse({
                "status":200,
                "message":"Utilisateur supprimé du groupe d'éditeurs d'articles !",
                "URL":reverse_lazy('site-admin:make-editor',args=(user_id,))
            })
        else:
            return redirect('site-admin:dash-board')
    except:
        return redirect('extra:error-404')

# CRUD OPERATIONS

@isSuperUser
def createCategory(request):

    if request.method == "POST":
        form = CategoryForm(request.POST or None, request.FILES or None)

        if form.is_valid():
            form.save()
            # messages.success(request,"Catégorie ajoutée avec succès !",css_success_class)
            return redirect("site-admin:dashboard")
        else:
            # messages.error(request,"Erreur dans l'ajout de la catégorie !",css_fail_class)
            return redirect("site-admin:dashboard")
        
    else:
        context = {
            "form":CategoryForm(),
            "action":"CREATE",
            "table":"CATEGORY",
            "url":reverse("site-admin:create-category"),
            "panel":reverse("site-admin:dashboard")
        }
        return render(request,'administration/crud-form.html',context)



@isSuperUser
def updateCategory(request,categ_id):
    category = get_object_or_404(Category,id=categ_id)

    if request.method == "POST":
        form = CategoryForm(request.POST or None, request.FILES or None,instance=category)

        if form.is_valid():
            form.save()
            # messages.success(request,"Catégorie mise-à-jour avec succès !",css_success_class)
            return redirect('site-admin:dashboard')
        else:
            # messages.success(request,"Echec de modification !",css_fail_class)
            return redirect('site-admin:dashboard')
    else:
        context = {
            "form":CategoryForm(instance=category),
            "action":"UPDATE",
            "table":"CATEGORIES",
            "url":reverse("site-admin:update-category",args=(categ_id,)),
            "panel":reverse("site-admin:dashboard")
        }
        return render(request,'administration/crud-form.html',context)

@isSuperUser
def deleteCategory(request,categ_id):
    try:
        category = get_object_or_404(Category,id=categ_id)
        category.delete()

        if checkAjax(request):
            return JsonResponse({
                "status":200,
                "message":"Catégorie supprimée avec succès !"
            })
        else:
            # messages.success(request,"Echec de suppression !",css_fail_class)
            return redirect("site-admin:dashboard")
    except:
        return redirect('extra:error-404')

@isSuperUser
def createOpinion(request):
    if request.method == "POST":
        form = WhatPeopleSayForm(request.POST or None)

        if form.is_valid():
            form.save()
            # messages.success(request,"Avis Public ajouté avec succès !",css_success_class)
            return redirect("site-admin:dashboard")
        else:
            # messages.error(request,"Avis Public ajouté avec succès !",css_fail_class)
            return redirect("site-admin:dashboard")
    else:
        context = {
            "form":WhatPeopleSayForm(),
            "action":"CREATE",
            "table":"OPINION OF USER",
            "url":reverse('site-admin:create-opinion'),
            "panel":reverse('site-admin:dashboard')
        }
        return render(request,'administration/crud-form.html',context)

@isSuperUser
def deleteOpinion(request,opinion_id):
    try:
        opinion = get_object_or_404(WhatPeopleSay,id=opinion_id)
        opinion.delete()

        if checkAjax(request):
            return JsonResponse({
                "status":200,
                "message":"Avis supprimée avec succès !"
            })
        else:
            # messages.success(request,"Avis supprimée avec succès !",css_fail_class)
            return redirect('site-admin:dashboard')
    except:
        return redirect('extra:error-404')

@isSuperUser
def updateOpinion(request,opinion_id):
    opinion = get_object_or_404(WhatPeopleSay,id=opinion_id)

    if request.method == "POST":
        form = WhatPeopleSayForm(request.POST or None,instance=opinion)

        if form.is_valid():
            form.save()
            # messages.success(request,"Avis public mis-à-jour avec succès !",css_success_class)
            return redirect('site-admin:dashboard')
        else:
            # messages.success(request,"Echec de modification !",css_fail_class)
            return redirect('site-admin:dashboard')
    else:
        context = {
            "form":WhatPeopleSayForm(instance=opinion),
            "action":"UPDATE",
            "table":"OPINION OF USER",
            "url":reverse("site-admin:update-opinion",args=(opinion_id,)),
            "panel":reverse("site-admin:dashboard")
        }
        return render(request,'administration/crud-form.html',context)
    

def postOrNot(request,opinion_id,verdict):
    try:
        opinion = get_object_or_404(WhatPeopleSay,id=opinion_id)
        opinion.postIt = verdict 
        opinion.save()

        if checkAjax(request):
            dataToSendBack = {
                "status":200,
            }

            if verdict:
                dataToSendBack['message'] = "Avis public posté avec succès !"
                dataToSendBack["URL"] = reverse("site-admin:post-not-opinion",args=(opinion_id,))
            else:
                dataToSendBack['message'] = "Avis public non posté avec succès !"
                dataToSendBack["URL"] = reverse("site-admin:post-opinion",args=(opinion_id,))

            return JsonResponse(dataToSendBack)
        else:
            return redirect('site-admin:dashboard')
    except:
        return redirect("extra:error-404")

@isSuperUser
def postOpinion(request,opinion_id):
    return postOrNot(request,opinion_id,True)

@isSuperUser
def postNot(request,opinion_id):
    return postOrNot(request,opinion_id,False)


@isEditor
def createArticle(request):

    if request.method == "POST":

        # LES DONNES RECUES DE L'UTILISATEUR
        title = request.POST.get('title')
        content = request.POST.get('content')
        image = request.FILES.get('image')
        sumItUp = request.POST.get('sumItUp')
        imageAlt = request.POST.get('imageAlt')
        imageAuthor = request.POST.get('imageAuthor')
        articleCategory = request.POST.get('category')
        articleHashtags = request.POST.getlist('hashtags')
        keepDraft = request.POST.get('keep-draft')

        newArticle = Article.objects.create(
            title=title,
            sumItUp=sumItUp,
            content=content,
            image=image,
            imageAlt=imageAlt,
            imageAuthor=imageAuthor,
            category=Category.objects.get(id=int(articleCategory)),
            author=BlogUser.objects.get(id=int(request.user.id))
        )
        

        for n in articleHashtags:
            newArticle.hashtags.add(
                Hashtags.objects.get(id=int(n))
            )

        newArticle.likes.add(
            BlogUser.objects.get(id=int(request.user.id))
        )

        newArticle.online = True if keepDraft is None else False
        newArticle.save()
        
        return redirect(newArticle.get_absolute_url)
    
    else:
        context = {
            "allHashtags":Hashtags.objects.all().order_by('hashtag'),
            "allCategories":Category.objects.all(),
            "form":ArticleForm()
        }
        return render(request,'administration/create-article.html',context)
        

def updateArticle(request,art_slug,art_id):
    
    article = get_object_or_404(Article,slug=art_slug,id=art_id)

    candEdit = inEditors(request)
    isSuper = request.user.is_superuser 
    isAuthor = request.user.id == article.author.id

    if (candEdit and isAuthor) or isSuper:
        if request.method == "POST":
            form = UpdateArticleForm(request.POST or None, request.FILES or None, instance=article)

            if form.is_valid():
                form.save()

                messages.success(request,"Article mis à jour avec succès !", css_success_class)
                redirectPath = reverse_lazy(
                    "post:read-article",
                    args=(
                        article.slug,
                        article.id
                    )
                )

                return redirect(redirectPath)
            else:
                messages.error(request,"Echec de mise-à-jour de l'article !",css_fail_class)
                return redirect(request.headers.get('Referer'))
        else:
            context = {
                "panel":reverse("site-admin:dashboard-articles"),
                "allHashtags":Hashtags.objects.all().order_by('hashtag'),
                "allCategories":Category.objects.all(),
                "article":article,
                "form":ArticleForm(instance=article)
            }
            return render(request,'administration/update-article.html',context)

    else:
        messages.success(request,"Seul l'auteur de l'article peut le modifer !",css_fail_class)
        return redirect('extra:access-denied')
    


def markMessageAsRead(request,message_id):
    message = get_object_or_404(Message,id=message_id)
    message.read = True 
    message.save()

    if checkAjax(request):
        return JsonResponse({
            "status":200,
            "message":"Message lu avec succès !"
        })
    else:
        messages.success(request,"Message lu avec succès !",css_success_class)
        return redirect(request.headers.get('Referer'))
    
def deleteMessage(request,message_id):
    message = get_object_or_404(Message,id=message_id)
    message.delete()

    if checkAjax(request):
        return JsonResponse({
            "status":200,
            "message":"Message supprimé avec succès !"
        })
    else:
        messages.success(request,"Message supprimé avec succès !",css_success_class)
        return redirect(request.headers.get('Referer'))

async def deleteAllMessage(request):
    messages = Message.objects.all()
    await messages.adelete()
    return redirect('site-admin:dashboard-messages')



async def deleteAllComments(request):
    comments = Comment.objects.all()
    await comments.adelete()
    return redirect('site-admin:dashboard-comments')
    

def createHashtag(request):
    if checkAjax(request):
        receivedHashtag = parseBytesToDict(request)['hashtag']
        
        createdHashtag = Hashtags.objects.create(
            hashtag=receivedHashtag
        )
        createdHashtag.save()

        return JsonResponse({
            "status":201,
            "message":f"Hashtag {createdHashtag.hashtag} créé avec succès !",
            "id":createdHashtag.id
        })