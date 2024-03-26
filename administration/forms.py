from django import forms
from post.models import BlogUser,Category,WhatPeopleSay,Hashtags,Article

class ModelAdminForm(forms.ModelForm):
    pass
class BlogUserForm(forms.ModelForm):
    class Meta:
        model = BlogUser 
        # fields = ['username','email','password']
        fields = ['username','email','password','keepChecked','joinNewsletter']


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"

class WhatPeopleSayForm(forms.ModelForm):
    class Meta:
        model = WhatPeopleSay
        fields = "__all__"

class HashtagsForm(forms.ModelForm):
    class Meta:
        model = Hashtags
        fields = "__all__"

class ArticleForm(forms.ModelForm):
    class Meta:
        model=Article 
        fields = [
            'content',
            'image'
        ]

class UpdateArticleForm(forms.ModelForm):
    class Meta:
        model = Article 
        fields = [
            'content',
            'title',
            'sumItUp',
            'image',
            'imageAlt',
            'imageAuthor',
            'hashtags',
            'category'
        ]