from django import template
from django.template.defaultfilters import stringfilter



register = template.Library()

@register.filter 
@stringfilter
def formatUserName(value):
    value = str(value).replace('-',' ')
    return value


@register.filter
def formatDate(value):
    day = value.day
    month = value.month 
    year = value.year 
    hour = value.hour 
    minutes = value.minute

    formatted = f"{day}-{month}-{str(year).removeprefix('20')} {hour}:{minutes}"
    return formatted

@register.filter 
def isEditor(user):
    return user.groups.filter(name="Editors").exists()

@register.filter 
def canEdit(user,article):
    candEdit = isEditor(user)
    isSuper = user.is_superuser 
    isAuthor = user.id == article.author.id

    return (candEdit and isAuthor) or isSuper
