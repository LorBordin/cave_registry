import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, pagination, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cave, CaveMedia
from .serializers import (
    CaveSerializer,
    CaveGeoSerializer,
    CaveWriteSerializer,
    CaveMediaSerializer,
)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse(
            {"id": user.id, "username": user.username, "email": user.email}
        )
    else:
        return JsonResponse({"error": "Invalid credentials"}, status=401)


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    logout(request)
    return JsonResponse({}, status=204)


@require_http_methods(["GET"])
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    return JsonResponse(
        {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        }
    )


class CavePagination(pagination.PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class CaveListView(generics.ListCreateAPIView):
    queryset = Cave.objects.filter(is_published=True).order_by("registry_id")
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

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CaveWriteSerializer
        return CaveSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class CaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "registry_id"

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cave.objects.all()
        return Cave.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CaveWriteSerializer
        return CaveSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        # Delete associated media files from filesystem
        for media in instance.media.all():
            if media.file:
                media.file.delete()
        instance.delete()


class CaveAdminListView(generics.ListAPIView):
    queryset = Cave.objects.all()
    serializer_class = CaveSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["name", "registry_id", "elevation"]


class CaveGeoJsonView(generics.ListAPIView):
    queryset = Cave.objects.filter(is_published=True)
    serializer_class = CaveGeoSerializer
    pagination_class = None  # No pagination for GeoJSON


class CaveMediaListView(generics.ListCreateAPIView):
    serializer_class = CaveMediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        cave = get_object_or_404(Cave, registry_id=self.kwargs["registry_id"])
        return CaveMedia.objects.filter(cave=cave)

    def perform_create(self, serializer):
        cave = get_object_or_404(Cave, registry_id=self.kwargs["registry_id"])
        serializer.save(cave=cave, uploaded_by=self.request.user)


class CaveMediaDeleteView(generics.DestroyAPIView):
    queryset = CaveMedia.objects.all()
    serializer_class = CaveMediaSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def perform_destroy(self, instance):
        if instance.file:
            instance.file.delete()
        instance.delete()
