from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('extra.urls')),
    path('froala_editor/',include('froala_editor.urls')),
    path('post/',include('post.urls')),
    path('management/',include('django.contrib.auth.urls')),
    path('management/',include('management.urls')),
    path('forum/',include('forum.urls')),
    path('site-administration/',include('administration.urls'))
] + static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)