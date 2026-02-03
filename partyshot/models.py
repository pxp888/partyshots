from django.db import models


class Album(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.TextField()
    name = models.TextField()
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    thumbnail = models.TextField(null=True, blank=True)
    editable = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.TextField()
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    s3_key = models.CharField(max_length=512, null=True, blank=True)
    thumb_key = models.CharField(max_length=512, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    filename = models.TextField()

    def __str__(self):
        return str(self.album.name) + " - " + str(self.id)


class Subscriber(models.Model):
    id = models.AutoField(primary_key=True)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)
