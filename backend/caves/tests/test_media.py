import os
import tempfile
import shutil
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from caves.models import Cave, CaveMedia

# Use a temporary directory for media during tests
TEMP_MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class MediaTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="admin", password="password")
        self.cave = Cave.objects.create(
            registry_id="M1",
            name="Media Cave",
            location=Point(11.0, 46.0),
            is_published=True
        )
        self.test_image = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"test image content",
            content_type="image/jpeg"
        )

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def test_upload_media_authenticated(self):
        self.client.login(username="admin", password="password")
        url = reverse("cave-media-list", kwargs={"registry_id": "M1"})
        data = {
            "media_type": "photo",
            "caption": "Test Photo",
            "file": self.test_image
        }
        response = self.client.post(url, data=data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CaveMedia.objects.count(), 1)
        
        media = CaveMedia.objects.first()
        self.assertTrue(os.path.exists(media.file.path))

    def test_upload_media_unauthenticated(self):
        url = reverse("cave-media-list", kwargs={"registry_id": "M1"})
        data = {
            "media_type": "photo",
            "file": self.test_image
        }
        response = self.client.post(url, data=data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_media_visibility(self):
        # Create an unpublished cave and add media to it
        hidden_cave = Cave.objects.create(
            registry_id="M2",
            name="Hidden Media Cave",
            location=Point(11.1, 46.1),
            is_published=False
        )
        CaveMedia.objects.create(
            cave=hidden_cave,
            file=self.test_image,
            media_type="photo",
            uploaded_by=self.user
        )

        # Public user should not see media for unpublished cave
        url = reverse("cave-media-list", kwargs={"registry_id": "M2"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Authenticated user should see it
        self.client.login(username="admin", password="password")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle paginated response
        self.assertEqual(len(response.json()["results"]), 1)

    def test_media_file_cleanup_on_delete(self):
        self.client.login(username="admin", password="password")
        
        # 1. Create media
        media = CaveMedia.objects.create(
            cave=self.cave,
            file=SimpleUploadedFile("to_delete.jpg", b"content"),
            media_type="photo",
            uploaded_by=self.user
        )
        file_path = media.file.path
        self.assertTrue(os.path.exists(file_path))

        # 2. Delete media via API
        url = reverse("cave-media-delete", kwargs={"id": media.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 3. Check file is gone from disk
        self.assertFalse(os.path.exists(file_path))

    def test_cave_deletion_cleanup(self):
        self.client.login(username="admin", password="password")
        
        # 1. Create cave with media
        cave_to_del = Cave.objects.create(
            registry_id="DEL",
            name="Delete Me",
            location=Point(11.2, 46.2)
        )
        media = CaveMedia.objects.create(
            cave=cave_to_del,
            file=SimpleUploadedFile("cave_del.jpg", b"content"),
            media_type="photo",
            uploaded_by=self.user
        )
        file_path = media.file.path
        self.assertTrue(os.path.exists(file_path))

        # 2. Delete cave via API (this should trigger file cleanup in perform_destroy)
        url = reverse("cave-detail", kwargs={"registry_id": "DEL"})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 3. Check cave and file are gone
        self.assertFalse(Cave.objects.filter(registry_id="DEL").exists())
        self.assertFalse(os.path.exists(file_path))
