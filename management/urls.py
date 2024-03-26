from django.urls import path,include
from . import views 

app_name = "management"
urlpatterns = [
    path('form/', views.serve_form, name="form"),
    path('logUserIn/', views.logUserIn, name="logUserIn"),
    path('logUserOut/', views.logUserOut, name="logUserOut"),
    path('signUserUp/', views.signUserUp, name="signUserUp"),
    path('unactiveAccount/', views.unactiveAccount, name="unactiveAccount"),
    path('delete-article/<slug:article_slug>/<int:article_id>/', views.delete_article, name="delete-article"),
    path('contact-developper/',views.contactMe,name="contact-me"),
    path('modify-user-data/', views.modifyUserData,name="modify-user-data"),
    path('user-update-username/', views.updateUsername,name="update-username"),
    path('user-update-email/', views.updateUserEmail,name="update-user-email"),
    path('user-update-password/', views.updateUserPassword,name="update-user-password"),
]