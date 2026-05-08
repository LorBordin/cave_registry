from django.urls import path
from .views import (
    CaveListView,
    CaveDetailView,
    CaveGeoJsonView,
    CaveAdminListView,
    CaveMediaListView,
    CaveMediaDeleteView,
)

urlpatterns = [
    path("caves/", CaveListView.as_view(), name="cave-list"),
    path("caves/admin/", CaveAdminListView.as_view(), name="cave-admin-list"),
    path("caves/geojson/", CaveGeoJsonView.as_view(), name="cave-geojson"),
    path("caves/<str:registry_id>/", CaveDetailView.as_view(), name="cave-detail"),
    path(
        "caves/<str:registry_id>/media/",
        CaveMediaListView.as_view(),
        name="cave-media-list",
    ),
    path("media/<int:id>/", CaveMediaDeleteView.as_view(), name="cave-media-delete"),
]
