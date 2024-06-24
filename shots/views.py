from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, FileResponse
from django.contrib.auth.models import User
from .models import Album, Photo, Tag, Subs

import boto3
from botocore.exceptions import ClientError

from PIL import Image
import base64 
import random
import string
import io 
import pickle

funcs = {}

incoming = {}


def homepage(request):
    context = {}
    return render(request, 'shots/home.html', context)


def data(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {'Key Error': action,}
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


def getThumb(request):
    photoid = request.POST.get('photoid')
    photo = get_object_or_404(Photo, id=photoid)
    user = photo.user.username
    created = photo.created_at

    msg = {
        'ecode': 0,
        'photoid': photoid,
        'link': 'http://localhost:8001/thumbs/' + str(photoid) + '.jpg',
        'user': user,
        'created': created,
    }
    return JsonResponse(msg)


def makeThumbnail(data):
    try:
        mt, encoded = data.split(',', 1)
        decoded = base64.b64decode(encoded)
        
        image_bytes_io = io.BytesIO(decoded)
        image = Image.open(image_bytes_io)
        thumbnail = image.resize((300, 300))

        return thumbnail
    except Exception as e:
        print(e)
        return None


def processPhoto(target, meta):
    data = ''.join(target)
    
    user = User.objects.get(username=meta['user'])
    album = Album.objects.get(code=meta['album'])

    photo = Photo.objects.create(user=user, album=album, filename=meta['filename'])
    photo.save()

    thumb = makeThumbnail(data)
    if thumb:
        path='imagestore/thumbs/' + str(photo.id) + '.jpg'
        thumb.save(path)

    path='imagestore/original/' + str(photo.id)
    with open(path, 'wb') as f:
        pickle.dump((meta, data), f)    
    return photo.id


def addPhoto(request):
    user = request.user.username
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    chunk = int(request.POST.get('chunk'))
    chunks = int(request.POST.get('chunks'))
    filename = request.POST.get('filename')
    data = request.POST.get('data')
    hash = request.POST.get('hash')

    if hash not in incoming:
        target = [None] * chunks
        meta = {
            'hash': hash,
            'filename': filename,
            'chunks': chunks,
            'album': album.code,
            'user': user,
            'count': 0,
            }
        incoming[hash] = [target, meta]
    else:
        target, meta = incoming[hash]

    target[chunk] = data
    meta['count'] += 1
    if meta['count'] == chunks:
        photoid = processPhoto(target, meta)
        del incoming[hash]
        response = {
            'ecode': 1,
            'photoid': photoid,
        }
        return JsonResponse(response)

    response = {
        'ecode': 0,
    }
    return JsonResponse(response)


def getThumbs(request):
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    photos = Photo.objects.filter(album=album)
    thumbs = []
    for photo in photos:
        thumbs.append(photo.id)
    response = {
        'thumbs': thumbs,
    }
    return JsonResponse(response)


funcs['createAlbum'] = createAlbum
funcs['getAlbum'] = getAlbum
funcs['getAlbums'] = getAlbums
funcs['addPhoto'] = addPhoto
funcs['getThumb'] = getThumb
funcs['getThumbs'] = getThumbs
