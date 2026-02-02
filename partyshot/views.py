import json
import uuid

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Album, Photo


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
            albums = Album.objects.filter(user__username=username).values(
                "id", "name", "code"
            )
            return JsonResponse({"albums": list(albums)}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
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
        from .models import Album, Photo

        # Basic album data
        album = (
            Album.objects.filter(code=album_code)
            .values("id", "name", "code", "user__username")
            .first()
        )
        if not album:
            return JsonResponse({"error": "Album not found"}, status=404)

        # Attach the photos that belong to this album
        photos_qs = Photo.objects.filter(album__code=album_code).values(
            "id", "filename", "link", "tlink", "user__username"
        )
        album["photos"] = list(photos_qs)

        return JsonResponse({"album": album}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def upload_photo(request):
    """
    Handles photo uploads.
    • Any user (authenticated or specified by username in POST) can upload to any album.
    • The uploader is resolved via a database lookup and stored in the Photo record.
    • Returns a JSON payload that the front‑end can consume via `data.photo`.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    uploader_username = request.POST.get("username") or (
        request.user.username if request.user.is_authenticated else None
    )
    if not uploader_username:
        return JsonResponse({"error": "Username required"}, status=400)

    try:
        uploader = User.objects.get(username=uploader_username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    album_code = request.POST.get("album")
    if not album_code:
        return JsonResponse({"error": "Album code is required"}, status=400)

    try:
        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return JsonResponse({"error": "Album not found"}, status=404)

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    file_id = uuid.uuid4().hex

    photo = Photo.objects.create(
        code=file_id,
        user=uploader,
        album=album,
        link="None",
        tlink=None,
        filename=uploaded_file.name,
    )

    # print(f"Upload received:")
    # print(f"  Username    : {uploader_username}")
    # print(f"  Album code  : {album_code}")
    # print(f"  File name   : {uploaded_file.name}")
    # print(f"  File size   : {uploaded_file.size} bytes")
    # print(f"  File ID     : {file_id}")

    return JsonResponse(
        {
            "status": "ok",
            "photo": {
                "id": photo.id,
                "file_id": file_id,
                "file_name": uploaded_file.name,
                "file_size": uploaded_file.size,
                "username": uploader.username,
                "album_code": album_code,
            },
        },
        status=200,
    )
