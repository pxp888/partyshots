import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if not username or not password:
                return JsonResponse(
                    {"error": "Username and password are required"}, status=400
                )

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)

            user = User.objects.create_user(
                username=username, email=email, password=password
            )
            return JsonResponse({"message": "User registered successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse(
                    {
                        "message": "Login successful",
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "email": user.email,
                        },
                    },
                    status=200,
                )
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def create_album(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        try:
            data = json.loads(request.body)
            name = data.get("name")
            if not name:
                return JsonResponse({"error": "Album name is required"}, status=400)

            import uuid

            from .models import Album

            code = uuid.uuid4().hex[:8]
            album = Album.objects.create(name=name, user=request.user, code=code)

            return JsonResponse(
                {
                    "message": "Album created successfully",
                    "album": {"id": album.id, "name": album.name, "code": album.code},
                },
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_albums(request):
    if request.method == "GET":
        username = request.GET.get("username")
        if not username:
            return JsonResponse({"error": "Username is required"}, status=400)

        try:
            from .models import Album

            albums = Album.objects.filter(user__username=username).values(
                "id", "name", "code"
            )
            return JsonResponse({"albums": list(albums)}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


def get_album(request, album_code):
    """
    Return a single album identified by its unique ``code``.
    The endpoint is intentionally permissive – it does not require the
    caller to be authenticated. If you later need stricter access
    control, add a permission check or decorate the view with
    ``@login_required``.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        from .models import Album

        album = (
            Album.objects.filter(code=album_code)
            .values("id", "name", "code", "user__username")
            .first()
        )
        if not album:
            return JsonResponse({"error": "Album not found"}, status=404)
        return JsonResponse({"album": album}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def upload_photo(request):
    """
    Handle file uploads from the front‑end.

    Expected multipart form data:

    * ``file``   – the file object
    * ``description`` – optional textual description
    * ``album`` – the album *code* the photo belongs to

    Returns a JSON payload containing the created photo data.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    # Pull the data from the multipart request
    file_obj = request.FILES.get("file")
    description = request.POST.get("description", "")
    album_code = request.POST.get("album", "")

    if not file_obj:
        return JsonResponse({"error": "No file provided"}, status=400)

    if not album_code:
        return JsonResponse({"error": "Album code is required"}, status=400)

    try:
        from .models import Album, Photo

        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return JsonResponse({"error": "Album not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Error retrieving album: {str(e)}"}, status=400)

    try:
        photo = Photo.objects.create(
            file=file_obj,
            description=description,
            album=album,
            uploaded_by=request.user,
        )
        photo_data = {
            "id": photo.id,
            "description": photo.description,
            "url": request.build_absolute_uri(photo.file.url),
            "album": photo.album.code,
            "uploaded_by": photo.uploaded_by.username,
        }
        return JsonResponse({"photo": photo_data}, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Failed to save photo: {str(e)}"}, status=400)
