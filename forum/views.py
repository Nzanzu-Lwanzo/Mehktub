from django.shortcuts import render


def list_subjects(request):
    return render(request,'forum/list_subjects.html')

def chat(request):
    return render(request,'forum/chat_room.html')