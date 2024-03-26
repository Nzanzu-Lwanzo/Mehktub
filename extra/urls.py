from django.urls import path,include
from . import views 

app_name = "extra"
urlpatterns = [
    path('homepage/', views.homepage, name="homepage"),
    path('error-404/', views.error_404,name="error-404"),
    path('access-denied/', views.accessDenied, name="access-denied"),
]