from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('albums/create/', views.create_album, name='create_album'),
    path('albums/list/', views.get_albums, name='list_albums'),
]
