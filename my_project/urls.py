"""
URL configuration for my_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include 
from about import views as about_views
from party import views as party_views

urlpatterns = [
    path("accounts/", include("allauth.urls")),
    path('', party_views.homepage, name='home'),
    path('create', party_views.create, name='create'),
    path('chooser', party_views.chooser, name='chooser'),
    path('viewer', party_views.viewer, name='viewer'),
    path('about', about_views.about, name='about'),
    path('admin/', admin.site.urls),
]

