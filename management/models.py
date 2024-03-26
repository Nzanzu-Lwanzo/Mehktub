from django.db import models
import django.utils.timezone as dut


class Message(models.Model):
    # L'expéditeur
    sender = models.CharField(max_length=64,null=False,blank=False)
    # Le message
    content = models.TextField()
    # L'e-mail
    email = models.EmailField(null=False,blank=False)
    # Le numéro de téléphone
    phone = models.CharField(max_length=16,null=False,blank=False)
    # Le motif
    motive = models.CharField(max_length=64,null=False,blank=False)
    # Date d'envoie
    sendDate = models.DateTimeField(editable=False,auto_now_add=True)
    # Si le message a déjà été lu
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message de {self.sender} pour motif : {self.motive}"
    
    class Meta:
        verbose_name="message"
        verbose_name_plural="Messages"
        db_table="messages_to_me"

