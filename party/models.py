from django.db import models

# Create your models here.
class Party(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300)
    description = models.TextField()
    date = models.DateField(null=True)
    time = models.TimeField(null=True)
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    link = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.party.name) + ' - ' + str(self.id)


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE)
    data = models.TextField()

    def __str__(self):
        return str(self.party.name) + ' - ' + str(self.tag)
    
    