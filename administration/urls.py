from django.urls import path
from . import views 


app_name = "site-admin"

urlpatterns = [
    path('dashboard-home/',views.serveDashboard,name="dashboard"),
    path('dashboard-users/',views.serveDashboardUsers,name="dashboard-users"),
    path('dashboard-comments/',views.serveDashboardComments,name="dashboard-comments"),
    path('dashboard-messages/',views.serveDashboardMessages,name="dashboard-messages"),
    path('dashboard-hashtags/',views.serveDashboardHashtags,name="dashboard-hashtags"),
    path('dashboard-articles/',views.serveDashboardArticles,name="dashboard-articles"),
    path('editor-space/',views.editorSpace,name="editor-space"),
    path('same-author-articles/<int:author_id>/',views.editorSpace,name="same-author-articles"),
    path('same-article-comment/<int:article_id>/',views.sameArticleComments,name="same-article-comments"),
    path('same-date-articles/<int:article_id>/',views.sameDateArticles,name="same-date-articles"),

    path('desactivate-account/<int:user_id>/',views.desactivateAccount,name="desactivate-account"),
    path('reactivate-account/<int:user_id>/',views.reactivateAccount,name="reactivate-account"),

    path('add-to-editors-group/<int:user_id>/', views.addToEditorsGroup,name="make-editor"),
    path('remove-from-editors-group/<int:user_id>/', views.removeFromEditorsGroup,name="remove-editor"),

    path('get-all-online/',views.getAllOnline,name="get-all-online"),
    path('get-all-outline/',views.getAllOutline,name="get-all-outline"),
    path('get-all-images/',views.getAllImages,name="get-all-images"),

    # CRUD OPERATIONS

    # CATEGORIES
    path('create-category/',views.createCategory,name="create-category"),
    path('update-category/<int:categ_id>/',views.updateCategory,name="update-category"),
    path('delete-category/<int:categ_id>/', views.deleteCategory,name="delete-category"),

    # PUBLIC OPINIONS
    path('create-opinion/', views.createOpinion,name="create-opinion"),
    path('update-opinion/<int:opinion_id>/', views.updateOpinion,name="update-opinion"),
    path('delete-opinion/<int:opinion_id>/', views.deleteOpinion,name="delete-opinion"),
    path('post-opinion/<int:opinion_id>/', views.postOpinion, name="post-opinion"),
    path('post-not-opinion/<int:opinion_id>/', views.postNot, name="post-not-opinion"),

    # ARTICLE
    path("create-article/", views.createArticle, name="create-article"),
    path("update-article/<slug:art_slug>/<int:art_id>/", views.updateArticle, name="update-article"),

    # MESSAGE
    path('mark-message-as-read/<int:message_id>/',views.markMessageAsRead,name="mark-as-read"),
    path('delete-message/<int:message_id>/',views.deleteMessage,name="delete-message"),
    path('delete-all-messages/',views.deleteAllMessage,name="delete-all-message"),

    # COMMENTAIRES
    path('delete-all-comments/', views.deleteAllComments,name="delete-all-comments"),

    # HASHTAGS
    path('create-hashtag/', views.createHashtag,name="create-hashtag")
]

