from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Album
import json

class AlbumCreationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

    def test_create_album(self):
        response = self.client.post(
            '/api/albums/create/',
            json.dumps({'name': 'Test Album'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Album.objects.filter(name='Test Album').exists())
        self.assertEqual(Album.objects.get(name='Test Album').user, self.user)
        
    def test_create_album_unauthenticated(self):
        self.client.logout()
        response = self.client.post(
            '/api/albums/create/',
            json.dumps({'name': 'Test Album'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
