from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer, GeometryField
from .models import Cave


class CaveSerializer(serializers.ModelSerializer):
    location = GeometryField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Cave
        fields = [
            "id",
            "registry_id",
            "plaque_number",
            "name",
            "location",
            "latitude",
            "longitude",
            "elevation",
            "length",
            "depth_positive",
            "depth_negative",
            "municipality",
            "valley",
            "geology",
            "description",
            "last_survey_date",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def get_latitude(self, obj):
        return obj.location.y if obj.location else None

    def get_longitude(self, obj):
        return obj.location.x if obj.location else None


class CaveGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Cave
        geo_field = "location"
        fields = [
            "registry_id",
            "name",
            "elevation",
            "depth_positive",
            "depth_negative",
            "length",
        ]
