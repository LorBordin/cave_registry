import os
import tempfile
import shutil
from django.core.management import call_command
from django.test import TestCase
from caves.models import Cave


class IngestionCommandTests(TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def create_csv(self, filename, content):
        path = os.path.join(self.test_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return path

    def test_import_caves_success(self):
        csv_content = (
            "catasto,Numero di placchetta,Nome,Quota ingresso,Estensione spaziale,"
            "Estensione verticale positiva,Estensione verticale negativa,Latitudine,Longitudine\n"
            "123,P123,Test Cave,1000,50.5,10.0,20.0,46.123,11.456\n"
        )
        self.create_csv("caves.csv", csv_content)

        call_command("import_caves", source=self.test_dir)

        self.assertEqual(Cave.objects.count(), 1)
        cave = Cave.objects.get(registry_id="123")
        self.assertEqual(cave.name, "Test Cave")
        self.assertEqual(cave.location.x, 11.456)
        self.assertEqual(cave.location.y, 46.123)
        self.assertEqual(cave.elevation, 1000)

    def test_import_caves_idempotency_and_enrichment(self):
        csv_content = (
            "catasto,Nome,Latitudine,Longitudine\n123,Initial Name,46.1,11.1\n"
        )
        self.create_csv("caves.csv", csv_content)
        call_command("import_caves", source=self.test_dir)

        # Manually enrich
        cave = Cave.objects.get(registry_id="123")
        cave.description = "Manually added description"
        cave.save()

        # Update CSV with new name
        csv_content_updated = (
            "catasto,Nome,Latitudine,Longitudine\n123,Updated Name,46.1,11.1\n"
        )
        self.create_csv("caves.csv", csv_content_updated)
        call_command("import_caves", source=self.test_dir)

        cave.refresh_from_db()
        self.assertEqual(cave.name, "Updated Name")
        self.assertEqual(cave.description, "Manually added description")

    def test_import_caves_skip_invalid(self):
        csv_content = (
            "catasto,Nome,Latitudine,Longitudine\n"
            "1,Valid Cave,46.1,11.1\n"
            "2,No Coordinates,,\n"
            "3,Invalid Coordinates,abc,def\n"
            ",No ID,46.2,11.2\n"
        )
        self.create_csv("caves.csv", csv_content)

        call_command("import_caves", source=self.test_dir)

        self.assertEqual(Cave.objects.count(), 1)
        self.assertTrue(Cave.objects.filter(registry_id="1").exists())

    def test_import_caves_hash_header(self):
        csv_content = (
            "#catasto,Nome,Latitudine,Longitudine\n456,Hash Header Cave,46.5,11.5\n"
        )
        self.create_csv("caves.csv", csv_content)

        call_command("import_caves", source=self.test_dir)

        self.assertEqual(Cave.objects.count(), 1)
        self.assertTrue(Cave.objects.filter(registry_id="456").exists())
