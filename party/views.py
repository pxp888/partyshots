from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Party, Photo, Tag, Subs

import random
import string

funcs = {}

# Create your views here.
def homepage(request):
    context = {}
    return render(request, 'party/home.html', context)


def view(request):
    print(request)
    context = {}
    return render(request, 'party/view.html', context)


def data(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {'Key Error': True,}
            return JsonResponse(response)
    return JsonResponse({'Error': 'No POST data sent.'})


def test(request):
    response = {'action': 'test'}
    return JsonResponse(response)


def makeName():
    while True:
        name = ''.join(random.choices(string.ascii_uppercase + string.digits, k=23))
        if not Party.objects.filter(name=name).exists():
            break
    return name


def generateName(request):
    name = makeName()
    response = {
        'action': 'generateName',
        'name': name,
        }
    return JsonResponse(response)


def createEvent(request):
    user = request.user
    name = request.POST.get('name')
    description = request.POST.get('description')

    if name=='': name = makeName()

    if Party.objects.filter(name=name).exists():
        response = {
            'action': 'createEvent',
            'error': 1,
            }
        return JsonResponse(response)

    party = Party.objects.create(name=name, description=description, user=user)
    sub = Subs.objects.create(party=party, user=user)
    response = {
        'action': 'createEvent',
        'error': 0,
        'party': party.id,
        'name': party.name,
        }
    return JsonResponse(response)


def getEvents(request):
    user = request.user
    parties = Subs.objects.filter(user=user)
    events = []
    for thing in parties:
        events.append(thing.party.name)
    response = {
        'action': 'getEvents',
        'events': events,
        }
    return JsonResponse(response)


def getEvent(request):
    user = request.user
    name = request.POST.get('name')
    party = get_object_or_404(Party, name=name)
    response = {
        'action': 'getEvent',
        'name': party.name,
        'description': party.description,
        'owner': party.user.username,
        'created': party.created_at,
    }
    return JsonResponse(response)


funcs['test'] = test
funcs['generateName'] = generateName
funcs['createEvent'] = createEvent
funcs['getEvents'] = getEvents
funcs['getEvent'] = getEvent
