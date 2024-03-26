from django.contrib import admin
from  post.models import BlogUser,Category,Hashtags,Article,Comment,WhatPeopleSay
from .models import Message

# Register your models here.
admin.site.register(BlogUser)
admin.site.register(Category)
admin.site.register(Hashtags)
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    pass
admin.site.register(Comment)
admin.site.register(WhatPeopleSay)
admin.site.register(Message)


