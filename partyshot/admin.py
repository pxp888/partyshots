from django.contrib import admin

from .models import Album  # import the model(s) you want to expose


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "user")
    search_fields = ("name", "code")
    list_filter = ("user",)


# If you have more models, register them similarly
# from .models import AnotherModel
# admin.site.register(AnotherModel)
