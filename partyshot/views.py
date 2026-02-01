import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth import authenticate, login

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({'message': 'User registered successfully'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful', 'user': {'id': user.id, 'username': user.username, 'email': user.email}}, status=200)
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
             return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def create_album(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
             return JsonResponse({'error': 'User not authenticated'}, status=401)
        try:
            data = json.loads(request.body)
            name = data.get('name')
            if not name:
                return JsonResponse({'error': 'Album name is required'}, status=400)
            
            import uuid
            from .models import Album
            
            code = uuid.uuid4().hex[:8]
            album = Album.objects.create(name=name, user=request.user, code=code)
            
            return JsonResponse({'message': 'Album created successfully', 'album': {'id': album.id, 'name': album.name, 'code': album.code}}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def get_albums(request):
    if request.method == 'GET':
        username = request.GET.get('username')
        if not username:
             return JsonResponse({'error': 'Username is required'}, status=400)
        
        try:
            from .models import Album
            albums = Album.objects.filter(user__username=username).values('id', 'name', 'code')
            return JsonResponse({'albums': list(albums)}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
