from django.urls import path,include 
from . import views 

app_name = "forum"
urlpatterns = [
    path('subjects/', views.list_subjects,name="subjects"),
    path('chat_room/',views.chat,name="chat")
]