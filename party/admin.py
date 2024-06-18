from django.contrib import admin
from .models import Party, Photo, Tag, Subs

# Register your models here.
admin.site.register(Party)
admin.site.register(Photo)
admin.site.register(Tag)
admin.site.register(Subs)
