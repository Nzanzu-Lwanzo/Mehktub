from django.shortcuts import render,get_object_or_404,redirect
from .models import Article,Category,Hashtags,Comment,BlogUser
from django.utils.timezone import now
from django.core.paginator import Paginator
from django.http import HttpResponse,JsonResponse
import json
from django.contrib.auth.models import User
from django.contrib import messages
from django.http.response import Http404
from django.utils.timezone import now
from django.db.models import Q 
from django.urls import reverse,reverse_lazy


def inEditors(request):
    return request.user.groups.filter(name="Editors").exists()


def checkAjax(request):
    # Toutes les clés du header
    header_keys = request.headers.keys()
    # La méthode est-elle POST ?
    is_post = request.method == "POST"
    # Le header a-t-il une clé X-Requested-With ?
    has_xreq = 'x-requested-with' in header_keys or 'X-Requested-With' in header_keys
    # Cette clé a-t-elle la valeur XMLHttpRequest ? Clé en Majuscule
    value_xml_maj = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    # Cette clé a-t-elle la valeur XMLHttpRequest ? Clé en Miniscule
    value_xml_min = request.headers.get('x-requested-with') == 'XMLHttpRequest'
    # Joindre les deux conditions précédentes
    value_xml = value_xml_maj or value_xml_min
    # Au final, est-ce bien une requête XMLHttpRequest ?
    is_xhr =  has_xreq and value_xml

    # Si toutes les conditions sont correctes
    # alors, ce doit être en AJAX
    is_ajax = is_post and is_xhr

    return is_ajax

def fetchHastags():
    fetchedHashtags = Hashtags.objects.all()
    return fetchedHashtags

def list_articles(request):
    return render(request,'post/list_articles.html')

def read_article(request,article_slug,article_id):

    if request.user.is_authenticated:
        try:
            # RECUPERER L'ARTICLE CORRESPONDANT
            article = get_object_or_404(
                Article, 
                slug=article_slug,
                id=article_id
            )

            if article.online == False and not inEditors(request):
                messages.error(request,"Cet article a été sorti de ligne ! Il sera remis en ligne très bientôt !")
                return redirect("extra:access-denied")

            # RECHERCHE PLUS D'ARTICLES A PROPOSER
            # PROCHE DE CELUI QU'ON LIT
            # RECUPERER TOUS LES ARTICLES
            # EXCLUANT L'ARTICLE COURANT
            # ORDONNANT PAR DATE DE MISE A JOUR
            # DECROISSANTE
            allArticles = Article.objects.all().exclude(id=article.id).order_by('-updateDate','-saveDate')

            # - Récupérer les hashtags de l'article courant
            # - Il se peut qu'aucun hashtag n'existe
            # - ou qu'on cherche un troisième hashtag
            # - alors qu'il n'y en a que deux
            # - pour éviter une exception du genre
            # - index out of range
            # - je try-except tout !
            
            try:
                mainHashtag = article.hashtags.all()[0]
            except:
                mainHashtag = None

            try:
                secondHashtag = article.hashtags.all()[1]
            except:
                secondHashtag = None

            try:
                thirdHashtag = article.hashtags.all()[2]
            except:
                thirdHashtag = None

            # - Initialiser les listes des articles à proposer
            if mainHashtag:
                mainArticles = allArticles.filter(hashtags__hashtag__iexact=mainHashtag)
            else:
                mainArticles = None
            if secondHashtag:
                secondArticles = allArticles.filter(hashtags__hashtag__iexact=secondHashtag)
            else:
                secondArticles = None
            if thirdHashtag:
                thirdArticles = allArticles.filter(hashtags__hashtag__iexact=thirdHashtag)
            else:
                thirdArticles = None
            
            # - Tous les articles à proposer 
            proposeMore = set()

            if mainArticles:
                for anArticle in mainArticles:
                    proposeMore.add(anArticle)
            if secondArticles:
                for anArticle in secondArticles:
                    proposeMore.add(anArticle)
            if thirdArticles:
                for anArticle in thirdArticles:
                    proposeMore.add(anArticle)

            # RECUPERER TOUS LES COMMENTAIRES
            # QUI SONT EN RELATION AVEC CET ARTICLE
            comments = Comment.objects.all().filter(whichArticle=article).order_by('postDate')[:12]

            # EMPECHER UN UTILISATEUR DE LIKER
            # DEUX FOIS
            hasLiked = article.likes.contains(
                BlogUser.objects.get(id=int(request.user.id))
            )

            context={
                'article':article,
                "categories": Category.objects.all(),
                "moreArticles":list(proposeMore)[:6],
                'comments':comments,
                "hasLiked":hasLiked
            }
            
            return render(request,'post/display_article.html',context)
        except Http404 as e:
            return render(request,'extra/404_page.html')
    else:
        messages.success(request,'Vous ne pouvez pas lire cet article sans être abonné et connecté !')
        return render(request,'extra/accessDenied.html')
        

def category_articles(request,categ_slug,categ_id):

    if request.user.is_authenticated:
        try:
            # LA CATEGORIE QUI CORRESPOND
            category = get_object_or_404(
                Category,  
                slug=categ_slug,
                id=categ_id        
            )

            # LES ARTICLES DE CETTE CATEGORIE
            # LES DONNER EN GROUPE - PAGINATION
            if not inEditors(request):
                articles = Article.objects.all().filter(category__slug__iexact=categ_slug,online=True).order_by('-saveDate','-updateDate')
            else:
                articles = Article.objects.all().filter(category__slug__iexact=categ_slug).order_by('-saveDate','-updateDate')

            paginator = Paginator(articles,per_page=12)
            current_page = request.GET.get('cp')
            servableArticles = paginator.get_page(current_page)

            # Le nombre total de pages
            totalPages = servableArticles.paginator.num_pages

            # RECUPERER TOUS LES UTILISATEURS
            # on ne peut lire un article
            # que si on est déjà abonné
            allUsers = User.objects.all()

            # RECUPERER TOUS LES HASHTAGS 
            # CITES DANS CETTE CATEGORIE
            allHashtagsWithThisCategory = Article.objects.filter(category=category).values_list('hashtags__hashtag').distinct()

            # LE CONTEXTE
            context = {
                "category":category,
                "articles":servableArticles,
                "totalPages":[x for x in range(1,totalPages+1)],
                "now":now,
                "categories": Category.objects.all(),
                "allUsers":allUsers,
                "numberOfArticles":articles.count(),
                "numberOfHashtags":allHashtagsWithThisCategory.count()
            }
            
            return render(request,'management/base_listing.html',context)
        
        except Http404 as e:
            return render(request,'extra/404_page.html')
    else:
        messages.success(request,'Vous ne pouvez pas voir cette page sans être abonné et connecté !')
        return render(request,'extra/accessDenied.html')



def post_comment(request):
    if request.user.is_authenticated:
        if checkAjax(request):
            receivedDataInBytes = request.body
            receivedDataInString = receivedDataInBytes.decode('utf-8')
            fromJSONtoDict = json.loads(receivedDataInString)

            # Les données
            userComment = fromJSONtoDict['content']
            articleID = fromJSONtoDict['articleID']
            userID = fromJSONtoDict['userID']

            # Ajouter un commentaire
            newComment = Comment.objects.create(
                content=userComment,
                whoPost=BlogUser.objects.get(id=userID),
                whichArticle= Article.objects.get(id=articleID)
            )

            dataToSendBack = {
                'id':newComment.id,
                'content':newComment.content,
                'whoPost':newComment.whoPost.username.replace('-',' '),
                'toDelete':newComment.delete_comment
            }

            return JsonResponse(dataToSendBack)
        else:
            content = request.POST.get('content')
            whichArticleId = request.POST.get('articleIdForBackend')

            Comment.objects.create(
                content=content,
                whoPost=BlogUser.objects.get(id=request.user.id),
                whichArticle=Article.objects.get(id=whichArticleId)
            )

            return redirect(request.META['HTTP_REFERER'])

    else:
        messages.success(request,'Vous ne pouvez pas commenter sans être abonné et connecté !')
        return render(request,'extra/accessDenied.html')


def search_article(request):
    # Tous les articles
    allArticles = Article.objects.all()

    # La requête de l'utilisateur
    query = request.GET.get('search-input')

    inTitle = Q(title__icontains=query)
    inSumItUp = Q(sumItUp__icontains=query)
    inAuthorName = Q(author__username__icontains=query)
    isOnline = Q(online=True)

    if not inEditors(request):
        proposeArticles = Article.objects.all().filter((inTitle | inSumItUp | inAuthorName) and isOnline ).distinct()
    else:
        proposeArticles = Article.objects.all().filter(inTitle | inSumItUp | inAuthorName).distinct()
    
    context={
        'now': now(),
        'categories':Category.objects.all(),
        'query':query
    }

    if proposeArticles:        
        context['proposeArticles'] = proposeArticles.order_by('-updateDate')
    else:
        messages.success(request,"Aucun résultat n'a été trouvé pour votre recherche")
   
    return render(request,'post/found_articles.html',context)

def search_by_hashtag(request,hashtag_id=None,hashtag_name=None):
    
    # Cette information passée par URL
    # vient du panel d'administration
    # je liste les hashtags mais ceux-ci
    # ont la possibilité de conduire
    # par un lien vers une page qui contient
    # tous les articles où ils sont cités
    # au lieu de créer une autre vue,
    # j'ai préféré utiliser la même que pour la recherche
    # par hashtag. Sauf qu'ici, la donnée par laquelle
    # rechercher ne vient pas d'un formulaire
    # mais est passé dans l'URL.
    if hashtag_id is not None:
        query = Hashtags.objects.get(id=int(hashtag_id)).hashtag
    else:
        query = request.GET.get('hashtag-search').strip()


    proposeArticles = Article.objects.all().filter(hashtags__hashtag__iexact=query,online=True)
    context = {
        'now': now(),
        'categories':Category.objects.all()
    }

    if proposeArticles:        
        context['proposeArticles'] = proposeArticles.order_by('-updateDate')
    else:
        messages.success(request,"Aucun résultat n'a été trouvé pour votre recherche")

    return render(request,'post/found_articles.html',context)


def like_article(request,article_id):
    try:
        article = get_object_or_404(Article,pk=article_id)
        article.likes.add(
            BlogUser.objects.get(id=int(request.user.id))
        )

        if checkAjax(request):
            return JsonResponse({
                "status":200,
                "message":"Article liké avec succès !"
            })
        else:
            return redirect(request.headers.get("Referer"))
    except:
        return redirect('extra:error-404')


def delete_comment(request,comment_id):
    
    commentToDelete = get_object_or_404(Comment,id=comment_id)

    if checkAjax(request):
        commentToDelete.delete()

        # Renvoyer une réponse JSON.
        # Pour la carte modale
        return JsonResponse({
            'status':200,
            'message':'Commentaire supprimé !'
        })
    
    # Supprimer normalement
    else:
        commentToDelete.delete()
        # Rédiriger vers la page d'où
        # la requête a été envoyée
        return redirect(request.META['HTTP_REFERER'])

def putArticleOutlineOrNot(request,article_slug,article_id):
    article = get_object_or_404(Article,id=article_id,slug=article_slug)
    article.online = False 
    article.save()
    
    if checkAjax(request):
        return JsonResponse({
            "status":200,
            "message":f"L'article {article.title} n'est plus en ligne !",
            "URL":reverse_lazy("post:put-article-online",args=(article_slug,article_id))
        })
    else:
        return redirect(request.headers.get('Referer'))

def putArticleOnlineOrNot(request,article_slug,article_id):
    article = get_object_or_404(Article,id=article_id,slug=article_slug)
    article.online = True 
    article.save()
    
    if checkAjax(request):
        return JsonResponse({
            "status":200,
            "message":f"L'article {article.title} a été mis en ligne !",
            "URL":reverse_lazy("post:put-article-outline",args=(article_slug,article_id))
        })
    else:
        return redirect(request.headers.get('Referer'))