import json
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from rest_framework import status
from rest_framework.test import APITestCase
from caves.models import Cave


class AuthTests(APITestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "testpassword"
        self.user = User.objects.create_user(
            username=self.username, password=self.password, email="test@example.com"
        )

    def test_login_success(self):
        url = reverse("login")
        data = {"username": self.username, "password": self.password}
        response = self.client.post(url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["username"], self.username)

    def test_login_failure(self):
        url = reverse("login")
        data = {"username": self.username, "password": "wrongpassword"}
        response = self.client.post(url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        self.client.login(username=self.username, password=self.password)
        url = reverse("logout")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_me_view(self):
        self.client.login(username=self.username, password=self.password)
        url = reverse("me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["username"], self.username)


class CaveAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="admin", password="password")
        self.published_cave = Cave.objects.create(
            registry_id="100",
            name="Published Cave",
            location=Point(11.0, 46.0),
            is_published=True
        )
        self.hidden_cave = Cave.objects.create(
            registry_id="200",
            name="Hidden Cave",
            location=Point(11.1, 46.1),
            is_published=False
        )

    def test_public_cave_list(self):
        url = reverse("cave-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results is paginated
        self.assertEqual(len(response.json()["results"]), 1)
        self.assertEqual(response.json()["results"][0]["registry_id"], "100")

    def test_public_cave_detail(self):
        url = reverse("cave-detail", kwargs={"registry_id": "100"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Published Cave")

        # Test hidden cave (should be 404 for public)
        url_hidden = reverse("cave-detail", kwargs={"registry_id": "200"})
        response_hidden = self.client.get(url_hidden)
        self.assertEqual(response_hidden.status_code, status.HTTP_404_NOT_FOUND)

    def test_private_access_to_hidden_cave(self):
        self.client.login(username="admin", password="password")
        url = reverse("cave-detail", kwargs={"registry_id": "200"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Hidden Cave")

    def test_create_cave_unauthenticated(self):
        url = reverse("cave-list")
        data = {
            "registry_id": "300",
            "name": "New Cave",
            "latitude": 46.2,
            "longitude": 11.2
        }
        response = self.client.post(url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_cave_authenticated(self):
        self.client.login(username="admin", password="password")
        url = reverse("cave-list")
        data = {
            "registry_id": "300",
            "name": "New Cave",
            "latitude": 46.2,
            "longitude": 11.2
        }
        response = self.client.post(url, data=json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Cave.objects.filter(registry_id="300").exists())

    def test_geojson_view(self):
        url = reverse("cave-geojson")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertEqual(len(data["features"]), 1)
        self.assertEqual(data["features"][0]["properties"]["registry_id"], "100")
