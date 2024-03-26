from django.shortcuts import redirect
from django.contrib.messages import success,error

def isSuperUser(function):
    def wrapper(request,*args,**kwargs):
        if request.user.is_superuser:
            return function(request,*args,**kwargs) 
        else:
            error(request,"Seuls les administrateurs ont l'accréditation pour voir cette page ou effectuer cette action ! Vérifiez vos crédentials !")
            return redirect('extra:access-denied')
    return wrapper 

def isLoggedIn(function):
    def wrapper(request,*args,**kwargs):
        if request.user.is_authenticated:
            return function(request,*args,**kwargs)
        else:
            error(request,"Vérifiez que vous êtes abonné(e) et connecté(e) !")
            return redirect('extra:access-denied')
    return wrapper 

