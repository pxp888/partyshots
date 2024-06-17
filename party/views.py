from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Party, Photo, Tag

import random
import string

funcs = {}

# Create your views here.
def homepage(request):
    context = {}
    return render(request, 'party/home.html', context)


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
    response = {'test': 'test'}
    return JsonResponse(response)

funcs['test'] = test
