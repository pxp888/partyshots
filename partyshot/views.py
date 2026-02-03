import io
import json
import uuid

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image

from .aws import *
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
                "id", "name", "code", "user__username", "thumbnail", "created_at"
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
        album = (
            Album.objects.filter(code=album_code)
            .values("id", "name", "code", "user__username", "created_at")
            .first()
        )
        if not album:
            return JsonResponse({"error": "Album not found"}, status=404)

        # Attach the photos that belong to this album
        photos_qs = Photo.objects.filter(album__code=album_code).values(
            "id", "filename", "link", "tlink", "user__username", "created_at"
        )
        album["photos"] = list(photos_qs)

        return JsonResponse({"album": album}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def upload_photo(request):
    """
    Accepts a multipart/form‑data POST with the keys:

        file      – the binary file to upload
        album     – the album code (8‑char string)
        username  – optional; if omitted uses request.user

    The file is uploaded to S3 *without* being stored in the database.
    A Photo record is created that only keeps the S3 key(s).
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
    s3_key = f"{album_code}/{file_id}_{uploaded_file.name}"

    try:
        file_bytes = uploaded_file.read()
    except Exception as e:
        return JsonResponse({"error": f"Could not read file: {e}"}, status=500)

    if not upload_bytes_to_s3(file_bytes, s3_key):
        return JsonResponse({"error": "S3 upload failed"}, status=500)

    thumb_key = None
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.thumbnail((200, 200))
        thumb_io = io.BytesIO()

        try:
            image.save(thumb_io, format="JPEG")
            thumb_format = "image/jpeg"
        except Exception:
            image.save(thumb_io, format="PNG")
            thumb_format = "image/png"

        thumb_io.seek(0)
        thumb_key = f"{album_code}/thumb_{file_id}_{uploaded_file.name}"
        if not upload_bytes_to_s3(thumb_io.read(), thumb_key):
            thumb_key = None
    except Exception as e:
        print(f"Thumbnail generation failed for {uploaded_file.name}: {e}")
        thumb_key = None

    photo = Photo.objects.create(
        code=file_id,
        user=uploader,
        album=album,
        link=create_presigned_url(s3_key),
        tlink=create_presigned_url(thumb_key) if thumb_key else None,
        filename=uploaded_file.name,
    )

    if thumb_key and not album.thumbnail:
        album.thumbnail = photo.tlink
        album.save(update_fields=["thumbnail"])

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
                # "s3_key": s3_key,
                "link": photo.link,
                "tlink": photo.tlink,
            },
        },
        status=200,
    )


@csrf_exempt
def searchbar_lookup(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)

    term = request.GET.get("q", "").strip()
    if not term:
        return JsonResponse({"error": "Search term required"}, status=400)

    # 1️⃣ Check for a user with this username
    if User.objects.filter(username=term).exists():
        return JsonResponse({"status": "user"}, status=200)

    # 2️⃣ If no user, check for an album with this code
    if Album.objects.filter(code=term).exists():
        return JsonResponse({"status": "album"}, status=200)

    # 3️⃣ Neither matched
    return JsonResponse({"status": "not found"}, status=200)
