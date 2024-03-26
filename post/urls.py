from django.urls import path,include
from . import views 

app_name = "post"
urlpatterns = [
    path('list-articles/', views.list_articles,name="list-articles"),
    path('category-articles/<slug:categ_slug>/<int:categ_id>/', views.category_articles,name="category-articles"),
    path('read-article/<slug:article_slug>/<int:article_id>/', views.read_article,name="read-article"),
    path('post-comment/',views.post_comment,name="comment-article"),
    path('search-article/', views.search_article,name="search-article"),
    path('search-by-hashtag/', views.search_by_hashtag,name="search-by-hashtag"),
    path('search-by-hashtag/<int:hashtag_id>/<str:hashtag_name>/', views.search_by_hashtag,name="search-by-hashtag"),
    path('delete-comment/<int:comment_id>/', views.delete_comment,name="delete-comment"),
    path('like-article/<int:article_id>/', views.like_article,name="like-article"),
    path('put-article-outline/<slug:article_slug>/<int:article_id>/',views.putArticleOutlineOrNot,name="put-article-outline"),
     path('put-article-online/<slug:article_slug>/<int:article_id>/',views.putArticleOnlineOrNot,name="put-article-online")
    
]