from django.db import models

# Create your models here.
class Party(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField()
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    link = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.party.name) + ' - ' + str(self.id)


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE)
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    key= models.TextField()
    value = models.TextField()

    def __str__(self):
        return str(self.party.name) + ' - ' + str(self.tag)


class Subs(models.Model):
    id = models.AutoField(primary_key=True)
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    
    def __str__(self):
        return str(self.party.name) + ' - ' + str(self.user.username)

