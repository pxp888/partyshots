from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("photos/upload/", views.upload_photo, name="upload_photo"),
    path("searchbar_lookup/", views.searchbar_lookup, name="searchbar_lookup"),
    path("photos/delete/", views.delete_photos, name="delete_photos"),
    path("albums/create/", views.create_album, name="create_album"),
    path("albums/list/", views.get_albums, name="list_albums"),
    path("albums/<str:album_code>/", views.get_album, name="album_detail"),
    path("albums/<str:album_code>/delete/", views.delete_album, name="delete_album"),
    path(
        "albums/<str:album_code>/subscribe/",
        views.subscribe_album,
        name="subscribe_album",
    ),
    path(
        "albums/<str:album_code>/unsubscribe/",
        views.unsubscribe_album,
        name="unsubscribe_album",
    ),
]
