from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from . import views

urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("searchbar_lookup/", views.searchbar_lookup, name="searchbar_lookup"),
    path("photos/upload/", views.upload_photo, name="upload_photo"),
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
    path("album/setedit/", views.set_editable, name="set_editable"),
    path("mergeAlbums/", views.mergeAlbums, name="mergeAlbums"),
    path("account/update/", views.update_account, name="updateAccount"),
    path("account/delete/", views.delete_account, name="deleteAccount"),
]
