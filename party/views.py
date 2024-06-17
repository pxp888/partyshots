from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Party, Photo, Tag

import random
import string

funcs = {}

# Create your views here.
def homepage(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {'Key Error': True,}
            return JsonResponse(response)

    context = {}
    return render(request, 'party/home.html', context)


def create(request):
    context = {}
    return render(request, 'party/create.html', context)


def chooser(request):
    context = {}
    return render(request, 'party/chooser.html', context)


def viewer(request):
    context = {}
    return render(request, 'party/viewer.html', context)




def generateName(request):
    length = 45
    letters = string.ascii_letters 
    result_str = ''.join(random.choice(letters) for _ in range(length))
    
    while True:
        if not Party.objects.filter(name=result_str).exists():
            break
        result_str = ''.join(random.choice(letters) for _ in range(length))

    response = {'name': result_str}
    return JsonResponse(response)


def checkName(request):
    name = request.POST.get('name')
    if Party.objects.filter(name=name).exists():
        response = {'exists': True, 'name': name}
    else:
        response = {'exists': False, 'name': name}
    return JsonResponse(response)


def createParty(request):
    name = request.POST.get('name')

    if Party.objects.filter(name=name).exists():
        response = {
        'action': 'createParty',
        'name': name,
        'success': False,
        }
        return JsonResponse(response)

    party = Party(name=name)
    party.save()
    response = {
        'action': 'createParty',
        'name': name,
        'success': True,
        }
    return JsonResponse(response)


def findParty(request):
    name = request.POST.get('name')
    if Party.objects.filter(name=name).exists():
        response = {'action':'findParty', 
                    'exists': True, 
                    'name': name,
                    }
    else:
        response = {'action':'findParty', 
                    'exists': False, 
                    'name': name,
                    }
    return JsonResponse(response)


def getParty(request):
    name = request.POST.get('name')
    party = Party.objects.get(name=name)
    photos = Photo.objects.filter(party=party)

    
    response = {
        'action': 'getParty',
        'name': name,
    }
    return JsonResponse(response)


funcs['generateName'] = generateName
funcs['checkName'] = checkName
funcs['createParty'] = createParty
funcs['findParty'] = findParty
funcs['getParty'] = getParty




