import io
import json
import uuid
from ast import Sub

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from .aws import *
from .models import Album, Photo, Subscriber
from .serializers import RegisterSerializer, UserSerializer


def rm_photo_s3(photo):
    """
    Delete the S3 objects associated with ``photo`` only if no other
    ``Photo`` records reference the same ``s3_key`` or ``thumb_key``.
    """
    # Delete the main image only if it is unique
    if photo.s3_key:
        if not Photo.objects.filter(s3_key=photo.s3_key).exclude(id=photo.id).exists():
            delete_file_from_s3(photo.s3_key)
            print(f"Deleted S3 object: {photo.s3_key}")

    # Delete the thumbnail only if it is unique
    if photo.thumb_key:
        if (
            not Photo.objects.filter(thumb_key=photo.thumb_key)
            .exclude(id=photo.id)
            .exists()
        ):
            delete_file_from_s3(photo.thumb_key)
            print(f"Deleted S3 object: {photo.thumb_key}")

    return True


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "User registered successfully",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticate user and return JWT tokens."""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_album(request):
    """Create a new album (requires JWT authentication)."""
    name = request.data.get("name")
    if not name:
        return Response(
            {"error": "Album name is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    code = uuid.uuid4().hex[:8]
    album = Album.objects.create(name=name, user=request.user, code=code)

    return Response(
        {
            "message": "Album created successfully",
            "album": {"id": album.id, "name": album.name, "code": album.code},
        },
        status=status.HTTP_201_CREATED,
    )


@csrf_exempt
def get_albums(request):
    if request.method == "GET":
        username = request.GET.get("username")
        if not username:
            return JsonResponse({"error": "Username is required"}, status=400)

        try:
            # Include albums owned by the user or those the user is subscribed to
            albums_qs = (
                Album.objects.filter(
                    Q(user__username=username) | Q(subscriber__user__username=username)
                )
                .distinct()
                .values(
                    "id", "name", "code", "user__username", "thumbnail", "created_at"
                )
            )
            albums = list(albums_qs)
            # Convert any album thumbnails to presigned URLs before returning
            for album in albums:
                if album.get("thumbnail"):
                    album["thumbnail"] = create_presigned_url(album["thumbnail"])
            return JsonResponse({"albums": albums}, status=200)
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
            .values("id", "name", "code", "user__username", "created_at", "editable")
            .first()
        )
        if not album:
            return JsonResponse({"error": "Album not found"}, status=404)

        # check if user is subscribed to the album
        if request.user.is_authenticated:
            is_subscribed = Subscriber.objects.filter(
                album__code=album_code, user=request.user
            ).exists()
            album["is_subscribed"] = is_subscribed
        else:
            album["is_subscribed"] = False

        # Attach the photos that belong to this album
        photos_qs = Photo.objects.filter(album__code=album_code).values(
            "id", "filename", "s3_key", "thumb_key", "user__username", "created_at"
        )

        photos = []
        for p in photos_qs:
            # Generate presigned URLs for client consumption
            p["link"] = create_presigned_url(p["s3_key"])
            p["tlink"] = (
                create_presigned_url(p["thumb_key"]) if p["thumb_key"] else None
            )
            photos.append(p)
        album["photos"] = photos

        # Convert album thumbnail (currently a key) to a presigned URL
        if album.get("thumbnail"):
            album["thumbnail"] = create_presigned_url(album["thumbnail"])

        return JsonResponse({"album": album}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_photo(request):
    """
    Accepts a multipart/form‑data POST with the keys:

        file      – the binary file to upload
        album     – the album code (8‑char string)
        username  – optional; if omitted uses request.user

    The file is uploaded to S3 *without* being stored in the database.
    A Photo record is created that only keeps the S3 key(s).
    """
    print("upload_photo called")

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

    if not album.editable:
        return JsonResponse({"error": "Album is not editable"}, status=403)

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    file_id = uuid.uuid4().hex
    s3_key = f"{album_code}/{file_id}"

    try:
        file_bytes = uploaded_file.read()
    except Exception as e:
        return JsonResponse({"error": f"Could not read file: {e}"}, status=500)

    if not upload_bytes_to_s3(file_bytes, s3_key):
        return JsonResponse({"error": "S3 upload failed"}, status=500)

    thumb_key = None
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.thumbnail((300, 300))
        thumb_io = io.BytesIO()

        try:
            image.save(thumb_io, format="JPEG")
            thumb_format = "image/jpeg"
        except Exception:
            image.save(thumb_io, format="PNG")
            thumb_format = "image/png"

        thumb_io.seek(0)
        thumb_key = f"{album_code}/thumb_{file_id}"
        if not upload_bytes_to_s3(thumb_io.read(), thumb_key):
            thumb_key = None
    except Exception as e:
        print(f"Thumbnail generation failed for {uploaded_file.name}: {e}")
        thumb_key = None

    # Store the raw S3 keys in the DB; the presigned URLs will be generated
    # when the client requests them.
    photo = Photo.objects.create(
        code=file_id,
        user=uploader,
        album=album,
        s3_key=s3_key,
        thumb_key=thumb_key,
        filename=uploaded_file.name,
    )

    if thumb_key and not album.thumbnail:
        album.thumbnail = photo.thumb_key
        album.save(update_fields=["thumbnail"])

    # Create presigned URLs for the response (client‑side use only).
    link_url = create_presigned_url(s3_key) if s3_key else None
    tlink_url = create_presigned_url(thumb_key) if thumb_key else None

    return JsonResponse(
        {
            "status": "ok",
            "photo": {
                "id": photo.id,
                "filename": uploaded_file.name,
                "s3_key": s3_key,
                "thumb_key": thumb_key,
                "user__username": uploader.username,
                "created_at": photo.created_at,
                "link": link_url,
                "tlink": tlink_url,
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


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_album(request, album_code):
    """
    Delete an album identified by its unique ``code``.
    The caller must be authenticated **and** be the owner of the album.
    """
    try:
        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    if album.user != request.user:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    # Delete all photos' S3 objects via the helper
    photos = Photo.objects.filter(album=album)
    for photo in photos:
        rm_photo_s3(photo)

    # Finally delete the album record (cascades to Photo rows)
    album.delete()

    return Response({"message": "Album deleted"}, status=status.HTTP_200_OK)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def delete_photos(request):
    """
    Delete multiple photos identified by their database ids.

    The caller must be authenticated and may delete any photo that is
    either owned by themselves **or** owned by the album's owner.
    Photos that do not satisfy either condition are skipped – the request
    still succeeds for the others.
    """
    ids = request.data.get("ids", [])
    if not isinstance(ids, list) or not ids:
        return Response(
            {"error": "ids list required"}, status=status.HTTP_400_BAD_REQUEST
        )

    deleted_ids = []
    for photo_id in ids:
        try:
            photo = Photo.objects.get(id=photo_id)
        except Photo.DoesNotExist:
            continue

        # Allow deletion if the requester owns the photo OR owns the album
        if photo.user != request.user and photo.album.user != request.user:
            continue

        if photo.album.editable is False:
            continue

        # Use the helper to delete any orphaned S3 objects
        rm_photo_s3(photo)

        photo_id = photo.id
        photo.delete()
        deleted_ids.append(photo_id)

    return Response(
        {"message": "Deleted", "deleted_ids": deleted_ids}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def subscribe_album(request, album_code):
    """
    Allow an authenticated user to subscribe to an album identified by its
    unique ``code``. A subscription is represented by a ``Subscriber`` record
    linking the user to the album. The endpoint is idempotent – if the user
    is already subscribed, the request simply returns a success response.
    """
    try:
        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    if album.user == request.user:
        return Response(
            {"error": "You cannot subscribe to your own album"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Prevent duplicate subscriptions
    if Subscriber.objects.filter(album=album, user=request.user).exists():
        return Response({"message": "Already subscribed"}, status=status.HTTP_200_OK)

    Subscriber.objects.create(album=album, user=request.user)
    return Response(
        {"message": "Subscribed successfully"}, status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unsubscribe_album(request, album_code):
    """
    Allow an authenticated user to unsubscribe from an album identified by its
    unique ``code``. The subscription is represented by a ``Subscriber`` record
    linking the user to the album. If the user is not currently subscribed, a
    404 error is returned. This endpoint is idempotent – calling it twice will
    result in the same final state.
    """
    try:
        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        subscription = Subscriber.objects.get(album=album, user=request.user)
    except Subscriber.DoesNotExist:
        return Response(
            {"error": "You are not subscribed to this album"},
            status=status.HTTP_404_NOT_FOUND,
        )

    subscription.delete()
    return Response({"message": "Unsubscribed successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mergeAlbums(request):
    """
    Merge photos from a *source* album into a *destination* album by **creating
    new `Photo` rows**.  The original photos remain untouched.

    The request body must contain:
        source:     the album code of the album whose photos are to be copied.
        destination: the album code of the album that will receive the copies.

    The authenticated user becomes the owner of the new photo records.

    Returns a list of the new photo IDs that were created.
    """
    print("------------------")
    print(request.data)

    source_code = request.data.get("source")
    dest_code = request.data.get("destination")

    if not source_code or not dest_code:
        return Response(
            {"error": "Both 'source' and 'destination' album codes are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if source_code == dest_code:
        return Response(
            {"error": "Source and destination albums must be different"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        source_album = Album.objects.get(code=source_code)
    except Album.DoesNotExist:
        return Response(
            {"error": "Source album not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        dest_album = Album.objects.get(code=dest_code)
    except Album.DoesNotExist:
        return Response(
            {"error": "Destination album not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if dest_album.editable is False:
        return Response(
            {"error": "Destination album is not editable"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Pull the columns we need to duplicate.
    source_photos = Photo.objects.filter(album=source_album).values(
        "s3_key", "thumb_key", "filename"
    )

    new_photo_ids = []
    for sp in source_photos:
        # Generate a fresh, unique code for the new photo.
        new_code = uuid.uuid4().hex[:8]
        new_photo = Photo.objects.create(
            code=new_code,
            user=request.user,
            album=dest_album,
            s3_key=sp["s3_key"],
            thumb_key=sp["thumb_key"],
            filename=sp["filename"],
        )
        new_photo_ids.append(new_photo.id)

    return Response(
        {
            "message": f"Created {len(new_photo_ids)} duplicate photo(s) in album {dest_album.code}",
            "new_photo_ids": new_photo_ids,
            "destination_album_code": dest_album.code,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_editable(request):
    """
    Set the 'editable' flag on an album, which controls whether photos can
    be added or removed. Only the album owner can change this setting.

    Request body must contain:
        album_code: the unique code of the album to update
        editable:   boolean value to set (true or false)
    """
    album_code = request.data.get("album_code")
    editable = request.data.get("editable")

    if album_code is None or editable is None:
        return Response(
            {"error": "Both 'album_code' and 'editable' are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not isinstance(editable, bool):
        return Response(
            {"error": "'editable' must be a boolean value"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        album = Album.objects.get(code=album_code)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    if album.user != request.user:
        return Response(
            {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
        )

    album.editable = editable
    album.save(update_fields=["editable"])

    return Response(
        {
            "message": f"Album '{album.name}' editable set to {album.editable}",
            "album_code": album.code,
            "editable": album.editable,
        },
        status=status.HTTP_200_OK,
    )
