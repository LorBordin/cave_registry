import os
import csv
import glob
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from caves.models import Cave


class Command(BaseCommand):
    help = "Import caves from CSV files"

    def add_arguments(self, parser):
        parser.add_argument("--source", type=str, default="../data/")

    def handle(self, *args, **options):
        source_dir = options["source"]
        if not os.path.isabs(source_dir):
            # Assume relative to manage.py
            source_dir = os.path.join(os.getcwd(), source_dir)

        csv_files = sorted(glob.glob(os.path.join(source_dir, "*.csv")))

        if not csv_files:
            self.stdout.write(self.style.WARNING(f"No CSV files found in {source_dir}"))
            return

        stats = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}

        for csv_file in csv_files:
            self.stdout.write(f"Importing {csv_file}...")
            try:
                with open(csv_file, mode="r", encoding="utf-8-sig") as f:
                    # Handle potential '#' in header
                    first_line = f.readline()
                    if first_line.startswith("#"):
                        header = [h.strip() for h in first_line.lstrip("#").split(",")]
                    else:
                        f.seek(0)
                        header = None

                    reader = csv.DictReader(f, fieldnames=header)
                    for row in reader:
                        # Clean up row keys and values
                        row = {
                            k.strip() if k else k: v.strip() if v else v
                            for k, v in row.items()
                        }
                        try:
                            registry_id = row.get("catasto")
                            if not registry_id:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"Missing registry_id in row: {row}"
                                    )
                                )
                                stats["errors"] += 1
                                continue

                            lat_str = row.get("Latitudine")
                            lon_str = row.get("Longitudine")

                            if not lat_str or not lon_str:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"Missing coordinates for {registry_id}. Row: {row}"
                                    )
                                )
                                stats["skipped"] += 1
                                continue

                            try:
                                lat = float(lat_str)
                                lon = float(lon_str)
                                location = Point(lon, lat, srid=4326)
                            except (ValueError, TypeError):
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"Unparseable coordinates for {registry_id}: {lat_str}, {lon_str}"
                                    )
                                )
                                stats["skipped"] += 1
                                continue

                            # Mapping fields
                            defaults = {
                                "name": row.get("Nome", "Unnamed Cave"),
                                "plaque_number": row.get("Numero di placchetta"),
                                "location": location,
                                "elevation": self._parse_int(row.get("Quota ingresso")),
                                "length": self._parse_float(
                                    row.get("Estensione spaziale")
                                ),
                                "depth_positive": self._parse_float(
                                    row.get("Estensione verticale positiva")
                                ),
                                "depth_negative": self._parse_float(
                                    row.get("Estensione verticale negativa")
                                ),
                            }

                            cave, created = Cave.objects.get_or_create(
                                registry_id=registry_id, defaults=defaults
                            )

                            if created:
                                stats["created"] += 1
                            else:
                                # Update only fields from CSV, don't touch enrichment fields
                                # unless they are currently null?
                                # Spec says: "On update, does NOT overwrite enrichment fields
                                # that are already populated — only overwrites fields that come directly from the CSV."
                                for field, value in defaults.items():
                                    setattr(cave, field, value)
                                cave.save()
                                stats["updated"] += 1

                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f"Error processing row: {e}")
                            )
                            stats["errors"] += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error reading file {csv_file}: {e}")
                )
                stats["errors"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete. Created: {stats['created']}, Updated: {stats['updated']}, "
                f"Skipped: {stats['skipped']}, Errors: {stats['errors']}"
            )
        )

    def _parse_int(self, value):
        try:
            return int(float(value)) if value else None
        except (ValueError, TypeError):
            return None

    def _parse_float(self, value):
        try:
            return float(value) if value else None
        except (ValueError, TypeError):
            return None
