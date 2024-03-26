from django.shortcuts import render,get_object_or_404,redirect
from post.models import Article,BlogUser,Hashtags,Comment,WhatPeopleSay,Category
from .models import Message
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.hashers import check_password,make_password
import json
from post.views import checkAjax
from django.db.utils import IntegrityError
from django.contrib import messages
from django.http.response import Http404
from django.contrib.auth.decorators import login_required


# VARIABLES GENERALES
css_success_class = "gen-success"
css_fail_class = "gen-fail"

# FONCTION UTILES-OUTILS-REUTILISABLES
def parseBytesToDict(request):
    rawData = request.body
    parsedData = rawData.decode('utf8')
    fromJSONtoDict = json.loads(parsedData)
    return fromJSONtoDict

def buildDataToSendBack(code,message,extraData):
    # Récupérer le dernier article
    lastArticle = Article.objects.all().exclude(online=False).last()

    # La réponse pour le JSON
    data = {
        'message':message,
        'status':code,
        'lastArticle':{
            'title':lastArticle.title,
            'slug':lastArticle.slug,
            'sumItUp':lastArticle.sumItUp,
            'image':lastArticle.image.url,
            'imageAlt':lastArticle.imageAlt,
            'imageAuthor':lastArticle.imageAuthor,
            'saveDate':lastArticle.saveDate,
            'category':lastArticle.category.title,
            'hashtags':[
                relatedHashtag.hashtag for relatedHashtag in lastArticle.hashtags.all()
            ],
            'author':lastArticle.author.username,
            'location':lastArticle.get_absolute_url,
            'homepage':'/homepage/'
        }
    }

    finalData = {**data,**extraData}

    return finalData

def isEditor(user):
    return user.groups.filter(name="Editors").exists()

def canEdit(user,article):
    candEdit = isEditor(user)
    isSuper = user.is_superuser 
    isAuthor = user.id == article.author.id

    return (candEdit and isAuthor) or isSuper



def serve_form(request):
    return render(request,'management/base_form.html')

def logUserIn(request):
    if request.method == "POST":
        # Récupérer les données envoyées
        sentUsername = request.POST.get('username').replace(' ','-')
        sentPassword = request.POST.get('password')

        # Authentifier l'utilisateur
        user = authenticate(request,username=sentUsername,password=sentPassword) 

        # Si l'utilisateur ne peut être connecté
        # on l'invite à s'abonner
        if user is not None:
            login(request,user)
            return redirect('extra:homepage')
        else:
            messages.success(request,"Compte non abonné ! Abonnez-le !")
            return redirect('management:signUserUp')
    else:
        return render(request,'management/logIn_form.html')

def logUserOut(request):
    logout(request)
    return redirect('extra:homepage')

def unactiveAccount(request):
    account = request.user 

    if account:
        account.is_active = False
        account.save()
        return redirect('extra:homepage')
    else:
        return redirect('extra:homepage')


# CREER UN COMPTE 
# Peut-être qu'en passant par une
# classe de formulaire
# le cas de création de compte
# par quelqu'un qui est déjà dans la BDD
# sera automatiquement gérée
def signUserUp(request):
    # Est-ce en POST ?
    if request.method == "POST":
        # Si oui, est-ce en XMLHttpRequest ?
        # POUR AJAX
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            # Les données soumises par l'utilisateur
            submittedData = parseBytesToDict(request)

            # Séparer les données
            s_username = submittedData['username'].replace(' ','-')
            s_email = submittedData['email']
            s_password = submittedData['password']
            s_keepChecked = submittedData['keepChecked']
            s_joinNewsletter = submittedData['joinNewsletter']

            # CREATION DE L'UTILISATEUR
            try:
                createdUser = BlogUser.objects.create_user(
                    username=s_username,
                    email=s_email,
                    password=s_password,
                    keepChecked=s_keepChecked,
                    joinNewsletter=s_joinNewsletter
                )

                user = authenticate(request,username=s_username,password=s_password)

                if user is not None:
                    login(request,user)
                    dataToSendBack = buildDataToSendBack(201,'Connecté',{})  
                    return JsonResponse(dataToSendBack)
                else:
                    # Le contenu de la réponse JSON
                    dataToSendBack = buildDataToSendBack(201,'Compte créé avec succès !',{})
                    return JsonResponse(dataToSendBack)
            
            # Si le username est déjà dans la BDD
            # une IntegrityError sera levée
            except IntegrityError as e:
                # Vérifier si le nom et le mot de passe 
                # reçus de la requête                
                # correspondent à un utilisateur 
                # déjà enregistré avec les mêmes
                # credentials dans la BDD
                userAccordingToDataSent = BlogUser.objects.get(username=s_username)
                theirUsername = userAccordingToDataSent.username
                theirPassword = userAccordingToDataSent.password
                
                if s_username == theirUsername and check_password(s_password,theirPassword) :
                    # Si oui, alors ce compte existe déjà
                    # et son possesseur essaie d'en créer un autre
                    # avec le même nom d'utilisateur

                    # Il peut avoir mis son compte sur inactif
                    # une façon de dire qu'il l'a supprimé
                    # au lieu de supprimer les comptes dans Django
                    # c'est conseillé de mettre les utilisateur sur
                    # is_active = False
                    # pour éviter des problèmes avec les clés étrangères
                    # ou les relations ManyToMany
                    userAccordingToDataSent.is_active = True 
                    userAccordingToDataSent.save()

                    # Le contenu de la réponse JSON
                    messages.success(request,'Ce compte existe ! Connectez-le !')
                    dataToSendBack = buildDataToSendBack(301,'Vous avez déjà un compte !',{
                        'redirectURL': reverse('management:logUserIn')
                    })
                    
                    return JsonResponse(dataToSendBack)
                
                else:
                    return JsonResponse({
                        'message':"Ce compte n'est pas à vous !",
                        'status':500
                    })

        # Si non, alors c'est sans AJAX
        # Le navigateur de l'utilisateur 
        # ne supporte pas JavaScript.
        # Le connecter normalement
        else:
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            keepChecked = True if request.POST.get('keepChecked') is not None else False
            joinNewsletter = True if request.POST.get('joinNewsletter') is not None else False

            try:
                BlogUser.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    keepChecked=keepChecked,
                    joinNewsletter=joinNewsletter
                )

                user = authenticate(request,username=username,password=password)

                if user is not None:
                    login(request,user)
                    return redirect('extra:homepage')
                else:
                    messages.success(request,'Compte créé ! A présent, connectez-vous !')
                    return redirect('management:logUserIn')
            
            # Si une erreur d'intégrité des données
            # est levée, c'est que l'utilisateur existe déjà
            except IntegrityError as e :

                # Récupérer l'utilisateur déjà présent dans la BDD
                pretendUser = BlogUser.objects.get(username=username)

                # Si les nouvelles données,
                # et celles de l'utilisateur déjà dans la BDD
                #  correspondent
                if check_password(password,pretendUser.password):

                    user = authenticate(request,username=username,password=password)

                    if user is not None:
                        login(request,user)
                        return redirect('extra:homepage')
                    else:
                        messages.success(request,'Ce compte existe ! Connectez-le !')
                        return redirect('management:logUserIn')

                # Sinon, on lui dit que c'est pas son compte,
                #  qu'il en crée un autre
                else:
                    messages.success(request,"Compte déjà possédé ! Créez un nouveau !")
                    return redirect('management:signUserUp')
    else:
        return render(request,'management/signUp_form.html')
    


def delete_article(request,article_slug,article_id):

    if request.user.is_superuser or isEditor(request.user):
        try:
            # RECUPERER L'ARTICLE
            articleToDelete = get_object_or_404(Article,slug=article_slug,id=article_id)

            if not canEdit(request.user,articleToDelete):
                messages.success(request,"Vous n'êtes pas autorisé à effectuer cette action !")
                return render(request,'extra/accessDenied.html')

            # GARDER UNE TRACE DU NOM DE SA CATEGORIE
            # ET DE L'ID DE SA CATEGORIE
            # POUR PERMETTRE LA REDIRECTION
            thisArticleCategName = articleToDelete.category.title
            thisArticleCategId = articleToDelete.category.id 

            # SUPPRIMER
            articleToDelete.delete()

            if checkAjax(request):
                # REPONSE (ça doit être un prochain article qui remplacera celui qu'on a supprimé)
                return JsonResponse({'status':200,'statusText':'OK','ok':True})
            else:
                return redirect(request.headers.get('Referer'))
        except Http404 as e:
            return render(request,'extra/404_page.html')
    else:
        messages.success(request,"Vous n'êtes pas autorisé à effectuer cette action !")
        return render(request,'extra/accessDenied.html')

def contactMe(request):
    if checkAjax(request):
        receivedData = parseBytesToDict(request)

        # SEPARER LES DONNEES
        sender = receivedData.get('sender','NO NAME')
        usermail=receivedData.get('usermail','NO MAIL')
        phoneTel=receivedData.get('phoneTel','NO PHONE')
        subject = receivedData.get('subject','NO SUBJECT')
        content = receivedData.get('content','NO CONTENT')
        
        # ENREGISTRER LE MESSAGE
        Message.objects.create(
            sender=sender,
            email=usermail,
            content=content,
            phone=phoneTel,
            motive=subject,
            read=False
        )

        return JsonResponse({
            "status":201,
            "redirection":reverse('extra:homepage')
        })


    elif request.method == "POST":
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        sender = request.POST.get('sender')
        usermail = request.POST.get('usermail')
        phoneTel = request.POST.get('phoneTel')

        Message.objects.create(
            sender=sender,
            content=message,
            email=usermail,
            phone=phoneTel,
            motive=subject
        )

        backURL = request.headers.get('Referer')
        return redirect(backURL)

def isAllowedToUpdate(request,password):
    recoredPassword = BlogUser.objects.get(id=int(request.user.id)).password

    return check_password(password,recoredPassword)

def modifyUserData(request):
    return render(request,'management/modify-data.html')
    
def updateUsername(request):
    
    username = request.POST.get('username')
    password = request.POST.get('password')

    if isAllowedToUpdate(request,password):
        user = BlogUser.objects.get(id=int(request.user.id))
        user.username = username
        user.save()
        messages.success(request,"Nom d'utilisateur mis à jour avec sucès !",css_success_class)
        return redirect("management:modify-user-data")
    else:
        messages.success(request,"Echec de la mise-à-jour !",css_fail_class)
        return redirect("management:modify-user-data")


def updateUserEmail(request):
    email = request.POST.get('email')
    password = request.POST.get('password')

    if isAllowedToUpdate(request,password):
        user = BlogUser.objects.get(id=int(request.user.id))
        user.email = email 
        user.save()
        messages.success(request,"Adresse e-mail mise à jour avec sucès !",css_success_class)
        return redirect("management:modify-user-data")
    else:
        messages.success(request,"Echec de la mise-à-jour !",css_fail_class)
        return redirect("management:modify-user-data")

def updateUserPassword(request):
    
    password1 = request.POST.get('password1')
    password2 = request.POST.get('password2')

    if isAllowedToUpdate(request,password1):
        user = BlogUser.objects.get(id=int(request.user.id))
        user.password = make_password(password2) 
        user.save()
        messages.success(request,"Mot de passe mis à jour avec sucès !",css_success_class)
        return redirect("management:modify-user-data")
    else:
        messages.success(request,"Echec de la mise-à-jour !",css_fail_class)
        return redirect("management:modify-user-data")