from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Album, Photo, Tag, Subs

import boto3
from botocore.exceptions import ClientError

import random
import string

funcs = {}

def homepage(request):
    context = {}
    return render(request, 'shots/home.html', context)


def data(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {'Key Error': True,}
            return JsonResponse(response)
    return JsonResponse({'Error': 'No POST data sent.'})


def createAlbum(request):
    user = request.user
    name = request.POST.get('name')
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))
        if Album.objects.filter(code=code).count() == 0:
            break
    
    n = Album.objects.filter(name=name, user=user).count()
    if n > 0:
        response = {'Error': 'Album already exists.', 'ecode': 1 }
        return JsonResponse(response)

    album = Album.objects.create(name=name, code=code, user=user)
    album.save()
    response = {'code': album.code, 'ecode': 0}
    return JsonResponse(response)


def getAlbums(request):
    user = request.user

    bums = {}
    albums = Album.objects.filter(user=user)
    for album in albums:
        bums[album.code] = True
    subs = Subs.objects.filter(user=user)
    for sub in subs:
        bums[sub.album.code] = True
    response = {
        'albums': list(bums.keys()),
    }
    return JsonResponse(response)


def getAlbum(request):
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    response = {
        'name': album.name,
        'code': album.code,
        'user': album.user.username,
        'created_at': album.created_at,
    }
    return JsonResponse(response)


def getPhotos(request):
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    photos = Photo.objects.filter(album=album)
    pics = []
    for photo in photos:
        pics.append(photo.id)
    response = {
        'photos': pics,
    }
    return JsonResponse(response)


def getPhoto(request):
    user = request.user
    id = request.POST.get('id')
    photo = get_object_or_404(Photo, id=id)
    response = {
        'id': photo.id,
        'album': photo.album.code,
        'user': photo.user.username,
        'link': photo.link,
        'created_at': photo.created_at,
    }
    return JsonResponse(response)


def addPhoto(request):
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    filename = request.POST.get('filename')
    blob = request.POST.get('blob')

    link = ''
    
    photo = Photo.objects.create(user=user, album=album, link=link, filename=filename)
    photo.save()

    print('added:' ,filename)
    
    response = {
        'photoid': photo.id,
        'ecode': 0,
    }
    return JsonResponse(response)


funcs['createAlbum'] = createAlbum
funcs['getAlbum'] = getAlbum
funcs['getAlbums'] = getAlbums
funcs['getPhotos'] = getPhotos
funcs['getPhoto'] = getPhoto
funcs['addPhoto'] = addPhoto


