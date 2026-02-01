from django.db import models


class Album(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.TextField()
    name = models.TextField()
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    thumbnail = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.TextField()
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    link = models.TextField()
    tlink = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    filename = models.TextField()

    def __str__(self):
        return str(self.album.name) + " - " + str(self.id)
