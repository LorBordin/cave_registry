from django.contrib.gis import admin
from .models import Cave, CaveMedia


@admin.register(Cave)
class CaveAdmin(admin.GISModelAdmin):
    list_display = ("registry_id", "name", "elevation", "is_published")
    search_fields = ("registry_id", "name")
    list_filter = ("is_published", "geology")


@admin.register(CaveMedia)
class CaveMediaAdmin(admin.ModelAdmin):
    list_display = ("cave", "media_type", "uploaded_at")
    list_filter = ("media_type",)
