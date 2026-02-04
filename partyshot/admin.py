from django.contrib import admin

from .models import Album, Photo, Subscriber


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "user")
    search_fields = ("name", "code")
    list_filter = ("user",)


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "album", "user", "created_at")
    search_fields = ("album__name", "user__username", "filename")
    list_filter = ("album", "user", "created_at")
    readonly_fields = ("created_at",)  # Prevent accidental edits to timestamps


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("id", "album", "user", "created_at")
    search_fields = ("album__name", "user__username")
    list_filter = ("album", "user", "created_at")
    readonly_fields = ("created_at",)
