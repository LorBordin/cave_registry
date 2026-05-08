from rest_framework import generics, filters, pagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cave
from .serializers import CaveSerializer, CaveGeoSerializer


class CavePagination(pagination.PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class CaveListView(generics.ListAPIView):
    queryset = Cave.objects.filter(is_published=True)
    serializer_class = CaveSerializer
    pagination_class = CavePagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "registry_id"]
    ordering_fields = [
        "name",
        "registry_id",
        "elevation",
        "length",
        "depth_positive",
        "depth_negative",
    ]


class CaveDetailView(generics.RetrieveAPIView):
    queryset = Cave.objects.filter(is_published=True)
    serializer_class = CaveSerializer
    lookup_field = "registry_id"


class CaveGeoJsonView(generics.ListAPIView):
    queryset = Cave.objects.filter(is_published=True)
    serializer_class = CaveGeoSerializer
    pagination_class = None  # No pagination for GeoJSON
