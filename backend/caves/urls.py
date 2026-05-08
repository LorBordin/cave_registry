from django.urls import path
from .views import CaveListView, CaveDetailView, CaveGeoJsonView

urlpatterns = [
    path("caves/", CaveListView.as_view(), name="cave-list"),
    path("caves/geojson/", CaveGeoJsonView.as_view(), name="cave-geojson"),
    path("caves/<str:registry_id>/", CaveDetailView.as_view(), name="cave-detail"),
]
