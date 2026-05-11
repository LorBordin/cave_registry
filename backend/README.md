# (UN)official Catasto Grotte - Backend

This is the Django-based backend for the Catasto Grotte project.

## 🛠 Tech Stack

- **Framework:** Django 5.x
- **API:** Django REST Framework
- **GIS:** PostGIS
- **Database:** PostgreSQL
- **Manager:** `uv`

## 🚀 Key Components

- `caves/`: Main application containing models for Caves and Media.
- `caves/management/commands/import_caves.py`: Ingestion pipeline for CSV data.
- `config/`: Project configuration and settings.

## 🏁 Running Locally

The backend is intended to be run via Docker Compose from the root directory.

```bash
# From the project root
docker compose up backend
```

For more detailed instructions, please refer to the [Root README](../README.md).
