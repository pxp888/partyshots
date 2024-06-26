from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import Album, Photo, Tag, Subs

import boto3
from botocore.exceptions import ClientError

from PIL import Image
import base64 
import random
import string
import io 
import os 
import threading


'''AWS S3 functions'''

if os.path.exists('env.py'):
    import env 


def upload_bytes_to_s3(bytes_data, object_name):
    bucket_name = 'pxp-imagestore'
    s3_client = boto3.client('s3')
    try:
        response = s3_client.put_object(Body=bytes_data, Bucket=bucket_name, Key=object_name)
    except ClientError as e:
        print(e)
        return False
    return True


def upload_file_to_s3(file_name, object_name):
    bucket_name = 'pxp-imagestore'
    s3_client = boto3.client('s3', region_name='eu-north-1')
    try:
        response = s3_client.upload_file(file_name, bucket_name, object_name)
    except ClientError as e:
        print(e)
        return False
    return True


def create_presigned_url(object_name, expiration=604800):
    bucket_name = 'pxp-imagestore'
    s3_client = boto3.client('s3', region_name='eu-north-1')
    try:
        response = s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': object_name}, ExpiresIn=expiration)
    except ClientError as e:
        print(e)
        return None
    except:
        return None

    return response


def cleanup():
    '''This function cleans up the S3 bucket by deleting any files that are not in the database.'''
    bucket_name = 'pxp-imagestore'

    s3_client = boto3.client('s3')
    response = s3_client.list_objects_v2(Bucket=bucket_name)

    current = {}
    phots = Photo.objects.all()
    for phot in phots:
        current[phot.link] = True
        current[phot.tlink] = True

    for content in response.get('Contents', []):
        if content['Key'] not in current:
            print('Deleting: ', content['Key'])
            s3_client.delete_object(Bucket=bucket_name, Key=content['Key'])

    print('----------------------\n S3 Cleanup done. \n----------------------')


funcs = {}
incoming = {}


'''The following functions handle page views'''
def albums(request):
    context = {}
    if not request.user.is_authenticated:
        return render(request, 'shots/landing.html', context)
    return render(request, 'shots/albums.html', context)


def browse(request, slug):
    context = {}
    return render(request, 'shots/browse.html', context)


def searchPage(request, slug):
    context = {}
    return render(request, 'shots/search.html', context)


# def homepage(request):
#     context = {}
#     return render(request, 'shots/home.html', context)


def data(request):
    '''This function handles ajax requests and calls functions defined in the funcs dictionary'''
    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {'Key Error': action,}
            return JsonResponse(response)
    return JsonResponse({'Error': 'No POST data sent.'})


def createAlbum(request):
    '''This function creates a new album for the user. It generates a unique code for the album and returns it to the user.'''
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
    '''This function returns a list of albums that the user has created or subscribed to.'''
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
    '''This function returns information about an album. It returns the name, code, user, creation date, and thumbnail of the album.'''
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    
    response = {
        'name': album.name,
        'code': album.code,
        'user': album.user.username,
        'created_at': album.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'timestamp': album.created_at.timestamp(),
    }

    tnail = create_presigned_url(album.thumbnail)
    
    if (tnail):
        response['thumbnail'] = tnail
    return JsonResponse(response)


def getThumb(request):
    '''This function returns information about a thumbnail. It returns the photoid, user, creation date, and description of the photo. It also returns a link to the thumbnail.'''
    photoid = request.POST.get('photoid')
    photo = get_object_or_404(Photo, id=photoid)
    user = photo.user.username
    # created = photo.created_at
    created = photo.created_at.strftime('%Y-%m-%d %H:%M:%S')

    tag = Tag.objects.filter(photo=photo, key='description')
    if tag.count() > 0:
        description = tag.last().value 
    else:
        description = ''

    msg = {
        'ecode': 0,
        'photoid': photoid,
        'user': user,
        'created': created,
        'description': description,
    }

    if (photo.tlink):
        msg['link'] = create_presigned_url(photo.tlink)

    return JsonResponse(msg)


def getPhoto(request):
    '''This function returns information about a photo. It returns the photoid, user, creation date, and filename of the photo. It also returns a link to the original photo.'''
    photoid = request.POST.get('photoid')
    photo = get_object_or_404(Photo, id=photoid)
    user = photo.user.username
    created = photo.created_at
    filename = photo.filename

    msg = {
        'ecode': 0,
        'photoid': photoid,
        'link': create_presigned_url(photo.link),
        'user': user,
        'created': created,
        'filename': filename,
    }
    return JsonResponse(msg)


def processPhoto(target, meta):
    '''This function processes the photo data and saves it to the database. It creates a thumbnail and saves the original photo. It returns the photoid of the photo.'''
    data = ''.join(target)
    
    user = User.objects.get(username=meta['user'])
    album = Album.objects.get(code=meta['album'])
    filename = meta['filename']
    photo = Photo.objects.create(user=user, album=album, filename=filename)
    photo.save()

    mt, encoded = data.split(',', 1)
    decoded = base64.b64decode(encoded)

    # create thumbnail
    try:
        image_bytes_io = io.BytesIO(decoded)
        image = Image.open(image_bytes_io)
        thumb = image.resize((300, 300))

        path='imagestore/thumbs/' + str(photo.id) + '.jpg'
        thumb.save(path)

        tlink = 'tn-' + str(photo.id)
        if (upload_file_to_s3(path, tlink)):
            os.remove(path)

        photo.tlink = tlink
        photo.save()

        if album.thumbnail is None:
            album.thumbnail = tlink
            album.save()

    except Exception as e:
        print('thumbnail error: ', e)
        photo.tlink = None
        photo.save()

    # save original
    path='imagestore/original/' + str(photo.id) + '/'
    if not os.path.exists(path):
        os.makedirs(path)
    path += filename
    with open(path, 'wb') as f:
        f.write(decoded)

    link = 'of-' + str(photo.id)
    if(upload_file_to_s3(path, link)):
        os.remove(path)

    photo.link = link
    photo.save()
    return photo.id


def addPhoto(request):
    '''This function adds a photo to the database. It receives the photo data in chunks and processes it when all chunks have been received.'''
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
    '''This function returns a list of thumbnails for an album. It returns the photoid of each thumbnail.'''
    code = request.POST.get('code')
    album = Album.objects.get(code=code)
    if album is None:
        response = {'ecode': 1, 'Error': 'Album not found.'}
        return JsonResponse(response)
    
    photos = Photo.objects.filter(album=album)
    thumbs = []
    for photo in photos:
        thumbs.append(photo.id)
    response = {
        'ecode': 0,
        'thumbs': thumbs,
    }
    return JsonResponse(response)


def removePhoto(request):
    '''This function removes a photo from the database. It checks if the user is the owner of the photo or the album.'''
    user = request.user
    photoid = request.POST.get('photoid')
    photo = get_object_or_404(Photo, id=photoid)
    album = photo.album

    if photo.user == user:
        photo.delete()
        response = {'ecode': 0}
        return JsonResponse(response)
    
    if album.user == user:
        photo.delete()
        response = {'ecode': 0}
        return JsonResponse(response)
    
    response = {'ecode': 1, 'Error': 'This is not your photo.'}
    return JsonResponse(response)


def removeAlbum(request):
    '''This function removes an album from the database. It checks if the user is the owner of the album.'''
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)

    if album.user == user:
        album.delete()
        response = {'ecode': 0}
        return JsonResponse(response)
    
    sub = Subs.objects.filter(user=user, album=album)
    if sub.count() > 0:
        sub.delete()
        response = {'ecode': 0}
        return JsonResponse(response)


def subscribe(request):
    '''This function subscribes the user to an album. It checks if the user is the owner of the album.'''
    user = request.user
    code = request.POST.get('code')
    album = get_object_or_404(Album, code=code)
    if album.user == user:
        response = {'ecode': 1, 'Error': 'You cannot subscribe to your own album.'}
        return JsonResponse(response)
    sub = Subs.objects.create(user=user, album=album)
    sub.save()
    response = {'ecode': 0}
    return JsonResponse(response)


def addDescription(request):
    '''This function adds a description to a photo.'''
    user = request.user
    code = request.POST.get('code')
    description = request.POST.get('description')

    photo = get_object_or_404(Photo, id=code)
    if photo.user != user:
        response = {'ecode': 1, 'Error': 'You cannot add description to this photo.'}
        return JsonResponse(response)
    
    tag = Tag.objects.create(photo=photo, key='description', value=description)
    tag.save()
    
    response = {'ecode': 0}
    return JsonResponse(response)


def getUserAlbums(request):
    '''This function returns a list of albums that a user has created.'''
    username = request.POST.get('username')
    bums = []
    albums = Album.objects.filter(user__username=username)
    for album in albums:
        bums.append(album.code)
    response = {
        'albums': bums,
        'ecode': 0,
    }
    return JsonResponse(response)


def searchCode(request):
    '''This function searches for either a username or an album code.'''
    code = request.POST.get('code')
    
    try:
        user = User.objects.get(username=code)
    except User.DoesNotExist:
        user = None
    if not user is None:
        response = {'ecode': 0, 'type': 'user' }
        return JsonResponse(response)
    
    try:
        album = Album.objects.get(code=code)
    except Album.DoesNotExist:
        album = None
    if not album is None:
        response = {'ecode': 0, 'type': 'album' }
        return JsonResponse(response)
        
    response = {'ecode': 1, 'Error': 'Code not found.'}
    print(response)
    return JsonResponse(response)


def getAlbumLinks(request):
    '''This function returns a list of full links for an album.'''
    code = request.POST.get('code')
    album = Album.objects.get(code=code)
    if album is None:
        response = {'ecode': 1, 'Error': 'Album not found.'}
        return JsonResponse(response)
    
    links = []
    names = []
    photos = Photo.objects.filter(album=album)
    for photo in photos:
        links.append(create_presigned_url(photo.link))
        names.append(photo.filename)
    response = {
        'ecode': 0,
        'links': links,
        'names': names,
    }
    return JsonResponse(response)


'''These are defined ajax functions that are called from the frontend. They are stored in the funcs dictionary.'''
funcs['createAlbum'] = createAlbum
funcs['getAlbums'] = getAlbums
funcs['getAlbum'] = getAlbum
funcs['addPhoto'] = addPhoto
funcs['getThumbs'] = getThumbs
funcs['getThumb'] = getThumb
funcs['getPhoto'] = getPhoto
funcs['removePhoto'] = removePhoto
funcs['removeAlbum'] = removeAlbum
funcs['subscribe'] = subscribe
funcs['addDescription'] = addDescription
funcs['getUserAlbums'] = getUserAlbums
funcs['searchCode'] = searchCode
funcs['getAlbumLinks'] = getAlbumLinks


# create storage paths, 
path='imagestore/original/'
if not os.path.exists(path):
    os.makedirs(path)
path='imagestore/thumbs/'
if not os.path.exists(path):
    os.makedirs(path)


# cleanup()



